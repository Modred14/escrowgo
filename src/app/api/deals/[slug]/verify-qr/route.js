import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { error: "You must be logged in to scan a release code." },
      { status: 401 },
    );
  }

  const { code } = await req.json();
  if (!code)
    return NextResponse.json({ error: "No code provided." }, { status: 400 });

  const qrCode = await prisma.qRCode.findUnique({
    where: { code: code.trim() },
    include: {
      deal: {
        include: {
          product: true,
          escrow: true,
          delivery: { include: { agent: true } },
        },
      },
    },
  });

  if (!qrCode) {
    return NextResponse.json(
      { error: "Invalid or unrecognized QR code." },
      { status: 404 },
    );
  }

  if (qrCode.isUsed) {
    return NextResponse.json(
      { error: "This QR code has already been used to release payment." },
      { status: 409 },
    );
  }

  const deal = qrCode.deal;

  const isSeller = deal.sellerId === session.user.id;
  const isAssignedAgent =
    session.user.role === "DELIVERY_AGENT" &&
    deal.delivery?.agent?.userId === session.user.id;

  const isAuthorized =
    deal.deliveryOption === "SELF" ? isSeller : isAssignedAgent;

  if (!isAuthorized) {
    const message =
      deal.deliveryOption === "SELF"
        ? "Only the seller can release this delivery's escrow."
        : "Only the courier assigned to this delivery can release its escrow.";
    return NextResponse.json({ error: message }, { status: 403 });
  }

  if (!["DELIVERED"].includes(deal.status)) {
    return NextResponse.json(
      {
        error:
          "This deal must be marked as delivered before escrow can be released.",
      },
      { status: 400 },
    );
  }

  const now = new Date();

  await prisma.qRCode.update({
    where: { id: qrCode.id },
    data: { isUsed: true, usedAt: now },
  });
  await prisma.escrow.update({
    where: { dealId: deal.id },
    data: { status: "RELEASED", releasedAt: now },
  });
  await prisma.deal.update({
    where: { id: deal.id },
    data: { status: "PAYMENT_RELEASED" },
  });

  // Courier gets paid the delivery fee at the moment escrow is actually released,
  // not when they mark the item "delivered" — they haven't earned it until the
  // buyer's release confirms the handoff.
  if (deal.deliveryOption === "ESCROWGO" && deal.delivery?.agentId) {
    await prisma.deliveryAgent.update({
      where: { id: deal.delivery.agentId },
      data: { earnings: { increment: deal.delivery.fee } },
    });
  }

  await notify(deal.buyerId, {
    title: "Escrow released",
    message: `Delivery confirmed. Payment for "${deal.product.name}" has been released to the seller.`,
    type: "SUCCESS",
  });
  await notify(deal.sellerId, {
    title: "Payment released to you",
    message: `Delivery of "${deal.product.name}" was confirmed and escrow has been released.`,
    type: "SUCCESS",
  });

  return NextResponse.json({
    success: true,
    deal: {
      slug: deal.slug,
      status: "PAYMENT_RELEASED",
      productName: deal.product.name,
    },
  });
}
