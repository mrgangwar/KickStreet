import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: "METHOD NOT ALLOWED" });
  }

  await dbConnect();

  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ success: false, message: "SESSION ID REQUIRED" });
    }

    // Find order by Stripe session ID
    const order = await Order.findOne({ stripeSessionId: session_id });

    if (!order) {
      return res.status(404).json({ success: false, message: "ORDER NOT FOUND" });
    }

    res.status(200).json({ success: true, order });
  } catch (error: any) {
    console.error("VERIFY_SESSION_ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}
