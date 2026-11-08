import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Save, 
  RefreshCw, 
  Package, 
  DollarSign, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  Truck,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import { ShopProduct, ShopCategory } from '../../types/shop';
import { 
  getShopProducts, 
  saveShopProducts, 
  addShopProduct, 
  updateShopProduct, 
  deleteShopProduct 
} from '../../services/shopService';
import ImageUploader from '../ImageUploader';

const CATEGORIES: { id: ShopCategory; label: string }[] = [
  { id: 'kits', label: 'Starter & Lab Kits' },
  { id: 'microcontrollers', label: 'Microcontrollers' },
  { id: 'sensors', label: 'Sensors & Displays' },
  { id: 'motors', label: 'Motors & Drivers' },
  { id: 'components', label: 'Components & Tools' },
];

export default function ShopManagerAdminTab() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ShopCategory | 'all'>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ShopProduct | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formCategory, setFormCategory] = useState<ShopCategory>('kits');
  const [formPriceUsd, setFormPriceUsd] = useState<number>(10);
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formBadge, setFormBadge] = useState('');
  const [formSuitableLevels, setFormSuitableLevels] = useState('Levels 0 to 8');
  const [formInStock, setFormInStock] = useState(true);
  const [formComponentsText, setFormComponentsText] = useState('');

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const items = await getShopProducts();
      setProducts(items);
    } catch (e: any) {
      showNotice('error', 'Failed to load shop catalog: ' + (e?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormTitle('');
    setFormSubtitle('');
    setFormCategory('kits');
    setFormPriceUsd(15);
    setFormDescription('');
    setFormImageUrl('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800');
    setFormBadge('');
    setFormSuitableLevels('Levels 0 to 8');
    setFormInStock(true);
    setFormComponentsText('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: ShopProduct) => {
    setEditingProduct(p);
    setFormTitle(p.title);
    setFormSubtitle(p.subtitle);
    setFormCategory(p.category);
    setFormPriceUsd(p.priceUsd);
    setFormDescription(p.description);
    setFormImageUrl(p.imageUrl);
    setFormBadge(p.badge || '');
    setFormSuitableLevels(p.suitableLevels || 'Levels 0 to 8');
    setFormInStock(p.inStock);
    setFormComponentsText((p.includedComponents || []).join('\n'));
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Please provide a product title');
      return;
    }

    setIsSaving(true);
    try {
      const componentsList = formComponentsText
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      const categoryLabel = CATEGORIES.find(c => c.id === formCategory)?.label || 'General Hardware';

      const payload = {
        title: formTitle.trim(),
        subtitle: formSubtitle.trim() || categoryLabel,
        category: formCategory,
        categoryLabel,
        priceUsd: Number(formPriceUsd) || 0,
        description: formDescription.trim(),
        imageUrl: formImageUrl.trim() || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
        badge: formBadge.trim() || undefined,
        suitableLevels: formSuitableLevels.trim() || undefined,
        inStock: formInStock,
        includedComponents: componentsList
      };

      if (editingProduct) {
        await updateShopProduct(editingProduct.id, payload);
        showNotice('success', `Updated "${payload.title}" successfully!`);
      } else {
        await addShopProduct(payload);
        showNotice('success', `Added "${payload.title}" to the store!`);
      }

      await loadCatalog();
      setIsModalOpen(false);
    } catch (err: any) {
      showNotice('error', 'Error saving product: ' + (err?.message || 'Unknown'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove "${title}" from the hardware shop?`)) {
      return;
    }

    try {
      await deleteShopProduct(id);
      showNotice('success', `Removed "${title}" from the shop.`);
      await loadCatalog();
    } catch (err: any) {
      showNotice('error', 'Failed to delete product: ' + (err?.message || 'Unknown'));
    }
  };

  const handleToggleStock = async (p: ShopProduct) => {
    try {
      await updateShopProduct(p.id, { inStock: !p.inStock });
      await loadCatalog();
      showNotice('success', `"${p.title}" marked as ${!p.inStock ? 'In Stock' : 'Out of Stock'}.`);
    } catch (err: any) {
      showNotice('error', 'Failed to update stock status');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    if (!matchesCategory) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const inStockCount = products.filter(p => p.inStock).length;
  const outOfStockCount = products.length - inStockCount;

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-sm font-bold ${
          notification.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Hardware Shop Inventory</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Shop Products &amp; Pricing Management
          </h2>
          <p className="text-xs text-slate-500 max-w-xl">
            Upload hardware kits, microcontrollers, sensors, and electronic tools. Changes update the public shop immediately with real prices.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadCatalog}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reload</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Products</span>
          <span className="text-2xl font-black text-slate-900">{products.length}</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">In Stock</span>
          <span className="text-2xl font-black text-emerald-600">{inStockCount}</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Out of Stock</span>
          <span className="text-2xl font-black text-amber-600">{outOfStockCount}</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Store Status</span>
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mt-1">
            <span className={`w-2.5 h-2.5 rounded-full ${products.length > 0 ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
            <span>{products.length > 0 ? 'Live & Active' : 'Awaiting Uploads'}</span>
          </span>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedCategory === 'all' 
                ? 'bg-slate-900 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({products.length})
          </button>
          {CATEGORIES.map(cat => {
            const count = products.filter(p => p.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedCategory === cat.id 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search catalog..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Product List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs font-bold">
          Loading catalog...
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-16 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 uppercase">Shop Currently Empty</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              All mock items were purged. Click below to add your first real hardware kit, board, sensor or price!
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload First Product &amp; Price</span>
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-500">
          No products match the selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition"
            >
              <div>
                {/* Image */}
                <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 text-white text-[10px] font-bold uppercase">
                      {product.categoryLabel}
                    </span>
                    {product.badge && (
                      <span className="px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                        {product.badge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{product.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{product.subtitle}</p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{product.description}</p>

                  {product.includedComponents && product.includedComponents.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                        Components ({product.includedComponents.length}):
                      </span>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {product.includedComponents.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom bar */}
              <div className="p-5 pt-0 border-t border-slate-100 mt-3 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Price</span>
                  <span className="text-lg font-black text-slate-900 font-mono">
                    ${product.priceUsd} <span className="text-xs font-normal text-slate-500 font-sans">USD</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleStock(product)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      product.inStock 
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                    }`}
                  >
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(product)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                    title="Edit product"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteProduct(product.id, product.title)}
                    className="p-1.5 rounded-lg border border-slate-200 text-red-500 hover:bg-red-50 transition cursor-pointer"
                    title="Delete product"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingProduct ? 'Edit Hardware Product' : 'Add New Hardware Product'}
                  </h3>
                  <p className="text-xs text-slate-500">Configure title, pricing, category, and specifications.</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 uppercase">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ESP32 NodeMCU WiFi + Bluetooth Dev Board"
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Subtitle / Category Summary</label>
                  <input
                    type="text"
                    placeholder="e.g. 30-Pin Dual-Core Microcontroller"
                    value={formSubtitle}
                    onChange={e => setFormSubtitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Category</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as ShopCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Price (USD) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      required
                      placeholder="15.00"
                      value={formPriceUsd}
                      onChange={e => setFormPriceUsd(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Stock Status</label>
                  <select
                    value={formInStock ? 'true' : 'false'}
                    onChange={e => setFormInStock(e.target.value === 'true')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="true">In Stock</option>
                    <option value="false">Out of Stock</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Badge (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Best Seller, Essential, New"
                    value={formBadge}
                    onChange={e => setFormBadge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Target Levels</label>
                  <input
                    type="text"
                    placeholder="e.g. Levels 0 to 8"
                    value={formSuitableLevels}
                    onChange={e => setFormSuitableLevels(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Image URL & Uploader */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase">Product Image URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="https://..."
                    value={formImageUrl}
                    onChange={e => setFormImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <ImageUploader onUploadComplete={(url) => setFormImageUrl(url)} />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Product Description</label>
                <textarea
                  rows={3}
                  placeholder="Detailed description of hardware capabilities, specifications, and lab use cases..."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Included Components */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Included Components / Features (one per line)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g.&#10;1x ESP32 Dev Board&#10;1x Micro-USB Cable&#10;1x Antistatic Pouch"
                  value={formComponentsText}
                  onChange={e => setFormComponentsText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

