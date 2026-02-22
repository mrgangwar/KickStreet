import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { getServerSession } from "next-auth/next";
import authOptions from "../auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Admin Security Check
  const session = await getServerSession(req, res, authOptions);
  if (!session || (session as any).user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { filter } = req.query;
      const filterType = filter || 'all';
      
      // Calculate date range based on filter
      let dateFilter = {};
      const now = new Date();
      
      switch (filterType) {
        case 'today':
          const todayStart = new Date(now.setHours(0, 0, 0, 0));
          dateFilter = { createdAt: { $gte: todayStart } };
          break;
        case 'week':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - 7);
          dateFilter = { createdAt: { $gte: weekStart } };
          break;
        case 'month':
          const monthStart = new Date(now);
          monthStart.setMonth(now.getMonth() - 1);
          dateFilter = { createdAt: { $gte: monthStart } };
          break;
        default:
          dateFilter = {};
      }

      // 2. Calculate Total Revenue (from PAID orders only)
      const revenueData = await Order.aggregate([
        {
          $match: {
            status: 'Paid',
            ...dateFilter
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amountTotal' }
          }
        }
      ]);

      // Get counts by payment status
      const pendingOrders = await Order.countDocuments({ 
        status: 'Pending',
        ...(Object.keys(dateFilter).length > 0 ? dateFilter : {})
      });
      const paidOrders = await Order.countDocuments({ 
        status: 'Paid',
        ...(Object.keys(dateFilter).length > 0 ? dateFilter : {})
      });
      const failedOrders = await Order.countDocuments({ 
        status: 'Failed',
        ...(Object.keys(dateFilter).length > 0 ? dateFilter : {})
      });
      
      // Get counts by order status (logistics)
      const processingOrders = await Order.countDocuments({ 
        orderStatus: 'Processing',
        ...(Object.keys(dateFilter).length > 0 ? dateFilter : {})
      });
      const shippedOrders = await Order.countDocuments({ 
        orderStatus: 'Shipped',
        ...(Object.keys(dateFilter).length > 0 ? dateFilter : {})
      });
      const deliveredOrders = await Order.countDocuments({ 
        orderStatus: 'Delivered',
        ...(Object.keys(dateFilter).length > 0 ? dateFilter : {})
      });
      const cancelledOrders = await Order.countDocuments({ 
        orderStatus: 'Cancelled',
        ...(Object.keys(dateFilter).length > 0 ? dateFilter : {})
      });
      
      // Total products count
      const productsCount = await Product.countDocuments({ isActive: true });
      
      // 3. Fetch Recent Orders (For Dashboard Table)
      const recentOrders = await Order.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .select('_id email amountTotal status orderStatus createdAt items')
        .lean();

      // 4. Get All Orders for Report (more data for export)
      const allOrders = await Order.find(dateFilter)
        .sort({ createdAt: -1 })
        .select('_id email amountTotal status orderStatus createdAt items')
        .lean();

      res.status(200).json({
        success: true,
        stats: {
          totalRevenue: revenueData[0]?.totalRevenue || 0,
          totalOrders: paidOrders + pendingOrders + failedOrders,
          productsCount,
          pendingOrders,
          paidOrders,
          failedOrders,
          processingOrders,
          shippedOrders,
          deliveredOrders,
          cancelledOrders,
          recentOrders: recentOrders.map(order => ({
            _id: order._id,
            email: order.email,
            amountTotal: order.amountTotal,
            status: order.status,
            orderStatus: order.orderStatus,
            createdAt: order.createdAt,
            items: order.items
          })),
          allOrders: allOrders.map(order => ({
            _id: order._id,
            email: order.email,
            amountTotal: order.amountTotal,
            status: order.status,
            orderStatus: order.orderStatus,
            createdAt: order.createdAt,
            items: order.items
          })),
          filter: filterType
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
