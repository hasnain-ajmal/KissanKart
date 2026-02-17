
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, Wheat, Search, TrendingUp, Sparkles, MapPin, 
  Star, Trash2, Camera, Plus, CheckCircle, ChevronLeft, 
  User as UserIcon, LogOut, Video, Package, ArrowRight,
  Phone, MessageSquare, Info, Filter, Zap
} from 'lucide-react';
import { Product, CartItem, CATEGORIES, Farmer, Category } from './types';
import { generateProductDescription, generateFarmerBio, getPriceSuggestion } from './services/geminiService';

// Database Persistence Helpers
const DB = {
  getProducts: (): Product[] => JSON.parse(localStorage.getItem('kk_products') || '[]'),
  setProducts: (data: Product[]) => localStorage.setItem('kk_products', JSON.stringify(data)),
  getFarmers: (): Farmer[] => JSON.parse(localStorage.getItem('kk_farmers') || '[]'),
  setFarmers: (data: Farmer[]) => localStorage.setItem('kk_farmers', JSON.stringify(data)),
  getCurrentUser: (): Farmer | null => JSON.parse(localStorage.getItem('kk_session') || 'null'),
  setCurrentUser: (data: Farmer | null) => localStorage.setItem('kk_session', JSON.stringify(data))
};

const INITIAL_FARMERS: Farmer[] = [
  {
    id: 'f1',
    name: 'Muhammad Ahmed',
    bio: 'Dedicated to growing the finest Basmati rice in the fertile lands of Gujranwala for over 20 years.',
    location: 'Gujranwala, Punjab',
    joinedDate: 'Jan 2024',
    rating: 4.9,
    phone: '03001234567',
    verified: true,
    profileImage: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=200',
    whatsAppEnabled: true
  }
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    farmerId: 'f1',
    farmerName: 'Muhammad Ahmed',
    name: 'Premium Super Basmati',
    description: 'Aromatic, long-grain rice, aged for 2 years for perfect fluffiness.',
    price: 320,
    consumerPrice: 368,
    category: 'Rice',
    unit: 'kg',
    media: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400'],
    location: 'Gujranwala, Punjab',
    rating: 4.9,
    stockStatus: 'In Stock',
    freshnessLevel: 'High'
  }
];

export default function App() {
  const [view, setView] = useState<'home' | 'consumer' | 'farmer-portal' | 'farmer-profile' | 'cart' | 'product-details'>('home');
  const [currentFarmer, setCurrentFarmer] = useState<Farmer | null>(DB.getCurrentUser());
  const [selectedFarmerProfile, setSelectedFarmerProfile] = useState<Farmer | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Initialize Data from Storage or Seed
  useEffect(() => {
    const savedFarmers = DB.getFarmers();
    const savedProducts = DB.getProducts();
    
    if (savedFarmers.length === 0) {
      setFarmers(INITIAL_FARMERS);
      DB.setFarmers(INITIAL_FARMERS);
    } else {
      setFarmers(savedFarmers);
    }

    if (savedProducts.length === 0) {
      setProducts(INITIAL_PRODUCTS);
      DB.setProducts(INITIAL_PRODUCTS);
    } else {
      setProducts(savedProducts);
    }

    // Attempt to get Geolocation for "Nearby" feature
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log("Location denied")
      );
    }
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });

    // Simple proximity simulation if location is available
    if (userLocation) {
      return result.sort((a, b) => (a.lat || 0) - (b.lat || 0));
    }
    return result;
  }, [products, searchTerm, selectedCategory, userLocation]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    alert(`Added ${product.name} to Kart!`);
  };

  const handleFarmerRegister = (farmer: Farmer) => {
    const updatedFarmers = [...farmers, farmer];
    setFarmers(updatedFarmers);
    DB.setFarmers(updatedFarmers);
    setCurrentFarmer(farmer);
    DB.setCurrentUser(farmer);
    setView('farmer-portal');
  };

  const handlePostProduct = (p: Product) => {
    const updated = [p, ...products];
    setProducts(updated);
    DB.setProducts(updated);
  };

  const handleFarmerProfileView = (farmerId: string) => {
    const f = farmers.find(farm => farm.id === farmerId);
    if (f) {
      setSelectedFarmerProfile(f);
      setView('farmer-profile');
    }
  };

  const handleProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setView('product-details');
  };

  const logout = () => {
    setCurrentFarmer(null);
    DB.setCurrentUser(null);
    setView('home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-green-100 selection:text-green-900">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('home')}>
            <div className="bg-green-600 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
              <Wheat className="text-white h-5 w-5" />
            </div>
            <h1 className="text-xl font-black brand-font text-slate-900 tracking-tight">KissanKart</h1>
          </div>

          <div className="hidden lg:flex items-center gap-8 text-sm font-bold text-slate-500">
            <button onClick={() => setView('consumer')} className="hover:text-green-600 transition flex items-center gap-2">
              <Package className="h-4 w-4" /> Marketplace
            </button>
            <button onClick={() => setView('farmer-portal')} className="hover:text-green-600 transition flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Farmer Center
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition" onClick={() => setView('cart')}>
              <ShoppingCart className="h-5 w-5 text-slate-700" />
              {cart.length > 0 && (
                <span className="absolute top-1 right-1 bg-orange-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-white">
                  {cart.length}
                </span>
              )}
            </div>
            {currentFarmer ? (
              <div className="flex items-center gap-3">
                <button 
                  className="hidden sm:flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl border border-green-100 text-xs font-bold hover:bg-green-100 transition"
                  onClick={() => setView('farmer-portal')}
                >
                  <img src={currentFarmer.profileImage} className="w-5 h-5 rounded-lg object-cover" />
                  <span>{currentFarmer.name}</span>
                </button>
                <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 transition">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button 
                className="bg-green-700 text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-green-800 transition shadow-lg shadow-green-100 active:scale-95"
                onClick={() => setView('farmer-portal')}
              >
                Start Selling
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {view === 'home' && <HomeHero onStartShopping={() => setView('consumer')} onStartSelling={() => setView('farmer-portal')} />}
        
        {view === 'consumer' && (
          <ConsumerPortal 
            products={filteredProducts} 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onAddToCart={addToCart}
            onViewFarmer={handleFarmerProfileView}
            onViewProduct={handleProductDetails}
            isNearbyEnabled={!!userLocation}
          />
        )}

        {view === 'farmer-portal' && (
          currentFarmer ? 
          <FarmerDashboard 
            farmer={currentFarmer} 
            products={products.filter(p => p.farmerId === currentFarmer.id)}
            onPostProduct={handlePostProduct}
          /> : 
          <FarmerRegistration onRegister={handleFarmerRegister} />
        )}

        {view === 'farmer-profile' && selectedFarmerProfile && (
          <FarmerProfile 
            farmer={selectedFarmerProfile} 
            products={products.filter(p => p.farmerId === selectedFarmerProfile.id)}
            onAddToCart={addToCart}
            onViewProduct={handleProductDetails}
            onBack={() => setView('consumer')}
          />
        )}

        {view === 'product-details' && selectedProduct && (
          <ProductDetailsView 
            product={selectedProduct} 
            onAddToCart={addToCart}
            onViewFarmer={handleFarmerProfileView}
            onBack={() => setView('consumer')}
          />
        )}

        {view === 'cart' && (
          <CartView 
            items={cart} 
            onRemove={(id) => setCart(cart.filter(c => c.id !== id))} 
            onCheckout={() => {
              alert('Order submitted to local farmers! They will contact you via phone.');
              setCart([]);
              setView('home');
            }} 
          />
        )}
      </main>

      <footer className="bg-slate-900 py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-slate-400">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Wheat className="text-green-500 h-6 w-6" />
              <h3 className="text-white font-black brand-font text-2xl tracking-tighter">KissanKart</h3>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              We provide the digital backbone for Pakistan's rural agriculture. Direct access, AI-powered marketing, and community trust.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Connect</h4>
            <ul className="text-sm space-y-3">
              <li className="hover:text-white cursor-pointer transition">Facebook</li>
              <li className="hover:text-white cursor-pointer transition">Instagram</li>
              <li className="hover:text-white cursor-pointer transition">WhatsApp Group</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Platform</h4>
            <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-3 w-3 text-green-400" />
                <span className="text-[10px] font-black uppercase text-green-400 tracking-tighter">Pricing Transparency</span>
              </div>
              <p className="text-[11px] italic leading-snug">
                15% platform fee supports logistics, insurance, and the AI marketing engine for our farmers.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* --- Components --- */

const HomeHero = ({ onStartShopping, onStartSelling }: any) => (
  <section className="relative min-h-[700px] flex items-center justify-center bg-slate-950 px-4 overflow-hidden">
    <div className="absolute inset-0">
      <img src="https://images.unsplash.com/photo-1595111031303-34672692292c?auto=format&fit=crop&q=80&w=1600" className="w-full h-full object-cover opacity-40 scale-105" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/60 to-slate-950"></div>
    </div>
    <div className="relative z-10 text-center max-w-4xl px-4">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-white text-[11px] font-black uppercase tracking-[0.2em] mb-8 animate-bounce">
        <Zap className="h-3 w-3 text-yellow-400 fill-yellow-400" /> New: Nearby Farms Feature Live
      </div>
      <h1 className="text-5xl md:text-8xl font-black text-white mb-8 brand-font leading-[0.9] tracking-tighter">
        Empowering<br/>Pakistan's Soil.
      </h1>
      <p className="text-xl text-slate-300 mb-12 font-medium max-w-2xl mx-auto leading-relaxed">
        The ultimate marketplace for high-quality, local produce. Skip the bazaar, buy straight from the source.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <button onClick={onStartShopping} className="w-full sm:w-auto px-12 py-5 bg-green-600 text-white rounded-[2rem] font-black text-lg hover:bg-green-500 transition shadow-2xl shadow-green-900/40">Shop Fresh Harvest</button>
        <button onClick={onStartSelling} className="w-full sm:w-auto px-12 py-5 bg-white text-slate-900 rounded-[2rem] font-black text-lg hover:bg-slate-100 transition shadow-2xl flex items-center justify-center gap-2">Farmer Registration <ArrowRight className="h-5 w-5" /></button>
      </div>
    </div>
  </section>
);

const FarmerRegistration = ({ onRegister }: { onRegister: (f: Farmer) => void }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [crops, setCrops] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const bio = await generateFarmerBio(name, location, crops);
    const newFarmer: Farmer = {
      id: 'f' + Date.now(),
      name,
      location,
      phone,
      bio,
      joinedDate: new Date().toLocaleDateString('en-PK', { month: 'short', year: 'numeric' }),
      rating: 5.0,
      verified: true,
      profileImage: `https://ui-avatars.com/api/?name=${name}&background=16a34a&color=fff&size=200`,
      whatsAppEnabled: true,
      lat: 31.5204 + (Math.random() - 0.5) * 2, // Mock lat for Lahore region
      lng: 74.3587 + (Math.random() - 0.5) * 2
    };
    onRegister(newFarmer);
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto py-24 px-4">
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 relative">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-green-600 p-4 rounded-3xl shadow-xl">
          <Wheat className="h-8 w-8 text-white" />
        </div>
        <div className="text-center mt-6 mb-12">
          <h2 className="text-4xl font-black text-slate-900 brand-font">Grow Together.</h2>
          <p className="text-slate-500 mt-3 font-medium">Join 5,000+ Pakistani farmers selling directly to customers.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <input required type="text" placeholder="Full Name" className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-green-100 outline-none transition-all font-semibold" value={name} onChange={e => setName(e.target.value)} />
            <input required type="text" placeholder="Harvest Location (e.g., Multan, Sindh)" className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-green-100 outline-none transition-all font-semibold" value={location} onChange={e => setLocation(e.target.value)} />
            <input required type="tel" placeholder="Active WhatsApp Phone" className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-green-100 outline-none transition-all font-semibold" value={phone} onChange={e => setPhone(e.target.value)} />
            <input required type="text" placeholder="Main Harvest (e.g., Mangoes, Grains)" className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-green-100 outline-none transition-all font-semibold" value={crops} onChange={e => setCrops(e.target.value)} />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition shadow-xl disabled:opacity-50 active:scale-95"
          >
            {loading ? 'AI Creating Bio...' : 'Create Farmer Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

const FarmerDashboard = ({ farmer, products, onPostProduct }: any) => {
  const [showListingForm, setShowListingForm] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState<Category>('Vegetables');
  const [unit, setUnit] = useState('kg');
  const [desc, setDesc] = useState('');
  const [media, setMedia] = useState<string[]>([]);
  const [tempMedia, setTempMedia] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  const handlePost = (e: any) => {
    e.preventDefault();
    if (media.length === 0) return alert('At least one image is mandatory!');
    const p: Product = {
      id: 'p' + Date.now(),
      farmerId: farmer.id,
      farmerName: farmer.name,
      name,
      description: desc,
      price,
      consumerPrice: Math.ceil(price * 1.15),
      category,
      unit,
      media,
      location: farmer.location,
      lat: farmer.lat,
      lng: farmer.lng,
      rating: 5.0,
      stockStatus: 'In Stock',
      freshnessLevel: 'High'
    };
    onPostProduct(p);
    setShowListingForm(false);
    resetForm();
    alert('Harvest Posted Live!');
  };

  const resetForm = () => {
    setName(''); setPrice(0); setDesc(''); setMedia([]); setTempMedia('');
  };

  const handleSuggestPrice = async () => {
    if (!name) return alert('Enter product name first');
    setLoadingAI(true);
    const suggested = await getPriceSuggestion(name);
    setPrice(suggested);
    setLoadingAI(false);
  };

  const handleAIDesc = async () => {
    if (!name) return alert('Enter product name first');
    setLoadingAI(true);
    const description = await generateProductDescription(name, category, "");
    setDesc(description);
    setLoadingAI(false);
  };

  return (
    <div className="max-w-7xl mx-auto py-16 px-4">
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="lg:w-1/3 space-y-6">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-green-600"></div>
            <img src={farmer.profileImage} className="w-24 h-24 rounded-[2rem] mx-auto mb-6 border-4 border-white shadow-xl object-cover" />
            <h3 className="text-2xl font-black text-slate-900 brand-font mb-2">{farmer.name}</h3>
            <div className="flex items-center justify-center gap-2 text-slate-400 text-sm font-bold mb-8">
              <MapPin className="h-4 w-4 text-green-500" /> {farmer.location}
            </div>
            
            <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-50 mb-8">
              <div className="text-center">
                <p className="text-xl font-black text-slate-900">{farmer.rating}</p>
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Farmer Score</p>
              </div>
              <div className="text-center border-l border-slate-100">
                <p className="text-xl font-black text-slate-900">{products.length}</p>
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Active Crops</p>
              </div>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-3xl text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Farmer Story</p>
              <p className="text-xs text-slate-500 italic leading-relaxed font-medium">"{farmer.bio}"</p>
            </div>
          </div>
        </div>

        <div className="lg:w-2/3 space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-black text-slate-900 brand-font tracking-tight">Active Harvest</h2>
            <button 
              onClick={() => setShowListingForm(!showListingForm)}
              className="bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-green-100 hover:bg-green-700 transition flex items-center gap-3 active:scale-95"
            >
              {showListingForm ? <ChevronLeft className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {showListingForm ? 'Back to Dashboard' : 'Post New Harvest'}
            </button>
          </div>

          {showListingForm ? (
            <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-500">
              <form onSubmit={handlePost} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Harvest Name</label>
                    <input required className="w-full px-6 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-green-50 font-bold" placeholder="e.g., Sindhri Mangoes" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Category</label>
                    <select className="w-full px-6 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-green-50 font-bold" value={category} onChange={e => setCategory(e.target.value as any)}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Your Base Price (Rs.)</label>
                    <div className="relative">
                      <input required type="number" className="w-full px-6 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-green-50 font-bold pr-20" placeholder="0" value={price || ''} onChange={e => setPrice(Number(e.target.value))} />
                      <button type="button" onClick={handleSuggestPrice} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition">
                        <Sparkles className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Product Media (Photos & Videos)</label>
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <input className="flex-grow px-6 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-green-50 font-medium text-sm" placeholder="Paste image or video URL (Unsplash/Imgur etc)" value={tempMedia} onChange={e => setTempMedia(e.target.value)} />
                    <button type="button" onClick={() => { if(tempMedia) { setMedia([...media, tempMedia]); setTempMedia(''); } }} className="px-8 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition font-black text-sm active:scale-95">
                      Add Media
                    </button>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {media.map((m, i) => (
                      <div key={i} className="relative shrink-0 group">
                        <img src={m} className="w-32 h-32 rounded-[1.5rem] object-cover border-2 border-slate-100 group-hover:border-green-500 transition-colors" />
                        <button type="button" onClick={() => setMedia(media.filter((_, idx) => idx !== i))} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 shadow-lg hover:scale-110 transition active:scale-90">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <div className="w-32 h-32 rounded-[1.5rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 gap-2 shrink-0">
                      <Camera className="h-6 w-6" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Upload</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-4 font-bold">*At least one high-quality image is required for consumers to trust your post.</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Listing Story</label>
                    <button type="button" onClick={handleAIDesc} className="text-[10px] font-black text-green-600 uppercase flex items-center gap-2 hover:bg-green-50 px-3 py-1 rounded-full transition">
                      <Sparkles className="h-3 w-3" /> AI Help Writing
                    </button>
                  </div>
                  <textarea required className="w-full px-6 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-green-50 h-32 leading-relaxed font-medium" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe the freshness, soil quality, and why consumers should buy from you..." />
                </div>

                <button type="submit" className="w-full py-5 bg-green-600 text-white rounded-[2rem] font-black text-xl hover:bg-green-700 transition shadow-2xl shadow-green-100 active:scale-95">Go Live with Harvest</button>
              </form>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {products.map(p => (
                <div key={p.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl flex gap-6 group hover:translate-y-[-4px] transition-all">
                  <img src={p.media[0]} className="w-28 h-28 rounded-3xl object-cover shadow-lg" />
                  <div className="flex flex-col justify-between py-1">
                    <div>
                      <h4 className="text-xl font-black text-slate-900 leading-tight mb-1">{p.name}</h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{p.category}</p>
                    </div>
                    <div>
                      <p className="text-xl font-black text-green-800">Rs. {p.price}</p>
                      <p className="text-[9px] font-black text-slate-300 uppercase">Per {p.unit}</p>
                    </div>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="md:col-span-2 py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                  <Package className="h-16 w-16 text-slate-100 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-slate-200 uppercase tracking-widest">No Active Harvests</h3>
                  <p className="text-slate-300 mt-2 font-medium">Click "Post New Harvest" to start selling.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ConsumerPortal = ({ products, searchTerm, setSearchTerm, selectedCategory, setSelectedCategory, onAddToCart, onViewFarmer, onViewProduct, isNearbyEnabled }: any) => (
  <div className="max-w-7xl mx-auto py-20 px-4">
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
      <div className="max-w-2xl">
        <h2 className="text-5xl font-black text-slate-900 brand-font mb-4 tracking-tighter">Fresh from the Farm.</h2>
        <p className="text-slate-500 text-lg font-medium leading-relaxed">Direct access to Pakistan's best crops. Skip the middleman, support the local farmer, and eat 100% fresh.</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
        <div className="relative group flex-grow">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-green-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search mangoes, grains..." 
            className="w-full sm:w-80 pl-14 pr-8 py-5 bg-white rounded-[2rem] border border-slate-200 outline-none focus:ring-8 focus:ring-green-50 transition-all shadow-sm font-bold"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="px-8 py-5 bg-white rounded-[2rem] border border-slate-200 outline-none font-black text-slate-700 focus:ring-8 focus:ring-green-50 transition-all appearance-none cursor-pointer"
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div>

    {isNearbyEnabled && (
      <div className="flex items-center gap-3 mb-10 text-green-700 bg-green-50 w-fit px-6 py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest animate-pulse">
        <Filter className="h-4 w-4" /> Sorted by Nearby Farms
      </div>
    )}

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
      {products.map((p: Product) => (
        <div key={p.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-500 group overflow-hidden flex flex-col hover:translate-y-[-8px]">
          <div className="h-64 relative overflow-hidden cursor-pointer" onClick={() => onViewProduct(p)}>
            <img src={p.media[0]} className="w-full h-full object-cover group-hover:scale-110 transition duration-1000" />
            <div className="absolute top-5 left-5 flex flex-col gap-2">
              <span className="bg-green-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl shadow-lg">{p.category}</span>
              {p.freshnessLevel === 'High' && <span className="bg-white text-green-700 text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1"><Zap className="h-3 w-3 fill-current" /> High Freshness</span>}
            </div>
            {p.media.length > 1 && (
              <div className="absolute bottom-5 right-5 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl flex items-center gap-2 text-[10px] font-black text-slate-900 shadow-xl border border-white">
                <Camera className="h-3 w-3" /> +{p.media.length-1} Media
              </div>
            )}
          </div>
          <div className="p-8 flex-grow flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-black text-slate-900 leading-none hover:text-green-600 transition-colors cursor-pointer" onClick={() => onViewProduct(p)}>{p.name}</h3>
              <div className="flex items-center gap-1 text-orange-500 font-black text-sm">
                <Star className="h-4 w-4 fill-current" /> {p.rating}
              </div>
            </div>
            <div 
              className="flex items-center gap-3 mb-6 cursor-pointer hover:bg-slate-50 p-2 -ml-2 rounded-2xl transition-colors group/farmer"
              onClick={() => onViewFarmer(p.farmerId)}
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden"><UserIcon className="h-4 w-4 text-slate-400 group-hover/farmer:text-green-600 transition-colors" /></div>
              <p className="text-xs font-black text-slate-400 group-hover/farmer:text-green-600 transition-colors uppercase tracking-widest">By {p.farmerName}</p>
            </div>
            <p className="text-sm text-slate-500 line-clamp-2 mb-8 flex-grow leading-relaxed font-medium">{p.description}</p>
            <div className="flex items-end justify-between mt-auto">
              <div>
                <p className="text-[10px] text-slate-300 uppercase font-black tracking-[0.2em] mb-1">Total Payable</p>
                <p className="text-3xl font-black text-green-800">Rs. {p.consumerPrice}<span className="text-xs text-slate-400 ml-1">/{p.unit}</span></p>
              </div>
              <button 
                onClick={() => onAddToCart(p)}
                className="p-5 bg-slate-900 text-white rounded-[1.5rem] hover:bg-green-600 transition-all active:scale-90 shadow-xl shadow-slate-100 hover:shadow-green-100"
              >
                <ShoppingCart className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ProductDetailsView = ({ product, onAddToCart, onViewFarmer, onBack }: any) => {
  const [activeMedia, setActiveMedia] = useState(0);

  return (
    <div className="max-w-7xl mx-auto py-20 px-4">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-green-600 font-black text-xs uppercase tracking-widest mb-12 transition">
        <ChevronLeft className="h-5 w-5" /> Back to Marketplace
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-6">
          <div className="h-[500px] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
            <img src={product.media[activeMedia]} className="w-full h-full object-cover animate-in fade-in zoom-in duration-700" />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {product.media.map((m: string, i: number) => (
              <div 
                key={i} 
                onClick={() => setActiveMedia(i)}
                className={`w-24 h-24 rounded-2xl overflow-hidden cursor-pointer transition-all border-4 ${activeMedia === i ? 'border-green-500 scale-105 shadow-xl' : 'border-white opacity-60 hover:opacity-100'}`}
              >
                <img src={m} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">{product.category}</span>
            <span className="flex items-center gap-1 text-orange-500 font-bold text-sm bg-orange-50 px-4 py-2 rounded-xl">
              <Star className="h-4 w-4 fill-current" /> {product.rating} (Verified Harvest)
            </span>
          </div>
          <h1 className="text-6xl font-black text-slate-900 brand-font mb-6 tracking-tighter leading-tight">{product.name}</h1>
          <p className="text-xl text-slate-500 font-medium leading-relaxed mb-10">{product.description}</p>
          
          <div className="bg-slate-50 p-8 rounded-[2.5rem] mb-10 flex items-center justify-between border border-slate-100">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2">Farmer's Price</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-green-800">Rs. {product.consumerPrice}</span>
                <span className="text-slate-400 font-bold">/ {product.unit}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2">Availability</p>
              <span className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-green-100">{product.stockStatus}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <button onClick={() => onAddToCart(product)} className="flex-grow bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-green-600 transition shadow-2xl shadow-slate-200 flex items-center justify-center gap-4 active:scale-95">
              <ShoppingCart className="h-6 w-6" /> Add to Shopping Kart
            </button>
          </div>

          <div className="mt-auto pt-10 border-t border-slate-100 flex items-center gap-6">
             <img src={`https://ui-avatars.com/api/?name=${product.farmerName}&background=f8fafc&color=1e293b`} className="w-16 h-16 rounded-[1.5rem] border-4 border-white shadow-xl" />
             <div className="flex-grow">
               <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Harvested By</p>
               <h4 className="text-xl font-black text-slate-900 hover:text-green-600 cursor-pointer transition-colors" onClick={() => onViewFarmer(product.farmerId)}>{product.farmerName}</h4>
             </div>
             <button onClick={() => onViewFarmer(product.farmerId)} className="p-4 bg-green-50 text-green-700 rounded-2xl hover:bg-green-100 transition shadow-sm">
               <ArrowRight className="h-6 w-6" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FarmerProfile = ({ farmer, products, onAddToCart, onViewProduct, onBack }: any) => (
  <div className="max-w-7xl mx-auto py-20 px-4">
    <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-green-600 font-black text-xs uppercase tracking-widest mb-12 transition">
      <ChevronLeft className="h-5 w-5" /> All Farmers
    </button>
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
      <div className="lg:col-span-1">
        <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl text-center sticky top-32">
          <div className="relative inline-block mx-auto mb-8">
            <img src={farmer.profileImage} className="w-40 h-40 rounded-[3rem] border-8 border-white shadow-2xl object-cover" />
            {farmer.verified && <CheckCircle className="absolute -bottom-2 -right-2 h-10 w-10 text-blue-500 fill-white drop-shadow-lg" />}
          </div>
          <h2 className="text-4xl font-black text-slate-900 brand-font mb-4 tracking-tighter">{farmer.name}</h2>
          <div className="flex items-center justify-center gap-3 text-slate-400 font-bold mb-10">
            <MapPin className="h-5 w-5 text-green-500" /> {farmer.location}
          </div>
          
          <div className="p-8 bg-green-50 rounded-[2.5rem] mb-10 border border-green-100">
            <p className="text-sm text-green-800 italic leading-relaxed font-semibold">"{farmer.bio}"</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
              <p className="text-2xl font-black text-slate-900">{farmer.rating}</p>
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Farmer Score</p>
            </div>
            <div className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
              <p className="text-2xl font-black text-slate-900">{products.length}</p>
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Active Crops</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button className="w-full py-4 bg-green-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-green-700 transition shadow-xl shadow-green-100">
              <MessageSquare className="h-5 w-5" /> Chat via WhatsApp
            </button>
            <button className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-slate-200 transition">
              <Phone className="h-5 w-5" /> Call Directly
            </button>
          </div>
        </div>
      </div>
      
      <div className="lg:col-span-2">
        <h3 className="text-4xl font-black text-slate-900 brand-font mb-12 tracking-tight">Available Harvest from {farmer.name}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          {products.map((p: any) => (
            <div key={p.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col group hover:translate-y-[-4px] transition-all">
              <div className="h-56 relative cursor-pointer" onClick={() => onViewProduct(p)}>
                <img src={p.media[0]} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                <div className="absolute top-4 left-4">
                  <span className="bg-green-600 text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl shadow-lg">{p.category}</span>
                </div>
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h4 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-green-600 transition-colors cursor-pointer" onClick={() => onViewProduct(p)}>{p.name}</h4>
                <p className="text-sm text-slate-500 line-clamp-2 mb-8 flex-grow font-medium">{p.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <p className="text-3xl font-black text-green-800">Rs. {p.consumerPrice} <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">/ {p.unit}</span></p>
                  <button onClick={() => onAddToCart(p)} className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-green-600 transition shadow-lg active:scale-90">
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const CartView = ({ items, onRemove, onCheckout }: any) => {
  const total = items.reduce((acc: number, item: any) => acc + (item.consumerPrice * item.quantity), 0);
  return (
    <div className="max-w-6xl mx-auto py-24 px-4">
      <h2 className="text-6xl font-black text-slate-900 brand-font mb-16 tracking-tighter">Shopping Kart.</h2>
      {items.length === 0 ? (
        <div className="bg-white py-32 rounded-[4rem] border-4 border-dashed border-slate-100 text-center shadow-inner">
          <ShoppingCart className="h-24 w-24 text-slate-100 mx-auto mb-8" />
          <p className="text-2xl font-black text-slate-200 uppercase tracking-widest">Your Kart is empty</p>
          <button onClick={() => window.location.reload()} className="mt-8 bg-green-600 text-white px-10 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-green-700 transition shadow-xl shadow-green-100">Shop Fresh Crops</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-8">
            {items.map((item: any) => (
              <div key={item.id} className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-xl flex items-center gap-8 group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-green-500/20"></div>
                <img src={item.media[0]} className="w-28 h-28 rounded-3xl object-cover shadow-2xl border-4 border-white" />
                <div className="flex-grow">
                  <h4 className="text-2xl font-black text-slate-900 leading-tight mb-2">{item.name}</h4>
                  <div className="flex items-center gap-3 text-slate-400 font-bold mb-4">
                    <span className="text-[10px] uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">{item.quantity} {item.unit} x Rs. {item.consumerPrice}</span>
                  </div>
                  <p className="text-3xl font-black text-green-700">Rs. {item.consumerPrice * item.quantity}</p>
                </div>
                <button onClick={() => onRemove(item.id)} className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-3xl transition-all active:scale-90">
                  <Trash2 className="h-6 w-6" />
                </button>
              </div>
            ))}
          </div>
          <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl h-fit sticky top-32">
            <h3 className="text-3xl font-black text-slate-900 brand-font mb-10 tracking-tight">Order Summary</h3>
            <div className="space-y-6 mb-12">
              <div className="flex justify-between text-slate-500 font-bold">
                <span className="text-sm uppercase tracking-widest">Subtotal</span>
                <span className="text-slate-900">Rs. {total}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-bold">
                <span className="text-sm uppercase tracking-widest">Farmer Delivery</span>
                <span className="text-green-600 text-[10px] uppercase font-black tracking-[0.2em] bg-green-50 px-4 py-1.5 rounded-full">Always Free</span>
              </div>
              <div className="pt-8 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xl font-black text-slate-900">Total Payable</span>
                <span className="text-5xl font-black text-green-800 tracking-tighter">Rs. {total}</span>
              </div>
            </div>
            <button onClick={onCheckout} className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-xl hover:bg-green-600 transition shadow-2xl shadow-slate-200 active:scale-95">Complete Order</button>
            <div className="mt-10 flex items-center justify-center gap-4 text-slate-300 grayscale opacity-50">
               <span className="text-[8px] font-black uppercase tracking-[0.4em]">Verified Secure Payments</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
