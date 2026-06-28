import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "DELIVERY_AGENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agent = await prisma.deliveryAgent.findUnique({
    where: { userId: session.user.id },
    include: {
      deliveries: {
        include: { deal: { include: { product: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!agent) return NextResponse.json({ error: "Courier profile not found." }, { status: 404 });

  const completed = agent.deliveries.filter((d) => d.status === "DELIVERED");
  const active = agent.deliveries.filter((d) => d.status === "ACCEPTED" || d.status === "PICKED_UP");

  return NextResponse.json({
    agent: { id: agent.id, location: agent.location, vehicleType: agent.vehicleType, earnings: agent.earnings },
    deliveries: agent.deliveries,
    stats: {
      totalEarnings: agent.earnings,
      completedCount: completed.length,
      activeCount: active.length,
    },
  });
}
