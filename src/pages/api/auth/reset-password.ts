import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: "METHOD NOT ALLOWED" });
  }

  await dbConnect();

  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "ALL FIELDS ARE REQUIRED" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email (must explicitly select otp and otpExpires since they have select:false in model)
    const user = await User.findOne({ email: normalizedEmail }).select('+otp +otpExpires');

    if (!user) {
      return res.status(404).json({ success: false, message: "USER NOT FOUND" });
    }

    // Validate OTP and Expiry
    const currentTime = new Date();
    const isOtpValid = user.otp === otp;
    const isNotExpired = currentTime < new Date(user.otpExpires);

    if (!isOtpValid) {
      return res.status(400).json({ success: false, message: "INVALID OTP" });
    }

    if (!isNotExpired) {
      return res.status(400).json({ success: false, message: "OTP EXPIRED. PLEASE REQUEST A NEW ONE." });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password and clear OTP
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.status(200).json({ 
      success: true, 
      message: "PASSWORD RESET SUCCESSFUL! PLEASE LOGIN." 
    });

  } catch (error: any) {
    console.error("RESET_PASSWORD_API_ERROR:", error);
    return res.status(500).json({ 
      success: false, 
      message: "INTERNAL SERVER ERROR. PLEASE TRY AGAIN." 
    });
  }
}
