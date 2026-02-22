import AdminLayout from '@/components/AdminLayout';
import { useState, useEffect } from 'react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    fetch('/api/admin/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success) setOrders(data.orders);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, orderStatus: newStatus }),
      });
      
      const data = await res.json();
      if (data.success) {
        alert('Order status updated!');
        fetchOrders();
      } else {
        alert(data.message || 'Failed to update order');
      }
    } catch (err) {
      alert('Error updating order');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-600';
      case 'Pending': return 'bg-orange-100 text-orange-600';
      case 'Failed': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'Processing': return 'bg-blue-100 text-blue-600';
      case 'Shipped': return 'bg-purple-100 text-purple-600';
      case 'Delivered': return 'bg-green-100 text-green-600';
      case 'Cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8 px-2 sm:px-0">
        <h2 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter text-black">Manage Orders</h2>
        <p className="text-gray-400 text-xs sm:text-sm font-bold uppercase tracking-widest">Customer Sales Tracker</p>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-[1.5rem] sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* DESKTOP VIEW: Visible only on lg screens and up */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-gray-400">Order ID</th>
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-gray-400">Customer</th>
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-gray-400">Items</th>
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-gray-400">Total</th>
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-gray-400">Payment</th>
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-gray-400">Order Status</th>
                <th className="p-5 font-black text-[10px] uppercase tracking-widest text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-20 text-center italic text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="p-20 text-center text-gray-400 uppercase font-black text-xs">No orders found yet.</td></tr>
              ) : (
                orders.map((order: any) => (
                  <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-5 text-[11px] font-mono font-bold text-gray-400">#{order._id.slice(-6).toUpperCase()}</td>
                    <td className="p-5">
                      <p className="font-black text-sm text-black">{order.email.split('@')[0]}</p>
                      <p className="text-[10px] text-gray-400 font-bold">{order.email}</p>
                    </td>
                    <td className="p-5 text-xs font-bold text-gray-600">{order.items.length} Units</td>
                    <td className="p-5 font-black text-black">₹{order.amountTotal?.toLocaleString('en-IN')}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${getOrderStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="p-5">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        disabled={updating === order._id}
                        className="text-[10px] font-black uppercase bg-gray-100 rounded-lg px-3 py-2 border-none outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE & TABLET VIEW: Card-based layout */}
        <div className="lg:hidden divide-y divide-gray-100">
          {loading ? (
            <div className="p-10 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">Loading...</div>
          ) : orders.length === 0 ? (
            <div className="p-10 text-center text-gray-400 font-bold uppercase text-xs">Empty Hype-line</div>
          ) : (
            orders.map((order: any) => (
              <div key={order._id} className="p-5 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-mono font-bold text-gray-400 mb-1">#{order._id.slice(-8).toUpperCase()}</p>
                    <h4 className="font-black uppercase text-sm leading-none">{order.email}</h4>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-black">₹{order.amountTotal?.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] font-bold text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border ${getStatusColor(order.status)}`}>
                    PAY: {order.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border ${getOrderStatusColor(order.orderStatus)}`}>
                    SHIP: {order.orderStatus}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-gray-400">Quick Update</span>
                  <select
                    value={order.orderStatus}
                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                    disabled={updating === order._id}
                    className="text-[10px] font-black uppercase bg-white border border-gray-200 rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}