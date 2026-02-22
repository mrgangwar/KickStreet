import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';

export default function ShopSettings() {
  const [settings, setSettings] = useState({
    storeName: 'KickStreet',
    storeEmail: 'support@kickstreet.com',
    storePhone: '+91 98765 43210',
    storeAddress: '123 Sneaker Street, Mumbai, India',
    freeShippingThreshold: 4999,
    codEnabled: true,
    stripeEnabled: true,
  });

  const handleSave = async () => {
    alert('Settings saved successfully! 🔥');
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-0 mb-10">
        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <h2 className="text-4xl sm:text-5xl font-[1000] italic uppercase tracking-tighter text-black leading-none">
            Store <span className="text-orange-600">Config</span>
          </h2>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.4em] mt-3">
            KickStreet Core Parameters
          </p>
        </div>

        {/* Settings Box */}
        <div className="bg-white rounded-[2rem] sm:rounded-[3.5rem] shadow-xl border border-gray-100 p-6 sm:p-12">
          <div className="space-y-10">
            
            {/* Store Info Section */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-8 bg-orange-600 rounded-full" />
                <h3 className="text-sm font-black uppercase tracking-widest text-black">Store Information</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="group">
                  <label className="text-[10px] font-black uppercase ml-2 mb-2 block text-gray-400 group-focus-within:text-orange-600">Store Name</label>
                  <input
                    type="text"
                    value={settings.storeName}
                    onChange={(e) => setSettings({...settings, storeName: e.target.value})}
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                </div>
                <div className="group">
                  <label className="text-[10px] font-black uppercase ml-2 mb-2 block text-gray-400 group-focus-within:text-orange-600">Support Email</label>
                  <input
                    type="email"
                    value={settings.storeEmail}
                    onChange={(e) => setSettings({...settings, storeEmail: e.target.value})}
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                </div>
                <div className="group">
                  <label className="text-[10px] font-black uppercase ml-2 mb-2 block text-gray-400 group-focus-within:text-orange-600">Contact Phone</label>
                  <input
                    type="text"
                    value={settings.storePhone}
                    onChange={(e) => setSettings({...settings, storePhone: e.target.value})}
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                </div>
                <div className="group">
                  <label className="text-[10px] font-black uppercase ml-2 mb-2 block text-gray-400 group-focus-within:text-orange-600">Free Ship Threshold (₹)</label>
                  <input
                    type="number"
                    value={settings.freeShippingThreshold}
                    onChange={(e) => setSettings({...settings, freeShippingThreshold: parseInt(e.target.value)})}
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                </div>
              </div>

              <div className="mt-6 group">
                <label className="text-[10px] font-black uppercase ml-2 mb-2 block text-gray-400 group-focus-within:text-orange-600">Warehouse Address</label>
                <textarea
                  value={settings.storeAddress}
                  onChange={(e) => setSettings({...settings, storeAddress: e.target.value})}
                  rows={3}
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>
            </section>

            {/* Payment Gateways Section */}
            <section className="pt-10 border-t border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-8 bg-black rounded-full" />
                <h3 className="text-sm font-black uppercase tracking-widest text-black">Payment Gateways</h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 'codEnabled', title: 'Cash on Delivery', desc: 'Allow manual payment on arrival' },
                  { id: 'stripeEnabled', title: 'Stripe Secure', desc: 'Accept Cards, Apple Pay, & Google Pay' }
                ].map((gate) => (
                  <div key={gate.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-[1.5rem] border border-transparent hover:border-gray-200 transition-all">
                    <div>
                      <p className="font-black uppercase text-sm text-black tracking-tight">{gate.title}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{gate.desc}</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, [gate.id]: !settings[gate.id as keyof typeof settings] })}
                      className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${
                        settings[gate.id as keyof typeof settings] ? 'bg-orange-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform ${
                        settings[gate.id as keyof typeof settings] ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Save Action */}
            <div className="pt-6">
              <button
                onClick={handleSave}
                className="w-full bg-black text-white py-6 rounded-full font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-orange-600 transition-all active:scale-95"
              >
                Sync All Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}