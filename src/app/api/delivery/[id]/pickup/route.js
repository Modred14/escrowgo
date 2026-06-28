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
  if (delivery.agentId !== agent.id) {
    return NextResponse.json({ error: "You are not assigned to this delivery." }, { status: 403 });
  }
  if (delivery.status !== "ACCEPTED") {
    return NextResponse.json({ error: "This delivery must be accepted first." }, { status: 400 });
  }

  await prisma.delivery.update({
    where: { id: delivery.id },
    data: { status: "PICKED_UP", pickedUpAt: new Date() },
  });
  await prisma.deal.update({ where: { id: delivery.dealId }, data: { status: "OUT_FOR_DELIVERY" } });

  await notify(delivery.deal.buyerId, {
    title: "Your item is on the way",
    message: `${delivery.deal.product.name} has been picked up and is heading your way.`,
    type: "INFO",
  });

  return NextResponse.json({ success: true });
}
