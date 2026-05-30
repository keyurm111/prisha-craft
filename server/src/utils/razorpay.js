const crypto = require("crypto");

/**
 * Create a new Order in Razorpay
 * @param {number} amount - Amount in INR (will be converted to paise)
 * @param {string} receiptId - Internal order reference ID
 */
async function createRazorpayOrder(amount, receiptId) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are missing in server environment");
  }

  // Convert amount to paise (e.g. ₹500.50 => 50050 paise)
  const amountInPaise = Math.round(amount * 100);

  try {
    const authString = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${authString}`
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt: receiptId
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.description || "Failed to create Razorpay order");
    }

    return {
      razorpayOrderId: data.id,
      amount: data.amount,
      currency: data.currency
    };
  } catch (error) {
    console.error("Razorpay Order Creation API Error:", error.message);
    throw error;
  }
}

/**
 * Verify Razorpay payment signature
 */
function verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new Error("Razorpay key secret is missing in environment");
  }

  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  return generatedSignature === razorpaySignature;
}

/**
 * Verify Razorpay webhook signature
 * @param {string} body - Raw string request body
 * @param {string} signature - Header signature X-Razorpay-Signature
 * @param {string} webhookSecret - Custom secret set in dashboard
 */
function verifyWebhookSignature(body, signature, webhookSecret) {
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}

function isPlaceholderCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return !keyId || !keySecret || keyId.includes("placeholder") || keySecret.includes("placeholder");
}

/**
 * Create a new Refund in Razorpay for a paid order
 * @param {string} paymentId - The Razorpay Payment ID
 * @param {number} amount - Amount in INR (will be converted to paise)
 * @param {string} receiptId - Idempotent reference ID for the refund
 */
async function createRazorpayRefund(paymentId, amount, receiptId) {
  if (isPlaceholderCredentials()) {
    console.log(`Razorpay: Simulating refund for payment: ${paymentId}, amount: ₹${amount}`);
    return {
      refundId: "rfnd_MOCK_" + Math.floor(Math.random() * 10000000),
      amount: Math.round(amount * 100),
      status: "processed"
    };
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  try {
    const authString = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const amountInPaise = Math.round(amount * 100);

    const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${authString}`
      },
      body: JSON.stringify({
        amount: amountInPaise,
        speed: "normal",
        receipt: receiptId
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.description || "Failed to initiate Razorpay refund");
    }

    return {
      refundId: data.id,
      amount: data.amount,
      status: data.status
    };
  } catch (error) {
    console.error("Razorpay Refund API Error:", error.message);
    throw error;
  }
}

module.exports = {
  createRazorpayOrder,
  verifySignature,
  verifyWebhookSignature,
  createRazorpayRefund
};
