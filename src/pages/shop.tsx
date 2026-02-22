import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Head from 'next/head';

export default function Shop({ products }: { products: any[] }) {
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState('');
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
    
    // Sort
    if (sort === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    }
    
    setFilteredProducts(result);
  }, [filter, sort, search, products]);

  const categories = ['all', 'Men', 'Women', 'Children'];

  return (
    <div className="bg-white min-h-screen selection:bg-orange-600 selection:text-white">
      <Head>
        <title>Shop New Arrivals | KICKSTREET</title>
        <meta name="description" content="Shop the latest sneakers and streetwear at KickStreet." />
      </Head>
      
      <Navbar />
      
      <main className="w-full px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-12">
            <div>
              <h1 className="text-[8vw] sm:text-6xl lg:text-7xl font-black italic uppercase tracking-tighter leading-none">
                New <span className="text-orange-600">Arrivals</span>
              </h1>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">
                Fresh Drops Added Daily
              </p>
            </div>
            
            {/* Sort */}
            <div className="flex items-center gap-2">
              <select 
                value={sort} 
                onChange={(e) => setSort(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-xs font-bold uppercase px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
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

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 sm:py-24 bg-gray-50 rounded-2xl sm:rounded-[3rem]">
              <p className="text-gray-400 font-black uppercase italic text-xl">No Products Found</p>
              <p className="text-gray-400 text-xs mt-2">Check back soon for new drops!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps() {
  await dbConnect();
  
  const products = await Product.find({})
    .sort({ createdAt: -1 })
    .lean();
    
  // Serialize _id for client
  const serializedProducts = products.map((product: any) => ({
    ...product,
    _id: product._id.toString(),
    createdAt: product.createdAt?.toISOString(),
    updatedAt: product.updatedAt?.toISOString(),
  }));

  return {
    props: {
      products: serializedProducts,
    },
  };
}
