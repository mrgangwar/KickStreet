import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface ISlider extends Document {
  image: string;
  productId: mongoose.Types.ObjectId | null;
  title: string;
  subtitle: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SliderSchema = new Schema<ISlider>({
  image: { 
    type: String, 
    required: [true, "Slider image is required"] 
  },
  productId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Product', 
    default: null 
  },
  title: { 
    type: String, 
    default: "" 
  },
  subtitle: { 
    type: String, 
    default: "" 
  },
  order: { 
    type: Number, 
    default: 0 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
}, { timestamps: true });

// Maximum 3 sliders
SliderSchema.pre('save', function(next) {
  if (this.isNew) {
    // Use the model directly
    const SliderModel = mongoose.models.Slider || mongoose.model<ISlider>('Slider', SliderSchema);
    SliderModel.countDocuments().then(count => {
      if (count >= 3) {
        (next as any)(new Error('Maximum 3 sliders allowed. Please delete an existing slider first.'));
      } else {
        (next as any)();
      }
    }).catch((err: Error) => {
      (next as any)(err);
    });
  } else {
    (next as any)();
  }
});

const Slider = models.Slider || model<ISlider>('Slider', SliderSchema);

export default Slider;
