import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import cloudinary from '@/lib/cloudinary';

// Get authOptions dynamically to avoid module resolution issues
async function getAuthOptions(req: NextApiRequest, res: NextApiResponse) {
  const { getServerSession } = await import("next-auth/next");
  const { authOptions } = await import("../../auth/[...nextauth]");
  return authOptions;
}

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const { getServerSession } = await import("next-auth/next");
  const { authOptions } = await import("../../auth/[...nextauth]");
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || (session.user as any).role !== 'admin') {
    return res.status(403).json({ success: false, message: "ACCESS DENIED: ADMIN ONLY" });
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
      const { name, description, price, category, sizes, colors, stock, images } = req.body;
      
      const updateData: any = {};
      if (name) updateData.name = name;
      if (description) updateData.description = description;
      if (price) updateData.price = price;
      if (category) updateData.category = category;
      if (sizes) updateData.sizes = sizes;
      if (colors) updateData.colors = colors;
      if (stock !== undefined) updateData.stock = stock;
      if (images && images.length > 0) updateData.images = images;

      const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
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
            
            const parts = imageUrl.split('/');
            const filename = parts.pop()?.split('.')[0]; 
            const folder = parts.pop(); 
            const publicId = `${folder}/${filename}`;
            
            await cloudinary.uploader.destroy(publicId);
          } catch (cloudErr) {
            console.error("Cloudinary Delete Error:", cloudErr);
          }
        }
      }

      await Product.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: "PRODUCT DELETED SUCCESSFULLY!" });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: "DELETE FAILED" });
    }
  } 

  else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ message: `METHOD ${req.method} NOT ALLOWED` });
  }
}
