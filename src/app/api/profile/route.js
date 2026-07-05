import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const data = {};

  if (typeof body.name === "string") {
    const trimmed = body.name.trim();
    if (!trimmed) {
      return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 });
    }
    data.name = trimmed;
  }
  if (typeof body.country === "string") data.country = body.country;
  if (typeof body.city === "string") data.city = body.city;

  if (body.image === null) {
    data.image = null;
  } else if (typeof body.image === "string") {
    try {
      data.image = await uploadToCloudinary(body.image);
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      return NextResponse.json(
        { error: "Failed to upload image." },
        { status: 400 },
      );
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: { name: true, country: true, city: true, image: true },
  });

  return NextResponse.json(updated);
}