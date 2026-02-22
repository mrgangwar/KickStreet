import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

// Toast Notification Type
type Toast = { message: string; type: 'success' | 'error' | null };

export default function ResetPassword() {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast>({ message: '', type: null });
  const router = useRouter();
  const email = router.query.email as string || '';

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

    if (newPassword !== confirmPassword) {
      setToast({ message: "PASSWORDS DO NOT MATCH", type: 'error' });
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setToast({ message: "PASSWORD MUST BE AT LEAST 6 CHARACTERS", type: 'error' });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setToast({ message: "PASSWORD RESET SUCCESSFUL", type: 'success' });
        setTimeout(() => {
          router.push('/auth/login?reset=true');
        }, 2000);
      } else {
        setToast({ message: data.message || "RESET FAILED", type: 'error' });
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
      
      <main className="flex-grow flex flex-col justify-center items-center px-4 py-8 sm:px-6 sm:py-12 lg:pt-20">
        <div className="w-full max-w-full sm:max-w-[400px]">
          
          {/* Header Section */}
          <div className="text-left mb-8 sm:mb-10">
            <h1 className="text-[13vw] xs:text-[14vw] sm:text-6xl font-black italic uppercase tracking-tighter leading-[0.85] mb-4 break-words">
              Enter <br /> <span className="text-orange-500">New Password.</span>
            </h1>
            <p className="text-gray-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] leading-relaxed">
              Enter OTP and set your new password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <div className="group w-full">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] ml-2 mb-2 block text-gray-400 group-focus-within:text-black transition-colors">
                Email
              </label>
              <input 
                type="email" 
                className="w-full p-4 sm:p-5 bg-gray-100 rounded-2xl font-bold text-sm outline-none border-2 border-transparent text-gray-400 cursor-not-allowed"
                value={email}
                disabled
              />
            </div>

            <div className="group w-full">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] ml-2 mb-2 block text-gray-400 group-focus-within:text-black transition-colors">
                OTP Code
              </label>
              <input 
                type="text" 
                placeholder="000000" 
                inputMode="numeric"
                className="w-full p-4 sm:p-5 bg-gray-100 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-black focus:bg-white transition-all duration-300"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                required
              />
            </div>

            <div className="group w-full">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] ml-2 mb-2 block text-gray-400 group-focus-within:text-black transition-colors">
                New Password
              </label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full p-4 sm:p-5 bg-gray-100 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-black focus:bg-white transition-all duration-300"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="group w-full">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] ml-2 mb-2 block text-gray-400 group-focus-within:text-black transition-colors">
                Confirm Password
              </label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full p-4 sm:p-5 bg-gray-100 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-black focus:bg-white transition-all duration-300"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button 
              disabled={loading || otp.length < 6}
              className="w-full bg-black text-white py-5 sm:py-6 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-2xl active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 flex justify-center items-center mt-2 text-xs sm:text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   RESETTING...
                </span>
              ) : 'RESET PASSWORD'}
            </button>
          </form>

          {/* Footer Section */}
          <div className="mt-10 sm:mt-12 pt-8 border-t border-gray-100 text-center">
            <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
              Didn't receive OTP? 
              <br className="sm:hidden" />
              <button 
                onClick={() => router.push('/auth/forgot-password')}
                className="text-black font-black underline underline-offset-8 decoration-2 decoration-orange-500 hover:text-orange-500 transition-colors mt-4 sm:mt-0 sm:ml-2 inline-block"
              >
                RESEND CODE
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}