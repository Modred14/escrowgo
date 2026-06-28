import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isMockMode } from "@/lib/nomba";
import { markPaymentSuccess } from "@/lib/payment-service";

export async function POST(req) {
  if (!isMockMode()) {
    return NextResponse.json({ error: "Mock payments are disabled — live Nomba keys are configured." }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { paymentId } = await req.json();
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  if (payment.buyerId !== session.user.id) {
    return NextResponse.json({ error: "This payment does not belong to you." }, { status: 403 });
  }

  const result = await markPaymentSuccess(paymentId);
  return NextResponse.json({ success: true, alreadyProcessed: result.alreadyProcessed });
}