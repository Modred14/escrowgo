import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";
import sharp from "sharp";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const NOMBA_BASE_URL = process.env.NOMBA_BASE_URL || "https://api.nomba.com";
const MAX_IMAGES = 3;
const MAX_RAW_IMAGE_BYTES = 15 * 1024 * 1024; // matches the "less than 15MB" hint on the form

let cachedNombaToken = null;
let cachedNombaTokenExpiry = 0;

async function getNombaAccessToken() {
  if (cachedNombaToken && Date.now() < cachedNombaTokenExpiry - 60_000) {
    return cachedNombaToken;
  }

  const res = await fetch(`${NOMBA_BASE_URL}/v1/auth/token/issue`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accountId: process.env.NOMBA_ACCOUNT_ID,
    },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: process.env.NOMBA_CLIENT_ID,
      client_secret: process.env.NOMBA_CLIENT_SECRET,
    }),
  });

 const json = await res.json();
if (!res.ok || json.code !== "00") {
  console.error("Nomba auth failed:", res.status, JSON.stringify(json), {
  clientIdLen: process.env.NOMBA_CLIENT_ID,
  accountIdLen: process.env.NOMBA_ACCOUNT_ID,
});
  throw new Error(json?.description || "Failed to authenticate with Nomba");
}

  cachedNombaToken = json.data.access_token;
  cachedNombaTokenExpiry = new Date(json.data.expiresAt).getTime();
  return cachedNombaToken;
}

async function createNombaCheckout({ orderReference, amount, customerEmail, callbackUrl, productName }) {
  const token = await getNombaAccessToken();

  const res = await fetch(`${NOMBA_BASE_URL}/v1/checkout/order`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      accountId: process.env.NOMBA_ACCOUNT_ID,
    },
    body: JSON.stringify({
      order: {
        orderReference,
        amount: amount.toFixed(2),
        currency: "NGN",
        customerEmail: customerEmail || undefined,
        callbackUrl,
        orderMetaData: { productName },
      },
    }),
  });

  const json = await res.json();
  if (!res.ok || json.code !== "00") {
    throw new Error(json?.description || "Failed to create Nomba checkout order");
  }

  return json.data; 
}
async function compressImage(file) {
  const arrayBuffer = await file.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);

  return sharp(inputBuffer)
    .rotate()
    .resize({ width: 1280, withoutEnlargement: true })
    .jpeg({ quality: 65, mozjpeg: true })
    .toBuffer();
}

async function uploadBufferToCloudinary(buffer, folder) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary is not configured (missing cloud name or upload preset)");
  }

  const form = new FormData();
  form.append("file", new Blob([buffer], { type: "image/jpeg" }));
  form.append("upload_preset", uploadPreset);
  form.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: form },
  );

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message || "Cloudinary upload failed");
  }

  return json; 
}


function calculateDeliveryFee({ deliveryOption, buyerLocation, sellerLocation }) {
  if (deliveryOption !== "ESCROWGO") return 0;

  const sameCountry =
    buyerLocation.countryCode &&
    sellerLocation.countryCode &&
    buyerLocation.countryCode === sellerLocation.countryCode;

  const sameState =
    sameCountry &&
    buyerLocation.stateCode &&
    sellerLocation.stateCode &&
    buyerLocation.stateCode === sellerLocation.stateCode;

  if (sameState) return 2500;
  if (sameCountry) return 5000;
  return 20000;
}

function estimatedDeliveryDaysFor({ deliveryOption, buyerLocation, sellerLocation }) {
  if (deliveryOption !== "ESCROWGO") return 3;

  const sameCountry = buyerLocation.countryCode === sellerLocation.countryCode;
  const sameState = sameCountry && buyerLocation.stateCode === sellerLocation.stateCode;

  if (sameState) return 2;
  if (sameCountry) return 5;
  return 10;
}

function formatLocationString(loc) {
  return [loc.city, loc.stateName, loc.countryCode].filter(Boolean).join(", ");
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}


export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();

    const productName = (formData.get("productName") || "").toString().trim();
    const description = (formData.get("description") || "").toString().trim();
    const price = Number(formData.get("price"));
    const deliveryOption = (formData.get("deliveryOption") || "").toString();
    const buyerEmail = (formData.get("buyerEmail") || "").toString().trim() || null;

    let buyerLocation;
    let sellerLocation;
    try {
      buyerLocation = JSON.parse(formData.get("buyerLocation"));
      sellerLocation = JSON.parse(formData.get("sellerLocation"));
    } catch {
      return NextResponse.json({ error: "Invalid location data" }, { status: 400 });
    }

    if (!productName) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: "A valid price is required" }, { status: 400 });
    }
    if (!["ESCROWGO", "SELF"].includes(deliveryOption)) {
      return NextResponse.json({ error: "A valid delivery option is required" }, { status: 400 });
    }
    if (!buyerLocation?.city || !sellerLocation?.city) {
      return NextResponse.json({ error: "Buyer and seller locations are required" }, { status: 400 });
    }

    const imageFiles = formData.getAll("images").filter((f) => f instanceof File && f.size > 0);
    if (imageFiles.length === 0) {
      return NextResponse.json({ error: "At least one product image is required" }, { status: 400 });
    }
    if (imageFiles.length > MAX_IMAGES) {
      return NextResponse.json({ error: `You can upload up to ${MAX_IMAGES} images` }, { status: 400 });
    }
    for (const file of imageFiles) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: `"${file.name}" is not an image` }, { status: 400 });
      }
      if (file.size > MAX_RAW_IMAGE_BYTES) {
        return NextResponse.json({ error: `"${file.name}" is larger than 15MB` }, { status: 400 });
      }
    }

    const imageUrls = [];
    for (const file of imageFiles) {
      const compressed = await compressImage(file);
      const uploaded = await uploadBufferToCloudinary(compressed, `deals/${session.user.id}`);
      imageUrls.push(uploaded.secure_url);
    }

    const deliveryFee = calculateDeliveryFee({ deliveryOption, buyerLocation, sellerLocation });
    const estimatedDeliveryDays = estimatedDeliveryDaysFor({ deliveryOption, buyerLocation, sellerLocation });
    const total = price + deliveryFee;

    const slug = `${slugify(productName)}-${crypto.randomBytes(4).toString("hex")}`;
    const orderReference = crypto.randomUUID();

   const nombaData = await createNombaCheckout({
      orderReference,
      amount: total,
      customerEmail: buyerEmail,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/deal/${slug}/complete`,
      productName,
    });
console.log("NOMBA RESPONSE:", JSON.stringify(nombaData, null, 2));
   const deal = await prisma.deal.create({
      data: {
        slug,
        sellerId: session.user.id,
        sellerLocation: formatLocationString(sellerLocation),
        buyerLocation: formatLocationString(buyerLocation),
        deliveryOption,
        estimatedDeliveryDays,
        deliveryFee,
        expectedDeliveryDate: new Date(Date.now() + estimatedDeliveryDays * 86400000),
        status: "PENDING_PAYMENT",
        product: {
          create: {
            name: productName,
            description,
            price,
            images: imageUrls,
          },
        },
        payments: {
          create: {
            amount: total,
            currency: "NGN",
            provider: "nomba",
            providerRef: nombaData.orderReference,
            checkoutUrl: nombaData.checkoutLink,
            status: "PENDING",
          },
        },
        qrCode: {
          create: {
            code: crypto.randomBytes(16).toString("hex"),
          },
        },
      },
      include: { product: true, payments: true },
    });
    return NextResponse.json({
      dealSlug: deal.slug,
      paymentLink: nombaData.checkoutLink,
      amount: total,
      deliveryFee,
    });
  } catch (error) {
    console.error("create-deal error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong while creating the order" },
      { status: 500 },
    );
  }
}