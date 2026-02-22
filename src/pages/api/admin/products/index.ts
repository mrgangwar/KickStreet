import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import mongoose from 'mongoose';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

// Newsletter model
const NewsletterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Newsletter = mongoose.models.Newsletter || mongoose.model('Newsletter', NewsletterSchema);

// Email sending function
async function sendNewProductEmails(product: any) {
  try {
    const subscribers = await Newsletter.find({ isActive: true }).select('email');
    
    if (subscribers.length === 0) return;
    
    const emails = subscribers.map(s => s.email);
    
    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    // For now, we'll log the notification
    console.log(`📧 Would send new product notification to ${emails.length} subscribers:`);
    console.log(`   Product: ${product.name} - ₹${product.price}`);
    console.log(`   Emails: ${emails.join(', ')}`);
    
    // TODO: Integrate with email service
    // await sendEmail({
    //   to: emails,
    //   subject: `NEW DROP: ${product.name} | KICKSTREET`,
    //   html: `...`
    // });
  } catch (error) {
    console.error('Failed to send new product emails:', error);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  // Admin authentication check
  const session = await getServerSession(req, res, authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return res.status(403).json({ success: false, message: "ACCESS DENIED: ADMIN ONLY" });
  }

  // GET: Fetch all products
  if (req.method === 'GET') {
    try {
      const products = await Product.find({}).sort({ createdAt: -1 });
      res.status(200).json({ success: true, products });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
  // POST: Create new product (handled by [id].ts for consistency, but keep here too)
  else if (req.method === 'POST') {
    try {
      const { name, description, price, category, sizes, colors, stock, images } = req.body;

      if (!images || images.length === 0) {
        return res.status(400).json({ success: false, message: "AT LEAST ONE IMAGE IS REQUIRED" });
      }

      const product = await Product.create({
        name,
        description,
        price,
        category,
        sizes: sizes || [],
        colors: colors || [],
        stock,
        images
      });

      // Send emails to newsletter subscribers
      await sendNewProductEmails(product);

      return res.status(201).json({ success: true, product });
    } catch (error: any) {
      console.error("ADMIN_PRODUCT_POST_ERROR:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
