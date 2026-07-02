import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";
import { generateDealCode } from "@/lib/qrcode";

export async function POST(req, props) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action } = await req.json();

  const deal = await prisma.deal.findUnique({
    where: { slug: params.slug },
    include: { delivery: true, product: true, qrCode: true },
  });

  if (!deal) return NextResponse.json({ error: "Deal not found." }, { status: 404 });
  if (deal.sellerId !== session.user.id) {
    return NextResponse.json({ error: "Only the seller can update this delivery." }, { status: 403 });
  }
  if (deal.deliveryOption !== "SELF") {
    return NextResponse.json({ error: "This deal uses escrowgo Delivery, not self-delivery." }, { status: 400 });
  }
  if (deal.status !== "FUNDS_HELD" && deal.status !== "OUT_FOR_DELIVERY") {
    return NextResponse.json({ error: "Funds must be secured in escrow before delivery can start." }, { status: 400 });
  }

  if (action === "PICKED_UP") {
    await prisma.delivery.update({
      where: { dealId: deal.id },
      data: { status: "PICKED_UP", pickedUpAt: new Date() },
    });
    await prisma.deal.update({ where: { id: deal.id }, data: { status: "OUT_FOR_DELIVERY" } });
    await notify(deal.buyerId, {
      title: "Your item is on the way",
      message: `${deal.product.name} has been picked up by the seller for delivery.`,
      type: "INFO",
    });
    return NextResponse.json({ success: true });
  }

  if (action === "DELIVERED") {
    await prisma.delivery.update({
      where: { dealId: deal.id },
      data: { status: "DELIVERED", deliveredAt: new Date() },
    });
    await prisma.deal.update({ where: { id: deal.id }, data: { status: "DELIVERED" } });

    let qrCode = deal.qrCode;
    if (!qrCode) {
      qrCode = await prisma.qRCode.create({
        data: { dealId: deal.id, code: generateDealCode(deal.id) },
      });
    }

    await notify(deal.buyerId, {
      title: "Delivery complete — confirm receipt",
      message: `Show your QR code to the seller once you've received "${deal.product.name}" to release payment.`,
      type: "SUCCESS",
    });

    return NextResponse.json({ success: true, qrCode });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
