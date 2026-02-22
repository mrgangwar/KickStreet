import mongoose, { Schema, Document, model, models } from 'mongoose';

// 1. Interface
export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  sizes: string[];
  colors: string[];
  stock: number;
  images: string[];
  ratings: number;
  numOfReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: { 
    type: String, 
    required: [true, "Product name is required"], 
    trim: true,
    unique: true 
  },
  slug: { 
    type: String, 
    lowercase: true,
    unique: true 
  },
  description: { type: String, required: [true, "Description is required"] },
  price: { 
    type: Number, // ✅ FIX: 'number' ko 'Number' kar diya
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"] 
  },
  category: { 
    type: String, 
    required: [true, "Category is required"],
    enum: {
      values: ['Men', 'Women', 'Children'],
      message: '{VALUE} is not a valid category. Choose Men, Women, or Children.'
    }
  },
  brand: { type: String, default: "KickStreet" },
  sizes: [{ type: String, required: true }], 
  colors: [{ type: String }],
  stock: { 
    type: Number, 
    required: [true, "Stock is required"], 
    default: 0,
    min: [0, "Stock cannot be negative"]
  },
  images: [{ type: String, required: true }],
  ratings: { type: Number, default: 0 },
  numOfReviews: { type: Number, default: 0 },
}, { timestamps: true });

// 2. Pre-save hook (Async pattern for Mongoose 5+)
ProductSchema.pre('save', async function() {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')    
      .replace(/[\s_-]+/g, '-')     
      .replace(/^-+|-+$/g, '');     
  }
});

// 3. Model Export
const Product = models.Product || model<IProduct>('Product', ProductSchema);

export default Product;