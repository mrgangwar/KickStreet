import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        // Redirect to reset password page with email
        setTimeout(() => {
          router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
        }, 2000);
      } else {
        setError(data.message || "REQUEST FAILED");
      }
    } catch (err) {
      setError("CONNECTION ERROR: TRY AGAIN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen selection:bg-orange-500 selection:text-white">
      <Navbar />
      
      <div className="flex flex-col justify-center items-center px-6 py-12 lg:pt-20">
        <div className="w-full max-w-[400px]">
          
          {/* Header Section */}
          <div className="text-left mb-10">
            <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-[0.8] mb-4">
              Reset <br /> <span className="text-orange-500">Password.</span>
            </h1>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">
              Enter your email to receive OTP
            </p>
          </div>

          {/* Error/Success Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6">
              <p className="text-red-600 text-[10px] font-black uppercase italic">{error}</p>
            </div>
          )}

          {message && (
            <div className="bg-green-50 border-l-4 border-green-600 p-4 mb-6">
              <p className="text-green-600 text-[10px] font-black uppercase italic">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="group">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] ml-2 mb-2 block text-gray-500 group-focus-within:text-black transition-colors">
                Email Address
              </label>
              <input 
                type="email" 
                placeholder="YOUR@EMAIL.COM" 
                className="w-full p-5 bg-gray-100 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-black focus:bg-white transition-all duration-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button 
              disabled={loading}
              className="w-full bg-black text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-2xl active:scale-95 disabled:bg-gray-300 flex justify-center items-center"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   SENDING OTP...
                </span>
              ) : 'SEND OTP'}
            </button>
          </form>

          {/* Footer Section */}
          <div className="mt-12 pt-8 border-t border-gray-100 text-center">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Remember your password? 
              <Link href="/auth/login" className="text-black font-black underline underline-offset-8 decoration-2 decoration-orange-500 hover:text-orange-500 transition-colors mt-2 inline-block">
                SIGN IN
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
