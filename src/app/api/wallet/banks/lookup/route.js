import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { lookupBankAccount } from "@/lib/nomba";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { accountNumber, bankCode } = await req.json();

  if (!/^\d{10}$/.test(accountNumber || "")) {
    return NextResponse.json(
      { error: "Enter a valid 10-digit account number." },
      { status: 400 },
    );
  }
  if (!bankCode) {
    return NextResponse.json({ error: "Select a bank first." }, { status: 400 });
  }

  try {
    const result = await lookupBankAccount({ accountNumber, bankCode });
    if (!result?.accountName) {
      return NextResponse.json(
        { error: "Couldn't verify that account. Double-check the number and bank." },
        { status: 404 },
      );
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error("[wallet/banks/lookup] failed", err);
    return NextResponse.json(
      { error: "Couldn't verify that account. Double-check the number and bank." },
      { status: 502 },
    );
  }
}