import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";

export async function POST(_req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "DELIVERY_AGENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agent = await prisma.deliveryAgent.findUnique({ where: { userId: session.user.id } });
  const delivery = await prisma.delivery.findUnique({
    where: { id: params.id },
    include: { deal: { include: { product: true } } },
  });

  if (!delivery) return NextResponse.json({ error: "Delivery not found." }, { status: 404 });
  if (delivery.status !== "UNASSIGNED") {
    return NextResponse.json({ error: "This delivery has already been accepted by another courier." }, { status: 409 });
  }

  const updated = await prisma.delivery.update({
    where: { id: delivery.id },
    data: { agentId: agent.id, status: "ACCEPTED", acceptedAt: new Date() },
  });

  await notify(delivery.deal.sellerId, {
    title: "Courier assigned",
    message: `A courier has accepted the delivery for "${delivery.deal.product.name}".`,
    type: "INFO",
  });
  await notify(delivery.deal.buyerId, {
    title: "Courier assigned",
    message: `A courier has been assigned to deliver "${delivery.deal.product.name}".`,
    type: "INFO",
  });

  return NextResponse.json({ success: true, delivery: updated });
}