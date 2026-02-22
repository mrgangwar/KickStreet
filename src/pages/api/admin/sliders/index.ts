import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import dbConnect from '@/lib/db';
import Slider from '@/models/Slider';
import Product from '@/models/Product';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const session = await getServerSession(req, res, authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return res.status(403).json({ success: false, message: "ACCESS DENIED: ADMIN ONLY" });
  }

  // GET: Fetch all sliders
  if (req.method === 'GET') {
    try {
      const sliders = await Slider.find({}).sort({ order: 1 }).lean();
      
      // Convert ObjectId to string for serialization
      const serializedSliders = JSON.parse(JSON.stringify(sliders)).map((slider: any) => ({
        ...slider,
        productId: slider.productId ? slider.productId.toString() : null
      }));
      
      // If no sliders exist, fetch latest products to auto-populate
      if (serializedSliders.length === 0) {
        const latestProducts = await Product.find({})
          .sort({ createdAt: -1 })
          .limit(3)
          .lean();
        
        // Create default sliders from latest products
        const defaultSliders = latestProducts.map((product, index) => ({
          image: product.images?.[0] || '',
          productId: product._id ? product._id.toString() : null,
          title: product.name,
          subtitle: `₹${product.price.toLocaleString('en-IN')}`,
          order: index,
          isActive: true
        }));
        
        if (defaultSliders.length > 0) {
          const createdSliders = await Slider.insertMany(defaultSliders);
          const createdSerialized = JSON.parse(JSON.stringify(createdSliders)).map((slider: any) => ({
            ...slider,
            productId: slider.productId ? slider.productId.toString() : null
          }));
          return res.status(200).json({ success: true, sliders: createdSerialized });
        }
      }
      
      res.status(200).json({ success: true, sliders: serializedSliders });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  // POST: Create new slider
  else if (req.method === 'POST') {
    try {
      const { image, productId, title, subtitle, order } = req.body;

      // Check max sliders (3)
      const count = await Slider.countDocuments();
      if (count >= 3) {
        return res.status(400).json({ 
          success: false, 
          message: "MAXIMUM 3 SLIDERS ALLOWED. DELETE ONE FIRST." 
        });
      }

      const slider = await Slider.create({
        image,
        productId: productId || null,
        title: title || "",
        subtitle: subtitle || "",
        order: order || count,
        isActive: true
      });

      res.status(201).json({ success: true, slider });
    } catch (error: any) {
      console.error("ADMIN_SLIDER_POST_ERROR:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
