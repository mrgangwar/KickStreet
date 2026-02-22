import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function Success() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { session_id } = router.query;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session_id) {
      fetch(`/api/orders/verify-session?session_id=${session_id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setOrder(data.order);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [session_id]);

  if (status === 'loading' || loading) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center p-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-gray-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-orange-600 rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="mt-8 font-[1000] italic uppercase tracking-tighter text-3xl animate-pulse">
          Securing your heat...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen selection:bg-orange-600 selection:text-white flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-10 sm:py-20 px-4">
        <div className="max-w-2xl w-full text-center">
          {/* Success Icon */}
          <div className="relative inline-block mb-10">
            <div className="absolute inset-0 bg-green-500 blur-3xl opacity-20 animate-pulse" />
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-black text-white rounded-[2.5rem] flex items-center justify-center rotate-3 hover:rotate-0 transition-transform duration-500">
              <svg className="w-12 h-12 sm:w-16 sm:h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="text-[12vw] sm:text-7xl font-[1000] italic uppercase tracking-tighter leading-none mb-6">
            GOT <span className="text-orange-600">'EM.</span>
          </h1>
          
          <p className="text-gray-400 font-black text-[10px] sm:text-xs uppercase tracking-[0.4em] mb-12">
            Your order has been confirmed
          </p>

          {order ? (
            <div className="bg-[#f9f9f9] border border-gray-100 rounded-[2.5rem] p-8 sm:p-10 mb-12 text-left relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none select-none">
                <svg className="w-32 h-32 rotate-12" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M21 16.5c0 .38-.21.71-.53.88l-7.97 4.44c-.31.17-.69.17-1 0l-7.97-4.44c-.31-.17-.53-.5-.53-.88v-9c0-.38.21-.71.53-.88l7.97-4.44c.31-.17.69-.17 1 0l7.97 4.44c.31.17.53.5.53.88v9z"/>
                </svg>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-end border-b border-gray-200 pb-4">
                  <div>
                    <span className="text-gray-400 font-black text-[9px] uppercase tracking-widest block mb-1">Order Ref</span>
                    <span className="font-mono text-sm font-bold uppercase">#{order._id?.slice(-12)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 font-black text-[9px] uppercase tracking-widest block mb-1">Status</span>
                    <span className="text-[10px] font-black uppercase text-green-600 bg-green-50 px-3 py-1 rounded-full">Confirmed</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 py-2">
                  <div>
                    <span className="text-gray-400 font-black text-[9px] uppercase tracking-widest block mb-2">Customer</span>
                    <span className="text-xs font-bold uppercase truncate block">{order.email}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 font-black text-[9px] uppercase tracking-widest block mb-2">Payment</span>
                    <span className="text-xs font-black uppercase">{order.paymentMethod === 'cod' ? 'CASH ON DELIVERY' : 'PREPAID'}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-xl font-[1000] italic uppercase tracking-tighter">Total Paid</span>
                  <span className="text-3xl font-[1000] tracking-tighter text-orange-600">₹{order.amountTotal?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center italic text-gray-300">
               Updating receipt details...
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/orders" className="bg-black text-white px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl active:scale-95">
              Track My Order
            </Link>
            <Link href="/" className="bg-transparent border-2 border-black/5 text-black px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-black transition-all active:scale-95">
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-10 text-center opacity-20">
         <p className="text-[8px] font-black uppercase tracking-[0.5em]">KickStreet Verification Protocol v2.0</p>
      </footer>
    </div>
  );
}