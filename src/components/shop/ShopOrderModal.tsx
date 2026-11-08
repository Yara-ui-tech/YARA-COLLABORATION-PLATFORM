import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  CheckCircle2, 
  Truck, 
  CreditCard, 
  Phone, 
  User, 
  MapPin, 
  School, 
  Building2, 
  MessageSquare, 
  Printer, 
  ArrowRight,
  ShieldCheck,
  Package
} from 'lucide-react';
import { ShopProduct, ShopOrder } from '../../types/shop';
import { useAuth } from '../AuthContext';

interface Props {
  product: ShopProduct;
  isOpen: boolean;
  onClose: () => void;
}

export const ShopOrderModal: React.FC<Props> = ({ product, isOpen, onClose }) => {
  const { user, profile } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState(profile?.display_name || '');
  const [customerPhone, setCustomerPhone] = useState(profile?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(profile?.email || user?.email || '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [cityOrProvince, setCityOrProvince] = useState('Harare Metropolitan');
  const [schoolOrClubName, setSchoolOrClubName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'ecocash' | 'card' | 'innbucks' | 'cash_on_delivery' | 'whatsapp'>('ecocash');
  const [orderCompleted, setOrderCompleted] = useState<ShopOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const unitPrice = product.priceUsd;
  const totalPrice = unitPrice * quantity;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
      alert('Please fill in your name, phone number, and delivery address.');
      return;
    }

    setIsSubmitting(true);

    const order: ShopOrder = {
      id: `YARA-ORD-${Date.now().toString().slice(-6)}`,
      productId: product.id,
      productTitle: product.title,
      quantity,
      totalPriceUsd: totalPrice,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      deliveryAddress: deliveryAddress.trim(),
      cityOrProvince,
      schoolOrClubName: schoolOrClubName.trim(),
      paymentMethod,
      orderDate: new Date().toISOString(),
      status: 'pending'
    };

    // Save order locally for user reference
    try {
      const existing = JSON.parse(localStorage.getItem('yara_shop_orders') || '[]');
      existing.unshift(order);
      localStorage.setItem('yara_shop_orders', JSON.stringify(existing));
    } catch {}

    // If WhatsApp method selected, open WhatsApp directly with prefilled message
    if (paymentMethod === 'whatsapp') {
      const msg = encodeURIComponent(
        `Hello YARA Logistics! I would like to order:\n\n*Product:* ${product.title}\n*Qty:* ${quantity}\n*Total:* $${totalPrice} USD\n*Name:* ${customerName}\n*Phone:* ${customerPhone}\n*Address:* ${deliveryAddress}, ${cityOrProvince}${schoolOrClubName ? `\n*School/Club:* ${schoolOrClubName}` : ''}\n*Order ID:* ${order.id}`
      );
      window.open(`https://wa.me/263717468236?text=${msg}`, '_blank');
    }

    setIsSubmitting(false);
    setOrderCompleted(order);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-slate-950 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                {orderCompleted ? 'Order Confirmed' : 'Purchase Hardware & Kits'}
              </h3>
              <p className="text-xs text-slate-400">Official YARA Hardware Distribution Network</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {orderCompleted ? (
          /* Order Confirmation View */
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-black text-slate-900">Thank You for Your Order!</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Your order reference is <strong className="text-indigo-600 font-mono">{orderCompleted.id}</strong>. Our logistics directorate will contact you on <strong className="text-slate-900">{orderCompleted.customerPhone}</strong> to arrange dispatch.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 font-bold text-slate-900">
                <span>Item</span>
                <span>Amount</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span>{orderCompleted.productTitle} × {orderCompleted.quantity}</span>
                <span className="font-bold">${orderCompleted.totalPriceUsd} USD</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 pt-1">
                <span>Delivery Destination</span>
                <span className="text-right truncate max-w-[200px]">{orderCompleted.deliveryAddress}, {orderCompleted.cityOrProvince}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Payment Preference</span>
                <span className="uppercase font-mono text-[10px] font-bold px-2 py-0.5 bg-slate-200 rounded text-slate-800">
                  {orderCompleted.paymentMethod.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Need instant priority dispatch or school invoice?</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Call or WhatsApp YARA Dispatch on <strong className="text-slate-950">+263 78 895 3986</strong> or <strong className="text-slate-950">0717468236</strong> quoting order #{orderCompleted.id}.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Order Slip</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Order Form View */
          <form onSubmit={handleSubmitOrder} className="p-6 space-y-5">
            {/* Selected Product Summary Card */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <img 
                src={product.imageUrl} 
                alt={product.title} 
                className="w-16 h-16 rounded-xl object-cover bg-white shrink-0 border border-slate-200 shadow-xs" 
              />
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full tracking-wider">
                  {product.categoryLabel}
                </span>
                <h4 className="text-sm font-bold text-slate-900 truncate mt-0.5">{product.title}</h4>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-black text-emerald-600">${unitPrice} USD</span>
                  
                  {/* Quantity selector */}
                  <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden shadow-xs">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 font-bold text-xs text-slate-900">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Highlight */}
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-900 text-white">
              <span className="text-xs font-semibold text-slate-300">Total Due:</span>
              <span className="text-lg font-black text-emerald-400 font-mono">${totalPrice} USD</span>
            </div>

            {/* Delivery & Customer Details */}
            <div className="space-y-3">
              <h5 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Customer &amp; Delivery Information
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Tendai Moyo"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 0771 234 567"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Delivery Address / School / Hub *</label>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Street, School Name, or Town Pickup Point"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">City or Province</label>
                  <select
                    value={cityOrProvince}
                    onChange={(e) => setCityOrProvince(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Harare Metropolitan">Harare Metropolitan</option>
                    <option value="Mashonaland West (Chinhoyi)">Mashonaland West (Chinhoyi)</option>
                    <option value="Bulawayo">Bulawayo</option>
                    <option value="Midlands (Gweru / Kwekwe)">Midlands (Gweru / Kwekwe)</option>
                    <option value="Manicaland (Mutare)">Manicaland (Mutare)</option>
                    <option value="Masvingo">Masvingo</option>
                    <option value="Mashonaland Central (Bindura)">Mashonaland Central (Bindura)</option>
                    <option value="Mashonaland East (Marondera)">Mashonaland East (Marondera)</option>
                    <option value="Matabeleland North">Matabeleland North</option>
                    <option value="Matabeleland South">Matabeleland South</option>
                    <option value="International / Other African Region">International / Other African Region</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">School or Robotics Club (Optional)</label>
                  <input
                    type="text"
                    value={schoolOrClubName}
                    onChange={(e) => setSchoolOrClubName(e.target.value)}
                    placeholder="e.g. Chinhoyi High Robotics Club"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-700 block">Payment / Dispatch Preference</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'ecocash', label: 'EcoCash / Mobile' },
                  { id: 'whatsapp', label: 'Direct WhatsApp' },
                  { id: 'card', label: 'Debit / Credit Card' },
                  { id: 'innbucks', label: 'InnBucks' },
                  { id: 'cash_on_delivery', label: 'Cash on Pickup' }
                ].map(method => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                      paymentMethod === method.id
                        ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{paymentMethod === 'whatsapp' ? 'Order via WhatsApp' : 'Place Hardware Order'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

