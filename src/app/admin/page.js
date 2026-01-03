"use client";
import React, { useState, useEffect } from 'react';
import { Package, Phone, MapPin, Calendar, RefreshCw, Lock, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  // --- SECURITY STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  // --- DASHBOARD STATE ---
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. The Login Function
  const handleLogin = (e) => {
    e.preventDefault();
    // SET YOUR SECRET ADMIN PASSWORD HERE
    if (passcode === "admin123") { 
      setIsAuthenticated(true);
      fetchOrders(); // Load data only AFTER logging in
    } else {
      setError("Wrong Passcode");
      setPasscode(''); // Clear input on wrong password
    }
  };

  // 2. The Logout Function
  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasscode(''); 
    setError('');
  };

  // 3. Fetch Orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/order', { cache: 'no-store' });
      const data = await res.json();
      setOrders(data.orders);
    } catch (error) {
      console.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  // --- IF NOT LOGGED IN, SHOW LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-gray-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access</h2>
          <p className="text-gray-500 mb-6">Enter your secret passcode to view orders.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Enter Passcode" 
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setError('');
              }}
              // FIXED: Added 'text-black' and 'placeholder-gray-500' for visibility
              className="w-full text-center text-xl font-bold tracking-widest p-3 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:border-black focus:outline-none"
              autoFocus
            />
            {error && <p className="text-red-600 text-sm font-bold animate-pulse">{error}</p>}
            
            <button 
              type="submit"
              className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2"
            >
              Unlock Dashboard <ArrowRight size={20} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- IF LOGGED IN, SHOW DASHBOARD ---
  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-black">Admin Dashboard</h1>
            <p className="text-gray-500">Manage your Kickoff Kits orders</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchOrders} className="flex items-center gap-2 bg-white text-black border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
              <RefreshCw size={18} /> Refresh
            </button>
            <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium">
              Logout
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
            <p className="text-3xl font-bold mt-2 text-black">{orders.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
            <p className="text-3xl font-bold mt-2 text-green-600">
              ৳ {orders.reduce((sum, order) => sum + order.total, 0)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Pending Delivery</h3>
            <p className="text-3xl font-bold mt-2 text-orange-500">{orders.length}</p>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-black">Recent Orders</h2>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-500">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-10 text-center text-gray-500">No orders received yet.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {orders.map((order) => (
                <div key={order.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                    
                    {/* Customer Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded">#{order.id}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar size={12} /> {order.date}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-black">{order.customer.name}</h3>
                      <div className="text-sm text-gray-600 mt-1 space-y-1">
                        <p className="flex items-center gap-2"><Phone size={14} className="text-gray-400"/> {order.customer.phone}</p>
                        <p className="flex items-center gap-2"><MapPin size={14} className="text-gray-400"/> {order.customer.address}, {order.customer.city}</p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Items</h4>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-sm border-b border-dashed border-gray-200 pb-1 last:border-0">
                            <span className="font-medium text-gray-900">1x {item.name}</span>
                            <span className="text-gray-500 bg-gray-100 px-2 rounded text-xs">Size: {item.selectedSize}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total & Status */}
                    <div className="w-full md:w-32 text-right">
                      <p className="text-xl font-bold text-gray-900">৳ {order.total}</p>
                      <span className="inline-block mt-2 bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">
                        {order.status}
                      </span>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}