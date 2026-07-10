import crypto from "crypto";

const BASE_URL = process.env.NOMBA_BASE_URL;

export function isMockMode() {
  return (
    process.env.PAYMENTS_MOCK_MODE === "true" ||
    !process.env.NOMBA_CLIENT_ID ||
    !process.env.NOMBA_CLIENT_SECRET
  );
}

let cachedToken = null;
let tokenExpiresAt = 0;


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


export async function createCheckoutOrder({ orderReference, amount, currency, callbackUrl, customerEmail, description }) {
  if (isMockMode()) {
    return {
      checkoutUrl: `/pay/mock?ref=${orderReference}`,
      providerOrderId: `MOCK-${orderReference}`,
      mock: true,
    };
  }

  const token = await getAccessToken();

  const isSandbox = BASE_URL?.includes("sandbox.nomba.com");
  const checkoutPath = isSandbox ? "/sandbox/checkout/order" : "/v1/checkout/order";
  const res = await fetch(`${BASE_URL}${checkoutPath}`, {
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

export async function verifyTransactionStatus({ orderReference }) {
  if (isMockMode()) {
    return { status: "SUCCESS", mock: true };
  }

  const token = await getAccessToken();

  async function query(paramName) {
    const res = await fetch(
      `${BASE_URL}/v1/transactions/accounts/single?${paramName}=${orderReference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          accountId: process.env.NOMBA_ACCOUNT_ID,
        },
      },
    );
    return res;
  }

  
  let res = await query("orderReference");
  if (res.status === 404) {
    res = await query("orderId");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Nomba transaction verification failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return { status: data?.data?.status, mock: false, raw: data };
}

let cachedBanks = null;
let banksCachedAt = 0;

export async function fetchBanks() {
  if (isMockMode()) {
    return [
      { name: "Access Bank", code: "044" },
      { name: "Guaranty Trust Bank", code: "058" },
      { name: "Zenith Bank", code: "057" },
      { name: "First Bank of Nigeria", code: "011" },
      { name: "United Bank for Africa", code: "033" },
      { name: "Opay", code: "999992" },
      { name: "Kuda Bank", code: "090267" },
      { name: "Moniepoint MFB", code: "50515" },
    ];
  }

  if (cachedBanks && Date.now() < banksCachedAt + 60 * 60 * 1000) {
    return cachedBanks;
  }

  const token = await getAccessToken();
  const res = await fetch(`${BASE_URL}/v1/transfers/banks`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      accountId: process.env.NOMBA_ACCOUNT_ID,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Nomba fetch banks failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  const list = data?.data?.results || data?.data || [];
  cachedBanks = list.map((b) => ({ name: b.name, code: b.code }));
  banksCachedAt = Date.now();
  return cachedBanks;
}

export async function lookupBankAccount({ accountNumber, bankCode }) {
  if (isMockMode()) {
    return { accountNumber, accountName: "Demo Account (Mock Mode)" };
  }

  const token = await getAccessToken();
  const res = await fetch(`${BASE_URL}/v1/transfers/bank/lookup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      accountId: process.env.NOMBA_ACCOUNT_ID,
    },
    body: JSON.stringify({ accountNumber, bankCode }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Nomba account lookup failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return {
    accountNumber: data?.data?.accountNumber || accountNumber,
    accountName: data?.data?.accountName,
  };
}


export async function transferToBank({
  amount,
  accountNumber,
  accountName,
  bankCode,
  merchantTxRef,
  senderName,
  narration,
}) {
  if (isMockMode()) {
    return {
      status: "SUCCESS",
      providerRef: `MOCK-WD-${merchantTxRef}`,
      mock: true,
    };
  }

  const token = await getAccessToken();
  const res = await fetch(`${BASE_URL}/v2/transfers/bank`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      accountId: process.env.NOMBA_ACCOUNT_ID,
    },
    body: JSON.stringify({
      amount,
      accountNumber,
      accountName,
      bankCode,
      merchantTxRef,
      senderName,
      narration,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return {
      status: "FAILED",
      providerRef: data?.data?.id || null,
      message: data?.message || data?.description || `Transfer failed (${res.status})`,
      mock: false,
    };
  }

  return {
    status: data?.data?.status || "PENDING",
    providerRef: data?.data?.id || null,
    message: data?.message || data?.description,
    mock: false,
  };
}

export function verifyWebhookSignature(rawBody, signature) {
  if (isMockMode()) return true;
  if (!signature || !process.env.NOMBA_WEBHOOK_SECRET) {
    console.log("[webhook debug] missing signature or secret", {
      signaturePresent: !!signature,
      secretPresent: !!process.env.NOMBA_WEBHOOK_SECRET,
    });
    return false;
  }

  const expected = crypto
    .createHmac("sha256", process.env.NOMBA_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  console.log("[webhook debug] secret loaded:", JSON.stringify(process.env.NOMBA_WEBHOOK_SECRET));
  console.log("[webhook debug] signature received:", signature);
  console.log("[webhook debug] signature expected:", expected);
  console.log("[webhook debug] match:", signature === expected);

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}


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