import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import cloudinary from '@/lib/cloudinary';

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Admin authentication check
  const session = await getServerSession(req, res, authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return res.status(403).json({ success: false, message: "ACCESS DENIED: ADMIN ONLY" });
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ message: "Image is required" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: 'kickstreet_sliders',
      transformation: [
        { width: 1920, height: 1080, crop: 'fill' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    res.status(200).json({ 
      success: true, 
      url: result.secure_url 
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ message: "Upload failed" });
  }
}
