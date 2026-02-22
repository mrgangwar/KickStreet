import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
  email: { type: String, required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      size: { type: String, required: true },
      image: { type: String, default: '' },
    },
  ],
  amountTotal: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  
  // Payment Info
  paymentMethod: {
    type: String,
    enum: ['stripe', 'cod'],
    default: 'stripe'
  },
  status: { 
    type: String, 
    default: 'Pending',
    enum: ['Pending', 'Paid', 'Failed'] 
  },
  stripeSessionId: { type: String, default: null },

  // Logistics Tracking
  orderStatus: {
    type: String,
    default: 'Processing',
    enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned']
  },
  shippingAddress: {
    line1: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    postal_code: { type: String, default: '' },
    country: { type: String, default: '' },
    phone: { type: String, default: '' },
  },
  trackingId: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
