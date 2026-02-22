import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Slider from '@/models/Slider';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';

interface SliderData {
  _id: string;
  image: string;
  productId: string | null;
  title: string;
  subtitle: string;
  order: number;
  isActive: boolean;
}

export default function Home({ products, sliders }: { products: any[]; sliders: SliderData[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoSliding, setIsAutoSliding] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    let result = [...products];
    
    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.category?.toLowerCase().includes(searchLower)
      );
    }
    
    // Category filter
    if (filter !== 'all') {
      result = result.filter(p => p.category === filter);
    }
    
    setFilteredProducts(result);
  }, [search, filter, products]);

  const categories = ['all', 'Men', 'Women', 'Children'];

  useEffect(() => {
    if (!isAutoSliding || sliders.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliders.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAutoSliding, sliders.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoSliding(false);
    // Resume auto-sliding after 10 seconds of user interaction
    setTimeout(() => setIsAutoSliding(true), 10000);
  };

  // Reset auto-slide when component mounts
  useEffect(() => {
    setIsAutoSliding(true);
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    
    setNewsletterStatus('loading');
    
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setNewsletterStatus('success');
        setNewsletterMessage(data.message);
        setNewsletterEmail('');
      } else {
        setNewsletterStatus('error');
        setNewsletterMessage(data.message);
      }
    } catch (error) {
      setNewsletterStatus('error');
      setNewsletterMessage('Something went wrong. Try again.');
    }
  };

  return (
    <div className="bg-[#fcfcfc] min-h-screen selection:bg-orange-600 selection:text-white overflow-x-hidden">
      <Head>
        <title>KICKSTREET | Authentic Sneakers & Streetwear</title>
        <meta name="description" content="Shop the hottest limited edition sneakers at KickStreet." />
      </Head>

      <Navbar />
      
      {/* ⚡ HERO SLIDER SECTION */}
      <section id="hero" className="relative bg-black text-white h-[85vh] sm:h-[90vh] flex items-center justify-center overflow-hidden">
        {sliders.length > 0 ? (
          sliders.map((slider, index) => (
            <div
              key={slider._id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0'
              }`}
            >
              <div className="absolute inset-0">
                <Image
                  src={slider.image || '/placeholder-hero.jpg'}
                  alt={slider.title}
                  fill
                  className="object-cover scale-105 animate-slow-zoom"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              </div>

              <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
                <span className="text-orange-500 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.4em] mb-4 animate-pulse">
                  {slider.subtitle || 'Limited Drop'}
                </span>
                <h1 className="text-[14vw] sm:text-7xl md:text-[8rem] font-[1000] italic tracking-tighter mb-8 uppercase leading-[0.85] max-w-[90vw]">
                  {slider.title || 'HEAT FOR YOUR FEET'}
                </h1>
                
                {slider.productId && (
                  <Link 
                    href={`/products/${slider.productId}`}
                    className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all active:scale-95"
                  >
                    SHOP THIS DROP
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                )}
              </div>
            </div>
          ))
        ) : (
          /* Static Fallback if no sliders exist */
          <div className="text-center px-6">
             <h1 className="text-[15vw] sm:text-8xl font-[1000] italic tracking-tighter uppercase leading-none">
               KICK <br /> STREET.
             </h1>
          </div>
        )}

        {/* Navigation Dots */}
        {sliders.length > 1 && (
          <div className="absolute bottom-10 flex gap-2 z-20">
            {sliders.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1 rounded-full transition-all duration-500 ${
                  index === currentSlide ? 'bg-orange-600 w-12' : 'bg-white/20 w-4'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* 👟 NEW ARRIVALS GRID WITH SEARCH & FILTER */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 md:py-16" id="products">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search shoes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 sm:py-4 pl-11 sm:pl-12 bg-gray-100 rounded-xl sm:rounded-full font-medium border-2 border-transparent outline-none focus:border-orange-500 focus:bg-white text-base sm:text-sm transition-all"
            />
            <svg 
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-3 sm:py-2 rounded-xl sm:rounded-full text-sm sm:text-xs font-black uppercase tracking-wider transition-all ${
                filter === cat 
                ? 'bg-orange-600 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>

        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-6">
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-[1000] italic uppercase tracking-tighter leading-none">
              Step Into the <span className="text-orange-600">Future</span>
            </h2>
            <p className="text-gray-400 font-bold text-[9px] sm:text-[10px] uppercase tracking-[0.25em] mt-3">
              Discover exclusive sneaker drops, premium street-style collections, and the freshest kicks — only at KickStreet.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <span className="h-[2px] w-12 bg-gray-200"></span>
            <p className="text-black font-black uppercase text-[10px] tracking-widest">
              {filteredProducts.length} Units Ready to Ship
            </p>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-24 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
            <p className="text-gray-400 text-xl italic font-black uppercase tracking-tighter">No Products Found</p>
            <p className="text-gray-400 text-xs mt-2">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-8 gap-y-12 sm:gap-y-16">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>

      {/* 📧 NEWSLETTER SECTION */}
      <section className="px-4 sm:px-6 mb-12">
        <div className="max-w-[1400px] mx-auto bg-black text-white py-16 sm:py-24 px-6 rounded-[2.5rem] text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none select-none text-[20vw] font-black italic whitespace-nowrap">
            NEWSLETTER NEWSLETTER
          </div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter mb-4">Join the Crew</h3>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-10">Get early access to limited drops.</p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="YOUR@EMAIL.COM" 
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                disabled={newsletterStatus === 'loading' || newsletterStatus === 'success'}
                className="flex-1 p-5 bg-white/10 rounded-2xl outline-none font-black text-xs focus:bg-white focus:text-black transition-all border border-white/10 disabled:opacity-50" 
                required
              />
              <button 
                type="submit"
                disabled={newsletterStatus === 'loading'}
                className="bg-orange-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all active:scale-95 disabled:opacity-50"
              >
                {newsletterStatus === 'loading' ? 'Joining...' : newsletterStatus === 'success' ? 'Joined!' : 'Subscribe'}
              </button>
            </form>
            {newsletterMessage && (
              <p className={`mt-4 text-xs font-black uppercase tracking-wider ${newsletterStatus === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {newsletterMessage}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export async function getServerSideProps() {
  await dbConnect();
  try {
    // Fetch products
    const productResult = await Product.find({}).sort({ createdAt: -1 }).limit(8).lean();
    const products = JSON.parse(JSON.stringify(productResult));

    // Fetch sliders
    let sliderResult = await Slider.find({ isActive: true }).sort({ order: 1 }).limit(3).lean();
    
    // Convert ObjectId to string for serialization
    let sliders = JSON.parse(JSON.stringify(sliderResult)).map((slider: any) => ({
      ...slider,
      productId: slider.productId ? slider.productId.toString() : null
    }));

    // If no sliders, auto-create from latest products
    if (sliders.length === 0) {
      const latestProducts = await Product.find({})
        .sort({ createdAt: -1 })
        .limit(3)
        .lean();

      if (latestProducts.length > 0) {
        sliders = latestProducts.map((product: any, index: number) => ({
          _id: `auto-${index}`,
          image: product.images?.[0] || '',
          productId: product._id ? product._id.toString() : null,
          title: product.name,
          subtitle: `₹${product.price.toLocaleString('en-IN')}`,
          order: index,
          isActive: true
        }));
      }
    }

    return { props: { products, sliders } };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return { props: { products: [], sliders: [] } };
  }
}
