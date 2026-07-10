import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";
import { lookupBankAccount, transferToBank } from "@/lib/nomba";

async function getSpendableBalance(userId) {
  const [releasedEscrows, unavailableWithdrawals] = await Promise.all([
    prisma.escrow.findMany({
      where: { status: "RELEASED", deal: { sellerId: userId } },
      select: { amount: true },
    }),
    prisma.withdrawal.findMany({
      where: { userId, status: { in: ["SUCCESS", "PENDING"] } },
      select: { amount: true },
    }),
  ]);

  const moneyIn = releasedEscrows.reduce((sum, e) => sum + e.amount, 0);
  const totalCommitted = unavailableWithdrawals.reduce((sum, w) => sum + w.amount, 0);
  return moneyIn - totalCommitted;
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { amount, accountNumber, bankCode, bankName, pin } = await req.json();

  const numericAmount = Number(amount);
  if (!numericAmount || numericAmount <= 0) {
    return NextResponse.json({ error: "Enter a valid amount to withdraw." }, { status: 400 });
  }
  if (!/^\d{10}$/.test(accountNumber || "")) {
    return NextResponse.json({ error: "Enter a valid 10-digit account number." }, { status: 400 });
  }
  if (!bankCode) {
    return NextResponse.json({ error: "Select a bank." }, { status: 400 });
  }
  if (!/^\d{4}$/.test(pin || "")) {
    return NextResponse.json({ error: "Enter your 4-digit PIN." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, pin: true },
  });

  if (!user?.pin) {
    return NextResponse.json(
      {
        error: "no_pin",
        message: "You need to set a transaction PIN before you can withdraw. Set one in Security first.",
        redirectUrl: "/dashboard?tab=security",
      },
      { status: 400 },
    );
  }

  const pinValid = await bcrypt.compare(pin, user.pin);
  if (!pinValid) {
    return NextResponse.json({ error: "Incorrect PIN." }, { status: 401 });
  }

  const rawBalance = await getSpendableBalance(userId);
  const balance = Math.round(rawBalance * 100) / 100;
  if (numericAmount > balance) {
    return NextResponse.json(
      { error: "That's more than your available balance." },
      { status: 400 },
    );
  }

  let verifiedAccountName;
  try {
    const lookup = await lookupBankAccount({ accountNumber, bankCode });
    verifiedAccountName = lookup?.accountName;
    if (!verifiedAccountName) {
      return NextResponse.json(
        { error: "Couldn't verify that bank account. Please check the details." },
        { status: 400 },
      );
    }
  } catch (err) {
    console.error("[wallet/withdraw] lookup failed", err);
    return NextResponse.json(
      { error: "Couldn't verify that bank account. Please try again." },
      { status: 502 },
    );
  }

  const merchantTxRef = `WD-${userId.slice(0, 8)}-${crypto.randomBytes(6).toString("hex")}`;

  const withdrawal = await prisma.withdrawal.create({
    data: {
      userId,
      amount: numericAmount,
      bankCode,
      bankName: bankName || null,
      accountNumber,
      accountName: verifiedAccountName,
      status: "PENDING",
      merchantTxRef,
    },
  });

  let result;
  try {
    result = await transferToBank({
      amount: numericAmount,
      accountNumber,
      accountName: verifiedAccountName,
      bankCode,
      merchantTxRef,
      senderName: "EscrowGo",
      narration: `EscrowGo wallet withdrawal for ${user.name}`,
    });
  } catch (err) {
    console.error("[wallet/withdraw] transfer threw", err);
    result = { status: "FAILED", message: err.message };
  }

  if (result.status === "FAILED") {
    await prisma.withdrawal.update({
      where: { id: withdrawal.id },
      data: { status: "FAILED", failureReason: result.message || "Transfer failed" },
    });
    await notify(userId, {
      title: "Withdrawal failed",
      message: `Your withdrawal request could not be completed. ${result.message || "Please try again."}`,
      type: "ERROR",
    });
    return NextResponse.json(
      { error: result.message || "Withdrawal failed. Please try again." },
      { status: 502 },
    );
  }

  const finalStatus = result.status === "SUCCESS" ? "SUCCESS" : "PENDING";
  await prisma.withdrawal.update({
    where: { id: withdrawal.id },
    data: { status: finalStatus, providerRef: result.providerRef || null },
  });

  await notify(userId, {
    title: finalStatus === "SUCCESS" ? "Withdrawal successful" : "Withdrawal processing",
    message: `₦${numericAmount.toLocaleString("en-NG")} is on its way to ${verifiedAccountName} (${accountNumber}).`,
    type: "SUCCESS",
  });

  return NextResponse.json({
    success: true,
    status: finalStatus,
    amount: numericAmount,
    accountName: verifiedAccountName,
  });
}