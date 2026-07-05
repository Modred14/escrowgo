import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MIN_AGENTS_REQUIRED = 3;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const buyerCity = searchParams.get("buyerCity")?.trim();
  const sellerCity = searchParams.get("sellerCity")?.trim();

  if (!buyerCity && !sellerCity) {
    return NextResponse.json(
      { error: "buyerCity or sellerCity is required" },
      { status: 400 },
    );
  }

  
  const orConditions = [];
  if (buyerCity) {
    orConditions.push({ location: { contains: buyerCity, mode: "insensitive" } });
  }
  if (sellerCity) {
    orConditions.push({ location: { contains: sellerCity, mode: "insensitive" } });
  }

  const agentCount = await prisma.deliveryAgent.count({
    where: {
      isAvailable: true,
      OR: orConditions,
    },
  });

  return NextResponse.json({
    agentCount,
    eligibleForEscrowGo: agentCount >= MIN_AGENTS_REQUIRED,
    minRequired: MIN_AGENTS_REQUIRED,
  });
}