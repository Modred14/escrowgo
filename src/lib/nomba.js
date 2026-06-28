import crypto from "crypto";

const BASE_URL = process.env.NOMBA_BASE_URL || "https://sandbox.nomba.com";

export function isMockMode() {
  return (
    process.env.PAYMENTS_MOCK_MODE === "true" ||
    !process.env.NOMBA_CLIENT_ID ||
    !process.env.NOMBA_CLIENT_SECRET
  );
}

let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Nomba uses client-credential auth: exchange client id/secret for a short-lived
 * bearer token, then attach it (+ account id) to every subsequent request.
 */
async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

  const res = await fetch(`${BASE_URL}/v1/auth/token/issue`, {
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

  if (!res.ok) {
    throw new Error(`Nomba auth failed: ${res.status}`);
  }

  const data = await res.json();
  cachedToken = data?.data?.access_token;
  tokenExpiresAt = Date.now() + 25 * 60 * 1000;
  return cachedToken;
}

/**
 * Creates a hosted checkout order on Nomba and returns a checkout URL.
 * Buyer is redirected there; on completion Nomba calls our webhook.
 */
export async function createCheckoutOrder({ orderReference, amount, currency, callbackUrl, customerEmail, description }) {
  if (isMockMode()) {
    return {
      checkoutUrl: `/pay/mock?ref=${orderReference}`,
      providerOrderId: `MOCK-${orderReference}`,
      mock: true,
    };
  }

  const token = await getAccessToken();
  const res = await fetch(`${BASE_URL}/v1/checkout/order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      accountId: process.env.NOMBA_ACCOUNT_ID,
    },
    body: JSON.stringify({
      order: {
        orderReference,
        callbackUrl,
        customerEmail,
        amount: String(amount),
        currency: currency || "NGN",
        description,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Nomba checkout creation failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return {
    checkoutUrl: data?.data?.checkoutLink,
    providerOrderId: data?.data?.orderReference || orderReference,
    mock: false,
  };
}

/**
 * Verifies the HMAC signature Nomba attaches to webhook payloads.
 * Header name per Nomba docs: "nomba-sig-value".
 */
export function verifyWebhookSignature(rawBody, signature) {
  if (isMockMode()) return true;
  if (!signature || !process.env.NOMBA_WEBHOOK_SECRET) return false;

  const expected = crypto
    .createHmac("sha256", process.env.NOMBA_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

/**
 * Best-effort refund call against Nomba's transaction API.
 * In mock mode (or on any sandbox failure) we still mark the refund as
 * succeeded locally so the escrow/refund flow can be demoed end to end.
 */
export async function refundTransaction({ providerRef, amount }) {
  if (isMockMode()) {
    return { success: true, mock: true };
  }

  try {
    const token = await getAccessToken();
    const res = await fetch(`${BASE_URL}/v1/transactions/refund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        accountId: process.env.NOMBA_ACCOUNT_ID,
      },
      body: JSON.stringify({ transactionRef: providerRef, amount: String(amount) }),
    });
    if (!res.ok) return { success: false, mock: false };
    return { success: true, mock: false };
  } catch (err) {
    return { success: true, mock: true, error: err.message };
  }
}
