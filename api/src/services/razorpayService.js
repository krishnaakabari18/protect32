const Razorpay = require('razorpay');
const crypto = require('crypto');

const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error('Razorpay keys not configured in .env');
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

// ── Plans ──────────────────────────────────────────────────────────────────

const createRazorpayPlan = async ({ name, amount, currency = 'INR', interval = 'monthly', interval_count = 1 }) => {
  const rz = getRazorpayInstance();
  return rz.plans.create({
    period: interval,          // daily | weekly | monthly | yearly
    interval: interval_count,
    item: {
      name,
      amount: Math.round(amount * 100), // paise
      currency,
      description: name,
    },
  });
};

// ── Customers ─────────────────────────────────────────────────────────────

const createRazorpayCustomer = async ({ name, email, contact }) => {
  const rz = getRazorpayInstance();
  return rz.customers.create({ name, email, contact, fail_existing: 0 });
};

// ── Subscriptions ─────────────────────────────────────────────────────────

const createRazorpaySubscription = async ({ razorpay_plan_id, customer_id, total_count = 12, notes = {} }) => {
  const rz = getRazorpayInstance();
  return rz.subscriptions.create({
    plan_id: razorpay_plan_id,
    customer_notify: 1,
    quantity: 1,
    total_count,
    customer_id,
    notes,
  });
};

const cancelRazorpaySubscription = async (razorpay_subscription_id, cancel_at_cycle_end = 0) => {
  const rz = getRazorpayInstance();
  return rz.subscriptions.cancel(razorpay_subscription_id, cancel_at_cycle_end);
};

const fetchRazorpaySubscription = async (razorpay_subscription_id) => {
  const rz = getRazorpayInstance();
  return rz.subscriptions.fetch(razorpay_subscription_id);
};

// ── Signature Verification ────────────────────────────────────────────────

const verifyPaymentSignature = ({ razorpay_payment_id, razorpay_subscription_id, razorpay_signature }) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  const body = `${razorpay_payment_id}|${razorpay_subscription_id}`;
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return expected === razorpay_signature;
};

const verifyWebhookSignature = (rawBody, signature) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return expected === signature;
};

module.exports = {
  createRazorpayPlan,
  createRazorpayCustomer,
  createRazorpaySubscription,
  cancelRazorpaySubscription,
  fetchRazorpaySubscription,
  verifyPaymentSignature,
  verifyWebhookSignature,
};
