import Navbar from '@/components/Navbar';
import Toast from '@/components/Toast';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cod'>('stripe');
  const [guestEmail, setGuestEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    line1: '',
    city: '',
    state: '',
    postal_code: '',
    phone: '',
  });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
  };

  // Get email - prefer session, fallback to guest email
  const getEmail = () => session?.user?.email || guestEmail;

  const handleStripeCheckout = async () => {
    if (cart.length === 0) return;
    
    const email = getEmail();
    if (!email) {
      showToast("PLEASE ENTER YOUR EMAIL ADDRESS", 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, email }),
      });

      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.message || "Checkout Failed");

      window.location.href = data.url;
    } catch (error: any) {
      showToast(error.message.toUpperCase(), 'error');
      setLoading(false);
    }
  };

  const handleCODCheckout = async () => {
    if (cart.length === 0) return;
    
    const email = getEmail();
    if (!email) {
      showToast("PLEASE ENTER YOUR EMAIL ADDRESS", 'error');
      return;
    }

    if (!shippingAddress.line1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.postal_code) {
      showToast("PLEASE FILL IN YOUR SHIPPING ADDRESS", 'error');
      return;
    }

    if (!shippingAddress.phone) {
      showToast("PLEASE ENTER YOUR PHONE NUMBER", 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/checkout/cod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: cart, 
          email,
          shippingAddress 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "COD Order Failed");

      showToast("COD ORDER PLACED SUCCESSFULLY!", 'success');
      clearCart();
      setTimeout(() => {
        window.location.href = '/orders';
      }, 2000);
    } catch (error: any) {
      showToast(error.message.toUpperCase(), 'error');
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    if (paymentMethod === 'stripe') {
      handleStripeCheckout();
    } else {
      handleCODCheckout();
    }
  };

  return (
    <div className="bg-white min-h-screen selection:bg-orange-600 selection:text-white flex flex-col">
      <Navbar />
      
      <main className="flex-grow w-full px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-baseline gap-3 mb-8 sm:mb-12">
            <h1 className="text-[10vw] sm:text-6xl lg:text-7xl font-black italic uppercase tracking-tighter leading-none">Your Bag</h1>
            <span className="text-orange-600 font-black text-lg sm:text-2xl">({cart.length})</span>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-16 sm:py-24 lg:py-32 bg-gray-50 rounded-2xl sm:rounded-[3rem] border-2 border-dashed border-gray-100 px-4">
              <p className="text-gray-400 text-xl sm:text-2xl lg:text-3xl mb-6 sm:mb-8 font-black uppercase italic tracking-tighter">
                Your bag is empty
              </p>
              <Link href="/" className="inline-block bg-black text-white px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-orange-600 transition-all">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item) => (
                  <div key={`${item._id}-${item.size}`} className="flex gap-3 sm:gap-6 p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl">
                    {/* Image */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 flex-shrink-0 bg-white rounded-xl overflow-hidden">
                      <Image 
                        src={item.image || '/placeholder.png'} 
                        alt={item.name} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-sm sm:text-base font-bold uppercase italic truncate pr-2">{item.name}</h3>
                        <button 
                          onClick={() => removeFromCart(item._id, item.size)}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">Size: UK {item.size}</p>
                      
                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity */}
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => updateQuantity(item._id, item.size, Math.max(0, item.quantity - 1))}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-sm hover:border-black"
                          >
                            -
                          </button>
                          <span className="w-6 sm:w-8 text-center font-bold text-sm">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item._id, item.size, item.quantity + 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-sm hover:border-black"
                          >
                            +
                          </button>
                        </div>
                        
                        {/* Price */}
                        <p className="font-bold text-sm sm:text-base">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:sticky lg:top-24 h-fit">
                <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-black uppercase italic mb-4">Order Summary</h2>
                  
                  {/* Email for Guest Checkout */}
                  {!session && (
                    <div className="mb-4">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Your Email</label>
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 text-sm"
                      />
                    </div>
                  )}

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-bold">₹{cartTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Shipping</span>
                      <span className="font-bold text-green-600">FREE</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex justify-between">
                      <span className="font-black uppercase text-sm">Total</span>
                      <span className="font-black text-lg">₹{cartTotal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Payment Method</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPaymentMethod('stripe')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold uppercase transition-all ${
                          paymentMethod === 'stripe' 
                          ? 'bg-black text-white shadow-lg' 
                          : 'bg-white border border-gray-200 text-gray-600'
                        }`}
                      >
                        Card
                      </button>
                      <button
                        onClick={() => setPaymentMethod('cod')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold uppercase transition-all ${
                          paymentMethod === 'cod' 
                          ? 'bg-black text-white shadow-lg' 
                          : 'bg-white border border-gray-200 text-gray-600'
                        }`}
                      >
                        COD
                      </button>
                    </div>
                  </div>

                  {/* Shipping Address (COD only) */}
                  {paymentMethod === 'cod' && (
                    <div className="mb-6 space-y-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Shipping Address</p>
                      <input
                        type="text"
                        placeholder="Full Address"
                        value={shippingAddress.line1}
                        onChange={(e) => setShippingAddress({...shippingAddress, line1: e.target.value})}
                        className="w-full p-3 rounded-xl border border-gray-200 text-sm"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="City"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                          className="w-full p-3 rounded-xl border border-gray-200 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={shippingAddress.state}
                          onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                          className="w-full p-3 rounded-xl border border-gray-200 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Pincode"
                          value={shippingAddress.postal_code}
                          onChange={(e) => setShippingAddress({...shippingAddress, postal_code: e.target.value})}
                          className="w-full p-3 rounded-xl border border-gray-200 text-sm"
                        />
                        <input
                          type="tel"
                          placeholder="Phone"
                          value={shippingAddress.phone}
                          onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                          className="w-full p-3 rounded-xl border border-gray-200 text-sm"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full py-4 rounded-full bg-orange-600 text-white font-black uppercase text-sm tracking-wider hover:bg-orange-700 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : paymentMethod === 'stripe' ? 'Checkout with Card' : 'Place COD Order'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Toast */}
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.show} 
        onClose={() => setToast({ ...toast, show: false })} 
      />
    </div>
  );
}
