import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface ProductProps {
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    category: string;
    stock: number;
    slug?: string;
  };
}

export default function ProductCard({ product }: ProductProps) {
  const [imageError, setImageError] = useState(false);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock < 5;

  const imageSrc = imageError || !product.images?.[0] 
    ? 'https://res.cloudinary.com/demo/image/upload/v1/samples/shoe.jpg' 
    : product.images[0];

  return (
    <Link href={`/products/${product._id}`} className="block h-full">
      <div className="group cursor-pointer bg-white rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col h-full relative w-full">
        
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-[#f6f6f6] w-full">
          <Image 
            src={imageSrc} 
            alt={product.name} 
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain p-4 sm:p-8 group-hover:scale-110 transition-transform duration-700 ease-in-out"
            onError={() => setImageError(true)}
          />
          
          {/* Badge: Category - Scaled for mobile */}
          <div className="absolute top-3 left-3 sm:top-6 sm:left-6 bg-white/90 backdrop-blur-md text-black text-[7px] sm:text-[9px] px-2 sm:px-4 py-1.5 sm:py-2 rounded-full font-[1000] uppercase tracking-widest shadow-sm z-10">
            {product.category}
          </div>

          {/* Low Stock / Sold Out Indicators */}
          {isOutOfStock ? (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center z-20">
              <span className="bg-black text-white px-4 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-xs font-black uppercase italic tracking-widest -rotate-6 shadow-2xl">
                Sold Out
              </span>
            </div>
          ) : isLowStock ? (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[90%] sm:w-[80%] z-20">
               <div className="bg-orange-600 text-white text-[7px] sm:text-[8px] font-black uppercase py-1 sm:py-1.5 px-2 sm:px-3 rounded-full text-center tracking-tighter animate-pulse">
                 Only {product.stock} Left – Grab Fast! 🔥
               </div>
            </div>
          ) : null}
        </div>

        {/* Content Section - Responsive Padding */}
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col flex-grow w-full">
          <div className="flex justify-between items-start mb-1 sm:mb-2">
            <p className="text-[8px] sm:text-[9px] font-[1000] text-gray-400 uppercase tracking-[0.1em] sm:tracking-[0.2em]">KickStreet Original</p>
          </div>
          
          {/* Title: Break words to prevent overflow on very long names */}
          <h3 className="text-gray-900 font-black text-base sm:text-lg lg:text-xl uppercase italic leading-tight sm:leading-none mb-4 sm:mb-6 group-hover:text-orange-600 transition-colors break-words line-clamp-2">
            {product.name}
          </h3>
          
          <div className="mt-auto flex justify-between items-center gap-2">
            <div className="flex flex-col min-w-0">
              <span className="text-gray-400 text-[8px] sm:text-[9px] font-black uppercase tracking-widest leading-none mb-1">Price tag</span>
              <span className="text-black font-[1000] text-lg sm:text-xl lg:text-2xl tracking-tighter italic truncate">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            </div>
            
            {/* Action Circle - Scaled for mobile touch targets */}
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-50 text-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-300 transform group-hover:rotate-[360deg]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}