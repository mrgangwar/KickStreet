import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import dbConnect from '@/lib/db';
import Slider from '@/models/Slider';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const session = await getServerSession(req, res, authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return res.status(403).json({ success: false, message: "ACCESS DENIED: ADMIN ONLY" });
  }

  const { id } = req.query;

  // GET: Single slider
  if (req.method === 'GET') {
    try {
      const slider = await Slider.findById(id).lean();
      if (!slider) {
        return res.status(404).json({ success: false, message: "SLIDER NOT FOUND" });
      }
      const serializedSlider = {
        ...JSON.parse(JSON.stringify(slider)),
        productId: slider.productId ? slider.productId.toString() : null
      };
      res.status(200).json({ success: true, slider: serializedSlider });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  // PUT: Update slider
  else if (req.method === 'PUT') {
    try {
      const { image, productId, title, subtitle, order, isActive } = req.body;

      const updateData: any = {};
      if (image) updateData.image = image;
      if (productId !== undefined) updateData.productId = productId || null;
      if (title !== undefined) updateData.title = title;
      if (subtitle !== undefined) updateData.subtitle = subtitle;
      if (order !== undefined) updateData.order = order;
      if (isActive !== undefined) updateData.isActive = isActive;

      const slider = await Slider.findByIdAndUpdate(id, updateData, { new: true }).lean();
      
      if (!slider) {
        return res.status(404).json({ success: false, message: "SLIDER NOT FOUND" });
      }
      
      const serializedSlider = {
        ...JSON.parse(JSON.stringify(slider)),
        productId: slider.productId ? slider.productId.toString() : null
      };
      
      res.status(200).json({ success: true, slider: serializedSlider });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  // DELETE: Delete slider
  else if (req.method === 'DELETE') {
    try {
      const slider = await Slider.findByIdAndDelete(id);
      
      if (!slider) {
        return res.status(404).json({ success: false, message: "SLIDER NOT FOUND" });
      }
      
      res.status(200).json({ success: true, message: "SLIDER DELETED SUCCESSFULLY" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
