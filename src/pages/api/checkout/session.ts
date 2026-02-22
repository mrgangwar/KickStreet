import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: "Method not allowed" });

  try {
    // Get session to get user email
    const session = await getSession({ req });
    const { items } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in cart" });
    }

    // Get user email from session or body
    const email = session?.user?.email || req.body.email;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required for checkout" });
    }

    await dbConnect();

    
    const line_items = await Promise.all(items.map(async (item: any) => {
      const dbProduct = await Product.findById(item._id);
      
      if (!dbProduct) throw new Error(`Product ${item.name} not found`);

      return {
        price_data: {
          currency: 'inr',
          product_data: {
            name: `${dbProduct.name} (Size: UK ${item.size})`,
            images: item.image ? [item.image] : [],
            metadata: {
              productId: item._id,
              size: item.size
            }
          },
          unit_amount: Math.round(dbProduct.price * 100), // DB original price
        },
        quantity: item.quantity,
      };
    }));

    // 2. Stripe Session 
    const session_stripe = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      shipping_address_collection: { allowed_countries: ['IN'] }, 
      line_items,
      mode: 'payment',
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cart`,
      customer_email: email,
      // Metadata for Webhook (Order Table fill )
      metadata: {
        email,
        orderData: JSON.stringify(items.map((i: any) => ({
          id: i._id,
          size: i.size,
          qty: i.quantity
        })))
      },
    });

    //  URL to frontend 
    res.status(200).json({ url: session_stripe.url });
  } catch (err: any) {
    console.error("STRIPE ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
}
