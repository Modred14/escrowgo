import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";
import { generateDealCode } from "@/lib/qrcode";

export async function POST(_req, props) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "DELIVERY_AGENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agent = await prisma.deliveryAgent.findUnique({ where: { userId: session.user.id } });
  const delivery = await prisma.delivery.findUnique({
    where: { id: params.id },
    include: { deal: { include: { product: true, qrCode: true } } },
  });

  if (!delivery) return NextResponse.json({ error: "Delivery not found." }, { status: 404 });
  if (delivery.agentId !== agent.id) {
    return NextResponse.json({ error: "You are not assigned to this delivery." }, { status: 403 });
  }
  if (delivery.status !== "PICKED_UP") {
    return NextResponse.json({ error: "Mark this delivery as picked up first." }, { status: 400 });
  }

  await prisma.delivery.update({
    where: { id: delivery.id },
    data: { status: "DELIVERED", deliveredAt: new Date() },
  });
  await prisma.deal.update({ where: { id: delivery.dealId }, data: { status: "DELIVERED" } });
  await prisma.deliveryAgent.update({
    where: { id: agent.id },
    data: { earnings: { increment: delivery.fee } },
  });

  let qrCode = delivery.deal.qrCode;
  if (!qrCode) {
    qrCode = await prisma.qRCode.create({
      data: { dealId: delivery.dealId, code: generateDealCode(delivery.dealId) },
    });
  }

  await notify(delivery.deal.buyerId, {
    title: "Delivery complete — confirm receipt",
    message: `Show your QR code to the courier to confirm receipt of "${delivery.deal.product.name}" and release payment.`,
    type: "SUCCESS",
  });

  return NextResponse.json({ success: true, qrCode });
}
