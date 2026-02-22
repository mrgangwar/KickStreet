import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import cloudinary from '@/lib/cloudinary';

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  // 1. Security Check (Admin Only)
  const session = await getServerSession(req, res, authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return res.status(403).json({ success: false, message: "UNAUTHORIZED: ADMIN ACCESS ONLY" });
  }

  // --- GET: Fetch all products ---
  if (req.method === 'GET') {
    try {
      const products = await Product.find({}).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, products });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // --- POST: Create new product ---
  if (req.method === 'POST') {
    try {
      const { name, description, price, category, sizes, colors, stock, images } = req.body;

      if (!images || images.length === 0) {
        return res.status(400).json({ success: false, message: "AT LEAST ONE IMAGE IS REQUIRED" });
      }

      // 2. Cloudinary Upload (Optimized)
      const uploadedImageUrls: string[] = []; 
      
      for (const img of images) {
        const result = await cloudinary.uploader.upload(img, {
          folder: 'kickstreet_products',
          resource_type: 'image',
          transformation: [{ width: 1000, crop: "scale", quality: "auto" }] // Auto-optimization
        });
        uploadedImageUrls.push(result.secure_url); 
      }

      // 3. Create Product in DB
      const product = await Product.create({
        name,
        description,
        price,
        category,
        sizes,
        colors,
        stock,
        images: uploadedImageUrls, // Match with Product model
      });

      return res.status(201).json({ success: true, product });

    } catch (error: any) {
      console.error("ADMIN_PRODUCT_POST_ERROR:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // 4. Method Not Allowed
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}