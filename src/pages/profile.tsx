import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Toast from '@/components/Toast';

interface UserData {
  name: string;
  email: string;
  phone: string;
  shippingAddress?: {
    line1: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string;
  };
}

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    line1: '',
    city: '',
    state: '',
    postal_code: '',
    addressPhone: '',
  });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/profile');
      const data = await res.json();
      
      if (res.ok && data.user) {
        setUser(data.user);
        setFormData({
          name: data.user.name || '',
          phone: data.user.phone || '',
          line1: data.user.shippingAddress?.line1 || '',
          city: data.user.shippingAddress?.city || '',
          state: data.user.shippingAddress?.state || '',
          postal_code: data.user.shippingAddress?.postal_code || '',
          addressPhone: data.user.shippingAddress?.phone || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          shippingAddress: {
            line1: formData.line1,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postal_code,
            country: 'IN',
            phone: formData.addressPhone,
          },
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast('Profile updated successfully!', 'success');
        setUser(data.user);
      } else {
        showToast(data.message || 'Failed to update profile', 'error');
      }
    } catch (error) {
      showToast('Something went wrong', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen selection:bg-orange-600 selection:text-white flex flex-col">
      <Navbar />
      
      <main className="flex-grow w-full px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter">My Profile</h1>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-600 font-medium"
            >
              Logout
            </button>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info */}
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-6">
              <h2 className="text-lg font-bold uppercase italic mb-4">Personal Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 text-sm"
                    placeholder="Your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={session?.user?.email || ''}
                    disabled
                    className="w-full p-3 rounded-xl border border-gray-200 text-sm bg-gray-100 text-gray-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 text-sm"
                    placeholder="Your phone number"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-6">
              <h2 className="text-lg font-bold uppercase italic mb-4">Shipping Address</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Full Address</label>
                  <textarea
                    value={formData.line1}
                    onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 text-sm"
                    placeholder="Street address, landmark"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full p-3 rounded-xl border border-gray-200 text-sm"
                      placeholder="City"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full p-3 rounded-xl border border-gray-200 text-sm"
                      placeholder="State"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Pincode</label>
                    <input
                      type="text"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                      className="w-full p-3 rounded-xl border border-gray-200 text-sm"
                      placeholder="Pincode"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.addressPhone}
                      onChange={(e) => setFormData({ ...formData, addressPhone: e.target.value })}
                      className="w-full p-3 rounded-xl border border-gray-200 text-sm"
                      placeholder="Phone"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 rounded-full bg-orange-600 text-white font-black uppercase text-sm tracking-wider hover:bg-orange-700 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      {/* Toast */}
      </main>

      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.show} 
        onClose={() => setToast({ ...toast, show: false })} 
      />
    </div>
  );
}
