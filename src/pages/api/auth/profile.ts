import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  if (!session?.user?.email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  await dbConnect();

  if (req.method === 'GET') {
    try {
      const user = await User.findOne({ email: session.user.email }).select('-password -otp -otpExpires');
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ success: true, user });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  } else if (req.method === 'PUT') {
    try {
      const { name, phone, shippingAddress } = req.body;
      
      // Check if phone is already taken by another user
      if (phone) {
        const existingUser = await User.findOne({ 
          phone, 
          email: { $ne: session.user.email } 
        });
        
        if (existingUser) {
          return res.status(400).json({ message: "Phone number already in use" });
        }
      }

      const updateData: any = {};
      if (name) updateData.name = name;
      if (phone) updateData.phone = phone;
      if (shippingAddress) updateData.shippingAddress = shippingAddress;

      const user = await User.findOneAndUpdate(
        { email: session.user.email },
        updateData,
        { new: true }
      ).select('-password -otp -otpExpires');

      res.status(200).json({ success: true, user });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
