import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Products', path: '/admin/products' },
    { name: 'Sliders', path: '/admin/sliders' },
    { name: 'Orders', path: '/admin/orders' },
    { name: 'Settings', path: '/admin/shop-settings' },
  ];

  return (
   <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8F9FA] overflow-x-hidden">
      
  {/* --- MOBILE HEADER --- */}
  <div className="lg:hidden bg-black text-white p-4 flex justify-between items-center sticky top-0 z-[100] border-b border-gray-800">
    
    {/* ✅ TEXT LOGO (mobile) */}
    <Link href="/admin/dashboard">
      <div className="text-lg font-[1000] italic uppercase tracking-tighter text-white">
        KICK<span className="text-orange-500">STREET</span>
      </div>
    </Link>

    <button 
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      className="bg-orange-500 p-2 rounded-lg text-xs font-black uppercase tracking-widest"
    >
      {isMobileMenuOpen ? 'Close' : 'Menu'}
    </button>
  </div>

  {/* --- SIDEBAR (Desktop) / OVERLAY MENU (Mobile) --- */}
  <aside className={`
    fixed lg:sticky top-0 left-0 z-[150] h-screen bg-black text-white p-6 lg:p-8 flex flex-col transition-transform duration-300 ease-in-out
    w-72 lg:translate-x-0
    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
  `}>
    
    <div className="mb-12 hidden lg:block">
      
      {/* ✅ TEXT LOGO (desktop) */}
      <Link href="/admin/dashboard">
        <div className="text-xl font-[1000] italic uppercase tracking-tighter text-white mb-2">
          KICK<span className="text-orange-500">STREET</span>
        </div>
      </Link>

      <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold mt-1">
        Admin Central
      </p>
    </div>

        <nav className="flex-1 space-y-2 lg:space-y-4">
          {menuItems.map((item) => {
            const isActive = router.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block"
              >
                <div className={`
                  group flex items-center py-4 px-6 rounded-2xl transition-all duration-300 font-bold uppercase text-[10px] lg:text-xs tracking-widest
                  ${isActive 
                    ? 'bg-orange-500 text-white shadow-[0_10px_20px_rgba(249,115,22,0.3)] scale-105' 
                    : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                  }
                `}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-4 transition-all ${isActive ? 'bg-white' : 'bg-transparent group-hover:bg-orange-500'}`}></span>
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-800">
          <Link href="/" className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2">
            <span>←</span> Store
          </Link>
        </div>
      </aside>

      {/* --- MOBILE OVERLAY BACKDROP --- */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[140] lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-4 sm:p-8 lg:p-12 overflow-x-hidden">
        <div className="max-w-6xl mx-auto w-full">
          
          <div className="w-full break-words">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}