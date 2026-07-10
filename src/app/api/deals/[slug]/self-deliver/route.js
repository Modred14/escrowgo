import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";

export const runtime = "nodejs";

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 },
      );
    }

    const { slug } = await params;
    const { action } = await request.json();
    if (!["PICKED_UP", "DELIVERED"].includes(action)) {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    const deal = await prisma.deal.findUnique({
      where: { slug },
      include: { product: true, delivery: true },
    });

    if (!deal) {
      return NextResponse.json({ error: "Deal not found." }, { status: 404 });
    }
    if (deal.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the seller can update this delivery." },
        { status: 403 },
      );
    }
    if (deal.deliveryOption !== "SELF") {
      return NextResponse.json(
        { error: "This deal isn't set to Self Delivery." },
        { status: 400 },
      );
    }
    if (!deal.delivery) {
      return NextResponse.json(
        { error: "No delivery record exists for this deal yet." },
        { status: 400 },
      );
    }

    if (action === "PICKED_UP") {
      if (deal.delivery.status !== "UNASSIGNED") {
        return NextResponse.json(
          { error: "This delivery has already been picked up." },
          { status: 400 },
        );
      }
      if (deal.status !== "FUNDS_HELD") {
        return NextResponse.json(
          { error: "Payment must be secured in escrow first." },
          { status: 400 },
        );
      }

      await prisma.delivery.update({
        where: { id: deal.delivery.id },
        data: { status: "PICKED_UP", pickedUpAt: new Date() },
      });
      await prisma.deal.update({
        where: { id: deal.id },
        data: { status: "OUT_FOR_DELIVERY" },
      });

      await notify(deal.buyerId, {
        title: "Your item is on the way",
        message: `${deal.product.name} has been picked up by the seller and is heading your way.`,
        type: "INFO",
      });

      return NextResponse.json({ success: true, status: "OUT_FOR_DELIVERY" });
    }

    if (deal.delivery.status !== "PICKED_UP") {
      return NextResponse.json(
        { error: "Mark this delivery as picked up first." },
        { status: 400 },
      );
    }

    await prisma.delivery.update({
      where: { id: deal.delivery.id },
      data: { status: "DELIVERED", deliveredAt: new Date() },
    });
    await prisma.deal.update({
      where: { id: deal.id },
      data: { status: "DELIVERED" },
    });

    await notify(deal.buyerId, {
      title: "Delivery complete — confirm receipt",
      message: `Show your QR code to the seller to confirm receipt of "${deal.product.name}" and release payment.`,
      type: "SUCCESS",
    });

    return NextResponse.json({ success: true, status: "DELIVERED" });
  } catch (error) {
    console.error("self-deliver error:", error);
    return NextResponse.json(
      {
        error: error.message || "Something went wrong updating this delivery.",
      },
      { status: 500 },
    );
  }
}
