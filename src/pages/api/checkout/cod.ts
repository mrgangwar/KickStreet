import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Order from '@/models/Order';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: "Method not allowed" });

  try {
    // Get session to get user email
    const session = await getSession({ req });
    const { items, shippingAddress } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in cart" });
    }

    // Get user email from session or body
    const email = session?.user?.email || req.body.email;
    
    if (!email) {
      return res.status(400).json({ message: "Email is required for checkout" });
    }

    await dbConnect();

    // Verify products and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const dbProduct = await Product.findById(item._id);
      
      if (!dbProduct) {
        return res.status(400).json({ message: `Product ${item.name} not found` });
      }

      // Check stock
      if (dbProduct.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
      }

      totalAmount += dbProduct.price * item.quantity;
      
      orderItems.push({
        productId: dbProduct._id,
        name: dbProduct.name,
        quantity: item.quantity,
        price: dbProduct.price,
        size: item.size,
        image: item.image || ''
      });

      // Reduce stock
      await Product.findByIdAndUpdate(item._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // Create COD order
    const order = await Order.create({
      email,
      items: orderItems,
      amountTotal: totalAmount,
      paymentMethod: 'cod',
      status: 'Pending',
      orderStatus: 'Processing',
      stripeSessionId: null,
      shippingAddress: {
        line1: shippingAddress?.line1 || '',
        city: shippingAddress?.city || '',
        state: shippingAddress?.state || '',
        postal_code: shippingAddress?.postal_code || '',
        country: shippingAddress?.country || 'IN',
        phone: shippingAddress?.phone || ''
      }
    });

    res.status(201).json({ 
      success: true, 
      message: "COD order placed successfully!",
      orderId: order._id 
    });
  } catch (err: any) {
    console.error("COD CHECKOUT ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
}
