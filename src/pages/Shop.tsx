import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  Phone, 
  Wrench, 
  Cpu, 
  Layers, 
  ArrowRight,
  Package,
  CheckCircle2,
  PhoneCall,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { ShopProduct, ShopCategory } from '../types/shop';
import { ShopOrderModal } from '../components/shop/ShopOrderModal';
import { getCustomKits } from '../services/resourcesService';
import { getShopProducts } from '../services/shopService';
import Breadcrumbs from '../components/Breadcrumbs';

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getShopProducts().then(items => {
      if (mounted) {
        setProducts(items);
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  // Combine official dynamic products with any custom kits added by admin
  const allProducts = useMemo(() => {
    const customKits = getCustomKits().map(k => ({
      id: k.id,
      title: k.title,
      subtitle: k.subtitle || 'Custom Assembled Hardware Kit',
      category: 'kits' as ShopCategory,
      categoryLabel: 'Custom Kit',
      priceUsd: k.priceUsd,
      description: k.description,
      imageUrl: k.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
      includedComponents: k.includedComponents,
      inStock: true
    }));

    return [...products, ...customKits];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter(item => {
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchCategory) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchSub = item.subtitle.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchComp = item.includedComponents?.some(c => c.toLowerCase().includes(q)) ?? false;
        return matchTitle || matchSub || matchDesc || matchComp;
      }
      return true;
    });
  }, [allProducts, selectedCategory, searchQuery]);

  const categories: { id: ShopCategory; label: string; count: number }[] = [
    { id: 'all', label: 'All Hardware', count: allProducts.length },
    { id: 'kits', label: 'Starter & Lab Kits', count: allProducts.filter(p => p.category === 'kits').length },
    { id: 'microcontrollers', label: 'Microcontrollers', count: allProducts.filter(p => p.category === 'microcontrollers').length },
    { id: 'sensors', label: 'Sensors & Displays', count: allProducts.filter(p => p.category === 'sensors').length },
    { id: 'motors', label: 'Motors & Drivers', count: allProducts.filter(p => p.category === 'motors').length },
    { id: 'components', label: 'Components & Tools', count: allProducts.filter(p => p.category === 'components').length },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-24">
      {/* Header Banner */}
      <div className="bg-slate-900 border-b border-slate-800 pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Hardware Shop' }
            ]}
          />

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Official YARA Hardware Distribution</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase">
                Hardware Kits &amp; Electronics
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                Authentic robotics starter kits, ESP32 microcontrollers, sensors, actuators, and electronic components delivered across Zimbabwe and Africa.
              </p>
            </div>

            {/* Quick Dispatch Badge */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2 shrink-0 max-w-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Truck className="w-4 h-4" />
                <span>Provincial &amp; School Dispatch</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Direct dispatch from Harare &amp; Chinhoyi Hubs. Nationwide delivery to all 10 provinces.
              </p>
              <div className="pt-1 text-[11px] font-bold text-slate-200 flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                <span>Inquiries: 0717468236 / +263 78 895 3986</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Search & Category Filter Navigation */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === cat.id ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px] sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search kits, ESP32, sensors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>
          </div>
        </div>

        {/* Product Catalog Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Checking hardware inventory...</p>
          </div>
        ) : allProducts.length === 0 ? (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 sm:p-16 text-center space-y-5 max-w-2xl mx-auto shadow-xl">
            <div className="w-16 h-16 bg-slate-800/90 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 border border-slate-700">
              <Package className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-black text-white uppercase tracking-tight">Hardware Catalog Empty</h4>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                No products are currently published in the hardware shop. The administrator will be uploading real components, robotics kits, and pricing shortly.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://wa.me/263717468236?text=Hello%20YARA%20Logistics,%20I%20would%20like%20to%20inquire%20about%20hardware%20kits%20and%20pricing."
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-md"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Inquire on WhatsApp</span>
              </a>
              <a
                href="tel:+263788953986"
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-slate-700 transition"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                <span>Call Hotline</span>
              </a>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-slate-900 border border-dashed border-slate-800 rounded-3xl p-16 text-center space-y-3">
            <Package className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-base font-bold text-white">No hardware products match your search</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try switching categories or clearing your search keywords.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="group bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-md hover:shadow-xl"
              >
                <div>
                  {/* Image container */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                    <img 
                      src={product.imageUrl} 
                      alt={product.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                    {/* Top badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950/90 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                        {product.categoryLabel}
                      </span>
                      {product.badge && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/90 backdrop-blur-md text-slate-950 text-[10px] font-black uppercase tracking-wider">
                          {product.badge}
                        </span>
                      )}
                    </div>

                    {product.suitableLevels && (
                      <div className="absolute bottom-3 left-3 text-[10px] font-bold text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800">
                        {product.suitableLevels}
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors leading-snug">
                        {product.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {product.subtitle}
                      </p>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                      {product.description}
                    </p>

                    {/* Included Components or Specs */}
                    {product.includedComponents && product.includedComponents.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                          Included Hardware Highlights:
                        </span>
                        <ul className="space-y-1 text-xs text-slate-300">
                          {product.includedComponents.slice(0, 3).map((item, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-[11px] truncate">
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="truncate">{item}</span>
                            </li>
                          ))}
                          {product.includedComponents.length > 3 && (
                            <li className="text-[10px] text-slate-400 pl-5">
                              + {product.includedComponents.length - 3} more items included
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Strip */}
                <div className="p-6 pt-0 border-t border-slate-800/60 mt-4 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Price</span>
                    <span className="text-2xl font-black text-white font-mono">
                      ${product.priceUsd} <span className="text-xs text-slate-400 font-sans font-normal">USD</span>
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Buy Now</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bulk School & Club Orders Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
              Institutional &amp; School Club Inquiries
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Ordering for a School Robotics Club or Lab?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              We provide subsidized hardware bundles, teacher training packs, official school quotes, and tax invoices for school administrations across Africa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="https://wa.me/263717468236?text=Hello%20YARA%20Directorate,%20we%20would%20like%20to%20request%20a%20bulk%20hardware%20quote%20for%20our%20school%20robotics%20club."
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-md"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp School Order</span>
            </a>
            <a
              href="tel:+263788953986"
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center gap-2 border border-slate-700"
            >
              <PhoneCall className="w-4 h-4 text-amber-400" />
              <span>Call +263 78 895 3986</span>
            </a>
          </div>
        </div>

      </div>

      {/* Order Modal */}
      {selectedProduct && (
        <ShopOrderModal
          product={selectedProduct}
          isOpen={true}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

