"use client";
import React, { useState, useEffect } from 'react';
import { Package, Phone, MapPin, Calendar, RefreshCw, Lock, ArrowRight, Truck, CheckCircle, Search, Archive, Clock, Plus, Tag, Image as ImageIcon } from 'lucide-react';

export default function AdminDashboard() {
  // --- STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'history', 'add'
  
  // Data State
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // New Product Form State
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'National Teams', image: '', badge: '' });
  const [isAdding, setIsAdding] = useState(false);

  // --- ACTIONS ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode === "admin123") { setIsAuthenticated(true); fetchOrders(); } 
    else { setError("Wrong Passcode"); setPasscode(''); }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/order', { cache: 'no-store' });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) { console.error("Failed to fetch orders"); } finally { setLoading(false); }
  };

  const updateStatus = async (orderId, newStatus) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    await fetch('/api/order', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: orderId, status: newStatus }) });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    
    // Default image if empty
    const productToSend = {
      ...newProduct,
      image: newProduct.image || `https://placehold.co/400x500/png?text=${newProduct.name.replace(/ /g, '+')}`
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productToSend)
      });
      const data = await res.json();
      if (data.success) {
        alert("Product Added Successfully!");
        setNewProduct({ name: '', price: '', category: 'National Teams', image: '', badge: '' });
      } else {
        alert("Failed to add product.");
      }
    } catch (err) { alert("Error adding product"); } finally { setIsAdding(false); }
  };

  // --- FILTERING ---
  const filterList = (list) => {
    if (!searchTerm) return list;
    const s = searchTerm.toLowerCase();
    return list.filter(o => o.customer.name.toLowerCase().includes(s) || o.customer.phone.includes(s) || o.id.toString().includes(s));
  };

  const activeOrders = filterList(orders.filter(o => o.status !== 'Delivered'));
  const deliveredOrders = filterList(orders.filter(o => o.status === 'Delivered'));

  if (!isAuthenticated) return (
    // LOGIN SCREEN - Adapts to Dark/Light Mode
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 transition-colors duration-200">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md text-center border border-gray-200 dark:border-gray-700">
        <div className="bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-300 dark:border-gray-600">
            <Lock className="text-black dark:text-white" size={32} />
        </div>
        <h2 className="text-3xl font-extrabold text-black dark:text-white mb-2">Admin Access</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Enter passcode to manage store</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="password" 
            placeholder="Passcode" 
            value={passcode} 
            onChange={(e) => setPasscode(e.target.value)} 
            // THIS LINE ENSURES VISIBILITY IN BOTH MODES
            className="w-full text-center text-xl font-bold tracking-widest p-4 rounded-lg 
                       bg-white text-black border-2 border-gray-300 
                       dark:bg-gray-700 dark:text-white dark:border-gray-600 
                       focus:border-black dark:focus:border-white focus:outline-none placeholder-gray-400" 
            autoFocus 
          />
          {error && <p className="text-red-600 dark:text-red-400 text-sm font-bold animate-pulse">{error}</p>}
          <button type="submit" className="w-full bg-black text-white dark:bg-white dark:text-black py-4 rounded-lg font-bold text-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition transform active:scale-95">Unlock Dashboard</button>
        </form>
      </div>
    </div>
  );

  return (
    // MAIN DASHBOARD - Adapts to Dark/Light Mode
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8 font-sans text-gray-900 dark:text-white transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-black dark:text-white">Admin Dashboard</h1>
          <button onClick={() => setIsAuthenticated(false)} className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700">Logout</button>
        </div>

        {/* TABS */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <button onClick={() => setActiveTab('active')} className={`pb-4 px-4 font-bold whitespace-nowrap flex items-center gap-2 ${activeTab === 'active' ? 'text-black dark:text-white border-b-2 border-black dark:border-white' : 'text-gray-400'}`}><Clock size={18} /> Active ({activeOrders.length})</button>
          <button onClick={() => setActiveTab('history')} className={`pb-4 px-4 font-bold whitespace-nowrap flex items-center gap-2 ${activeTab === 'history' ? 'text-black dark:text-white border-b-2 border-black dark:border-white' : 'text-gray-400'}`}><Archive size={18} /> History ({deliveredOrders.length})</button>
          <button onClick={() => setActiveTab('add')} className={`pb-4 px-4 font-bold whitespace-nowrap flex items-center gap-2 ${activeTab === 'add' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}><Plus size={18} /> Add Product</button>
        </div>

        {/* SEARCH BAR (For Orders) */}
        {activeTab !== 'add' && (
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search orders..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white" 
            />
          </div>
        )}

        {/* --- CONTENT AREA --- */}
        {activeTab === 'add' ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 max-w-2xl mx-auto animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-black dark:text-white"><Plus className="text-blue-600" /> Add New Jersey</h2>
            <form onSubmit={handleAddProduct} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Jersey Name</label>
                <input required type="text" placeholder="e.g. Liverpool Home 24/25" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} 
                  className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Price (৳)</label>
                  <input required type="number" placeholder="1200" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} 
                    className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} 
                    className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500">
                      <option>National Teams</option><option>Premier League</option><option>La Liga</option><option>Bundesliga</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input type="text" placeholder="https://... (Leave empty for auto-placeholder)" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} 
                    className="w-full pl-10 p-3 border rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tip: Copy image address from Google Images.</p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Badge (Optional)</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input type="text" placeholder="e.g. Sale, New, Hot" value={newProduct.badge} onChange={e => setNewProduct({...newProduct, badge: e.target.value})} 
                    className="w-full pl-10 p-3 border rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <button type="submit" disabled={isAdding} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2">{isAdding ? "Adding..." : "Launch Product"}</button>
            </form>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* ORDER LIST */}
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
               {(activeTab === 'active' ? activeOrders : deliveredOrders).map((order) => (
                <div key={order.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="bg-black dark:bg-white text-white dark:text-black text-xs font-bold px-2 py-1 rounded">#{order.id}</span>
                      <h3 className="text-lg font-bold mt-2 text-black dark:text-white">{order.customer.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{order.customer.phone}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{order.customer.address}</p>
                      <div className="mt-2 text-sm font-medium text-gray-800 dark:text-gray-300">{order.items.map(i => `${i.name} (${i.selectedSize})`).join(', ')}</div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-black dark:text-white">৳ {order.total}</p>
                      <div className="flex flex-col gap-2 mt-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'Delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'}`}>{order.status}</span>
                        {order.status !== 'Delivered' && <button onClick={() => updateStatus(order.id, 'Delivered')} className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Mark Done</button>}
                      </div>
                    </div>
                  </div>
                </div>
               ))}
               {(activeTab === 'active' ? activeOrders : deliveredOrders).length === 0 && <div className="p-12 text-center text-gray-500 dark:text-gray-400">No orders found.</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}