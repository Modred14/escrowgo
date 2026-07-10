import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to become a courier." },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { deliveryAgent: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    if (user.role === "DELIVERY_AGENT" && user.deliveryAgent) {
      return NextResponse.json({
        success: true,
        alreadyCourier: true,
        deliveryAgent: user.deliveryAgent,
      });
    }

    const location =
      [user.city, user.country].filter(Boolean).join(", ") || "Not set yet";

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        role: "DELIVERY_AGENT",
        ...(user.deliveryAgent
          ? {}
          : {
              deliveryAgent: {
                create: {
                  location,
                  vehicleType: null,
                  isAvailable: true,
                },
              },
            }),
      },
      include: { deliveryAgent: true },
    });

    return NextResponse.json({
      success: true,
      alreadyCourier: false,
      deliveryAgent: updated.deliveryAgent,
    });
  } catch (err) {
    console.error("Become courier error:", err);
    return NextResponse.json(
      { error: "Something went wrong activating your courier account." },
      { status: 500 },
    );
  }
}