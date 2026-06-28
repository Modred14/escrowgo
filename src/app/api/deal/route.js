import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { checkDeliveryCoverage } from "@/lib/delivery-coverage";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in to create a deal." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      name,
      description,
      price,
      images,
      sellerLocation,
      buyerLocation,
      estimatedDeliveryDays,
      deliveryOption,
    } = body;

    if (!name || !description || !price || !sellerLocation || !buyerLocation || !estimatedDeliveryDays) {
      return NextResponse.json({ error: "Please fill in every field." }, { status: 400 });
    }
    if (!images || images.length < 2) {
      return NextResponse.json({ error: "Upload at least 2 product images." }, { status: 400 });
    }
    if (Number(price) <= 0) {
      return NextResponse.json({ error: "Price must be greater than zero." }, { status: 400 });
    }

    let finalDeliveryOption = deliveryOption === "EscrowGO" ? "EscrowGO" : "SELF";
    let deliveryFee = 0;
    let bufferDays = 0;
    let deliveryAvailable = true;

    if (finalDeliveryOption === "EscrowGO") {
      const coverage = checkDeliveryCoverage({
        sellerLocation,
        buyerLocation,
        estimatedDeliveryDays,
      });

      if (!coverage.available) {
        // System logic: force Self Delivery when EscrowGO Delivery is unavailable
        finalDeliveryOption = "SELF";
        deliveryAvailable = false;
        deliveryFee = 0;
        bufferDays = 0;
      } else {
        deliveryFee = coverage.fee;
        bufferDays = coverage.bufferDays;
      }
    }

    const deal = await prisma.deal.create({
      data: {
        slug: slugify(name),
        sellerId: session.user.id,
        sellerLocation,
        buyerLocation,
        deliveryOption: finalDeliveryOption,
        estimatedDeliveryDays: Number(estimatedDeliveryDays),
        bufferDays,
        deliveryFee,
        deliveryAvailable,
        status: "PENDING_PAYMENT",
        product: {
          create: {
            name,
            description,
            price: Number(price),
            images,
          },
        },
      },
      include: { product: true },
    });

    return NextResponse.json({
      success: true,
      deal,
      paymentLink: `${process.env.NEXT_PUBLIC_APP_URL}/deal/${deal.slug}`,
      forcedSelfDelivery: deliveryOption === "EscrowGO" && finalDeliveryOption === "SELF",
    });
  } catch (err) {
    console.error("Create deal error:", err);
    return NextResponse.json({ error: "Could not create the deal. Please try again." }, { status: 500 });
  }
}

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const as = searchParams.get("as");

  const where =
    as === "buyer"
      ? { buyerId: session.user.id }
      : as === "seller"
      ? { sellerId: session.user.id }
      : { OR: [{ sellerId: session.user.id }, { buyerId: session.user.id }] };

  const deals = await prisma.deal.findMany({
    where,
    include: { product: true, seller: true, buyer: true, escrow: true, delivery: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ deals });
}