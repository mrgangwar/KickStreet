import AdminLayout from '@/components/AdminLayout';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface ProductType {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  images: string[];
}

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (data.success) setProducts(data.products);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product? This will also remove images from Cloudinary.")) {
      try {
        const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          setProducts(products.filter((p) => p._id !== id));
          alert("Product deleted successfully!");
        } else {
          alert(data.message || "Delete failed");
        }
      } catch (err) {
        alert("Something went wrong while deleting.");
      }
    }
  };

  return (
    <AdminLayout>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 px-2 sm:px-0">
        <div>
          <h2 className="text-3xl sm:text-4xl font-[1000] italic uppercase tracking-tighter text-black">Manage Heat</h2>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">Live Inventory Tracking</p>
        </div>
        <button 
          onClick={() => router.push('/admin/add-product')}
          className="w-full sm:w-auto bg-black text-white px-8 py-4 rounded-2xl hover:bg-orange-600 transition-all shadow-xl font-black uppercase text-[10px] tracking-widest active:scale-95"
        >
          + Add New Product
        </button>
      </div>

      <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        
        {/* DESKTOP TABLE VIEW */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="p-6 font-black text-[10px] uppercase tracking-widest text-gray-400">Sneaker</th>
                <th className="p-6 font-black text-[10px] uppercase tracking-widest text-gray-400">Category</th>
                <th className="p-6 font-black text-[10px] uppercase tracking-widest text-gray-400">Price</th>
                <th className="p-6 font-black text-[10px] uppercase tracking-widest text-gray-400">Inventory</th>
                <th className="p-6 font-black text-[10px] uppercase tracking-widest text-gray-400 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center font-bold italic text-gray-300">Syncing with KickStreet...</td></tr>
              ) : products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <img src={product.images?.[0] || '/file.svg'} alt={product.name} className="w-14 h-14 object-cover rounded-xl bg-gray-100 border border-gray-100 group-hover:scale-110 transition-transform" />
                      <div>
                        <p className="font-black text-sm uppercase tracking-tight text-black">{product.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{product._id.slice(-6)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-[11px] font-black uppercase text-gray-400">{product.category}</td>
                  <td className="p-6 font-black text-black">₹{product.price.toLocaleString('en-IN')}</td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${product.stock < 10 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {product.stock} Units
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => router.push(`/admin/edit-product/${product._id}`)} className="bg-gray-100 hover:bg-black hover:text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all">Edit</button>
                      <button onClick={() => deleteProduct(product._id)} className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARD VIEW */}
        <div className="md:hidden divide-y divide-gray-100">
          {loading ? (
            <div className="p-10 text-center font-black uppercase text-xs text-gray-300">Loading Heat...</div>
          ) : products.map((product) => (
            <div key={product._id} className="p-4 flex gap-4 items-center">
              <img src={product.images?.[0] || '/file.svg'} alt={product.name} className="w-20 h-20 object-cover rounded-2xl bg-gray-50" />
              <div className="flex-1 min-w-0">
                <h4 className="font-black uppercase text-sm truncate">{product.name}</h4>
                <div className="flex justify-between items-center mt-1">
                  <p className="font-black text-orange-600 text-xs">₹{product.price.toLocaleString('en-IN')}</p>
                  <span className={`text-[8px] font-black uppercase ${product.stock < 10 ? 'text-red-500' : 'text-green-500'}`}>
                    {product.stock} left
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button 
                    onClick={() => router.push(`/admin/edit-product/${product._id}`)}
                    className="flex-1 bg-gray-100 py-2 rounded-lg text-[9px] font-black uppercase"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => deleteProduct(product._id)}
                    className="flex-1 bg-red-50 text-red-500 py-2 rounded-lg text-[9px] font-black uppercase"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}