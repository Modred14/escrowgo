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

  const { current, next, confirm } = await req.json();

  if (!current || !next || !confirm) {
    return NextResponse.json({ error: "Fill in all three fields." }, { status: 400 });
  }
  if (next.length < 8) {
    return NextResponse.json(
      { error: "New password must be at least 8 characters." },
      { status: 400 },
    );
  }
  if (next !== confirm) {
    return NextResponse.json(
      { error: "New password and confirmation don't match." },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  const isValid = await bcrypt.compare(current, user.password);
  if (!isValid) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(next, 10);
  const now = new Date();

  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashedPassword, passwordUpdatedAt: now },
  });

  return NextResponse.json({ passwordUpdatedAt: now });
}