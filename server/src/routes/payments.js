const router = require('express').Router();
const crypto = require('crypto');
const { z } = require('zod');
const { pool, requireAuth, validate } = require('../middleware/core');

/**
 * Premium unlock — ₹100 one-time.
 *
 * Three verification paths, one per platform. Only the SERVER may mark a user
 * premium; the client never self-reports. All handlers write to `purchases`
 * (audit trail) and set users.premium = true inside one transaction.
 *
 * PRODUCTION SETUP:
 *  Razorpay (web):  set RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET. Create the
 *    order server-side (POST /order), then verify the checkout signature:
 *    HMAC_SHA256(order_id + '|' + payment_id, key_secret) must equal
 *    razorpay_signature. Also register a webhook for payment.captured.
 *  Google Play:    verify purchaseToken with the Play Developer API
 *    (purchases.products.get) using a service account; check purchaseState=0.
 *  Apple IAP:      verify with the App Store Server API (JWS transactions),
 *    NOT the deprecated /verifyReceipt endpoint.
 */

const PREMIUM_PRICE_PAISE = 100 * 100; // ₹100

async function grantPremium(userId, platform, reference) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO purchases (user_id, platform, reference, amount_paise)
       VALUES ($1, $2, $3, $4) ON CONFLICT (reference) DO NOTHING`,
      [userId, platform, reference, PREMIUM_PRICE_PAISE]
    );
    await client.query('UPDATE users SET premium = true WHERE id = $1', [userId]);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

/** POST /api/payments/razorpay/order — create an order for the web checkout. */
router.post('/razorpay/order', requireAuth, async (_req, res) => {
  // Production: call Razorpay Orders API here and return { orderId, amount, keyId }.
  if (!process.env.RAZORPAY_KEY_ID) {
    return res.status(501).json({ error: 'Razorpay not configured. Set RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET.' });
  }
  res.status(501).json({ error: 'Wire the Razorpay Orders API call here.' });
});

/** POST /api/payments/razorpay/verify — verify checkout signature, grant premium. */
router.post(
  '/razorpay/verify',
  requireAuth,
  validate(z.object({
    razorpay_order_id: z.string().max(64),
    razorpay_payment_id: z.string().max(64),
    razorpay_signature: z.string().max(128),
  })),
  async (req, res, next) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      const secret = process.env.RAZORPAY_KEY_SECRET;
      if (!secret) return res.status(501).json({ error: 'Razorpay not configured' });
      const expected = crypto
        .createHmac('sha256', secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');
      const valid =
        expected.length === razorpay_signature.length &&
        crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature));
      if (!valid) return res.status(400).json({ error: 'Signature verification failed' });
      await grantPremium(req.user.sub, 'razorpay', razorpay_payment_id);
      res.json({ ok: true, premium: true });
    } catch (err) { next(err); }
  }
);

/** POST /api/payments/google/verify — verify a Play Billing purchase token. */
router.post(
  '/google/verify',
  requireAuth,
  validate(z.object({ purchaseToken: z.string().max(512), productId: z.string().max(120) })),
  async (_req, res) => {
    // Production: googleapis androidpublisher.purchases.products.get(...)
    res.status(501).json({ error: 'Wire the Play Developer API verification here.' });
  }
);

/** POST /api/payments/apple/verify — verify an App Store transaction. */
router.post(
  '/apple/verify',
  requireAuth,
  validate(z.object({ signedTransaction: z.string().max(8192) })),
  async (_req, res) => {
    // Production: verify the JWS with Apple's App Store Server API.
    res.status(501).json({ error: 'Wire the App Store Server API verification here.' });
  }
);

module.exports = router;
