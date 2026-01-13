"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; 
import { PhoneIncoming, CheckSquare, Package, Lock, CheckCircle, Archive, Plus, Search, Tag, Image as ImageIcon, Trash2, Power, AlertCircle, RefreshCw, MapPin, Phone, Truck, Upload, Loader2, LogOut, Eye, EyeOff, BarChart3, TrendingUp, DollarSign, ShoppingBag, Pencil, X, Ticket, Settings, Calendar, Printer, CalendarDays, Ban, LayoutGrid, Layers, Percent } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AdminDashboard() {
  const [session, setSession] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // DASHBOARD STATE
  const [activeSection, setActiveSection] = useState('dashboard'); // NEW: Main Category State
  const [activeTab, setActiveTab] = useState('overview');          // Existing: Specific View State
  
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]); 
  const [loadingData, setLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // CMS STATE
  const [siteContent, setSiteContent] = useState({ hero_headline: '', hero_subheadline: '', hero_image: '' });

  // FORMS
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'National Teams', image: '', badge: '' });
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingAuth(false);
      if (session) loadData();
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadData();
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
    setIsLoggingIn(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setOrders([]); setProducts([]); };

  const loadData = async () => {
    setLoadingData(true);
    await Promise.all([fetchOrders(), fetchProducts(), fetchCoupons(), fetchContent()]);
    setLoadingData(false);
  };

  const fetchOrders = async () => { try { const res = await fetch('/api/order', { cache: 'no-store' }); const data = await res.json(); setOrders(data.orders || []); } catch (e) {} };
  const fetchProducts = async () => { try { const res = await fetch('/api/products', { cache: 'no-store' }); const data = await res.json(); setProducts(data || []); } catch (e) {} };
  const fetchCoupons = async () => { try { const res = await fetch('/api/coupons?all=true', { cache: 'no-store' }); const data = await res.json(); setCoupons(data.data || []); } catch (e) {} };
  const fetchContent = async () => { try { const res = await fetch('/api/content', { cache: 'no-store' }); const data = await res.json(); if(data) setSiteContent(data); } catch (e) {} };

  const updateStatus = async (orderId, newStatus) => {
    if (newStatus === 'Cancelled' && !confirm("Are you sure you want to CANCEL this order?")) return;
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    await fetch('/api/order', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: orderId, status: newStatus }) });
  };

  const handleImageUpload = async (e, type = 'product') => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        if (type === 'product') setNewProduct({ ...newProduct, image: data.url });
        if (type === 'hero') setSiteContent({ ...siteContent, hero_image: data.url });
      } else alert("Upload failed.");
    } catch (err) { alert("Error uploading image."); } finally { setIsUploading(false); }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    const productToSend = { ...newProduct, image: newProduct.image || `https://placehold.co/400x500/png?text=${newProduct.name.replace(/ /g, '+')}` };
    try {
      let res;
      if (editingId) {
        res = await fetch('/api/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingId, ...productToSend }) });
      } else {
        res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productToSend) });
      }
      const data = await res.json();
      if (data.success) { alert(editingId ? "Updated!" : "Added!"); resetForm(); fetchProducts(); }
    } catch (err) { alert("Error saving"); } finally { setIsAdding(false); }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(siteContent) });
      const data = await res.json();
      if (data.success) alert("Website Updated!");
    } catch (e) { alert("Error updating settings"); }
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/coupons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newCoupon) });
      const data = await res.json();
      if (data.success) { alert("Coupon Created!"); setNewCoupon({ code: '', discount: '' }); fetchCoupons(); }
    } catch (e) { alert("Error creating coupon"); }
  };

  const deleteCoupon = async (id) => { if(!confirm("Delete this coupon?")) return; setCoupons(coupons.filter(c => c.id !== id)); await fetch(`/api/coupons?id=${id}`, { method: 'DELETE' }); };
  const resetForm = () => { setNewProduct({ name: '', price: '', category: 'National Teams', image: '', badge: '' }); setEditingId(null); };
  const toggleStock = async (product) => { const newStatus = !product.in_stock; setProducts(products.map(p => p.id === product.id ? { ...p, in_stock: newStatus } : p)); try { await fetch('/api/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: product.id, in_stock: newStatus }) }); } catch (err) { fetchProducts(); } };
  const deleteProduct = async (id) => { if (!confirm("Delete?")) return; setProducts(products.filter(p => p.id !== id)); try { await fetch(`/api/products?id=${id}`, { method: 'DELETE' }); } catch (err) { fetchProducts(); } };
  
  // NEW: Tab Switching Logic
  const startEdit = (product) => { 
    setNewProduct(product); 
    setEditingId(product.id); 
    setActiveSection('products'); // Switch main category
    setActiveTab('add');          // Switch sub-tab
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const switchSection = (section) => {
    setActiveSection(section);
    // Set default sub-tab for each section
    if (section === 'dashboard') setActiveTab('overview');
    if (section === 'orders') setActiveTab('pending');
    if (section === 'products') setActiveTab('manage');
    if (section === 'marketing') setActiveTab('coupons');
    if (section === 'settings') setActiveTab('settings');
  };

  // --- INVOICE GENERATOR ---
  const printInvoice = (order) => {
    const orderDate = new Date(order.created_at);
    const dateStr = orderDate.toLocaleDateString('en-GB').split('/').reverse().join(''); 
    const sameDayOrders = orders.filter(o => {
      const d = new Date(o.created_at);
      return d.getDate() === orderDate.getDate() && d.getMonth() === orderDate.getMonth() && d.getFullYear() === orderDate.getFullYear();
    });
    sameDayOrders.sort((a, b) => a.id - b.id);
    const dailyIndex = sameDayOrders.findIndex(o => o.id === order.id) + 1;
    const dailySequence = String(dailyIndex).padStart(3, '0');
    const customOrderId = `#${dateStr}-${dailySequence}`;

    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`<html><head><title>Invoice ${customOrderId}</title><style>body{font-family:'Courier New',Courier,monospace;padding:40px;color:#000}.header{text-align:center;border-bottom:2px solid #000;padding-bottom:20px;margin-bottom:30px}h1{margin:0;font-size:24px;letter-spacing:2px}.meta{display:flex;justify-content:space-between;margin-bottom:30px}.section-title{font-weight:bold;border-bottom:1px solid #ccc;margin-bottom:10px;padding-bottom:5px}table{width:100%;border-collapse:collapse;margin-bottom:30px}th{text-align:left;border-bottom:1px solid #000;padding:10px 0}td{padding:10px 0;border-bottom:1px solid #eee}.total-section{text-align:right;margin-top:20px}.grand-total{font-size:20px;font-weight:bold;border-top:2px solid #000;display:inline-block;padding-top:10px;margin-top:10px}</style></head><body><div class="header"><h1>KICKOFF KITS</h1><p>Premium Jerseys - Bangladesh</p></div><div class="meta"><div><div class="section-title">BILL TO</div><div>${order.customer.name}</div><div>${order.customer.phone}</div><div style="max-width:200px;">${order.customer.address}, ${order.customer.city}</div></div><div style="text-align:right;"><div class="section-title">ORDER INFO</div><div><strong>Invoice No:</strong> ${customOrderId}</div><div><strong>System ID:</strong> #${order.id}</div><div><strong>Date:</strong> ${orderDate.toLocaleDateString()}</div><div><strong>Status:</strong> ${order.status}</div></div></div><table><thead><tr><th>ITEM</th><th>SIZE</th><th>PRICE</th></tr></thead><tbody>${order.items.map(item=>`<tr><td>${item.name}</td><td>${item.selectedSize}</td><td>৳${item.price}</td></tr>`).join('')}</tbody></table><div class="total-section">${order.discount_code?`<div>Discount (${order.discount_code}): -৳${order.discount_amount}</div>`:''}<div>Shipping: ৳60</div><div class="grand-total">TOTAL DUE: ৳${order.total}</div></div><div style="text-align:center;margin-top:50px;font-size:12px;border-top:1px solid #eee;padding-top:20px;">Thank you for shopping with Kickoff Kits!</div></body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  // --- STATS CALCULATION ---
  const calculateStats = () => {
    const now = new Date();
    const todayStr = now.toLocaleDateString();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let dailyRev = 0, dailyCount = 0;
    let monthlyRev = 0, monthlyCount = 0;
    let yearlyRev = 0, yearlyCount = 0;
    let totalRev = 0;

    orders.forEach(o => {
      if (o.status === 'Cancelled') return;
      const d = new Date(o.created_at);
      const rev = o.total || 0;
      totalRev += rev;
      if (d.getFullYear() === currentYear) {
        yearlyRev += rev; yearlyCount++;
        if (d.getMonth() === currentMonth) {
          monthlyRev += rev; monthlyCount++;
          if (d.toLocaleDateString() === todayStr) { dailyRev += rev; dailyCount++; }
        }
      }
    });

    const pendingCount = orders.filter(o => o.status === 'Pending').length;
    const deliveredCount = orders.filter(o => o.status === 'Delivered').length;

    const chartData = [
      { name: 'Pending', value: orders.filter(o => o.status === 'Pending').reduce((s, o) => s + o.total, 0) },
      { name: 'Approved', value: orders.filter(o => o.status === 'Approved').reduce((s, o) => s + o.total, 0) },
      { name: 'Shipped', value: orders.filter(o => o.status === 'Shipped').reduce((s, o) => s + o.total, 0) },
      { name: 'Delivered', value: orders.filter(o => o.status === 'Delivered').reduce((s, o) => s + o.total, 0) },
    ];
    return { dailyRev, dailyCount, monthlyRev, monthlyCount, yearlyRev, yearlyCount, totalRev, pendingCount, deliveredCount, chartData };
  };
  const stats = calculateStats();

  const filterList = (list) => { 
    if (!searchTerm) return list; 
    const s = searchTerm.toLowerCase(); 
    return list.filter(o => o.customer?.name?.toLowerCase().includes(s) || o.customer?.phone?.includes(s) || o.id?.toString().includes(s)); 
  };
  const formatDate = (dateString) => { if (!dateString) return ''; return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); };

  const pendingOrders = filterList(orders.filter(o => o.status === 'Pending'));
  const confirmedOrders = filterList(orders.filter(o => o.status === 'Approved' || o.status === 'Shipped'));
  const deliveredOrders = filterList(orders.filter(o => o.status === 'Delivered'));
  const cancelledOrders = filterList(orders.filter(o => o.status === 'Cancelled'));

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredCoupons = coupons.filter(c => c.code.toLowerCase().includes(searchTerm.toLowerCase()));
  
  const displayedOrders = activeTab === 'pending' ? pendingOrders : activeTab === 'confirmed' ? confirmedOrders : activeTab === 'delivered' ? deliveredOrders : activeTab === 'cancelled' ? cancelledOrders : [];

  if (loadingAuth) return <div className="min-h-screen flex items-center justify-center bg-gray-900"><Loader2 className="animate-spin text-white" size={48} /></div>;
  if (!session) return ( <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4"><div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md text-center border border-gray-200 dark:border-gray-700"><div className="bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-300 dark:border-gray-600"><Lock className="text-black dark:text-white" size={32} /></div><h2 className="text-3xl font-extrabold text-black dark:text-white mb-2">Admin Portal</h2><form onSubmit={handleLogin} className="space-y-4 mt-6"><input type="email" placeholder="admin@kickoffkits.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 rounded-lg bg-gray-50 text-black border border-gray-300" required /><div className="relative"><input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 pr-12 rounded-lg bg-gray-50 text-black border border-gray-300" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></div>{authError && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm font-bold flex items-center gap-2"><AlertCircle size={16}/> {authError}</div>}<button type="submit" disabled={isLoggingIn} className="w-full bg-black text-white py-4 rounded-lg font-bold text-lg hover:bg-gray-800 disabled:opacity-50">{isLoggingIn ? "Verifying..." : "Login"}</button></form></div></div> );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8 font-sans text-gray-900 dark:text-white transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8"><h1 className="text-3xl font-extrabold text-black dark:text-white">Admin Dashboard</h1><div className="flex gap-2"><button onClick={loadData} className="flex items-center gap-2 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"><RefreshCw size={18} className={loadingData ? "animate-spin" : ""} /> Refresh</button><button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 flex items-center gap-2"><LogOut size={18} /> Logout</button></div></div>
        
        {/* --- LEVEL 1: MAIN NAVIGATION --- */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-800">
            <button onClick={() => switchSection('dashboard')} className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition ${activeSection === 'dashboard' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}><LayoutGrid size={18} /> Dashboard</button>
            <button onClick={() => switchSection('orders')} className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition ${activeSection === 'orders' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}><ShoppingBag size={18} /> Orders {pendingOrders.length > 0 && <span className="ml-1 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingOrders.length}</span>}</button>
            <button onClick={() => switchSection('products')} className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition ${activeSection === 'products' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}><Layers size={18} /> Products</button>
            <button onClick={() => switchSection('marketing')} className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition ${activeSection === 'marketing' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}><Percent size={18} /> Marketing</button>
            <button onClick={() => switchSection('settings')} className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition ${activeSection === 'settings' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}><Settings size={18} /> Settings</button>
        </div>

        {/* --- LEVEL 2: SUB NAVIGATION --- */}
        <div className="mb-6">
            {activeSection === 'orders' && (
                <div className="flex gap-3 overflow-x-auto">
                    <button onClick={() => setActiveTab('pending')} className={`px-3 py-1.5 rounded-md text-sm font-bold border transition ${activeTab === 'pending' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>New ({pendingOrders.length})</button>
                    <button onClick={() => setActiveTab('confirmed')} className={`px-3 py-1.5 rounded-md text-sm font-bold border transition ${activeTab === 'confirmed' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>Confirmed</button>
                    <button onClick={() => setActiveTab('delivered')} className={`px-3 py-1.5 rounded-md text-sm font-bold border transition ${activeTab === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>Delivered</button>
                    <button onClick={() => setActiveTab('cancelled')} className={`px-3 py-1.5 rounded-md text-sm font-bold border transition ${activeTab === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>Cancelled</button>
                </div>
            )}
            {activeSection === 'products' && (
                <div className="flex gap-3 overflow-x-auto">
                    <button onClick={() => setActiveTab('manage')} className={`px-3 py-1.5 rounded-md text-sm font-bold border transition ${activeTab === 'manage' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>Manage Stock</button>
                    <button onClick={() => { resetForm(); setActiveTab('add'); }} className={`px-3 py-1.5 rounded-md text-sm font-bold border transition ${activeTab === 'add' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>Add New</button>
                </div>
            )}
        </div>

        {activeTab !== 'add' && activeTab !== 'overview' && activeTab !== 'settings' && activeTab !== 'coupons' && (
          <div className="mb-6 relative"><Search className="absolute left-3 top-3 text-gray-400" size={20} /><input type="text" placeholder={activeTab === 'coupons' ? "Search coupons..." : "Search orders or products..."} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white" /></div>
        )}

        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"><div className="flex items-center gap-3 mb-2"><div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg"><CalendarDays className="text-blue-700 dark:text-blue-300" size={20} /></div><span className="text-sm font-bold text-gray-500 dark:text-gray-400">Today</span></div><div className="flex justify-between items-end"><div><h3 className="text-2xl font-extrabold text-black dark:text-white">৳ {stats.dailyRev}</h3><p className="text-xs text-gray-400">{stats.dailyCount} Orders</p></div></div></div>
              <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"><div className="flex items-center gap-3 mb-2"><div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg"><Calendar className="text-purple-700 dark:text-purple-300" size={20} /></div><span className="text-sm font-bold text-gray-500 dark:text-gray-400">This Month</span></div><div className="flex justify-between items-end"><div><h3 className="text-2xl font-extrabold text-black dark:text-white">৳ {stats.monthlyRev}</h3><p className="text-xs text-gray-400">{stats.monthlyCount} Orders</p></div></div></div>
              <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"><div className="flex items-center gap-3 mb-2"><div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg"><TrendingUp className="text-orange-700 dark:text-orange-300" size={20} /></div><span className="text-sm font-bold text-gray-500 dark:text-gray-400">This Year</span></div><div className="flex justify-between items-end"><div><h3 className="text-2xl font-extrabold text-black dark:text-white">৳ {stats.yearlyRev}</h3><p className="text-xs text-gray-400">{stats.yearlyCount} Orders</p></div></div></div>
              <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"><div className="flex items-center gap-3 mb-2"><div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg"><DollarSign className="text-green-700 dark:text-green-300" size={20} /></div><span className="text-sm font-bold text-gray-500 dark:text-gray-400">All Time</span></div><div className="flex justify-between items-end"><div><h3 className="text-2xl font-extrabold text-black dark:text-white">৳ {stats.totalRev}</h3><p className="text-xs text-gray-400">Total Revenue</p></div></div></div>
            </div>
            {/* CHARTS */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"><h3 className="text-lg font-bold mb-6 text-black dark:text-white flex items-center gap-2"><TrendingUp size={20}/> Revenue by Status</h3><div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={stats.chartData}><CartesianGrid strokeDasharray="3 3" opacity={0.1} /><XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} /><YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `৳${value}`} /><Tooltip contentStyle={{ backgroundColor: '#000', color: '#fff', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} /><Bar dataKey="value" fill="#000000" radius={[4, 4, 0, 0]} barSize={50} className="fill-black dark:fill-white" /></BarChart></ResponsiveContainer></div></div>
          </div>
        )}

        {/* --- SETTINGS TAB --- */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 max-w-2xl mx-auto animate-in fade-in zoom-in duration-300">
             <h2 className="text-2xl font-bold flex items-center gap-2 text-black dark:text-white mb-6"><Settings className="text-orange-600" /> Website Settings</h2>
             <form onSubmit={handleSaveSettings} className="space-y-6">
                <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Headline Text</label><input type="text" value={siteContent.hero_headline} onChange={e => setSiteContent({...siteContent, hero_headline: e.target.value})} className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white" /></div>
                <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Sub-Headline</label><input type="text" value={siteContent.hero_subheadline} onChange={e => setSiteContent({...siteContent, hero_subheadline: e.target.value})} className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white" /></div>
                <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Hero Background Image</label><div className="flex items-center gap-4"><label className="cursor-pointer flex items-center gap-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-4 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition">{isUploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}<span className="text-sm font-bold">{isUploading ? "Uploading..." : "Change Image"}</span><input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'hero')} /></label><div className="flex-1"><input type="text" value={siteContent.hero_image} onChange={e => setSiteContent({...siteContent, hero_image: e.target.value})} className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white text-sm" /></div></div>{siteContent.hero_image && (<div className="mt-4 w-full h-40 rounded-lg border border-gray-200 overflow-hidden relative"><img src={siteContent.hero_image} className="w-full h-full object-cover object-top" /></div>)}</div>
                <button type="submit" className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl hover:bg-orange-700 transition">Save Changes</button>
             </form>
          </div>
        )}

        {/* --- COUPONS TAB --- */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-xl mb-4 text-black dark:text-white">Create New Coupon</h3>
              <form onSubmit={handleAddCoupon} className="flex gap-4"><input required type="text" placeholder="Code (e.g. MESSI10)" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value})} className="flex-1 p-3 border rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white uppercase font-bold tracking-wider" /><input required type="number" placeholder="Discount %" value={newCoupon.discount} onChange={e => setNewCoupon({...newCoupon, discount: e.target.value})} className="w-32 p-3 border rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white" /><button type="submit" className="bg-pink-600 text-white font-bold px-6 rounded-lg hover:bg-pink-700">Create</button></form>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{filteredCoupons.map(c => ( <div key={c.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex justify-between items-center"><div><h4 className="font-extrabold text-lg text-black dark:text-white tracking-widest">{c.code}</h4><p className="text-sm text-gray-500">{c.discount_percent}% Off</p></div><button onClick={() => deleteCoupon(c.id)} className="bg-gray-100 dark:bg-gray-700 text-red-500 p-2 rounded-lg hover:bg-red-100"><Trash2 size={16}/></button></div> ))}</div>
          </div>
        )}

        {/* --- ADD / EDIT PRODUCT TAB --- */}
        {activeTab === 'add' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 max-w-2xl mx-auto animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold flex items-center gap-2 text-black dark:text-white">{editingId ? <><Pencil className="text-blue-600" /> Edit Product</> : <><Plus className="text-blue-600" /> Add New Jersey</>}</h2>{editingId && <button onClick={() => { resetForm(); setActiveTab('manage'); }} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 font-bold"><X size={16} /> Cancel Edit</button>}</div>
            <form onSubmit={handleSaveProduct} className="space-y-6">
              <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Name</label><input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600" /></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Price</label><input required type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600" /></div><div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Category</label><select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600"><option>National Teams</option><option>Premier League</option><option>La Liga</option><option>Bundesliga</option></select></div></div>
              <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Jersey Image</label><div className="flex items-center gap-4"><label className="cursor-pointer flex items-center gap-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-4 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition">{isUploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}<span className="text-sm font-bold">{isUploading ? "Uploading..." : "Change Photo"}</span><input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'product')} /></label><div className="flex-1"><input type="text" placeholder="Or paste URL..." value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600 text-sm" /></div></div>{newProduct.image && (<div className="mt-4 w-32 h-32 rounded-lg border border-gray-200 overflow-hidden relative"><img src={newProduct.image} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center text-white text-xs font-bold">Preview</div></div>)}</div>
              <div><label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Badge</label><input type="text" value={newProduct.badge} onChange={e => setNewProduct({...newProduct, badge: e.target.value})} className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600" /></div>
              <button type="submit" disabled={isAdding || isUploading} className={`w-full text-white font-bold py-4 rounded-xl transition ${editingId ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}`}>{isAdding ? "Saving..." : editingId ? "Update Product" : "Launch Product"}</button>
            </form>
          </div>
        )}

        {/* --- MANAGE STOCK TAB --- */}
        {activeTab === 'manage' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
                <img src={product.image} className="w-20 h-20 object-cover rounded-lg bg-gray-100" />
                <div className="flex-1"><h3 className="font-bold text-black dark:text-white">{product.name}</h3><p className="text-sm text-gray-500 dark:text-gray-400">৳ {product.price}</p><div className="flex gap-2 mt-3"><button onClick={() => toggleStock(product)} className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition ${product.in_stock !== false ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'}`}><Power size={14} /> {product.in_stock !== false ? "In Stock" : "Sold Out"}</button><button onClick={() => startEdit(product)} className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200"><Pencil size={16} /></button><button onClick={() => deleteProduct(product.id)} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-red-600 dark:text-red-400 rounded-lg"><Trash2 size={16} /></button></div></div>
              </div>
            ))}
          </div>
        )}

        {/* --- ORDER LISTS --- */}
        {(activeTab === 'pending' || activeTab === 'confirmed' || activeTab === 'delivered' || activeTab === 'cancelled') && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
             {displayedOrders.map((order) => (
                <div key={order.id} className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition border-b border-gray-100 dark:border-gray-700 last:border-0 ${activeTab === 'delivered' || activeTab === 'cancelled' ? 'opacity-75' : ''}`}>
                  <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2"><span className="bg-black dark:bg-white text-white dark:text-black text-xs font-bold px-2 py-1 rounded">#{order.id}</span><span className="text-xs text-gray-400 font-medium flex items-center gap-1"><Calendar size={10} /> {formatDate(order.created_at)}</span></div>
                      <h3 className="text-lg font-bold mt-1 text-black dark:text-white">{order.customer.name}</h3>
                      <div className="mt-1 space-y-1"><p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2"><Phone size={14} /> {order.customer.phone}</p><p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2"><MapPin size={14} /> {order.customer.address}, {order.customer.city}</p></div><div className="mt-2 text-sm font-medium text-gray-800 dark:text-gray-300">{order.items.map(i => `${i.name} (${i.selectedSize})`).join(', ')}</div></div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-black dark:text-white">৳ {order.total}</p>
                      {order.discount_code && (<div className="mt-1 flex justify-end"><span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100"><Ticket size={12} /> {order.discount_code} (-৳{order.discount_amount})</span></div>)}
                      <div className="mt-2 mb-3"><span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'Pending' ? 'bg-blue-100 text-blue-800' : order.status === 'Approved' ? 'bg-purple-100 text-purple-800' : order.status === 'Shipped' ? 'bg-orange-100 text-orange-800' : order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{order.status}</span></div>
                      
                      <div className="flex flex-col gap-2">
                        {order.status === 'Pending' && <div className="flex gap-2 justify-end">
                            <button onClick={() => updateStatus(order.id, 'Cancelled')} className="bg-gray-100 text-red-600 border border-gray-200 px-3 py-2 rounded-lg text-sm font-bold hover:bg-red-50 flex items-center gap-1"><Ban size={14}/> Cancel</button>
                            <button onClick={() => updateStatus(order.id, 'Approved')} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 shadow-sm animate-pulse flex items-center gap-1"><PhoneIncoming size={16} /> Confirm</button>
                        </div>}
                        
                        {(order.status === 'Approved' || order.status === 'Shipped') && (<div className="flex gap-2 justify-end">
                           {order.status === 'Approved' && <button onClick={() => updateStatus(order.id, 'Cancelled')} className="bg-gray-100 text-red-600 border border-gray-200 px-3 py-2 rounded-lg text-xs font-bold hover:bg-red-50 flex items-center gap-1"><Ban size={12}/> Cancel</button>}
                           {order.status !== 'Shipped' && <button onClick={() => updateStatus(order.id, 'Shipped')} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 flex items-center gap-1"><Truck size={14}/> Ship</button>}
                           <button onClick={() => updateStatus(order.id, 'Delivered')} className="bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-green-700 flex items-center gap-1"><CheckCircle size={14}/> Done</button>
                        </div>)}

                        <button onClick={() => printInvoice(order)} className="bg-gray-800 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-black flex items-center justify-center gap-1"><Printer size={14}/> Print Invoice</button>
                      </div>

                    </div>
                  </div>
                </div>
             ))}
             {displayedOrders.length === 0 && <div className="p-12 text-center text-gray-500 dark:text-gray-400">No orders here.</div>}
          </div>
        )}
      </div>
    </div>
  );
}