import { useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';

export default function AddProduct() {
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', category: 'Men', stock: '', sizes: '', colors: ''
  });
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Image to Base64 with size check
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        return alert("File too large! Max 5MB allowed.");
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setImages(old => [...old, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) return alert("Please upload at least one image!");
    
    setLoading(true);

    const productData = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
      sizes: formData.sizes.split(',').map(s => s.trim().toUpperCase()), 
      colors: formData.colors.split(',').map(c => c.trim().toLowerCase()),
      images: images 
    };

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (res.ok) {
        alert("Product Dropped to the Hype! 🔥");
        setFormData({ name: '', description: '', price: '', category: 'Men', stock: '', sizes: '', colors: '' });
        setImages([]);
        router.push('/admin/products');
      } else {
        const err = await res.json();
        alert(err.message || "Error adding product");
      }
    } catch (error) {
      alert("SERVER ERROR: CHECK CONNECTION");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      {/* Optimized Container for Mobile Viewports */}
      <div className="w-full max-w-4xl mx-auto bg-white p-5 sm:p-10 rounded-[2rem] sm:rounded-[3.5rem] shadow-xl border border-gray-100 mb-10 overflow-hidden">
        <div className="mb-8 sm:mb-10 text-center sm:text-left">
           <h2 className="text-3xl sm:text-5xl font-black italic uppercase mb-2 tracking-tighter text-black leading-tight">Add New Heat</h2>
           <p className="text-gray-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">KickStreet Inventory Management</p>
        </div>
        
        {/* Responsive Grid/Flex logic */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:grid sm:grid-cols-2 sm:gap-6">
          {/* Shoe Name */}
          <div className="sm:col-span-2 group">
              <label className="text-[9px] sm:text-[10px] font-black uppercase ml-1 sm:ml-2 mb-2 block text-gray-400 group-focus-within:text-orange-500 transition-colors">Shoe Name</label>
              <input type="text" placeholder="NIKE AIR MAX 270" required value={formData.name}
                className="w-full p-4 sm:p-5 bg-gray-50 rounded-xl sm:rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm sm:text-base"
                onChange={(e)=>setFormData({...formData, name:e.target.value})} />
          </div>

          {/* Price & Category */}
          <div className="group">
              <label className="text-[9px] sm:text-[10px] font-black uppercase ml-1 sm:ml-2 mb-2 block text-gray-400 group-focus-within:text-orange-500 transition-colors">Price (₹)</label>
              <input type="number" placeholder="9999" required value={formData.price}
                className="w-full p-4 sm:p-5 bg-gray-50 rounded-xl sm:rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                onChange={(e)=>setFormData({...formData, price:e.target.value})} />
          </div>

          <div className="group">
              <label className="text-[9px] sm:text-[10px] font-black uppercase ml-1 sm:ml-2 mb-2 block text-gray-400">Category</label>
              <select className="w-full p-4 sm:p-5 bg-gray-50 rounded-xl sm:rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                value={formData.category} onChange={(e)=>setFormData({...formData, category:e.target.value})}>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Children">Children</option>
              </select>
          </div>

          {/* Description */}
          <div className="sm:col-span-2 group">
              <label className="text-[9px] sm:text-[10px] font-black uppercase ml-1 sm:ml-2 mb-2 block text-gray-400 group-focus-within:text-orange-500 transition-colors">Story / Description</label>
              <textarea placeholder="Tell the story of this pair..." value={formData.description}
                className="w-full p-4 sm:p-5 bg-gray-50 rounded-xl sm:rounded-2xl h-28 sm:h-32 font-medium border-none outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm"
                onChange={(e)=>setFormData({...formData, description:e.target.value})}></textarea>
          </div>

          {/* Stock & Sizes */}
          <div className="group">
            <label className="text-[9px] sm:text-[10px] font-black uppercase ml-1 sm:ml-2 mb-2 block text-gray-400">Inventory Stock</label>
            <input type="number" placeholder="50" value={formData.stock}
              className="w-full p-4 sm:p-5 bg-gray-50 rounded-xl sm:rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              onChange={(e)=>setFormData({...formData, stock:e.target.value})} />
          </div>
               
          <div className="group">
            <label className="text-[9px] sm:text-[10px] font-black uppercase ml-1 sm:ml-2 mb-2 block text-gray-400">Sizes (UK)</label>
            <input type="text" placeholder="7, 8, 9, 10" value={formData.sizes}
              className="w-full p-4 sm:p-5 bg-gray-50 rounded-xl sm:rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              onChange={(e)=>setFormData({...formData, sizes:e.target.value})} />
          </div>

          {/* Images Section */}
          <div className="sm:col-span-2">
            <label className="block text-[9px] sm:text-[10px] font-black uppercase mb-4 text-gray-400 ml-1">Drop Product Images</label>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                {/* Upload Trigger */}
                <label className="w-full sm:w-32 h-32 flex flex-col items-center justify-center border-4 border-dashed border-gray-100 rounded-2xl sm:rounded-[2rem] hover:border-orange-500 hover:bg-orange-50 transition-all cursor-pointer">
                  <span className="text-3xl">+</span>
                  <span className="text-[8px] font-black uppercase">Upload</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
                
                {/* Image List: Ensuring horizontal scroll works on small screens */}
                <div className="flex gap-4 overflow-x-auto pb-4 w-full scrollbar-hide">
                  {images.map((img, i) => (
                    <div key={i} className="relative flex-shrink-0">
                       <img src={img} alt="Preview" className="w-32 h-32 object-cover rounded-2xl sm:rounded-[2rem] border-2 border-gray-50" />
                       <button type="button" onClick={()=>setImages(images.filter((_,index)=>index!==i))} 
                         className="absolute -top-1 -right-1 bg-black text-white w-7 h-7 rounded-full font-bold shadow-lg text-sm flex items-center justify-center">×</button>
                    </div>
                  ))}
                </div>
            </div>
          </div>

          <button type="submit" disabled={loading} 
            className="sm:col-span-2 bg-black text-white py-5 sm:py-6 rounded-xl sm:rounded-full font-black uppercase tracking-[0.2em] shadow-xl hover:bg-orange-600 transition-all active:scale-95 disabled:bg-gray-300 mt-4 text-xs sm:text-base">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Dripping Heat...
              </span>
            ) : "Confirm & Drop Product"}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}