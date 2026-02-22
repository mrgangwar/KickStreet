import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

async function getRawBody(readable: NextApiRequest) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia' as any,
});

export const config = { api: { bodyParser: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig!, endpointSecret!);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;

    await dbConnect();

    try {
      // Parse order data from metadata
      const orderData = JSON.parse(session.metadata?.orderData || '[]');
      
      // Get line items for more details
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

      // Map line items with metadata
      const orderItems = lineItems.data.map((item: any) => {
        const metadata = item.price?.product_data?.metadata || {};
        return {
          productId: metadata.productId || null,
          name: item.description,
          quantity: item.quantity,
          price: item.amount_total / 100 / item.quantity,
          size: metadata.size || 'N/A',
          image: item.price?.product_data?.images?.[0] || ''
        };
      });

      // Create order in database
      const newOrder = await Order.create({
        email: session.customer_details?.email || session.customer_email,
        items: orderItems,
        amountTotal: session.amount_total / 100,
        paymentMethod: 'stripe',
        status: 'Paid',
        orderStatus: 'Processing',
        stripeSessionId: session.id,
        shippingAddress: {
          line1: session.shipping_details?.address?.line1 || '',
          city: session.shipping_details?.address?.city || '',
          state: session.shipping_details?.address?.state || '',
          postal_code: session.shipping_details?.address?.postal_code || '',
          country: session.shipping_details?.address?.country || ''
        }
      });

      console.log(`🚀 Order ${newOrder._id} created via Stripe webhook!`);
    } catch (error) {
      console.error('Error creating order from webhook:', error);
    }
  }

  res.status(200).json({ received: true });
}
