import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate consistent OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Get OTP expiry time (5 minutes)
export const getOTPExpiry = (): Date => {
  return new Date(Date.now() + 5 * 60 * 1000);
};

export const sendOTPEmail = async (email: string, otp: string) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #ff6b00; font-style: italic; }
        .otp-box { background: #ff6b00; color: white; font-size: 36px; font-weight: bold; padding: 20px; text-align: center; border-radius: 8px; letter-spacing: 8px; }
        .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">KICKSTREET</div>
        </div>
        <h2>Welcome to KickStreet!</h2>
        <p>Your OTP for account verification is:</p>
        <div class="otp-box">${otp}</div>
        <p style="margin-top: 20px;">This OTP will expire in <strong>5 minutes</strong>.</p>
        <div class="footer">
          <p>If you didn't request this OTP, please ignore this email.</p>
          <p>&copy; 2026 KickStreet. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"KickStreet Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'KickStreet - Your OTP for Verification',
    html: htmlContent,
  };

  return await transporter.sendMail(mailOptions);
};

export const sendResetPasswordOTPEmail = async (email: string, otp: string) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #ff6b00; font-style: italic; }
        .otp-box { background: #ff6b00; color: white; font-size: 36px; font-weight: bold; padding: 20px; text-align: center; border-radius: 8px; letter-spacing: 8px; }
        .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">KICKSTREET</div>
        </div>
        <h2>Password Reset Request</h2>
        <p>Your OTP for password reset is:</p>
        <div class="otp-box">${otp}</div>
        <p style="margin-top: 20px;">This OTP will expire in <strong>5 minutes</strong>.</p>
        <div class="footer">
          <p>If you didn't request a password reset, please ignore this email or change your password immediately.</p>
          <p>&copy; 2026 KickStreet. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"KickStreet Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'KickStreet - Password Reset OTP',
    html: htmlContent,
  };

  return await transporter.sendMail(mailOptions);
};
