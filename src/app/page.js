"use client";
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, Star, Truck, Phone, Trash2, ArrowRight, CheckCircle, Loader2, Search, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// --- COMPONENTS ---

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
      else { alert("Something went wrong. Please try again."); }
    } catch (error) { console.error(error); alert("Network error."); } finally { setIsSubmitting(false); }
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] backdrop-blur-sm transition-opacity" onClick={onClose}></div>}
      <div className={`fixed inset-y-0 right-0 z-[70] w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900">{step === 'cart' ? `Your Cart` : step === 'checkout' ? 'Checkout' : 'Order Confirmed'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full"><X size={24} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {step === 'cart' && (
              <>
                {cartItems.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-center text-gray-500"><ShoppingBag size={48} className="mb-4 opacity-20" /><p>Your bag is empty.</p></div> : 
                  <div className="space-y-4">{cartItems.map((item, index) => (<div key={index} className="flex gap-4 border-b border-gray-100 pb-4"><div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200"><img src={item.image} alt={item.name} className="h-full w-full object-cover"/></div><div className="flex flex-1 flex-col"><div className="flex justify-between text-base font-medium text-gray-900"><h3 className="line-clamp-1">{item.name}</h3><p className="ml-4">৳{item.price}</p></div><p className="mt-1 text-sm text-gray-500">Size: {item.selectedSize}</p><button onClick={() => onRemoveItem(index)} className="mt-2 text-sm text-red-600 flex items-center gap-1"><Trash2 size={14} /> Remove</button></div></div>))}</div>
                }
              </>
            )}
            {step === 'checkout' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-10 duration-300">
                <div><label className="block text-sm font-medium text-gray-700">Full Name</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" /></div>
                <div><label className="block text-sm font-medium text-gray-700">Mobile Number</label><input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" /></div>
                <div><label className="block text-sm font-medium text-gray-700">Address</label><textarea name="address" value={formData.address} onChange={handleInputChange} rows={3} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black" /></div>
                <div><label className="block text-sm font-medium text-gray-700">City</label><select name="city" value={formData.city} onChange={handleInputChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"><option>Dhaka</option><option>Chittagong</option><option>Sylhet</option><option>Rajshahi</option><option>Khulna</option></select></div>
                <div className="bg-blue-50 p-4 rounded-lg mt-4"><div className="flex justify-between text-sm text-blue-700 mb-1"><span>Subtotal</span><span>৳ {total}</span></div><div className="flex justify-between text-sm text-blue-700 font-bold border-t border-blue-200 pt-2 mt-2"><span>Total (COD)</span><span>৳ {total + 60}</span></div></div>
              </div>
            )}
            {step === 'success' && (
              <div className="h-full flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
                <div className="bg-green-100 p-4 rounded-full mb-4"><CheckCircle size={48} className="text-green-600" /></div>
                <h3 className="text-2xl font-bold text-gray-900">Order Placed!</h3><p className="text-gray-500 mt-2">Thank you, {formData.name}.</p><p className="text-gray-500">Order ID: #{orderId}</p>
                <div className="bg-gray-50 p-4 rounded-lg mt-6 w-full text-left"><p className="text-sm text-gray-600">We will call you at <b>{formData.phone}</b> shortly to confirm delivery.</p></div>
                <button onClick={onClose} className="mt-8 bg-black text-white px-6 py-2 rounded-full font-bold">Continue Shopping</button>
              </div>
            )}
          </div>
          {step !== 'success' && cartItems.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-4 bg-white">
              {step === 'cart' ? (
                <><div className="flex justify-between text-base font-medium text-gray-900"><p>Subtotal</p><p>৳ {total}</p></div><button onClick={() => setStep('checkout')} className="w-full flex items-center justify-center rounded-md bg-black px-6 py-3 text-base font-medium text-white hover:bg-gray-800">Checkout <ArrowRight size={20} className="ml-2" /></button></>
              ) : (
                <><button onClick={handlePlaceOrder} disabled={isSubmitting} className="w-full flex items-center justify-center rounded-md bg-green-600 px-6 py-3 text-base font-medium text-white hover:bg-green-700 disabled:bg-gray-400">{isSubmitting ? <><Loader2 className="animate-spin mr-2"/> Processing...</> : "Confirm Order"}</button><button onClick={() => setStep('cart')} disabled={isSubmitting} className="w-full text-center text-sm text-gray-600 hover:text-black">Back to Cart</button></>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// --- PRODUCT MODAL ---
const ProductModal = ({ product, isOpen, onClose, onConfirm }) => {
  const [size, setSize] = useState('');
  if (!isOpen || !product) return null;
  const isOutOfStock = product.in_stock === false;
  const handleAddToCart = () => { if (!size) { alert("Please select a size!"); return; } onConfirm(product, size); setSize(''); onClose(); };
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"><X size={20} /></button>
        <div className="w-full md:w-1/2 bg-gray-100 relative">
          <img src={product.image} alt={product.name} className={`w-full h-64 md:h-full object-cover ${isOutOfStock ? 'grayscale opacity-75' : ''}`} />
          {isOutOfStock && <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10"><span className="bg-red-600 text-white font-bold px-4 py-2 text-lg transform -rotate-12 shadow-lg border-2 border-white">SOLD OUT</span></div>}
        </div>
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
          <div>
            <span className="text-sm text-gray-500 uppercase tracking-wider">{product.category}</span>
            <h2 className="text-xl font-bold text-gray-900 mt-1">{product.name}</h2>
            <p className="text-2xl font-bold text-gray-900 mt-2">৳ {product.price}</p>
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Select Size</h3>
              <div className="grid grid-cols-3 gap-2">
                {['M', 'L', 'XL', 'XXL'].map((s) => (
                  <button key={s} onClick={() => !isOutOfStock && setSize(s)} disabled={isOutOfStock} className={`py-2 text-sm font-bold rounded border ${size === s ? 'bg-black text-white border-black' : 'bg-white text-gray-900 border-gray-200'} ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'hover:border-black'}`}>{s}</button>
                ))}
              </div>
            </div>
          </div>
          {isOutOfStock ? (
            <button disabled className="mt-8 w-full bg-gray-200 text-gray-500 font-bold py-3 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"><AlertCircle size={20} /> Out of Stock</button>
          ) : (
            <button onClick={handleAddToCart} className="mt-8 w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"><ShoppingBag size={20} /><span>Add to Cart</span></button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- NAVBAR ---
const Navbar = ({ cartCount, setCategory, onOpenCart, searchTerm, setSearchTerm, products, onProductClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const filteredSearch = products.filter(p => searchTerm && p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const handleFilter = (category) => { setCategory(category); setIsOpen(false); };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center sm:hidden"><button onClick={() => setIsOpen(!isOpen)} className="text-gray-800">{isOpen ? <X size={24} /> : <Menu size={24} />}</button></div>
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => handleFilter('All')}><span className="text-2xl font-extrabold tracking-tighter text-black italic">KICKOFF<span className="text-red-600">.</span>KITS</span></div>
          <div className="hidden sm:flex space-x-8">
            <button onClick={() => handleFilter('Premier League')} className="text-gray-600 hover:text-black font-medium">Premier League</button>
            <button onClick={() => handleFilter('La Liga')} className="text-gray-600 hover:text-black font-medium">La Liga</button>
            <button onClick={() => handleFilter('National Teams')} className="text-gray-600 hover:text-black font-medium">National Teams</button>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:block relative">
               <div className="flex items-center bg-gray-100 px-3 py-2 rounded-full">
                <Search size={16} className="text-gray-500"/>
                <input type="text" placeholder="Search jerseys..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent border-none focus:outline-none text-sm ml-2 w-32 md:w-48 placeholder-gray-500"/>
              </div>
              {searchTerm && filteredSearch.length > 0 && (
                <div className="absolute top-full left-0 w-64 bg-white shadow-xl rounded-xl border border-gray-100 mt-2 overflow-hidden z-[60]">
                  {filteredSearch.map(product => (
                    <div key={product.id} onClick={() => { onProductClick(product); setSearchTerm(''); }} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors">
                      <img src={product.image} className={`w-10 h-10 object-cover rounded bg-gray-100 ${product.in_stock === false ? 'grayscale' : ''}`} />
                      <div className="flex-1"><p className="text-sm font-bold text-gray-900 line-clamp-1">{product.name}</p><div className="flex justify-between items-center"><p className="text-xs text-gray-500">৳ {product.price}</p>{product.in_stock === false && <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1 rounded">SOLD OUT</span>}</div></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={onOpenCart} className="relative p-2 text-gray-800 hover:text-black"><ShoppingBag size={24} />{cartCount > 0 && <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">{cartCount}</span>}</button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="sm:hidden bg-white border-t border-gray-100 relative">
          <div className="p-4 border-b border-gray-100">
             <input type="text" placeholder="Search jerseys..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-100 px-4 py-2 rounded-lg text-sm focus:outline-none"/>
          </div>
          <div className="pt-2 pb-4 space-y-1">
            <button onClick={() => handleFilter('Premier League')} className="block w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">Premier League</button>
            <button onClick={() => handleFilter('La Liga')} className="block w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">La Liga</button>
            <button onClick={() => handleFilter('National Teams')} className="block w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">National Teams</button>
          </div>
        </div>
      )}
    </nav>
  );
};

// --- PRODUCT CARD ---
const ProductCard = ({ product, openQuickView }) => {
  const isOutOfStock = product.in_stock === false;
  return (
    <div className={`group relative bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 ${isOutOfStock ? 'opacity-80' : ''}`}>
      <Link href={`/product/${product.id}`} className="block aspect-[4/5] bg-gray-200 relative overflow-hidden cursor-pointer">
        <img src={product.image} alt={product.name} className={`object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ${isOutOfStock ? 'grayscale' : ''}`} />
        {product.badge && !isOutOfStock && <span className="absolute top-2 left-2 bg-black text-white text-xs font-bold px-2 py-1 uppercase tracking-wider">{product.badge}</span>}
        {isOutOfStock && <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 uppercase tracking-wider shadow-sm">Sold Out</span>}
      </Link>
      <div className="p-4">
        <h3 className="text-sm text-gray-500">{product.category}</h3>
        <Link href={`/product/${product.id}`}><h2 className="text-lg font-semibold text-gray-900 truncate hover:text-red-600 transition-colors">{product.name}</h2></Link>
        <div className="flex items-center justify-between mt-2">
          <p className="text-lg font-bold text-gray-900">৳ {product.price}</p>
          {isOutOfStock ? (
            <button disabled className="bg-gray-200 text-gray-500 text-sm px-4 py-2 rounded font-bold cursor-not-allowed">Sold Out</button>
          ) : (
             <button onClick={() => openQuickView(product)} className="bg-black text-white text-sm px-4 py-2 rounded hover:bg-gray-800 transition-colors">Add</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ClothingStore() {
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false); 
  const [currentProduct, setCurrentProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try { const res = await fetch('/api/products'); const data = await res.json(); if (Array.isArray(data)) { setProducts(data); } } catch (err) {} finally { setLoading(false); }
    }
    fetchProducts();
  }, []);

  useEffect(() => { const savedCart = localStorage.getItem('kickoff-cart'); if (savedCart) setCart(JSON.parse(savedCart)); }, []);
  useEffect(() => { localStorage.setItem('kickoff-cart', JSON.stringify(cart)); }, [cart]);

  const openQuickView = (product) => { setCurrentProduct(product); setIsQuickViewOpen(true); };
  const confirmAddToCart = (product, size) => { setCart([...cart, { ...product, selectedSize: size }]); setIsCartOpen(true); };
  const removeFromCart = (index) => { setCart(cart.filter((_, i) => i !== index)); };
  const clearCart = () => { setCart([]); localStorage.removeItem('kickoff-cart'); };
  
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Navbar cartCount={cart.length} setCategory={setSelectedCategory} onOpenCart={() => setIsCartOpen(true)} searchTerm={searchTerm} setSearchTerm={setSearchTerm} products={products} onProductClick={openQuickView} />
      <ProductModal isOpen={isQuickViewOpen} product={currentProduct} onClose={() => setIsQuickViewOpen(false)} onConfirm={confirmAddToCart} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cartItems={cart} onRemoveItem={removeFromCart} clearCart={clearCart} />
      
      {/* --- NEW HERO SECTION WITH BACKGROUND IMAGE --- */}
      <div className="relative bg-gray-900 text-white">
        {/* Background Image Container */}
        <div className="absolute inset-0 overflow-hidden">
          {/* USES LOCAL FILE FROM PUBLIC FOLDER */}
          <img 
            src="/hero-bg.jpg" 
            alt="Football Players Background" 
            className="w-full h-full object-cover object-top" 
          />
          {/* Dark Overlay Gradient - Makes text readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-black/30"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-32 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-white drop-shadow-lg">
            WEAR YOUR PASSION
          </h1>
          <p className="text-xl md:text-2xl text-gray-100 mb-8 max-w-2xl drop-shadow-md font-medium">
            Premium Player & Fan Version Jerseys. Delivered All Over Bangladesh.
          </p>
          <button onClick={() => setSelectedCategory('All')} className="bg-white text-black font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition-colors shadow-xl">
            Shop All Kits
          </button>
        </div>
      </div>
      {/* ------------------------------------------- */}

      <div className="bg-gray-50 border-y border-gray-100"><div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8"><div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center"><div className="flex items-center justify-center space-x-2"><Truck className="text-red-600" /><span className="font-medium">Nationwide Delivery (Pathao/RedX)</span></div><div className="flex items-center justify-center space-x-2"><Phone className="text-red-600" /><span className="font-medium">Cash On Delivery Available</span></div><div className="flex items-center justify-center space-x-2"><Star className="text-red-600" /><span className="font-medium">Premium Quality Guarantee</span></div></div></div></div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8 border-b pb-4"><h2 className="text-3xl font-bold text-gray-900">{selectedCategory === 'All' ? 'Latest Drops' : selectedCategory}</h2>{selectedCategory !== 'All' && <button onClick={() => setSelectedCategory('All')} className="text-red-600 text-sm font-medium hover:underline">Clear Filter</button>}</div>
        
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading products from cloud...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">{filteredProducts.map((product) => <ProductCard key={product.id} product={product} openQuickView={openQuickView} />)}</div>
        )}
      </main>
      <footer className="bg-black text-white py-12"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8"><div><h3 className="text-lg font-bold mb-4">About Us</h3><p className="text-gray-400 text-sm">We are a fast-growing clothing brand based in Bangladesh.</p></div><div><h3 className="text-lg font-bold mb-4">Customer Care</h3><ul className="space-y-2 text-sm text-gray-400"><li><a href="#" className="hover:text-white">Track Order</a></li><li><a href="#" className="hover:text-white">Shipping Policy</a></li></ul></div><div><h3 className="text-lg font-bold mb-4">We Accept</h3><div className="flex space-x-4"><span className="bg-gray-800 px-2 py-1 rounded text-xs border border-gray-600">bKash</span><span className="bg-gray-800 px-2 py-1 rounded text-xs border border-gray-600">VISA</span></div></div></div><div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">© 2026 Kickoff Kits. All rights reserved.</div></footer>
    </div>
  );
}