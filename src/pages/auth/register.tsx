import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

// Toast Notification Type
type Toast = { message: string; type: 'success' | 'error' | null };

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast>({ message: '', type: null });
  const router = useRouter();

  // Toast auto-hide logic
  useEffect(() => {
    if (toast.type) {
      const timer = setTimeout(() => setToast({ message: '', type: null }), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast({ message: '', type: null });

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setToast({ message: "REGISTRATION SUCCESSFUL. REDIRECTING...", type: 'success' });
        setTimeout(() => {
          router.push(`/auth/otp-verification?email=${formData.email}`);
        }, 1500);
      } else {
        setToast({ message: data.message || "REGISTRATION FAILED", type: 'error' });
      }
    } catch (err) {
      setToast({ message: "CONNECTION ERROR: TRY AGAIN", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen selection:bg-orange-500 selection:text-white overflow-x-hidden flex flex-col">
      <Navbar />

      {/* --- TOAST NOTIFICATION --- */}
      {toast.type && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-[350px] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`p-4 rounded-2xl shadow-2xl border-l-4 flex items-center justify-between bg-white ${
            toast.type === 'success' ? 'border-green-600' : 'border-red-600'
          }`}>
            <p className={`text-[10px] font-black uppercase italic tracking-widest ${
              toast.type === 'success' ? 'text-green-600' : 'text-red-600'
            }`}>
              {toast.message}
            </p>
            <button onClick={() => setToast({ message: '', type: null })} className="text-gray-300 hover:text-black font-black ml-4">✕</button>
          </div>
        </div>
      )}
      
      <main className="flex-grow flex flex-col justify-center items-center px-4 py-8 sm:px-6 sm:py-10 lg:pt-16">
        <div className="w-full max-w-full sm:max-w-[420px]">
          
          {/* Header Section */}
          <div className="text-left mb-8">
            <h1 className="text-[14vw] xs:text-5xl sm:text-6xl font-black italic uppercase tracking-tighter leading-[0.85] mb-4 break-words">
              Join <br /> <span className="text-orange-500">The Crew.</span>
            </h1>
            <p className="text-gray-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] leading-relaxed">
              Start your journey with KickStreet
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <div className="group w-full">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] ml-2 mb-2 block text-gray-400 group-focus-within:text-black transition-colors">Full Name</label>
              <input 
                type="text" placeholder="HYPEBEAST NAME" required
                className="w-full p-4 sm:p-5 bg-gray-100 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-black focus:bg-white transition-all duration-300"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="group w-full">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] ml-2 mb-2 block text-gray-400 group-focus-within:text-black transition-colors">Email Address</label>
              <input 
                type="email" placeholder="YOUR@EMAIL.COM" required
                className="w-full p-4 sm:p-5 bg-gray-100 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-black focus:bg-white transition-all duration-300"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="group w-full">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] ml-2 mb-2 block text-gray-400 group-focus-within:text-black transition-colors">Phone Number</label>
              <input 
                type="tel" placeholder="+91 XXXXX XXXXX" required
                className="w-full p-4 sm:p-5 bg-gray-100 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-black focus:bg-white transition-all duration-300"
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div className="group w-full">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] ml-2 mb-2 block text-gray-400 group-focus-within:text-black transition-colors">Security Password</label>
              <input 
                type="password" placeholder="••••••••" required
                className="w-full p-4 sm:p-5 bg-gray-100 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-black focus:bg-white transition-all duration-300"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button 
              disabled={loading}
              className="w-full bg-black text-white py-5 sm:py-6 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-2xl active:scale-95 disabled:bg-gray-300 flex justify-center items-center mt-4 text-xs sm:text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   INITIALIZING...
                </span>
              ) : 'CREATE ACCOUNT'}
            </button>
          </form>

          {/* Footer Section */}
          <div className="mt-10 pt-8 border-t border-gray-100 text-center">
            <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
              Already part of the crew? 
              <br />
              <Link href="/auth/login" className="text-black font-black underline underline-offset-8 decoration-2 decoration-orange-500 hover:text-orange-500 transition-colors mt-4 inline-block">
                SIGN IN TO DASHBOARD
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}