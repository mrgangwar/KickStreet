import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import cloudinary from '@/lib/cloudinary';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const session = await getServerSession(req, res, authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return res.status(403).json({ success: false, message: "ACCESS DENIED" });
  }

  const { id } = req.query;

  // --- 1. GET: Single Product ---
  if (req.method === 'GET') {
    try {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ success: false, message: "NOT FOUND" });
      return res.status(200).json({ success: true, product });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  } 

  // --- 2. PUT: Update Product ---
  else if (req.method === 'PUT') {
    try {
      const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!updatedProduct) return res.status(404).json({ success: false, message: "PRODUCT NOT FOUND" });
      return res.status(200).json({ success: true, product: updatedProduct });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // --- 3. DELETE: Wipe Product & Cloudinary Assets ---
  else if (req.method === 'DELETE') {
    try {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ success: false, message: "NOT FOUND" });

      // Cloudinary Clean-up
      if (product.images && product.images.length > 0) {
        for (const imageUrl of product.images) {
          try {
            // URL se public_id nikalne ka safer tareeka
            const parts = imageUrl.split('/');
            const filename = parts.pop()?.split('.')[0]; // public_id without extension
            const folder = parts.pop(); // kickstreet_products
            const publicId = `${folder}/${filename}`;
            
            await cloudinary.uploader.destroy(publicId);
          } catch (cloudErr) {
            console.error("Cloudinary Delete Error:", cloudErr);
          }
        }
      }

      await Product.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: "PRODUCT BURNED SUCCESSFULLY! 🔥" });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: "DELETE FAILED" });
    }
  } 

  else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ message: `METHOD ${req.method} NOT ALLOWED` });
  }
}