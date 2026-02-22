import AdminLayout from '@/components/AdminLayout';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  email: string;
  amountTotal: number;
  status: string;
  orderStatus: string;
  createdAt: string;
  items: OrderItem[];
}

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  productsCount: number;
  pendingOrders: number;
  paidOrders: number;
  failedOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  recentOrders: Order[];
  allOrders: Order[];
  filter: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ 
    totalRevenue: 0, 
    totalOrders: 0, 
    productsCount: 0,
    pendingOrders: 0,
    paidOrders: 0,
    failedOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    recentOrders: [],
    allOrders: [],
    filter: 'all'
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showReportModal, setShowReportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated' || (session?.user as any)?.role !== 'admin') {
      router.push('/auth/login');
    }
  }, [status, session, router]);

  // Fetch stats function
  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/stats?filter=${filter}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("Dashboard Stats Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and auto-refresh every 30 seconds
  useEffect(() => {
    if (status === 'authenticated') {
      fetchStats();
      
      const intervalId = setInterval(() => {
        fetchStats();
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(intervalId); // Cleanup on unmount
    }
  }, [status, filter]);

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!stats.allOrders || stats.allOrders.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['Order ID', 'Customer Email', 'Amount', 'Payment Status', 'Order Status', 'Date'];
    const rows = stats.allOrders.map((order: Order) => [
      order._id,
      order.email,
      order.amountTotal,
      order.status,
      order.orderStatus,
      new Date(order.createdAt).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `kickstreet_report_${filter}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowReportModal(false);
  };

  // Export to PDF (simplified text-based)
  const exportToPDF = () => {
    if (!stats.allOrders || stats.allOrders.length === 0) {
      alert('No data to export');
      return;
    }

    let reportContent = `
KICKSTREET SALES REPORT
Generated: ${new Date().toLocaleString()}
Filter: ${filter === 'all' ? 'All Time' : filter.charAt(0).toUpperCase() + filter.slice(1)}

========================================
SUMMARY STATISTICS
========================================
Total Revenue: ₹${stats.totalRevenue.toLocaleString('en-IN')}
Total Orders: ${stats.totalOrders}
Paid Orders: ${stats.paidOrders}
Pending Orders: ${stats.pendingOrders}
Failed Orders: ${stats.failedOrders}
Processing: ${stats.processingOrders}
Shipped: ${stats.shippedOrders}
Delivered: ${stats.deliveredOrders}
Cancelled: ${stats.cancelledOrders}
Products: ${stats.productsCount}

========================================
ORDER DETAILS
========================================
`;

    stats.allOrders.forEach((order: Order, index: number) => {
      reportContent += `
${index + 1}. Order #${order._id.slice(-6).toUpperCase()}
   Customer: ${order.email}
   Amount: ₹${order.amountTotal.toLocaleString('en-IN')}
   Payment: ${order.status}
   Shipping: ${order.orderStatus}
   Date: ${new Date(order.createdAt).toLocaleDateString()}
`;
    });

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `kickstreet_report_${filter}_${new Date().toISOString().split('T')[0]}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowReportModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-700 border-green-200';
      case 'Pending': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Failed': return 'bg-red-100 text-red-700 border-red-200';
      case 'Processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Shipped': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="flex flex-col items-center gap-4 text-center">
           <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-black border-t-orange-600 rounded-full animate-spin" />
           <p className="font-black italic uppercase tracking-tighter text-xl sm:text-2xl">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-0">
        {/* 1. Header */}
        <div className="bg-white p-5 sm:p-10 rounded-[2rem] sm:rounded-[3.5rem] shadow-xl border border-gray-100 mb-8 sm:mb-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="text-center sm:text-left w-full">
              <h2 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tighter text-black leading-none">
                Insights <span className="text-orange-600">Overview</span>
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mt-2">
                <p className="text-gray-400 font-bold text-[8px] sm:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em]">
                  KickStreet Control Center / {new Date().getFullYear()}
                </p>
                {lastUpdated && (
                  <span className="text-[8px] font-bold text-green-600 uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    Live · {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
            <button 
              onClick={() => {
                fetchStats();
                setFilter('all');
              }}
              className="w-full sm:w-auto bg-black text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.582 0A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Generate Full Report
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-100">
            {['all', 'today', 'week', 'month'].map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === f 
                    ? 'bg-orange-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'All Time' : f === 'today' ? 'Today' : f === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
          {[
            { label: 'Revenue', val: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, color: 'text-green-600', sub: 'From Paid Orders' },
            { label: 'Pending', val: stats.pendingOrders || 0, color: 'text-orange-600', sub: 'Awaiting Payment' },
            { label: 'Paid', val: stats.paidOrders || 0, color: 'text-blue-600', sub: 'Completed' },
            { label: 'Products', val: stats.productsCount, color: 'text-black', sub: 'In Stock' }
          ].map((card, i) => (
            <div key={i} className="bg-white p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <p className="text-gray-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-2 sm:mb-4 group-hover:text-black transition-colors">{card.label}</p>
              <h3 className={`text-3xl sm:text-4xl lg:text-5xl font-[1000] tracking-tighter mb-1 sm:mb-2 ${card.color} break-words`}>{card.val}</h3>
              <p className="text-[8px] sm:text-[9px] font-bold text-gray-300 uppercase tracking-tight">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* 3. Additional Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 mb-8 sm:mb-12">
          {[
            { label: 'Failed', val: stats.failedOrders, color: 'text-red-600' },
            { label: 'Processing', val: stats.processingOrders, color: 'text-blue-600' },
            { label: 'Shipped', val: stats.shippedOrders, color: 'text-purple-600' },
            { label: 'Delivered', val: stats.deliveredOrders, color: 'text-green-600' },
            { label: 'Cancelled', val: stats.cancelledOrders, color: 'text-gray-600' },
            { label: 'Total Orders', val: stats.totalOrders, color: 'text-black' },
          ].map((card, i) => (
            <div key={i} className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-gray-400 text-[8px] sm:text-[9px] font-black uppercase tracking-widest mb-1">{card.label}</p>
              <h3 className={`text-2xl sm:text-3xl font-[1000] tracking-tighter ${card.color}`}>{card.val}</h3>
            </div>
          ))}
        </div>

        {/* 4. Recent Sales Table */}
        <div className="bg-white rounded-[1.5rem] sm:rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden mb-12">
          <div className="p-5 sm:p-8 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/30">
            <h3 className="font-black uppercase italic tracking-tight text-lg sm:text-xl">Recent Drops Sold</h3>
            <span className="text-[10px] font-bold text-gray-400 uppercase">
              Showing {stats.recentOrders.length} latest orders
            </span>
          </div>
          
          <div className="overflow-x-auto w-full scrollbar-hide">
            <table className="w-full text-left min-w-[600px] lg:min-w-full">
              <thead className="bg-white text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-gray-400 border-b border-gray-50">
                <tr>
                  <th className="px-6 sm:px-10 py-4 sm:py-6">Order Hash</th>
                  <th className="px-6 sm:px-10 py-4 sm:py-6">Customer</th>
                  <th className="px-6 sm:px-10 py-4 sm:py-6 text-right">Amount</th>
                  <th className="px-6 sm:px-10 py-4 sm:py-6 text-center">Payment</th>
                  <th className="px-6 sm:px-10 py-4 sm:py-6 text-center">Shipping</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentOrders.length > 0 ? stats.recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 sm:px-10 py-4 sm:py-6 text-[10px] font-mono font-bold text-gray-400 group-hover:text-black">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 sm:px-10 py-4 sm:py-6">
                      <p className="text-xs sm:text-sm font-black uppercase tracking-tight text-black truncate max-w-[120px] sm:max-w-none">
                        {order.email.split('@')[0]}
                      </p>
                      <p className="text-[9px] font-bold text-gray-400 truncate max-w-[120px] sm:max-w-none">{order.email}</p>
                    </td>
                    <td className="px-6 sm:px-10 py-4 sm:py-6 text-xs sm:text-sm font-[1000] text-right text-black">
                      ₹{order.amountTotal.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 sm:px-10 py-4 sm:py-6 text-center">
                      <span className={`px-3 py-1.5 text-[8px] sm:text-[9px] font-[1000] uppercase rounded-full tracking-tighter border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 sm:px-10 py-4 sm:py-6 text-center">
                      <span className={`px-3 py-1.5 text-[8px] sm:text-[9px] font-[1000] uppercase rounded-full tracking-tighter border ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-10 py-16 sm:py-20 text-center">
                      <div className="flex flex-col items-center opacity-20">
                        <span className="text-4xl sm:text-6xl mb-4">📦</span>
                        <p className="text-xs font-black uppercase italic tracking-widest">No Sales Found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-10 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2">
              Generate <span className="text-orange-600">Report</span>
            </h3>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-6">
              Filter: {filter === 'all' ? 'All Time' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </p>

            <div className="space-y-3">
              <button 
                onClick={exportToCSV}
                className="w-full bg-green-600 text-white px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export as CSV
              </button>
              
              <button 
                onClick={exportToPDF}
                className="w-full bg-red-600 text-white px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export as PDF
              </button>

              <button 
                onClick={() => setShowReportModal(false)}
                className="w-full bg-gray-100 text-gray-600 px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
