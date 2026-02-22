import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: "METHOD NOT ALLOWED" });
  }

  await dbConnect();

  try {
    const { email, otp } = req.body;

    // Data Validation
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "EMAIL AND OTP ARE REQUIRED" });
    }

    // Normalize email to match registration logic
    const normalizedEmail = email.toLowerCase().trim();

    // 2. Find the user (must explicitly select otp and otpExpires since they have select:false in model)
    const user = await User.findOne({ email: normalizedEmail }).select('+otp +otpExpires');

    if (!user) {
      return res.status(404).json({ success: false, message: "USER NOT FOUND. PLEASE REGISTER AGAIN." });
    }

    // 3. Check if user is already verified (Prevention of double requests)
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "ACCOUNT ALREADY VERIFIED. PLEASE LOGIN." });
    }

    // 4. Validate OTP and Expiry
    const currentTIme = new Date();
    const isOtpValid = user.otp === otp;
    const isNotExpired = currentTIme < new Date(user.otpExpires);

    if (!isOtpValid) {
      return res.status(400).json({ success: false, message: "INVALID HEAT CODE. DOUBLE CHECK YOUR INBOX." });
    }

    if (!isNotExpired) {
      return res.status(400).json({ success: false, message: "CODE EXPIRED. PLEASE REQUEST A NEW ONE." });
    }

    // 5. Success: Update user status and wipe OTP data
    user.isVerified = true;
    user.otp = undefined; 
    user.otpExpires = undefined;
    
    await user.save();

    return res.status(200).json({ 
      success: true, 
      message: "IDENTITY VERIFIED. WELCOME TO THE CREW! 🔥" 
    });

  } catch (error: any) {
    console.error("VERIFY_OTP_ERROR:", error);
    return res.status(500).json({ success: false, message: "SERVER ERROR. TRY AGAIN." });
  }
}