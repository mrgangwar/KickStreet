import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Navbar() {
  const { cartCount } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [router.asPath]);

  const user = session?.user as any;
  const isActive = (path: string) => router.pathname === path ? "text-orange-600" : "text-black";

  return (
    <>
      <nav className="flex justify-between items-center px-4 sm:px-6 md:px-12 py-4 sm:py-5 bg-white/90 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-[100] transition-all duration-300 w-full">
        
        {/* LOGO */}
        <Link href="/#hero">
          <div className="text-lg sm:text-2xl font-[1000] italic uppercase tracking-tighter text-black cursor-pointer group whitespace-nowrap">
            KICK<span className="text-orange-600">STREET</span>
          </div>
        </Link>
        
        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center space-x-10 font-black uppercase text-[10px] tracking-[0.2em]">
          <Link href="/" className={`${isActive('/')} hover:text-orange-600 transition-colors`}>Home</Link>
          <Link href="/shop" className={`${isActive('/shop')} hover:text-orange-600 transition-colors`}>New Arrivals</Link>
          
          {session && (
            <>
              <Link href="/orders" className={`${isActive('/orders')} hover:text-orange-600 transition-colors`}>My Orders</Link>
              <Link href="/profile" className={`${isActive('/profile')} hover:text-orange-600 transition-colors`}>Profile</Link>
            </>
          )}

          {user?.role === 'admin' && (
            <Link href="/admin/dashboard" className="bg-black text-white px-5 py-2 rounded-full hover:bg-orange-600 transition-all shadow-lg active:scale-95">
              Admin Panel
            </Link>
          )}
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
          
          {/* Auth Section */}
          {session ? (
            <div className="flex items-center space-x-2 sm:space-x-4 border-r border-gray-100 pr-2 sm:pr-4">
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-[8px] font-black uppercase tracking-tighter text-orange-600 leading-none mb-1">Authenticated</span>
                <span className="text-xs font-black uppercase italic leading-none">{session.user?.name?.split(' ')[0]}</span>
              </div>
              <button 
                onClick={() => signOut({ callbackUrl: '/' })} 
                className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest bg-gray-50 px-3 sm:px-4 py-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all whitespace-nowrap"
              >
                Exit
              </button>
            </div>
          ) : (
            <Link href="/auth/login" className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:text-orange-600 transition-all border-r border-gray-100 pr-2 sm:pr-4">
              Log In
            </Link>
          )}

          {/* Cart Icon */}
          <Link href="/cart" className="relative p-1.5 sm:p-2 group">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
            </svg>
            
            {mounted && cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[8px] font-[1000] w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full border-2 border-white shadow-md">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden flex flex-col justify-center items-center w-8 h-8"
            aria-label="Toggle Menu"
          >
            <div className={`w-6 h-0.5 bg-black transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
            <div className={`w-6 h-0.5 bg-black transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></div>
            <div className={`w-6 h-0.5 bg-black transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
          </button>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-[95] md:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Mobile Drawer */}
          <div className="fixed top-[65px] left-0 w-full bg-white z-[99] md:hidden shadow-xl animate-slide-down">
            <div className="flex flex-col p-6 space-y-4">
              <Link href="/" className="font-black uppercase text-2xl tracking-tight hover:text-orange-600 transition-colors py-2">Home</Link>
              <Link href="/shop" className="font-black uppercase text-2xl tracking-tight hover:text-orange-600 transition-colors py-2">New Arrivals</Link>
              {session && (
                <>
                  <Link href="/orders" className="font-black uppercase text-2xl tracking-tight hover:text-orange-600 transition-colors py-2">My Orders</Link>
                  <Link href="/profile" className="font-black uppercase text-2xl tracking-tight hover:text-orange-600 transition-colors py-2">Profile</Link>
                </>
              )}
              {user?.role === 'admin' && (
                <Link href="/admin/dashboard" className="bg-orange-600 text-white py-3 px-4 rounded-xl font-black uppercase text-center shadow-lg mt-2">
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
