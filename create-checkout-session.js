const Stripe = require('stripe');

module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).end('Method Not Allowed');
    }

    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret || !secret.startsWith('sk_')) {
      return res.status(500).json({ error: 'Invalid STRIPE_SECRET_KEY. Use sk_...' });
    }
    const stripe = new Stripe(secret);

    const origin = process.env.FRONTEND_URL || `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Test Results Access' },
            unit_amount: 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=1`,
    });

    return res.status(200).json({ id: session.id, url: session.url });
  } catch (e) {
    console.error('Error in create-checkout-session:', e);
    return res.status(500).json({ error: e?.message || 'Failed to create checkout session' });
  }
};
