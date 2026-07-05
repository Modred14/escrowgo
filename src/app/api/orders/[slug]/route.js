import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

    const deal = await prisma.deal.findUnique({
      where: { slug },
      include: { product: true, payments: true },
    });

    if (!deal) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (deal.sellerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const payment = deal.payments?.[0];

    return NextResponse.json({
      dealSlug: deal.slug,
      productName: deal.product?.name || "",
      amount: payment?.amount ?? 0,
      deliveryFee: deal.deliveryFee ?? 0,
      expectedDelivery: deal.expectedDeliveryDate,
      createdOn: deal.createdAt,
      paymentLink: payment?.checkoutUrl || "",
      status: deal.status,
    });
  } catch (error) {
    console.error("get-order error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong while fetching the order" },
      { status: 500 },
    );
  }
}