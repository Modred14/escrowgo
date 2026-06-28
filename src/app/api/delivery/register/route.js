import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { name, email, password, phone, location, vehicleType } = await req.json();

    if (!name || !email || !password || !location) {
      return NextResponse.json({ error: "Name, email, password and location are required." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashed,
        phone: phone || null,
        role: "DELIVERY_AGENT",
        deliveryAgent: {
          create: {
            location,
            vehicleType: vehicleType || "Bike",
          },
        },
      },
    });

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error("Delivery register error:", err);
    return NextResponse.json({ error: "Something went wrong creating your courier account." }, { status: 500 });
  }
}
