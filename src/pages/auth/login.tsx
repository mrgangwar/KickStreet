import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

// Toast Notification Type
type Toast = { id: number; message: string; type: 'success' | 'error' };

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const router = useRouter();
  const { data: session } = useSession();

  // Redirect if already logged in
  useEffect(() => {
    if (session?.user) {
      const user = session.user as any;
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    }
  }, [session, router]);

  const addToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: email.toLowerCase(),
        password,
      });

      if (res?.error) {
        addToast(res.error.toUpperCase() || "INVALID CREDENTIALS", 'error');
      } else {
        addToast("ACCESS GRANTED. WELCOME BACK.", 'success');
        // Get updated session to check role
        const newSession = await signIn('credentials', { 
          redirect: false,
          email: email.toLowerCase(), 
          password 
        });
        
        // Small delay then check session and redirect
        setTimeout(async () => {
          const response = await fetch('/api/auth/check-role');
          const data = await response.json();
          if (data.role === 'admin') {
            router.push('/admin/dashboard');
          } else {
            router.push('/');
          }
        }, 500);
      }
    } catch (err) {
      addToast("SERVER ERROR: TRY AGAIN LATER", 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen selection:bg-orange-500 selection:text-white flex flex-col overflow-x-hidden">
      <Navbar />

      {/* --- TOAST SYSTEM (Strictly Responsive & Fixed) --- */}
      <div className="fixed top-4 right-0 left-0 sm:left-auto sm:right-4 z-[999] flex flex-col gap-2 px-4 sm:px-0 w-full sm:w-80 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-2xl flex justify-between items-center transform transition-all duration-500 animate-in fade-in slide-in-from-top-4 sm:slide-in-from-right-full 
              ${toast.type === 'success' ? 'bg-black text-white border-l-4 border-orange-500' : 'bg-red-600 text-white'}`}
          >
            <p className="text-[10px] font-black uppercase tracking-widest leading-none break-words max-w-[85%]">
              {toast.message}
            </p>
            <button 
              onClick={() => setToasts(t => t.filter(x => x.id !== toast.id))} 
              className="ml-4 p-2 opacity-50 hover:opacity-100 transition-opacity"
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* --- MAIN RESPONSIVE LAYOUT --- */}
      <main className="flex-grow flex items-center justify-center px-4 py-6 sm:px-6 sm:py-12">
        <div className="w-full max-w-full sm:max-w-[400px] animate-in fade-in zoom-in-95 duration-700">
          
          {/* Header Section */}
          <div className="text-left mb-8 sm:mb-10">
            <h1 className="text-[13vw] xs:text-[14vw] sm:text-6xl lg:text-7xl font-black italic uppercase tracking-tighter leading-[0.85] mb-4 break-words">
              Enter <br /> <span className="text-orange-500">The Club.</span>
            </h1>
            <p className="text-gray-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] leading-relaxed">
              Premium Access to KickStreet Heat
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <div className="group w-full">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] ml-2 mb-2 block text-gray-400 group-focus-within:text-black transition-colors">
                Email / Username
              </label>
              <input 
                type="email" 
                placeholder="YOUR@EMAIL.COM" 
                className="w-full p-4 sm:p-5 bg-gray-100 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-black focus:bg-white transition-all duration-300"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="group text-right w-full">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] ml-2 mb-2 block text-gray-400 text-left group-focus-within:text-black transition-colors">
                Secret Password
              </label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full p-4 sm:p-5 bg-gray-100 rounded-2xl font-bold text-sm outline-none border-2 border-transparent focus:border-black focus:bg-white transition-all duration-300"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Link href="/auth/forgot-password" disable-nprogress="true" className="text-[9px] sm:text-[10px] font-black uppercase mt-3 inline-block hover:text-orange-500 transition-colors tracking-tighter">
                Forgot Credentials?
              </Link>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-black text-white py-5 sm:py-6 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-xl active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 flex justify-center items-center mt-2 text-xs sm:text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   VERIFYING...
                </span>
              ) : 'SIGN IN'}
            </button>
          </form>

          {/* Footer Section */}
          <div className="mt-10 sm:mt-12 pt-8 border-t border-gray-100 text-center">
            <p className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
              No Heat in your collection? 
              <br />
              <Link href="/auth/register" className="text-black font-black underline underline-offset-8 decoration-2 decoration-orange-500 hover:text-orange-500 transition-colors mt-4 inline-block">
                CREATE AN ACCOUNT
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}