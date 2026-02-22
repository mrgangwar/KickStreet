import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';
import { sendOTPEmail, generateOTP, getOTPExpiry } from '@/lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: "METHOD NOT ALLOWED" });
  }

  await dbConnect();

  try {
    const { name, email, phone, password } = req.body;

    // 1. Data Validation & Normalization
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: "ALL FIELDS ARE REQUIRED" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email: normalizedEmail }, { phone }] 
    });

    if (existingUser) {
      const field = existingUser.email === normalizedEmail ? "EMAIL" : "PHONE";
      return res.status(400).json({ 
        success: false, 
        message: `${field} ALREADY REGISTERED. TRY LOGGING IN.` 
      });
    }

    // 3. Generate OTP using consistent function
    const otp = generateOTP();
    const otpExpires = getOTPExpiry();

    // 4. Hash Password
    const hashedPassword = await hashPassword(password);

    // 5. Send OTP Email FIRST 
    try {
      await sendOTPEmail(normalizedEmail, otp);
    } catch (emailError) {
      console.error("EMAIL_SERVICE_ERROR:", emailError);
      return res.status(500).json({ 
        success: false, 
        message: "FAILED TO SEND OTP. PLEASE CHECK YOUR EMAIL ADDRESS." 
      });
    }

    // 6. Create User (Unverified)
    await User.create({
      name,
      email: normalizedEmail,
      phone,
      password: hashedPassword,
      otp,
      otpExpires,
      isVerified: false
    });

    return res.status(201).json({ 
      success: true, 
      message: "OTP SENT! CHECK YOUR INBOX 🔥" 
    });

  } catch (error: any) {
    console.error("REGISTER_API_ERROR:", error);
    return res.status(500).json({ 
      success: false, 
      message: "INTERNAL SERVER ERROR. PLEASE TRY AGAIN." 
    });
  }
}
