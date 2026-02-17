
import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, Wheat, Search, TrendingUp, Sparkles, MapPin, 
  Star, Trash2, Camera, Plus, CheckCircle, ChevronLeft, 
  User as UserIcon, LogOut, Video, Package, ArrowRight
} from 'lucide-react';
import { Product, CartItem, CATEGORIES, Farmer, Category } from './types';
import { generateProductDescription, generateFarmerBio, getPriceSuggestion } from './services/geminiService';

// Mock Data
const INITIAL_FARMERS: Farmer[] = [
  {
    id: 'f1',
    name: 'Muhammad Ahmed',
    bio: 'Dedicated to growing the finest Basmati rice in the fertile lands of Gujranwala for over 20 years.',
    location: 'Gujranwala, Punjab',
    joinedDate: 'Jan 2024',
    rating: 4.9,
    phone: '0300-1234567',
    verified: true,
    profileImage: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=200'
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
    stockStatus: 'In Stock'
  }
];

export default function App() {
  const [view, setView] = useState<'home' | 'consumer' | 'farmer-portal' | 'farmer-profile' | 'cart'>('home');
  const [currentFarmer, setCurrentFarmer] = useState<Farmer | null>(null);
  const [selectedFarmerProfile, setSelectedFarmerProfile] = useState<Farmer | null>(null);
  const [farmers, setFarmers] = useState<Farmer[]>(INITIAL_FARMERS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [products, searchTerm, selectedCategory]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleFarmerRegister = (farmer: Farmer) => {
    setFarmers(prev => [...prev, farmer]);
    setCurrentFarmer(farmer);
    setView('farmer-portal');
  };

  const handleFarmerProfileView = (farmerId: string) => {
    const f = farmers.find(farm => farm.id === farmerId);
    if (f) {
      setSelectedFarmerProfile(f);
      setView('farmer-profile');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
            <div className="bg-green-600 p-2 rounded-xl">
              <Wheat className="text-white h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold brand-font text-green-900 tracking-tight">KissanKart</h1>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <button onClick={() => setView('consumer')} className="hover:text-green-600 transition">Marketplace</button>
            <button onClick={() => setView('farmer-portal')} className="hover:text-green-600 transition">Sell Harvest</button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer group p-2 rounded-full hover:bg-slate-100 transition" onClick={() => setView('cart')}>
              <ShoppingCart className="h-5 w-5 text-slate-700" />
              {cart.length > 0 && (
                <span className="absolute top-1 right-1 bg-orange-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
                  {cart.length}
                </span>
              )}
            </div>
            {currentFarmer ? (
              <button 
                className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200 text-sm font-bold"
                onClick={() => setView('farmer-portal')}
              >
                <img src={currentFarmer.profileImage} className="w-6 h-6 rounded-full" />
                <span>Dashboard</span>
              </button>
            ) : (
              <button 
                className="bg-green-700 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-green-800 transition shadow-lg shadow-green-100"
                onClick={() => setView('farmer-portal')}
              >
                Join as Farmer
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
          />
        )}
        {view === 'farmer-portal' && (
          currentFarmer ? 
          <FarmerDashboard 
            farmer={currentFarmer} 
            onPostProduct={(p) => setProducts([p, ...products])}
            onLogout={() => setCurrentFarmer(null)}
          /> : 
          <FarmerRegistration onRegister={handleFarmerRegister} />
        )}
        {view === 'farmer-profile' && selectedFarmerProfile && (
          <FarmerProfile 
            farmer={selectedFarmerProfile} 
            products={products.filter(p => p.farmerId === selectedFarmerProfile.id)}
            onAddToCart={addToCart}
            onBack={() => setView('consumer')}
          />
        )}
        {view === 'cart' && <CartView items={cart} onRemove={(id) => setCart(cart.filter(c => c.id !== id))} onCheckout={() => alert('Order Placed!')} />}
      </main>

      <footer className="bg-slate-900 text-slate-500 py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4 col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Wheat className="text-green-500 h-6 w-6" />
              <h3 className="text-white font-bold brand-font text-2xl">KissanKart</h3>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              We empower Pakistani farmers by removing middlemen, ensuring higher profits for rural communities and fresher produce for urban families.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Categories</h4>
            <ul className="text-sm space-y-3">
              {CATEGORIES.slice(0, 4).map(c => <li key={c} className="hover:text-green-400 cursor-pointer">{c}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Transparency</h4>
            <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
              <p className="text-[11px] uppercase tracking-widest text-green-400 font-bold mb-2">Platform Fee</p>
              <p className="text-xs italic text-slate-300">15% fee included in buyer price covers logistics, insurance, and AI marketing tools for farmers.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* --- Components --- */

const HomeHero = ({ onStartShopping, onStartSelling }: any) => (
  <section className="relative min-h-[600px] flex items-center justify-center bg-green-950 px-4 overflow-hidden">
    <div className="absolute inset-0 opacity-40">
      <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1600" className="w-full h-full object-cover" />
    </div>
    <div className="relative z-10 text-center max-w-3xl">
      <span className="inline-block px-4 py-1.5 rounded-full bg-orange-600/90 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-xl">Pakistan's #1 Farmer Marketplace</span>
      <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 brand-font leading-tight">Farmer Direct,<br/>Quality Perfect.</h1>
      <p className="text-lg text-green-100 mb-10 font-light">Join the movement of fair trade. 100% fresh produce from local Pakistani soil directly to your home.</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button onClick={onStartShopping} className="w-full sm:w-auto px-10 py-4 bg-white text-green-950 rounded-2xl font-bold text-lg hover:bg-green-50 transition shadow-2xl">Browse Harvest</button>
        <button onClick={onStartSelling} className="w-full sm:w-auto px-10 py-4 bg-orange-600 text-white rounded-2xl font-bold text-lg hover:bg-orange-700 transition shadow-2xl flex items-center justify-center gap-2">Register as Farmer <ArrowRight className="h-5 w-5" /></button>
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
      joinedDate: 'Current',
      rating: 5.0,
      verified: false,
      profileImage: `https://ui-avatars.com/api/?name=${name}&background=15803d&color=fff`
    };
    onRegister(newFarmer);
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto py-20 px-4">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
        <div className="text-center mb-10">
          <div className="bg-green-100 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <UserIcon className="h-8 w-8 text-green-700" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 brand-font">Join KissanKart</h2>
          <p className="text-slate-500 mt-2">Start selling your harvest directly to customers across Pakistan.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <input required type="text" placeholder="Full Name" className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none" value={name} onChange={e => setName(e.target.value)} />
              <input required type="text" placeholder="Location (e.g., Multan, Punjab)" className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none" value={location} onChange={e => setLocation(e.target.value)} />
              <input required type="tel" placeholder="Phone Number (03XX-XXXXXXX)" className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none" value={phone} onChange={e => setPhone(e.target.value)} />
              <input required type="text" placeholder="Primary Crops (e.g., Mangoes, Rice)" className="w-full px-5 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none" value={crops} onChange={e => setCrops(e.target.value)} />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-green-700 text-white rounded-2xl font-bold text-lg hover:bg-green-800 transition shadow-xl disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};

const FarmerDashboard = ({ farmer, onPostProduct, onLogout }: any) => {
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
    if (media.length === 0) return alert('At least one image is required!');
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
      rating: 5.0,
      stockStatus: 'In Stock'
    };
    onPostProduct(p);
    setShowListingForm(false);
    alert('Listing Successful!');
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
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-green-600"></div>
            <img src={farmer.profileImage} className="w-24 h-24 rounded-3xl mx-auto mb-4 border-4 border-white shadow-lg" />
            <h3 className="text-2xl font-bold text-slate-900 brand-font">{farmer.name}</h3>
            <p className="text-slate-400 text-sm flex items-center justify-center gap-1 mt-1 mb-4">
              <MapPin className="h-3 w-3" /> {farmer.location}
            </p>
            <div className="flex justify-center gap-4 py-4 border-y border-slate-50">
              <div className="text-center">
                <p className="text-lg font-bold text-slate-800">{farmer.rating}</p>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Rating</p>
              </div>
              <div className="text-center border-l pl-4">
                <p className="text-lg font-bold text-slate-800">{farmer.joinedDate}</p>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Joined</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 my-6 italic leading-relaxed">"{farmer.bio}"</p>
            <button onClick={onLogout} className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition text-xs font-bold mx-auto">
              <LogOut className="h-3 w-3" /> Logout
            </button>
          </div>
        </div>

        <div className="md:w-2/3 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-slate-900 brand-font">Manage Harvest</h2>
            <button 
              onClick={() => setShowListingForm(!showListingForm)}
              className="bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-orange-100 hover:bg-orange-700 transition flex items-center gap-2"
            >
              <Plus className="h-5 w-5" /> {showListingForm ? 'Cancel' : 'Add New Crop'}
            </button>
          </div>

          {showListingForm && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
              <form onSubmit={handlePost} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1 md:col-span-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Crop Name</label>
                    <input required className="w-full px-5 py-3 rounded-xl border border-slate-200 outline-none" placeholder="e.g., Chaunsa Mangoes" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Category</label>
                    <select className="w-full px-5 py-3 rounded-xl border border-slate-200 outline-none" value={category} onChange={e => setCategory(e.target.value as any)}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Base Price (PKR)</label>
                    <div className="relative">
                      <input required type="number" className="w-full px-5 py-3 rounded-xl border border-slate-200 outline-none" value={price || ''} onChange={e => setPrice(Number(e.target.value))} />
                      <button type="button" onClick={handleSuggestPrice} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-green-600 hover:bg-green-50 rounded-lg transition">
                        <Sparkles className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Media (Images/Videos URL)</label>
                  <div className="flex gap-2 mb-4">
                    <input className="flex-grow px-5 py-3 rounded-xl border border-slate-200 outline-none" placeholder="Paste image/video URL" value={tempMedia} onChange={e => setTempMedia(e.target.value)} />
                    <button type="button" onClick={() => { if(tempMedia) { setMedia([...media, tempMedia]); setTempMedia(''); } }} className="px-4 bg-slate-100 rounded-xl hover:bg-slate-200 transition">
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {media.map((m, i) => (
                      <div key={i} className="relative shrink-0">
                        <img src={m} className="w-20 h-20 rounded-xl object-cover" />
                        <button type="button" onClick={() => setMedia(media.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg">
                          <Plus className="h-3 w-3 rotate-45" />
                        </button>
                      </div>
                    ))}
                    {media.length === 0 && <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300"><Camera className="h-6 w-6" /></div>}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">*At least one image is mandatory for your listing to go live.</p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Story & Details</label>
                    <button type="button" onClick={handleAIDesc} className="text-[10px] font-bold text-green-600 uppercase flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> AI Help
                    </button>
                  </div>
                  <textarea required className="w-full px-5 py-3 rounded-xl border border-slate-200 outline-none h-32" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe the taste, harvest date, and quality..." />
                </div>

                <button type="submit" className="w-full py-4 bg-orange-600 text-white rounded-2xl font-bold text-xl hover:bg-orange-700 transition shadow-2xl shadow-orange-100">Post Listing</button>
              </form>
            </div>
          )}

          {!showListingForm && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-2xl text-green-700"><Package className="h-6 w-6" /></div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">0</p>
                  <p className="text-xs font-bold text-slate-400 uppercase">Sales Today</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg flex items-center gap-4">
                <div className="bg-orange-100 p-3 rounded-2xl text-orange-700"><TrendingUp className="h-6 w-6" /></div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">Rs. 0</p>
                  <p className="text-xs font-bold text-slate-400 uppercase">Earnings</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ConsumerPortal = ({ products, searchTerm, setSearchTerm, selectedCategory, setSelectedCategory, onAddToCart, onViewFarmer }: any) => (
  <div className="max-w-7xl mx-auto py-16 px-4">
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
      <div className="max-w-xl">
        <h2 className="text-5xl font-bold text-slate-900 brand-font mb-4">Farmer Marketplace</h2>
        <p className="text-slate-500 text-lg">Support the hardworking people of Pakistan. Fresh from harvest, directly to your doorstep.</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
        <div className="relative group flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search mangoes, rice, dairy..." 
            className="w-full sm:w-80 pl-12 pr-6 py-4 bg-white rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-green-100 transition shadow-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="px-6 py-4 bg-white rounded-2xl border border-slate-200 outline-none font-bold text-slate-700"
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
        >
          <option value="All">All Items</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {products.map((p: Product) => (
        <div key={p.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group overflow-hidden flex flex-col">
          <div className="h-56 relative overflow-hidden">
            <img src={p.media[0]} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-green-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg">{p.category}</span>
              {p.media.length > 1 && <span className="bg-white/80 backdrop-blur text-slate-900 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg flex items-center gap-1"><Camera className="h-3 w-3" /> +{p.media.length-1}</span>}
            </div>
          </div>
          <div className="p-6 flex-grow flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-slate-900">{p.name}</h3>
              <div className="flex items-center gap-1 text-orange-500 font-bold text-sm">
                <Star className="h-4 w-4 fill-current" /> {p.rating}
              </div>
            </div>
            <div 
              className="flex items-center gap-2 mb-4 cursor-pointer hover:bg-slate-50 p-2 -ml-2 rounded-xl transition"
              onClick={() => onViewFarmer(p.farmerId)}
            >
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center"><UserIcon className="h-3 w-3 text-slate-400" /></div>
              <p className="text-xs font-bold text-slate-400 hover:text-green-600">By {p.farmerName}</p>
            </div>
            <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-grow leading-relaxed">{p.description}</p>
            <div className="flex items-end justify-between mt-auto">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Price per {p.unit}</p>
                <p className="text-2xl font-black text-green-800">Rs. {p.consumerPrice}</p>
              </div>
              <button 
                onClick={() => onAddToCart(p)}
                className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-green-700 transition active:scale-95"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const FarmerProfile = ({ farmer, products, onAddToCart, onBack }: any) => (
  <div className="max-w-7xl mx-auto py-16 px-4">
    <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-green-600 font-bold mb-10 transition">
      <ChevronLeft className="h-5 w-5" /> Back to Market
    </button>
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-1">
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl text-center">
          <div className="relative inline-block mx-auto mb-6">
            <img src={farmer.profileImage} className="w-32 h-32 rounded-[2rem] border-4 border-white shadow-xl" />
            {farmer.verified && <CheckCircle className="absolute -bottom-2 -right-2 h-8 w-8 text-blue-500 fill-white" />}
          </div>
          <h2 className="text-3xl font-bold text-slate-900 brand-font mb-2">{farmer.name}</h2>
          <p className="text-slate-400 flex items-center justify-center gap-2 mb-6">
            <MapPin className="h-4 w-4" /> {farmer.location}
          </p>
          <div className="bg-green-50 p-6 rounded-3xl mb-8">
            <p className="text-sm text-green-800 italic leading-relaxed">"{farmer.bio}"</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl">
              <p className="text-xl font-black text-slate-900">{farmer.rating}</p>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Farmer Rating</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl">
              <p className="text-xl font-black text-slate-900">{products.length}</p>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Crops Listed</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="lg:col-span-2">
        <h3 className="text-3xl font-bold text-slate-900 brand-font mb-10">Fresh from {farmer.name}'s Farm</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {products.map((p: any) => (
            <div key={p.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
              <img src={p.media[0]} className="h-48 w-full object-cover rounded-2xl mb-6" />
              <h4 className="text-xl font-bold text-slate-900 mb-2">{p.name}</h4>
              <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-grow">{p.description}</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-black text-green-800">Rs. {p.consumerPrice} <span className="text-[10px] text-slate-400 uppercase font-bold">/ {p.unit}</span></p>
                <button onClick={() => onAddToCart(p)} className="p-3 bg-slate-900 text-white rounded-xl hover:bg-green-700 transition">
                  <Plus className="h-5 w-5" />
                </button>
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
    <div className="max-w-5xl mx-auto py-20 px-4">
      <h2 className="text-5xl font-bold text-slate-900 brand-font mb-12">Shopping Kart</h2>
      {items.length === 0 ? (
        <div className="bg-white py-24 rounded-[3rem] border-2 border-dashed border-slate-100 text-center shadow-inner">
          <ShoppingCart className="h-20 w-20 text-slate-100 mx-auto mb-6" />
          <p className="text-xl font-bold text-slate-300">Your kart is looking fresh but empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {items.map((item: any) => (
              <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6 group">
                <img src={item.media[0]} className="w-24 h-24 rounded-2xl object-cover" />
                <div className="flex-grow">
                  <h4 className="text-xl font-bold text-slate-900">{item.name}</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{item.quantity} {item.unit} x Rs. {item.consumerPrice}</p>
                  <p className="text-2xl font-black text-green-700 mt-2">Rs. {item.consumerPrice * item.quantity}</p>
                </div>
                <button onClick={() => onRemove(item.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition">
                  <Trash2 className="h-6 w-6" />
                </button>
              </div>
            ))}
          </div>
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl h-fit">
            <h3 className="text-2xl font-bold text-slate-900 mb-8">Summary</h3>
            <div className="space-y-4 mb-10">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">Rs. {total}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Direct Delivery</span>
                <span className="text-green-600 font-bold uppercase tracking-widest text-[10px]">Free</span>
              </div>
              <hr className="border-slate-50" />
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-slate-900">Total</span>
                <span className="text-4xl font-black text-green-800">Rs. {total}</span>
              </div>
            </div>
            <button onClick={onCheckout} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-xl hover:bg-green-700 transition shadow-xl shadow-slate-100 active:scale-[0.98]">Confirm Order</button>
            <p className="text-center text-[9px] text-slate-400 mt-6 uppercase tracking-[0.3em] font-black">100% Secure Pakistani Checkout</p>
          </div>
        </div>
      )}
    </div>
  );
};
