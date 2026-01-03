"use client";
import React, { useState, useEffect } from 'react';
import { PhoneIncoming, CheckSquare, Package, Lock, CheckCircle, Archive, Plus, Search, Tag, Image as ImageIcon, Trash2, Power, AlertCircle, RefreshCw, MapPin, Phone, Truck } from 'lucide-react';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  
  // TABS: 'pending' (New), 'confirmed' (Processing), 'delivered' (Done), 'add' (New Product), 'manage' (Stock)
  const [activeTab, setActiveTab] = useState('pending'); 
  
  // Data
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Forms
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'National Teams', image: '', badge: '' });
  const [isAdding, setIsAdding] = useState(false);

  // --- ACTIONS ---
  const handleLogin = (e) => { e.preventDefault(); if (passcode === "admin123") { setIsAuthenticated(true); loadData(); } else { setError("Wrong Passcode"); setPasscode(''); } };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchOrders(), fetchProducts()]);
    setLoading(false);
  };

  const fetchOrders = async () => { try { const res = await fetch('/api/order', { cache: 'no-store' }); const data = await res.json(); setOrders(data.orders || []); } catch (e) {} };
  
  const fetchProducts = async () => { try { const res = await fetch('/api/products', { cache: 'no-store' }); const data = await res.json(); setProducts(data || []); } catch (e) {} };

  // ORDER ACTIONS
  const updateStatus = async (orderId, newStatus) => {
    // Optimistic Update
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    await fetch('/api/order', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: orderId, status: newStatus }) });
  };

  // PRODUCT ACTIONS
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    const productToSend = { ...newProduct, image: newProduct.image || `https://placehold.co/400x500/png?text=${newProduct.name.replace(/ /g, '+')}` };
    try {
      const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productToSend) });
      const data = await res.json();
      if (data.success) { alert("Added!"); setNewProduct({ name: '', price: '', category: 'National Teams', image: '', badge: '' }); fetchProducts(); }
    } catch (err) { alert("Error"); } finally { setIsAdding(false); }
  };

  const toggleStock = async (product) => {
    const newStatus = !product.in_stock;
    setProducts(products.map(p => p.id === product.id ? { ...p, in_stock: newStatus } : p));
    try { await fetch('/api/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: product.id, in_stock: newStatus }) }); } catch (err) { fetchProducts(); }
  };

  const deleteProduct = async (id) => {
    if (!confirm("Delete this jersey?")) return;
    setProducts(products.filter(p => p.id !== id));
    try { await fetch(`/api/products?id=${id}`, { method: 'DELETE' }); } catch (err) { fetchProducts(); }
  };

  // --- FILTERING ---
  const filterList = (list) => {
    if (!searchTerm) return list;
    const s = searchTerm.toLowerCase();
    return list.filter(o => o.customer?.name.toLowerCase().includes(s) || o.customer?.phone.includes(s) || o.id?.toString().includes(s));
  };

  // 1. Pending (New Orders)
  const pendingOrders = filterList(orders.filter(o => o.status === 'Pending'));
  
  // 2. Confirmed (Approved OR Shipped)
  const confirmedOrders = filterList(orders.filter(o => o.status === 'Approved' || o.status === 'Shipped'));
  
  // 3. Delivered (Completed)
  const deliveredOrders = filterList(orders.filter(o => o.status === 'Delivered'));
  
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Decide what to show based on tab
  const displayedOrders = activeTab === 'pending' ? pendingOrders : activeTab === 'confirmed' ? confirmedOrders : deliveredOrders;

  if (!isAuthenticated) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 transition-colors duration-200">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md text-center border border-gray-200 dark:border-gray-700">
        <div className="bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-300 dark:border-gray-600"><Lock className="text-black dark:text-white" size={32} /></div>
        <h2 className="text-3xl font-extrabold text-black dark:text-white mb-2">Admin Access</h2>
        <form onSubmit={handleLogin} className="space-y-4 mt-6">
          <input type="password" placeholder="Passcode" value={passcode} onChange={(e) => setPasscode(e.target.value)} className="w-full text-center text-xl font-bold tracking-widest p-4 rounded-lg bg-white text-black border-2 border-gray-300 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:border-black dark:focus:border-white focus:outline-none" autoFocus />
          {error && <p className="text-red-600 dark:text-red-400 text-sm font-bold animate-pulse">{error}</p>}
          <button type="submit" className="w-full bg-black text-white dark:bg-white dark:text-black py-4 rounded-lg font-bold text-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition">Unlock</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8 font-sans text-gray-900 dark:text-white transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-black dark:text-white">Admin Dashboard</h1>
          <div className="flex gap-2">
            <button onClick={loadData} className="flex items-center gap-2 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium">
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            <button onClick={() => setIsAuthenticated(false)} className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700">Logout</button>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <button onClick={() => setActiveTab('pending')} className={`pb-4 px-4 font-bold whitespace-nowrap flex items-center gap-2 ${activeTab === 'pending' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}><PhoneIncoming size={18} /> New Orders ({pendingOrders.length})</button>
          <button onClick={() => setActiveTab('confirmed')} className={`pb-4 px-4 font-bold whitespace-nowrap flex items-center gap-2 ${activeTab === 'confirmed' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-400'}`}><CheckSquare size={18} /> Confirmed ({confirmedOrders.length})</button>
          {/* NEW DELIVERED TAB */}
          <button onClick={() => setActiveTab('delivered')} className={`pb-4 px-4 font-bold whitespace-nowrap flex items-center gap-2 ${activeTab === 'delivered' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-400'}`}><CheckCircle size={18} /> Delivered ({deliveredOrders.length})</button>
          
          <div className="flex-1"></div> {/* Spacer */}
          
          <button onClick={() => setActiveTab('add')} className={`pb-4 px-4 font-bold whitespace-nowrap flex items-center gap-2 ${activeTab === 'add' ? 'text-gray-500 border-b-2 border-gray-500' : 'text-gray-400'}`}><Plus size={18} /> Add New</button>
          <button onClick={() => setActiveTab('manage')} className={`pb-4 px-4 font-bold whitespace-nowrap flex items-center gap-2 ${activeTab === 'manage' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-400'}`}><AlertCircle size={18} /> Manage Stock</button>
        </div>

        {activeTab !== 'add' && (
          <div className="mb-6 relative"><Search className="absolute left-3 top-3 text-gray-400" size={20} /><input type="text" placeholder={activeTab === 'manage' ? "Search products..." : "Search orders..."} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white" /></div>
        )}

        {/* --- ADD PRODUCT TAB --- */}
        {activeTab === 'add' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 max-w-2xl mx-auto animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-black dark:text-white"><Plus className="text-blue-600" /> Add New Jersey</h2>
            <form onSubmit={handleAddProduct} className="space-y-6">
              <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Name</label><input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Price</label><input required type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600" /></div>
                <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Category</label><select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600"><option>National Teams</option><option>Premier League</option><option>La Liga</option><option>Bundesliga</option></select></div>
              </div>
              <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Image URL</label><input type="text" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600" /></div>
              <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Badge</label><input type="text" value={newProduct.badge} onChange={e => setNewProduct({...newProduct, badge: e.target.value})} className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600" /></div>
              <button type="submit" disabled={isAdding} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition">{isAdding ? "Adding..." : "Launch Product"}</button>
            </form>
          </div>
        )}

        {/* --- MANAGE STOCK TAB --- */}
        {activeTab === 'manage' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
                <img src={product.image} className="w-20 h-20 object-cover rounded-lg bg-gray-100" />
                <div className="flex-1">
                  <h3 className="font-bold text-black dark:text-white">{product.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">৳ {product.price}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => toggleStock(product)} className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition ${product.in_stock !== false ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'}`}><Power size={14} /> {product.in_stock !== false ? "In Stock" : "Sold Out"}</button>
                    <button onClick={() => deleteProduct(product.id)} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-red-600 dark:text-red-400 rounded-lg"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- ORDER LISTS (Pending, Confirmed, Delivered) --- */}
        {(activeTab === 'pending' || activeTab === 'confirmed' || activeTab === 'delivered') && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
             {displayedOrders.map((order) => (
                <div key={order.id} className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition border-b border-gray-100 dark:border-gray-700 last:border-0 ${activeTab === 'delivered' ? 'opacity-75' : ''}`}>
                  <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                    <div className="flex-1">
                      <span className="bg-black dark:bg-white text-white dark:text-black text-xs font-bold px-2 py-1 rounded">#{order.id}</span>
                      <h3 className="text-lg font-bold mt-2 text-black dark:text-white">{order.customer.name}</h3>
                      <div className="mt-1 space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2"><Phone size={14} /> {order.customer.phone}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2"><MapPin size={14} /> {order.customer.address}, {order.customer.city}</p>
                      </div>
                      <div className="mt-2 text-sm font-medium text-gray-800 dark:text-gray-300">{order.items.map(i => `${i.name} (${i.selectedSize})`).join(', ')}</div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-black dark:text-white">৳ {order.total}</p>
                      
                      {/* STATUS LABEL */}
                      <div className="mt-2 mb-3">
                         <span className={`px-3 py-1 rounded-full text-xs font-bold 
                           ${order.status === 'Pending' ? 'bg-blue-100 text-blue-800' : 
                             order.status === 'Approved' ? 'bg-purple-100 text-purple-800' : 
                             order.status === 'Shipped' ? 'bg-orange-100 text-orange-800' : 
                             'bg-green-100 text-green-800'}`}>
                           {order.status}
                         </span>
                      </div>

                      {/* WORKFLOW BUTTONS */}
                      <div className="flex flex-col gap-2">
                        {/* 1. NEW ORDER (Pending) -> Approve */}
                        {order.status === 'Pending' && (
                          <button onClick={() => updateStatus(order.id, 'Approved')} className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 shadow-sm animate-pulse">
                            <PhoneIncoming size={16} /> Confirm Order
                          </button>
                        )}

                        {/* 2. CONFIRMED ORDER -> Ship OR Done */}
                        {(order.status === 'Approved' || order.status === 'Shipped') && (
                          <div className="flex gap-2 justify-end">
                            {order.status !== 'Shipped' && (
                               <button onClick={() => updateStatus(order.id, 'Shipped')} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-1">
                                 <Truck size={14}/> Ship
                               </button>
                            )}
                            <button onClick={() => updateStatus(order.id, 'Delivered')} className="bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-green-700 flex items-center gap-1">
                              <CheckCircle size={14}/> Done
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
             ))}
             {displayedOrders.length === 0 && <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                {activeTab === 'pending' ? 'No new orders to call.' : activeTab === 'confirmed' ? 'No orders to pack.' : 'No delivered history.'}
             </div>}
          </div>
        )}
      </div>
    </div>
  );
}