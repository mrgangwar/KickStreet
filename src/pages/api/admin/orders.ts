import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  // Dynamic import to avoid module resolution issues
  const { getServerSession } = await import("next-auth/next");
  const { authOptions } = await import("../auth/[...nextauth]");
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || (session.user as any).role !== 'admin') {
    return res.status(403).json({ success: false, message: "ACCESS DENIED: ADMIN ONLY" });
  }

  // GET: Fetch all orders
  if (req.method === 'GET') {
    try {
      const orders = await Order.find({}).sort({ createdAt: -1 });
      res.status(200).json({ success: true, orders });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  } 
  // PUT: Update order status
  else if (req.method === 'PUT') {
    try {
      const { orderId, orderStatus, status } = req.body;
      
      if (!orderId) {
        return res.status(400).json({ success: false, message: "ORDER ID IS REQUIRED" });
      }

      const updateData: any = {};
      if (orderStatus) updateData.orderStatus = orderStatus;
      if (status) updateData.status = status;

      const order = await Order.findByIdAndUpdate(orderId, updateData, { new: true });

      if (!order) {
        return res.status(404).json({ success: false, message: "ORDER NOT FOUND" });
      }

      res.status(200).json({ success: true, order, message: "ORDER UPDATED SUCCESSFULLY" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
