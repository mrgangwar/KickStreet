import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-16 sm:pt-20 pb-8 sm:pb-10 mt-10 sm:mt-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Grid Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 sm:gap-12 mb-12 sm:mb-16">
          
          {/* Brand Section */}
          <div className="sm:col-span-2">
            <h2 className="text-[12vw] sm:text-4xl font-[1000] italic uppercase tracking-tighter mb-6 leading-none break-words">
              KICK<span className="text-orange-600">STREET</span>
            </h2> 
            <p className="text-gray-400 max-w-sm font-medium leading-relaxed text-sm sm:text-base">
              Your ultimate destination for authentic sneakers and street culture. 
              We bring the heat to your doorstep.
            </p>
            {/* Social Links - Wrapped for small screens */}
            <div className="flex flex-wrap gap-4 sm:gap-6 mt-8">
              <Link href="#" className="hover:text-orange-600 transition-colors uppercase text-[10px] font-black tracking-widest">Instagram</Link>
              <Link href="#" className="hover:text-orange-600 transition-colors uppercase text-[10px] font-black tracking-widest">Twitter</Link>
              <Link href="#" className="hover:text-orange-600 transition-colors uppercase text-[10px] font-black tracking-widest">Discord</Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="border-t border-white/5 pt-8 sm:border-none sm:pt-0">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-orange-600">Shop</h4>
            <ul className="space-y-4 text-sm font-bold uppercase tracking-tighter">
              <li><Link href="/" className="hover:ml-2 transition-all duration-300 block">New Arrivals</Link></li>
              <li><Link href="/" className="hover:ml-2 transition-all duration-300 block">Best Sellers</Link></li>
              <li><Link href="/" className="hover:ml-2 transition-all duration-300 block">Release Calendar</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="border-t border-white/5 pt-8 sm:border-none sm:pt-0">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-orange-600">Support</h4>
            <ul className="space-y-4 text-sm font-bold uppercase tracking-tighter">
              <li><Link href="#" className="hover:ml-2 transition-all duration-300 block">Order Tracking</Link></li>
              <li><Link href="#" className="hover:ml-2 transition-all duration-300 block">Shipping Policy</Link></li>
              <li><Link href="#" className="hover:ml-2 transition-all duration-300 block">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] leading-loose max-w-[280px] sm:max-w-none">
            © 2026 KICKSTREET. ALL RIGHTS RESERVED. <br className="block sm:hidden" /> BUILT FOR THE CULTURE.
          </p>
          <div className="flex items-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all mb-4 md:mb-0">
            <p className="text-[8px] font-bold tracking-widest">SECURE PAYMENT VIA STRIPE</p>
          </div>
        </div>
      </div>
    </footer>
  );
}