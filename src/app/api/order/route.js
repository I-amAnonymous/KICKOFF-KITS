import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();

    const orderData = {
      customer: body.customer,
      items: body.items,
      total: body.total,
      status: 'Pending',
      date: new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })
    };

    // FIX: Changed 'orders' to 'Orders' to match your database
    const { data, error } = await supabase
      .from('Orders') 
      .insert([{ payload: orderData }])
      .select();

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    const savedOrder = data[0]; 

    console.log(`✅ Order #${savedOrder.id} saved to Supabase!`);

    return NextResponse.json({ 
      success: true, 
      message: "Order placed!", 
      orderId: savedOrder.id 
    });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function GET() {
  // FIX: Changed 'orders' to 'Orders' here too
  const { data, error } = await supabase
    .from('Orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Supabase Fetch Error:", error);
    return NextResponse.json({ orders: [] });
  }

  const formattedOrders = data.map(row => ({
    id: row.id,
    ...row.payload 
  }));

  return NextResponse.json({ orders: formattedOrders });
}