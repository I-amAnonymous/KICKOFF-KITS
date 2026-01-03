"use client";
import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowLeft, Star, Truck, Phone, CheckCircle, Trash2, ArrowRight, Loader2, Minus, Plus } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// --- SHARED CART COMPONENT (To keep the cart working here too) ---
const CartDrawer = ({ isOpen, onClose, cartItems, onRemoveItem, clearCart }) => {
  const [step, setStep] = useState('cart');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', city: 'Dhaka' });

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  useEffect(() => { if (!isOpen && step === 'success') { setStep('cart'); setOrderId(null); } }, [isOpen]);
  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePlaceOrder = async () => {
    if (!formData.name || !formData.phone || !formData.address) { alert("Please fill in all details!"); return; }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer: formData, items: cartItems, total: total })
      });
      const data = await response.json();
      if (data.success) { setOrderId(data.orderId); setStep('success'); clearCart(); } 
      else { alert("Something went wrong."); }
    } catch (error) { alert("Network error."); } finally { setIsSubmitting(false); }
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] backdrop-blur-sm" onClick={onClose}></div>}
      <div className={`fixed inset-y-0 right-0 z-[70] w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <h2 className="text-lg font-bold">{step === 'cart' ? 'Your Cart' : 'Checkout'}</h2>
            <button onClick={onClose}><ArrowRight size={24} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {step === 'cart' && (
              cartItems.length === 0 ? <div className="text-center text-gray-500 mt-10">Bag is empty</div> :
              <div className="space-y-4">{cartItems.map((item, index) => (<div key={index} className="flex gap-4 border-b pb-4"><img src={item.image} className="h-16 w-16 object-cover rounded"/><div><p className="font-bold">{item.name}</p><p className="text-sm">Size: {item.selectedSize}</p><p>৳{item.price}</p><button onClick={() => onRemoveItem(index)} className="text-red-500 text-xs flex items-center gap-1 mt-1"><Trash2 size={12}/> Remove</button></div></div>))}</div>
            )}
            {step === 'checkout' && (
               <div className="space-y-4">
                 <input type="text" name="name" placeholder="Name" onChange={handleInputChange} className="w-full border p-2 rounded" />
                 <input type="tel" name="phone" placeholder="Phone" onChange={handleInputChange} className="w-full border p-2 rounded" />
                 <textarea name="address" placeholder="Address" onChange={handleInputChange} className="w-full border p-2 rounded" />
                 <div className="bg-blue-50 p-4 rounded text-blue-800 font-bold flex justify-between"><span>Total</span><span>৳ {total + 60}</span></div>
               </div>
            )}
            {step === 'success' && <div className="text-center mt-10"><CheckCircle size={64} className="text-green-500 mx-auto"/><h3 className="text-2xl font-bold mt-4">Ordered!</h3><p>Order #{orderId}</p></div>}
          </div>
          {step !== 'success' && cartItems.length > 0 && (
            <div className="p-4 border-t">
              {step === 'cart' ? <button onClick={() => setStep('checkout')} className="w-full bg-black text-white py-3 rounded-lg font-bold">Checkout (৳{total})</button> :
              <button onClick={handlePlaceOrder} disabled={isSubmitting} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold">{isSubmitting ? 'Processing...' : 'Confirm Order'}</button>}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState('');
  
  // Cart State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load Cart from LocalStorage
  useEffect(() => { const saved = localStorage.getItem('kickoff-cart'); if (saved) setCart(JSON.parse(saved)); }, []);
  useEffect(() => { localStorage.setItem('kickoff-cart', JSON.stringify(cart)); }, [cart]);

  // Fetch Product Data
  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products?id=${params.id}`);
        const data = await res.json();
        setProduct(data);
      } catch (e) { console.error("Error"); } finally { setLoading(false); }
    }
    if (params.id) fetchProduct();
  }, [params.id]);

  const addToCart = () => {
    if (!size) { alert("Please select a size"); return; }
    setCart([...cart, { ...product, selectedSize: size }]);
    setIsCartOpen(true);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  const isOutOfStock = product.in_stock === false;

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Simple Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-black font-medium"><ArrowLeft size={20}/> Back to Shop</Link>
        <span className="font-extrabold text-xl tracking-tighter italic">KICKOFF<span className="text-red-600">.</span>KITS</span>
        <button onClick={() => setIsCartOpen(true)} className="relative p-2"><ShoppingBag size={24}/>{cart.length > 0 && <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-1.5 rounded-full">{cart.length}</span>}</button>
      </nav>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cartItems={cart} onRemoveItem={(i) => setCart(cart.filter((_, x) => x !== i))} clearCart={() => setCart([])} />

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-16">
        <div className="flex flex-col md:flex-row gap-12">
          {/* IMAGE SECTION */}
          <div className="w-full md:w-1/2">
            <div className="aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden relative shadow-sm">
              <img src={product.image} className={`w-full h-full object-cover ${isOutOfStock ? 'grayscale' : ''}`} />
              {isOutOfStock && <span className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 font-bold transform rotate-12 shadow-lg">SOLD OUT</span>}
            </div>
          </div>

          {/* DETAILS SECTION */}
          <div className="w-full md:w-1/2 flex flex-col justify-center">
            <span className="text-gray-500 font-bold tracking-wider uppercase mb-2">{product.category}</span>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-black">{product.name}</h1>
            <p className="text-3xl font-bold text-gray-900 mb-8">৳ {product.price}</p>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">Select Size</h3>
                <div className="flex flex-wrap gap-3">
                  {['M', 'L', 'XL', 'XXL'].map((s) => (
                    <button 
                      key={s} 
                      onClick={() => !isOutOfStock && setSize(s)}
                      disabled={isOutOfStock}
                      className={`h-12 w-16 border-2 rounded-lg font-bold transition-all ${size === s ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-black'} ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* ADD TO CART BUTTON */}
              <button 
                onClick={addToCart}
                disabled={isOutOfStock}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 ${isOutOfStock ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl'}`}
              >
                {isOutOfStock ? "Out of Stock" : <><ShoppingBag /> Add to Cart</>}
              </button>

              {/* FEATURES */}
              <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-3 text-sm font-medium text-gray-600"><Truck className="text-black"/> Fast Delivery</div>
                <div className="flex items-center gap-3 text-sm font-medium text-gray-600"><CheckCircle className="text-black"/> Official Quality</div>
                <div className="flex items-center gap-3 text-sm font-medium text-gray-600"><Phone className="text-black"/> 24/7 Support</div>
                <div className="flex items-center gap-3 text-sm font-medium text-gray-600"><Star className="text-black"/> 5-Star Rated</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}