import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

export default function MyOrders() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processing': return 'bg-blue-100 text-blue-700';
      case 'Shipped': return 'bg-purple-100 text-purple-700';
      case 'Delivered': return 'bg-green-100 text-green-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      case 'Returned': return 'bg-gray-100 text-gray-700';
      case 'Paid': return 'bg-green-100 text-green-700';
      case 'Pending': return 'bg-orange-100 text-orange-700';
      case 'Failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  useEffect(() => {
    if (session) {
      fetch('/api/orders/my-orders')
        .then(res => res.json())
        .then(data => {
          if (data.success) setOrders(data.orders);
          setLoading(false);
        });
    }
  }, [session]);

  if (!session) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-4xl font-[1000] uppercase italic tracking-tighter mb-6">Unauthorized</h2>
      <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-8 text-balance">
        You need to be logged in to view your heat.
      </p>
      <Link href="/auth/signin" className="bg-black text-white px-10 py-4 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-orange-600 transition-all">
        Sign In Now
      </Link>
    </div>
  );

  return (
    <div className="bg-white min-h-screen text-black selection:bg-orange-600 selection:text-white">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <header className="mb-12 sm:mb-16">
          <h1 className="text-[10vw] sm:text-7xl font-[1000] italic uppercase tracking-tighter leading-none mb-4">
            Order <span className="text-orange-600">History</span>
          </h1>
          <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em]">
            Tracking {orders.length} Shipments
          </p>
        </header>

        {loading ? (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-48 w-full bg-gray-50 animate-pulse rounded-[2.5rem]" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-24 border-2 border-dashed border-gray-100 rounded-[3rem] text-center px-6">
            <p className="text-gray-300 font-black uppercase italic text-xl sm:text-2xl tracking-tighter mb-8">
              No orders yet. <br /> Start your collection today.
            </p>
            <Link href="/" className="inline-block bg-black text-white px-12 py-5 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-orange-600 transition-all">
              Go To Shop
            </Link>
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-12">
            {orders.map((order: any) => (
              <div key={order._id} className="group border border-gray-100 p-6 sm:p-10 rounded-[2.5rem] bg-[#fdfdfd] hover:bg-white hover:shadow-2xl hover:shadow-gray-200 transition-all duration-500">
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-gray-50">
                  <div>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Receipt Reference</span>
                    <p className="font-mono text-sm uppercase font-bold text-black">#{order._id.slice(-10)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-[1000] uppercase tracking-widest px-4 py-2 rounded-full ${
                      getStatusColor(order.orderStatus)
                    }`}>
                      ● {order.orderStatus || 'Processing'}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-6">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 sm:gap-6">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-2xl overflow-hidden border border-gray-50 shrink-0">
                        <Image 
                          src={item.image} 
                          alt={item.name} 
                          fill 
                          className="object-contain p-2"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black uppercase italic text-sm sm:text-lg leading-tight truncate">{item.name}</h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                          <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest">
                            SIZE: <span className="text-black">UK {item.size}</span>
                          </p>
                          <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest">
                            QTY: <span className="text-black">{item.quantity}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-sm sm:text-base">₹{item.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-200" />
                    <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest">
                      Confirmed On: {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Paid Total</span>
                    <p className="text-2xl sm:text-3xl font-[1000] italic tracking-tighter">₹{order.amountTotal.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}