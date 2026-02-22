import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';

const NewsletterSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true 
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Newsletter = mongoose.models.Newsletter || mongoose.model('Newsletter', NewsletterSchema);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await dbConnect();

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if already subscribed
    const existing = await Newsletter.findOne({ email: email.toLowerCase() });
    
    if (existing) {
      return res.status(400).json({ message: "You're already on the list!" });
    }

    // Add to newsletter
    await Newsletter.create({ email });

    res.status(201).json({ 
      success: true, 
      message: "Welcome to the crew! You'll be first to know about new drops." 
    });
  } catch (error: any) {
    console.error('Newsletter error:', error);
    res.status(500).json({ message: "Server error" });
  }
}
