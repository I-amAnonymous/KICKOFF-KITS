import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: Fetch all orders (with new columns)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('id', { ascending: false }); // Newest first
    if (error) throw error;
    return NextResponse.json({ orders: data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create a new order (Saves Coupon Info now)
export async function POST(request) {
  try {
    const body = await request.json();
    const { customer, items, total, discount_code, discount_amount } = body;

    const { data, error } = await supabase
      .from('orders')
      .insert([
        { 
          customer, 
          items, 
          total, 
          status: 'Pending',
          discount_code: discount_code || null,   // Save the code (e.g., "MESSI10")
          discount_amount: discount_amount || 0   // Save the amount (e.g., 500)
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, orderId: data.id });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT: Update Order Status
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, status } = body;
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}