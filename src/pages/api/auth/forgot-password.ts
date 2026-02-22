import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendResetPasswordOTPEmail, generateOTP, getOTPExpiry } from '@/lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: "METHOD NOT ALLOWED" });
  }

  await dbConnect();

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "EMAIL IS REQUIRED" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({ 
        success: true, 
        message: "IF EMAIL EXISTS, OTP WILL BE SENT" 
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(400).json({ 
        success: false, 
        message: "ACCOUNT NOT VERIFIED. PLEASE REGISTER AGAIN." 
      });
    }

    // Generate OTP using consistent function
    const otp = generateOTP();
    const otpExpires = getOTPExpiry();

    // Save OTP to user
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP Email
    try {
      await sendResetPasswordOTPEmail(normalizedEmail, otp);
    } catch (emailError) {
      console.error("EMAIL_SERVICE_ERROR:", emailError);
      return res.status(500).json({ 
        success: false, 
        message: "FAILED TO SEND OTP. PLEASE CHECK YOUR EMAIL ADDRESS." 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: "OTP SENT TO YOUR EMAIL FOR PASSWORD RESET" 
    });

  } catch (error: any) {
    console.error("FORGOT_PASSWORD_API_ERROR:", error);
    return res.status(500).json({ 
      success: false, 
      message: "INTERNAL SERVER ERROR. PLEASE TRY AGAIN." 
    });
  }
}
