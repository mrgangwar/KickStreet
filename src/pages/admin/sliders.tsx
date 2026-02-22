import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/AdminLayout';
import Image from 'next/image';

interface Slider {
  _id: string;
  image: string;
  productId: string | null;
  title: string;
  subtitle: string;
  order: number;
  isActive: boolean;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
}

export default function SlidersPage() {
  const router = useRouter();
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSlider, setEditingSlider] = useState<Slider | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    image: '',
    productId: '',
    title: '',
    subtitle: '',
    order: 0,
    isActive: true
  });

  // Handle image upload to Cloudinary
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      alert("File too large! Max 5MB allowed.");
      return;
    }
    
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: reader.result })
        });
        const data = await res.json();
        if (data.url) {
          setFormData({ ...formData, image: data.url });
        }
      } catch (error) {
        console.error('Upload error:', error);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Quick add from product
  const handleQuickAddFromProduct = (product: Product) => {
    setFormData({
      image: product.images?.[0] || '',
      productId: product._id,
      title: product.name,
      subtitle: `₹${product.price.toLocaleString('en-IN')}`,
      order: sliders.length,
      isActive: true
    });
    setEditingSlider(null);
    setShowModal(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [slidersRes, productsRes] = await Promise.all([
        fetch('/api/admin/sliders'),
        fetch('/api/admin/products')
      ]);
      
      const slidersData = await slidersRes.json();
      const productsData = await productsRes.json();
      
      if (slidersData.success) setSliders(slidersData.sliders);
      if (productsData.success) setProducts(productsData.products);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingSlider ? `/api/admin/sliders/${editingSlider._id}` : '/api/admin/sliders';
      const method = editingSlider ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, productId: formData.productId || null })
      });

      const data = await res.json();

      if (data.success) {
        setShowModal(false);
        setEditingSlider(null);
        resetForm();
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Failed to save slider');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Drop this slide from the collection?')) return;
    try {
      const res = await fetch(`/api/admin/sliders/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchData();
    } catch (error) {
      alert('Failed to delete slider');
    }
  };

  const handleEdit = (slider: Slider) => {
    setEditingSlider(slider);
    setFormData({
      image: slider.image,
      productId: slider.productId || '',
      title: slider.title,
      subtitle: slider.subtitle,
      order: slider.order,
      isActive: slider.isActive
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      image: '',
      productId: '',
      title: '',
      subtitle: '',
      order: sliders.length,
      isActive: true
    });
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-0">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
          <div>
            <h2 className="text-4xl sm:text-5xl font-[1000] italic uppercase tracking-tighter text-black leading-none">
              Hero <span className="text-orange-600">Visuals</span>
            </h2>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.4em] mt-3">
              Homepage Banner Management (Limit: 03)
            </p>
          </div>
          <button
            onClick={() => { setEditingSlider(null); resetForm(); setShowModal(true); }}
            disabled={sliders.length >= 3}
            className="w-full sm:w-auto bg-black text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-600 disabled:opacity-30 transition-all shadow-xl active:scale-95"
          >
            + Create New Slide
          </button>
        </div>

        {/* Quick Add from Products */}
        {products.length > 0 && sliders.length < 3 && (
          <div className="mb-8">
            <p className="text-xs font-black uppercase text-gray-400 mb-3 ml-2">Quick create from products:</p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {products.slice(0, 6).map((product) => (
                <button
                  key={product._id}
                  onClick={() => handleQuickAddFromProduct(product)}
                  className="flex-shrink-0 bg-white border-2 border-gray-100 p-3 rounded-xl hover:border-orange-500 transition-all"
                >
                  <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden mb-2">
                    {product.images?.[0] ? (
                      <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-300 text-xs">No Image</div>
                    )}
                  </div>
                  <p className="text-[10px] font-black uppercase truncate w-20">{product.name}</p>
                  <p className="text-[9px] text-orange-600 font-bold">₹{product.price}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Grid */}
        {loading && sliders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-black mb-4"></div>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Loading Visuals...</p>
          </div>
        ) : sliders.length === 0 ? (
          <div className="bg-gray-50 rounded-[2.5rem] p-16 text-center border-2 border-dashed border-gray-200">
            <p className="text-black font-black uppercase italic text-xl">The Stage is Empty</p>
            <p className="text-gray-400 text-xs mt-2 uppercase font-bold tracking-tight">Add sliders to define your brand's first impression.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sliders.sort((a,b) => a.order - b.order).map((slider) => (
              <div key={slider._id} className="group bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500">
                <div className="relative h-56 w-full bg-gray-900">
                  {slider.image ? (
                    <Image src={slider.image} alt={slider.title} fill className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-[10px] font-black uppercase text-gray-700">Image Missing</div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg ${
                      slider.isActive ? 'bg-orange-600 text-white' : 'bg-white text-black'
                    }`}>
                      {slider.isActive ? 'Live' : 'Draft'}
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg">
                    <span className="text-white text-[10px] font-black">SLOT 0{slider.order + 1}</span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-black text-lg uppercase italic text-black truncate">{slider.title || 'No Title'}</h3>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-tight mt-1 line-clamp-1">{slider.subtitle || 'No subtitle provided'}</p>
                  
                  <div className="flex gap-2 mt-6">
                    <button onClick={() => handleEdit(slider)} className="flex-1 bg-gray-100 py-3 rounded-xl text-[9px] font-black uppercase hover:bg-black hover:text-white transition-all">Edit</button>
                    <button onClick={() => handleDelete(slider._id)} className="flex-1 bg-red-50 text-red-500 py-3 rounded-xl text-[9px] font-black uppercase hover:bg-red-500 hover:text-white transition-all">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Overlay */}
        {showModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white w-full max-w-2xl rounded-[2rem] sm:rounded-[3.5rem] shadow-2xl overflow-hidden">
              <div className="p-6 sm:p-10 border-b border-gray-100">
                <div className="text-center sm:text-left">
                  <h2 className="text-3xl sm:text-5xl font-black italic uppercase mb-2 tracking-tighter text-black leading-tight">
                    {editingSlider ? 'Edit Slide' : 'Add New Slide'}
                  </h2>
                  <p className="text-gray-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">KickStreet Hero Management</p>
                </div>
                <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 sm:top-10 sm:right-10 text-gray-400 hover:text-black font-black text-xs">CLOSE</button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-5 sm:grid sm:grid-cols-2 sm:gap-6">
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Slider Image</label>
                  <div className="space-y-3">
                    {formData.image && (
                      <div className="relative h-40 w-full bg-gray-100 rounded-2xl overflow-hidden">
                        <Image src={formData.image} alt="Preview" fill className="object-cover" />
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, image: ''})}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                    <label className="flex items-center justify-center w-full h-16 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden" 
                      />
                      <span className="text-xs font-black uppercase text-gray-400">
                        {uploading ? 'UPLOADING...' : formData.image ? 'CHANGE IMAGE' : 'UPLOAD IMAGE'}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Sequence Order</label>
                  <input type="number" value={formData.order} onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})} min="0" max="2" className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Status</label>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                    <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5 accent-orange-600" />
                    <span className="text-xs font-black uppercase text-black">Active on Site</span>
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Primary Title</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none focus:ring-2 focus:ring-orange-500" required placeholder="HEAT FOR YOUR FEET" />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Subtitle</label>
                  <input type="text" value={formData.subtitle} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none focus:ring-2 focus:ring-orange-500" placeholder="Limited Drop" />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Product Connection</label>
                  <select value={formData.productId} onChange={(e) => setFormData({...formData, productId: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold border-none focus:ring-2 focus:ring-orange-500 uppercase text-xs">
                    <option value="">No Link</option>
                    {products.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <button type="submit" className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl">
                    {editingSlider ? 'Sync Updates' : 'Launch Slide'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}