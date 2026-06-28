import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password, phone, role, location, vehicleType } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const isDeliveryAgent = role === "DELIVERY_AGENT";

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashed,
        phone: phone || null,
        role: isDeliveryAgent ? "DELIVERY_AGENT" : "USER",
        ...(isDeliveryAgent && {
          deliveryAgent: {
            create: {
              location: location || "Lagos",
              vehicleType: vehicleType || "Bike",
            },
          },
        }),
      },
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Something went wrong creating your account." }, { status: 500 });
  }
}
