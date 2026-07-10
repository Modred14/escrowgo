
const crypto = require("crypto");

const orderReference = process.argv[2];
const targetUrl = process.argv[3] || "http://localhost:3000/api/webhooks/nomba";
const secret = process.env.NOMBA_WEBHOOK_SECRET || "NombaHackathon2026";

if (!orderReference) {
  console.error("Usage: node test-webhook.js <providerRef> [targetUrl]");
  process.exit(1);
}

const payload = JSON.stringify({
  event_type: "payment_success",
  data: {
    orderReference,
    status: "success",
  },
});

const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

console.log("Target:", targetUrl);
console.log("Payload:", payload);
console.log("Signature:", signature);
console.log("---");

fetch(targetUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "nomba-signature": signature,
  },
  body: payload,
})
  .then(async (res) => {
    console.log("Response status:", res.status);
    const body = await res.json().catch(() => null);
    console.log("Response body:", body);
    if (res.status === 200) {
      console.log("\n✅ Webhook accepted. Now check Prisma Studio: the matching");
      console.log("   Payment should be SUCCESS, Deal should be FUNDS_HELD,");
      console.log("   and an Escrow row should exist with status HELD.");
    } else {
      console.log("\n⚠️  Non-200 response — check your server's terminal for the error.");
    }
  })
  .catch((err) => {
    console.error("Request failed:", err.message);
    console.error("If targeting your tunnel URL, this usually means the tunnel is down or the URL is stale.");
  });
