import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "DELIVERY_AGENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agent = await prisma.deliveryAgent.findUnique({ where: { userId: session.user.id } });
  if (!agent) return NextResponse.json({ error: "Courier profile not found." }, { status: 404 });

  const deliveries = await prisma.delivery.findMany({
    where: {
      status: "UNASSIGNED",
      deal: {
        deliveryOption: "EscrowGO",
        status: "FUNDS_HELD",
        OR: [
          { sellerLocation: { equals: agent.location, mode: "insensitive" } },
          { buyerLocation: { equals: agent.location, mode: "insensitive" } },
        ],
      },
    },
    include: { deal: { include: { product: true, seller: true, buyer: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ deliveries });
}