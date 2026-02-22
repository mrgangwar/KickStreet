import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Name is required"] },
  email: { 
    type: String, 
    required: [true, "Email is required"], 
    unique: true,
    lowercase: true,
    trim: true 
  },
  phone: { 
    type: String, 
    required: [true, "Phone number is required"], 
    unique: true,
    trim: true
  },
  password: { 
    type: String, 
    required: [true, "Password is required"],
    select: false 
  },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  isVerified: { type: Boolean, default: false },
  otp: { type: String, select: false }, 
  otpExpires: { type: Date, select: false },
  shippingAddress: {
    line1: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    postal_code: { type: String, default: '' },
    country: { type: String, default: 'IN' },
    phone: { type: String, default: '' },
  },
}, { timestamps: true });


export default mongoose.models.User || mongoose.model('User', UserSchema);