const Stripe = require('stripe');

module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).end('Method Not Allowed');
    }

    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret || !secret.startsWith('sk_')) {
      return res.status(500).json({ error: 'Invalid STRIPE_SECRET_KEY. Use sk_...' });
    }
    const stripe = new Stripe(secret);

    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing id' });

    const session = await stripe.checkout.sessions.retrieve(id);
    return res.status(200).json({
      id: session.id,
      payment_status: session.payment_status,
      status: session.status,
      amount_total: session.amount_total,
      currency: session.currency,
    });
  } catch (e) {
    console.error('Error in checkout-session:', e);
    return res.status(500).json({ error: e?.message || 'Failed to retrieve session' });
  }
};
