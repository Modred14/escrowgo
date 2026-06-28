/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const PRODUCT_IMAGES_PHONE = [
  "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80",
  "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80",
];
const PRODUCT_IMAGES_CAMERA = [
  "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80",
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80",
];
const PRODUCT_IMAGES_SNEAKERS = [
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
  "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80",
];

function slugify(text) {
  const base = text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}

function randomToken(length = 10) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

async function main() {
  console.log("Seeding escrowgo…");

  const password = await bcrypt.hash("password123", 10);

  await prisma.notification.deleteMany();
  await prisma.qRCode.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.escrow.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.product.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.deliveryAgent.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: { name: "Escrowgo Admin", email: "admin@escrowgo.test", password, role: "ADMIN" },
  });

  const seller = await prisma.user.create({
    data: { name: "Ada Obi", email: "seller@escrowgo.test", password, role: "USER", phone: "08031112222" },
  });

  const buyer = await prisma.user.create({
    data: { name: "Tunde Bello", email: "buyer@escrowgo.test", password, role: "USER", phone: "08033334444" },
  });

  const courierUser = await prisma.user.create({
    data: {
      name: "Chidi Okeke",
      email: "courier@escrowgo.test",
      password,
      role: "DELIVERY_AGENT",
      phone: "08055556666",
      deliveryAgent: { create: { location: "Lagos", vehicleType: "Bike" } },
    },
    include: { deliveryAgent: true },
  });

  // --- Deal 1: fresh, awaiting payment (escrowgo Delivery, covered route) ---
  await prisma.deal.create({
    data: {
      slug: slugify("iPhone 13 Pro Max 256GB"),
      sellerId: seller.id,
      sellerLocation: "Lagos",
      buyerLocation: "Abuja",
      deliveryOption: "ESCROWGO",
      estimatedDeliveryDays: 3,
      bufferDays: 7,
      deliveryFee: 3500,
      status: "PENDING_PAYMENT",
      product: {
        create: {
          name: "iPhone 13 Pro Max 256GB",
          description: "Used, excellent condition. Battery health 91%. Comes with original box and charger.",
          price: 450000,
          images: PRODUCT_IMAGES_PHONE,
        },
      },
    },
  });

  // --- Deal 2: paid, escrowgo Delivery, unassigned — ready for courier to accept ---
  const deal2 = await prisma.deal.create({
    data: {
      slug: slugify("Canon EOS M50 Camera"),
      sellerId: seller.id,
      buyerId: buyer.id,
      sellerLocation: "Lagos",
      buyerLocation: "Abuja",
      deliveryOption: "ESCROWGO",
      estimatedDeliveryDays: 2,
      bufferDays: 7,
      deliveryFee: 3500,
      status: "FUNDS_HELD",
      expectedDeliveryDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      product: {
        create: {
          name: "Canon EOS M50 Camera",
          description: "Mirrorless camera, barely used, includes 15-45mm kit lens and 32GB SD card.",
          price: 280000,
          images: PRODUCT_IMAGES_CAMERA,
        },
      },
    },
    include: { product: true },
  });
  await prisma.payment.create({
    data: { dealId: deal2.id, buyerId: buyer.id, amount: 283500, providerRef: `EGO-${randomToken()}`, status: "SUCCESS", paidAt: new Date() },
  });
  await prisma.escrow.create({ data: { dealId: deal2.id, amount: 280000, status: "HELD" } });
  await prisma.delivery.create({
    data: { dealId: deal2.id, pickupLocation: "Lagos", dropoffLocation: "Abuja", fee: 3500, status: "UNASSIGNED" },
  });

  // --- Deal 3: delivered, self-delivery, QR ready — scan this on /scanner to demo release ---
  const deal3 = await prisma.deal.create({
    data: {
      slug: slugify("Nike Air Max Sneakers"),
      sellerId: seller.id,
      buyerId: buyer.id,
      sellerLocation: "Lagos",
      buyerLocation: "Lagos",
      deliveryOption: "SELF",
      estimatedDeliveryDays: 1,
      bufferDays: 0,
      deliveryFee: 0,
      status: "DELIVERED",
      expectedDeliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      product: {
        create: {
          name: "Nike Air Max Sneakers",
          description: "Brand new, size 43, never worn — wrong size ordered.",
          price: 65000,
          images: PRODUCT_IMAGES_SNEAKERS,
        },
      },
    },
    include: { product: true },
  });
  await prisma.payment.create({
    data: { dealId: deal3.id, buyerId: buyer.id, amount: 65000, providerRef: `EGO-${randomToken()}`, status: "SUCCESS", paidAt: new Date() },
  });
  await prisma.escrow.create({ data: { dealId: deal3.id, amount: 65000, status: "HELD" } });
  const delivery3 = await prisma.delivery.create({
    data: {
      dealId: deal3.id,
      pickupLocation: "Lagos",
      dropoffLocation: "Lagos",
      fee: 0,
      status: "DELIVERED",
      pickedUpAt: new Date(),
      deliveredAt: new Date(),
    },
  });
  const demoCode = `EGO-${deal3.id.slice(-6).toUpperCase()}-${randomToken()}`;
  await prisma.qRCode.create({ data: { dealId: deal3.id, code: demoCode } });

  await prisma.notification.create({
    data: { userId: buyer.id, title: "Welcome to escrowgo", message: "Your account is ready.", type: "INFO" },
  });
  await prisma.notification.create({
    data: { userId: seller.id, title: "Welcome to escrowgo", message: "Create your first secure deal anytime.", type: "INFO" },
  });

  console.log("\nSeed complete. Demo accounts (all use password: password123):");
  console.log("  Admin    -> admin@escrowgo.test");
  console.log("  Seller   -> seller@escrowgo.test");
  console.log("  Buyer    -> buyer@escrowgo.test");
  console.log("  Courier  -> courier@escrowgo.test");
  console.log(`\nDeal ready for /scanner demo: "${deal3.product.name}"`);
  console.log(`  Release QR code value -> ${demoCode}`);
  console.log("  (paste this into the manual code field on /scanner while logged in as the seller)\n");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
