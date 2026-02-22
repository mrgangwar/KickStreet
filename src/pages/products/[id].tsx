import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Toast from '@/components/Toast';
import { useCart } from '@/context/CartContext';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Image from 'next/image';

export default function ProductDetails({ product }: { product: any }) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' | 'info' });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleAddToBag = () => {
    if (!selectedSize) {
      showToast('Please select a size first', 'error');
      return;
    }

    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url || product.images[0],
      size: selectedSize,
      quantity: 1
    });

    showToast('Added to bag successfully!', 'success');
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-400 font-black uppercase tracking-widest">Product Not Found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      
      {/* Mobile-first container */}
      <div className="w-full max-w-7xl mx-auto">
        {/* Breadcrumb - Mobile */}
        <div className="px-4 py-3 md:hidden border-b border-gray-100">
          <p className="text-xs text-gray-400 font-medium truncate">
            Home / {product.category} / {product.name}
          </p>
        </div>

        {/* Main Grid - Mobile First */}
        <div className="grid grid-cols-1 lg:grid-cols-2">
          
          {/* Left: Image Gallery */}
          <div className="w-full">
            {/* Main Image */}
            <div className="relative w-full aspect-[4/5] md:aspect-square bg-gray-50">
              <Image 
                src={product.images[selectedImage]?.url || product.images[selectedImage] || '/placeholder.png'} 
                alt={product.name} 
                fill 
                className="object-contain p-4 md:p-8"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              
              {/* Badge */}
              <div className="absolute top-4 left-4 md:top-6 md:left-6">
                <span className="bg-white/90 backdrop-blur-sm text-black text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider shadow-sm">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Thumbnail Strip - Horizontal Scroll on Mobile */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto px-4 py-3 md:px-6 md:py-4 scrollbar-hide">
                {product.images.map((img: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-black shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image 
                      src={img.url || img} 
                      alt={`${product.name} ${index + 1}`} 
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="w-full px-4 py-6 md:px-8 md:py-8 lg:sticky lg:top-0 lg:h-fit">
            {/* Breadcrumb - Desktop */}
            <div className="hidden md:block mb-4">
              <p className="text-xs text-gray-400 font-medium">
                Home / {product.category} / <span className="text-black">{product.name}</span>
              </p>
            </div>

            {/* Brand & Art No */}
            <div className="flex items-center gap-3 mb-2">
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                Art No. {String(product._id).slice(-6).toUpperCase()}
              </span>
            </div>

            {/* Title - Premium Hierarchy */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase italic tracking-tight text-black mb-3 leading-none">
              {product.name}
            </h1>

            {/* Price - Prominent */}
            <div className="mb-6">
              <span className="text-2xl md:text-3xl font-bold tracking-tight text-black">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Size Selector - Clean Grid */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Select Size (UK)</h4>
                <button className="text-xs font-bold text-orange-600 underline underline-offset-2 uppercase">
                  Size Guide
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2 md:gap-3">
                {product.sizes.map((size: string) => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 md:py-4 border-2 rounded-xl font-bold text-sm transition-all ${
                      selectedSize === size 
                      ? 'bg-black text-white border-black shadow-lg scale-[1.02]' 
                      : 'bg-white border-gray-200 hover:border-black text-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {!selectedSize && (
                <p className="text-xs text-red-500 mt-2 font-medium">Please select a size</p>
              )}
            </div>

            {/* Add to Cart - Full Width Mobile */}
            <div className="space-y-3 mb-6">
              <button 
                onClick={handleAddToBag}
                disabled={!selectedSize}
                className={`w-full py-4 md:py-[18px] rounded-2xl font-black text-base uppercase tracking-wider transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 ${
                  selectedSize 
                  ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-200' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {selectedSize ? 'Add to Bag' : 'Select Size'}
              </button>
            </div>

            {/* Product Details */}
            <div className="border-t border-gray-100 pt-6 space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Description</h4>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">{product.description}</p>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-gray-50 text-xs font-medium text-gray-600 rounded-full">
                  100% Authentic
                </span>
                <span className="px-3 py-1.5 bg-gray-50 text-xs font-medium text-gray-600 rounded-full">
                  Free Shipping
                </span>
                <span className="px-3 py-1.5 bg-gray-50 text-xs font-medium text-gray-600 rounded-full">
                  Easy Returns
                </span>
              </div>
            </div>

            {/* Footer Note */}
            <p className="text-center mt-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Free delivery on orders above ₹4,999
            </p>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.show} 
        onClose={() => setToast({ ...toast, show: false })} 
      />
    </div>
  );
}

// Server-Side Data Fetching
export async function getServerSideProps({ params }: any) {
  await dbConnect();
  try {
    const productData = await Product.findById(params.id).lean();
    if (!productData) return { notFound: true };

    // Handle both string array and object array for images
    const product = JSON.parse(JSON.stringify(productData));

    return {
      props: {
        product
      }
    };
  } catch (error) {
    return { notFound: true };
  }
}
