import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';

// Toast Notification Type
type Toast = { message: string; type: 'success' | 'error' | null };

export default function OTPVerification() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast>({ message: '', type: null });
  const router = useRouter();
  const { email } = router.query;

  // Toast auto-hide logic
  useEffect(() => {
    if (toast.type) {
      const timer = setTimeout(() => setToast({ message: '', type: null }), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setToast({ message: '', type: null });

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        setToast({ message: "ACCOUNT ACTIVATED. WELCOME TO THE CLUB.", type: 'success' });
        setTimeout(() => {
          router.push('/auth/login?verified=true');
        }, 2000);
      } else {
        setToast({ message: data.message || "INVALID CODE. TRY AGAIN.", type: 'error' });
      }
    } catch (err) {
      setToast({ message: "CONNECTION LOST. RECHECK INTERNET.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen selection:bg-orange-500 selection:text-white overflow-x-hidden flex flex-col">
      <Navbar />

      {/* --- TOAST SYSTEM --- */}
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
      
      <main className="flex-grow flex flex-col justify-center items-center px-4 py-8 sm:px-6 sm:py-12 lg:pt-24">
        <div className="w-full max-w-full sm:max-w-[400px] text-center">
          
          {/* Header Section */}
          <div className="mb-8 sm:mb-10">
            <h1 className="text-[13vw] xs:text-[14vw] sm:text-6xl font-black italic uppercase tracking-tighter leading-[0.85] mb-6 break-words">
              Check <br /> <span className="text-orange-500">The Inbox.</span>
            </h1>
            <div className="text-gray-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] leading-relaxed px-2">
              <p>A 6-digit heat code was sent to</p>
              <p className="text-black break-all mt-1">{email || "your-email@kicks.com"}</p>
            </div>
          </div>

          <form onSubmit={handleVerify} className="space-y-6 w-full">
            <div className="relative w-full">
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full p-5 sm:p-6 bg-gray-100 rounded-[1.5rem] sm:rounded-[2rem] font-black text-3xl sm:text-4xl tracking-[0.3em] sm:tracking-[0.5em] text-center outline-none border-2 border-transparent focus:border-orange-500 focus:bg-white transition-all duration-300"
                required
                autoFocus
                inputMode="numeric"
              />
              <div className="mt-4 flex justify-between px-2 sm:px-4">
                 <span className="text-[9px] sm:text-[10px] font-black uppercase text-gray-400">Enter Code</span>
                 <button type="button" className="text-[9px] sm:text-[10px] font-black uppercase text-black hover:text-orange-500 underline underline-offset-4">Resend?</button>
              </div>
            </div>

            <button 
              disabled={loading || otp.length < 6}
              className="w-full bg-black text-white py-5 sm:py-6 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-2xl active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 flex justify-center items-center text-xs sm:text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   CHECKING...
                </span>
              ) : 'ACTIVATE ACCOUNT'}
            </button>
          </form>

          {/* Security Note */}
          <p className="mt-10 sm:mt-12 text-[8px] sm:text-[9px] font-bold text-gray-300 uppercase tracking-widest px-4 sm:px-10 leading-normal">
            Secure verification by KickStreet Guard. <br /> If you didn't receive the mail, check your spam.
          </p>
        </div>
      </main>
    </div>
  );
}