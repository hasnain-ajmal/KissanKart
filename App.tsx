
import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, LayoutGrid, User, Wheat, Search, TrendingUp, Sparkles, Plus, MapPin, Star, Trash2 } from 'lucide-react';
import { Product, CartItem, CATEGORIES, User as UserType, Category } from './types';
import { generateProductDescription } from './services/geminiService';

// Initial Mock Data with Pakistani context
const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    farmerId: 'f1',
    farmerName: 'Muhammad Ahmed',
    name: 'Basmati Super Kernel Rice',
    description: 'Aromatic, extra-long grain aged Basmati rice from the fields of Gujranwala.',
    price: 320,
    consumerPrice: 368, // 320 * 1.15
    category: 'Rice',
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400',
    location: 'Gujranwala, Punjab',
    rating: 4.9
  },
  {
    id: '2',
    farmerId: 'f2',
    farmerName: 'Zubair Khan',
    name: 'Sindhri Mangoes (Premium)',
    description: 'The king of fruits from Mirpur Khas. Sweet, pulpy, and fiberless.',
    price: 180,
    consumerPrice: 207,
    category: 'Fruits',
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=400',
    location: 'Mirpur Khas, Sindh',
    rating: 4.8
  },
  {
    id: '3',
    farmerId: 'f3',
    farmerName: 'Bashir Ahmed',
    name: 'Red Desi Carrots',
    description: 'Crunchy and sweet organic carrots, perfect for Gajar ka Halwa.',
    price: 60,
    consumerPrice: 69,
    category: 'Vegetables',
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=400',
    location: 'Lahore, Punjab',
    rating: 4.7
  },
  {
    id: '4',
    farmerId: 'f4',
    farmerName: 'Fatima Bibi',
    name: 'Organic Desi Ghee',
    description: 'Pure buffalo milk ghee prepared using traditional methods in Sahiwal.',
    price: 2200,
    consumerPrice: 2530,
    category: 'Dairy',
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&q=80&w=400',
    location: 'Sahiwal, Punjab',
    rating: 5.0
  }
];

export default function App() {
  const [view, setView] = useState<'home' | 'consumer' | 'farmer' | 'cart'>('home');
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
    alert(`${product.name} added to cart!`);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const totalCartPrice = cart.reduce((acc, item) => acc + (item.consumerPrice * item.quantity), 0);

  const handleFarmerSubmit = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
    setView('consumer');
    alert('Your product has been posted successfully!');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setView('home')}
          >
            <div className="bg-green-600 p-2 rounded-lg">
              <Wheat className="text-white h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold brand-font text-green-800">KissanKart</h1>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button onClick={() => setView('consumer')} className="hover:text-green-600">Buy Fresh</button>
            <button onClick={() => setView('farmer')} className="hover:text-green-600">Farmer Portal</button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer group" onClick={() => setView('cart')}>
              <ShoppingCart className="h-6 w-6 text-slate-600 group-hover:text-green-600 transition" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
                  {cart.length}
                </span>
              )}
            </div>
            <button 
              className="bg-green-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-green-700 transition"
              onClick={() => setView('farmer')}
            >
              Start Selling
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {view === 'home' && <HomeHero onStartShopping={() => setView('consumer')} onStartSelling={() => setView('farmer')} />}
        {view === 'consumer' && (
          <ConsumerPortal 
            products={filteredProducts} 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onAddToCart={addToCart}
          />
        )}
        {view === 'farmer' && <FarmerPortal onSubmit={handleFarmerSubmit} />}
        {view === 'cart' && <CartView items={cart} onRemove={removeFromCart} total={totalCartPrice} onCheckout={() => alert('Order placed! (Simulated)')} />}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <h3 className="text-white font-bold brand-font text-2xl">KissanKart</h3>
            <p className="text-sm leading-relaxed">Pakistan's premier direct farmer-to-consumer marketplace. Freshness guaranteed, fairness promised.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-6">Explore</h4>
            <ul className="text-sm space-y-3">
              <li className="hover:text-white cursor-pointer" onClick={() => { setSelectedCategory('Vegetables'); setView('consumer'); }}>Vegetables</li>
              <li className="hover:text-white cursor-pointer" onClick={() => { setSelectedCategory('Rice'); setView('consumer'); }}>Rice & Grains</li>
              <li className="hover:text-white cursor-pointer" onClick={() => { setSelectedCategory('Fruits'); setView('consumer'); }}>Seasonal Fruits</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-6">Farmer Support</h4>
            <ul className="text-sm space-y-3">
              <li className="hover:text-white cursor-pointer" onClick={() => setView('farmer')}>How to Sell</li>
              <li className="hover:text-white cursor-pointer" onClick={() => setView('farmer')}>AI Marketing Help</li>
              <li className="hover:text-white cursor-pointer" onClick={() => setView('farmer')}>Payment Cycles</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-6">Transparency</h4>
            <p className="text-xs italic leading-relaxed">
              "We take a fixed 15% platform fee from the final consumer price. This covers logistics, digital marketing, and AI tools for our farmers."
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800 text-center text-xs">
          © {new Date().getFullYear()} KissanKart Pakistan. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

/* --- Sub-Components --- */

const HomeHero = ({ onStartShopping, onStartSelling }: { onStartShopping: () => void, onStartSelling: () => void }) => (
  <section className="relative h-[550px] flex items-center justify-center overflow-hidden bg-green-900">
    <div className="absolute inset-0">
      <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1600" className="w-full h-full object-cover opacity-50" alt="Pakistani Farm" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-900/80"></div>
    </div>
    <div className="relative z-10 text-center px-4 max-w-4xl">
      <span className="bg-orange-500/90 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 inline-block">Direct From Farm</span>
      <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 brand-font leading-tight">Farmer's Harvest,<br/>Your Table.</h1>
      <p className="text-xl text-green-50 mb-10 font-light max-w-2xl mx-auto">Skip the middlemen. Support Pakistani farmers and get 100% fresh produce at fair prices.</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <button 
          onClick={onStartShopping}
          className="bg-white text-green-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-green-50 transition shadow-2xl w-full sm:w-auto"
        >
          Browse Products
        </button>
        <button 
          onClick={onStartSelling}
          className="bg-orange-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-orange-700 transition shadow-2xl border-b-4 border-orange-800 w-full sm:w-auto"
        >
          Sell Your Harvest
        </button>
      </div>
    </div>
  </section>
);

const ProductCard: React.FC<{ product: Product; onAddToCart: (p: Product) => void }> = ({ product, onAddToCart }) => (
  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
    <div className="relative h-56 overflow-hidden">
      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold text-orange-600 shadow-sm border border-orange-100">
        <Star className="h-3 w-3 fill-current" /> {product.rating}
      </div>
      <div className="absolute bottom-3 left-3 bg-green-700 text-white text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded shadow-lg">
        {product.category}
      </div>
    </div>
    <div className="p-6">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-bold text-lg text-slate-800 leading-tight group-hover:text-green-700 transition-colors">{product.name}</h3>
      </div>
      
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-2xl font-black text-green-800">Rs. {product.consumerPrice}</span>
        <span className="text-sm text-slate-400 font-medium">per {product.unit}</span>
      </div>

      <p className="text-sm text-slate-500 mb-6 line-clamp-2 leading-relaxed">{product.description}</p>
      
      <div className="flex items-center gap-2 mb-6 text-xs font-medium text-slate-400">
        <MapPin className="h-4 w-4 text-orange-500" />
        <span>{product.location} • {product.farmerName}</span>
      </div>

      <button 
        onClick={() => onAddToCart(product)}
        className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all active:scale-95 flex items-center justify-center gap-2"
      >
        <ShoppingCart className="h-4 w-4" /> Add to Kart
      </button>
    </div>
  </div>
);

const ConsumerPortal = ({ 
  products, 
  searchTerm, 
  setSearchTerm, 
  selectedCategory, 
  setSelectedCategory,
  onAddToCart
}: { 
  products: Product[], 
  searchTerm: string, 
  setSearchTerm: (v: string) => void,
  selectedCategory: string,
  setSelectedCategory: (v: string) => void,
  onAddToCart: (p: Product) => void
}) => (
  <div className="max-w-7xl mx-auto px-4 py-16">
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
      <div className="max-w-xl">
        <h2 className="text-4xl font-bold text-slate-900 brand-font mb-3">Direct from Pakistan's Farms</h2>
        <p className="text-slate-500 text-lg">Pure, fresh, and supporting the backbone of our nation. Filter by your needs below.</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
        <div className="relative flex-grow sm:flex-grow-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input 
            type="text"
            placeholder="Search mangoes, rice, etc..."
            className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 outline-none w-full sm:w-80 shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="px-6 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-green-100 shadow-sm font-semibold text-slate-700"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div>

    {products.length === 0 ? (
      <div className="text-center py-32 bg-white rounded-3xl border border-slate-100 shadow-inner">
        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search className="h-10 w-10 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">No items found</h3>
        <p className="text-slate-500">Try adjusting your search or category filters.</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {products.map(product => (
          <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
        ))}
      </div>
    )}
  </div>
);

const FarmerPortal = ({ onSubmit }: { onSubmit: (p: Product) => void }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Vegetables');
  const [price, setPrice] = useState<number>(0);
  const [unit, setUnit] = useState('kg');
  const [keywords, setKeywords] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  const handleAIHelp = async () => {
    if (!name) return alert('Please enter product name first');
    setLoadingAI(true);
    const desc = await generateProductDescription(name, category, keywords);
    setDescription(desc);
    setLoadingAI(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      id: Date.now().toString(),
      farmerId: 'f-user',
      farmerName: 'New Farmer', 
      name,
      category,
      price,
      consumerPrice: Math.ceil(price * 1.15),
      unit,
      description,
      image: `https://images.unsplash.com/photo-1595111031303-34672692292c?auto=format&fit=crop&q=80&w=400`,
      location: location || 'Punjab, Pakistan',
      rating: 5.0
    };
    onSubmit(newProduct);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col lg:flex-row">
        {/* Marketing Sidebar */}
        <div className="bg-green-800 p-10 text-white lg:w-[35%] flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-bold brand-font mb-8">Empowering You.</h2>
            <ul className="space-y-8">
              <li className="flex gap-4">
                <div className="bg-green-700 p-3 rounded-2xl">
                  <TrendingUp className="h-6 w-6 text-green-300" />
                </div>
                <div>
                  <p className="font-bold text-lg mb-1">Higher Profits</p>
                  <p className="text-sm text-green-100 leading-relaxed">By selling directly, you avoid heavy middleman cuts. You keep 85%.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="bg-green-700 p-3 rounded-2xl">
                  <Sparkles className="h-6 w-6 text-green-300" />
                </div>
                <div>
                  <p className="font-bold text-lg mb-1">AI Listing Helper</p>
                  <p className="text-sm text-green-100 leading-relaxed">Don't worry about writing. Our AI helps create professional descriptions for your crop.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="bg-green-700 p-3 rounded-2xl">
                  <LayoutGrid className="h-6 w-6 text-green-300" />
                </div>
                <div>
                  <p className="font-bold text-lg mb-1">Nationwide Visibility</p>
                  <p className="text-sm text-green-100 leading-relaxed">Post in minutes and reach customers across major Pakistani cities.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="mt-12 p-6 bg-green-900 rounded-2xl border border-green-700 shadow-inner">
            <p className="text-xs font-black uppercase tracking-widest text-green-400 mb-4">Pricing Calculator (Rs.)</p>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-green-200">Your Base Price:</span>
                <span className="font-bold">Rs. {price || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-300 italic">+ Platform Fee (15%):</span>
                <span>Rs. {Math.ceil(price * 0.15)}</span>
              </div>
              <div className="pt-3 border-t border-green-700 flex justify-between items-center">
                <span className="font-bold text-green-100">Market Price:</span>
                <span className="font-black text-2xl text-white">Rs. {Math.ceil(price * 1.15)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Post Form */}
        <div className="p-10 lg:w-[65%]">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">New Listing</h2>
            <p className="text-slate-500">Provide details about your current harvest.</p>
          </div>
          
          <form className="space-y-8" onSubmit={handleFormSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">What are you selling?</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-5 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 outline-none transition-all" 
                  placeholder="e.g., Basmati Rice, Organic Tomatoes, Alphonso Mangoes" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                <select 
                  className="w-full px-5 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-green-100 outline-none font-semibold text-slate-700"
                  value={category}
                  onChange={e => setCategory(e.target.value as Category)}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Unit</label>
                <select 
                  className="w-full px-5 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-green-100 outline-none font-semibold text-slate-700"
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                >
                  <option value="kg">per kg</option>
                  <option value="dozen">per dozen</option>
                  <option value="crate">per crate</option>
                  <option value="sack">per sack (50kg)</option>
                  <option value="gram">per 500g</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Your Base Price (Rs.)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rs.</span>
                  <input 
                    required
                    type="number" 
                    className="w-full pl-12 pr-5 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-green-100 outline-none" 
                    placeholder="0.00" 
                    value={price || ''}
                    onChange={e => setPrice(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Harvest Location</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-5 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-green-100 outline-none" 
                  placeholder="e.g., Multan, Punjab" 
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Product Story & Details</label>
                <button 
                  type="button"
                  onClick={handleAIHelp}
                  disabled={loadingAI}
                  className="flex items-center gap-2 text-xs text-green-700 font-black uppercase tracking-wider hover:text-green-900 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" /> {loadingAI ? 'Writing...' : 'Boost with AI'}
                </button>
              </div>
              <textarea 
                required
                className="w-full px-5 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-green-100 outline-none h-32 leading-relaxed" 
                placeholder="Mention freshness, organic status, or specific variety..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-xl hover:bg-orange-700 shadow-xl shadow-orange-100 transition-all active:scale-[0.98]"
            >
              Confirm & Post Harvest
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const CartView = ({ items, onRemove, total, onCheckout }: { items: CartItem[], onRemove: (id: string) => void, total: number, onCheckout: () => void }) => (
  <div className="max-w-5xl mx-auto px-4 py-16">
    <h2 className="text-4xl font-bold mb-10 brand-font text-slate-900">Your Shopping Kart</h2>
    {items.length === 0 ? (
      <div className="text-center py-32 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 shadow-sm">
        <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="h-10 w-10 text-slate-300" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Kart is looking light</h3>
        <p className="text-slate-500 mb-8">Add some fresh Pakistani produce to your basket!</p>
        <button 
          onClick={() => window.location.reload()} // Quick fix to navigate back
          className="bg-green-700 text-white px-8 py-3 rounded-full font-bold hover:bg-green-800 transition"
        >
          Start Shopping
        </button>
      </div>
    ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {items.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
              <img src={item.image} className="h-24 w-24 rounded-2xl object-cover shadow-sm" alt={item.name} />
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-xl text-slate-800 mb-1">{item.name}</h4>
                  <button onClick={() => onRemove(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 className="h-6 w-6" />
                  </button>
                </div>
                <p className="text-sm text-slate-400 mb-3 font-medium">{item.quantity} {item.unit} x Rs. {item.consumerPrice}</p>
                <p className="text-xl font-black text-green-700">Rs. {item.consumerPrice * item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl h-fit sticky top-24">
          <h3 className="font-bold text-2xl text-slate-900 mb-6">Order Summary</h3>
          <div className="space-y-4 text-slate-600 mb-8">
            <div className="flex justify-between text-lg">
              <span>Items Total</span>
              <span className="font-bold text-slate-900">Rs. {total}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span>Delivery Fee</span>
              <span className="text-green-600 font-bold uppercase tracking-widest text-sm">Free</span>
            </div>
          </div>
          <hr className="mb-6 border-slate-100" />
          <div className="flex justify-between items-center mb-10">
            <span className="font-bold text-xl text-slate-500">Total Payable</span>
            <span className="font-black text-4xl text-green-800">Rs. {total}</span>
          </div>
          <button 
            onClick={onCheckout}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-xl hover:bg-green-700 transition-all shadow-xl shadow-slate-100 active:scale-95"
          >
            Confirm Order
          </button>
          <p className="text-center text-[10px] text-slate-400 mt-6 uppercase tracking-[0.2em] font-bold">Secure Pakistani Checkout</p>
        </div>
      </div>
    )}
  </div>
);
