import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      phone,
      role,
      country,
      city,
      location,
      vehicleType,
    } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required." },
        { status: 400 },
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 },
      );
    }

    const normalizedPhone = phone ? phone.trim() : null;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    
    if (normalizedPhone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone: normalizedPhone },
      });
      if (existingPhone) {
        return NextResponse.json(
          { error: "An account with that phone number already exists." },
          { status: 409 },
        );
      }
    }
    if (existing) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 },
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    const isDeliveryAgent = role === "DELIVERY_AGENT";
    const resolvedLocation =
      location || [city, country].filter(Boolean).join(", ") || null;

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashed,
        phone: normalizedPhone,
        country: country || null,
        city: city || null,
        role: isDeliveryAgent ? "DELIVERY_AGENT" : "USER",
        ...(isDeliveryAgent && {
          deliveryAgent: {
            create: {
              location: resolvedLocation || "Lagos",
              vehicleType: vehicleType || "Bike",
            },
          },
        }),
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Something went wrong creating your account." },
      { status: 500 },
    );
  }
}
