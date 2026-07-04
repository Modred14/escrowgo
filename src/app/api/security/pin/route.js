import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { newPin, confirmPin } = await req.json();

  if (!/^\d{4}$/.test(newPin || "") || !/^\d{4}$/.test(confirmPin || "")) {
    return NextResponse.json({ error: "Enter all 4 digits in both fields." }, { status: 400 });
  }
  if (newPin !== confirmPin) {
    return NextResponse.json({ error: "PINs don't match. Try again." }, { status: 400 });
  }

  const hashedPin = await bcrypt.hash(newPin, 10);
  const now = new Date();

  await prisma.user.update({
    where: { id: session.user.id },
    data: { pin: hashedPin, pinUpdatedAt: now },
  });

  return NextResponse.json({ pinSet: true, pinUpdatedAt: now });
}