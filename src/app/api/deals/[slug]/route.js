import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request, { params }) {
  try {
    const { slug } = await params;

    const deal = await prisma.deal.findUnique({
      where: { slug },
      include: {
        seller: { select: { name: true } },
        product: true,
        payments: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    if (!deal) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const latestPayment = deal.payments[0] || null;

    return NextResponse.json({
      slug: deal.slug,
      status: deal.status,
      sellerName: deal.seller?.name || "Seller",
      sellerLocation: deal.sellerLocation,
      buyerLocation: deal.buyerLocation,
      deliveryOption: deal.deliveryOption,
      deliveryFee: deal.deliveryFee,
      expectedDeliveryDate: deal.expectedDeliveryDate,
      createdAt: deal.createdAt,
      product: deal.product
        ? {
            name: deal.product.name,
            description: deal.product.description,
            price: deal.product.price,
            images: deal.product.images,
          }
        : null,
      payment: latestPayment
        ? {
            amount: latestPayment.amount,
            currency: latestPayment.currency,
            status: latestPayment.status,
            checkoutUrl: latestPayment.checkoutUrl,
          }
        : null,
    });
  } catch (error) {
    console.error("get-deal error:", error);
    return NextResponse.json(
      { error: "Something went wrong while fetching this order" },
      { status: 500 },
    );
  }
}