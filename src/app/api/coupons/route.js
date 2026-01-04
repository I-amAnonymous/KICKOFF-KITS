import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 1. GET: Check if a code exists and return the discount
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const getAll = searchParams.get('all'); // Admin flag

  try {
    let query = supabase.from('coupons').select('*');

    if (getAll) {
      // Fetch all for Admin Panel
      query = query.order('id', { ascending: false });
    } else {
      // Fetch specific code for Checkout
      if (!code) return NextResponse.json({ error: "No code provided" }, { status: 400 });
      query = query.eq('code', code.toUpperCase()).eq('is_active', true).single();
    }

    const { data, error } = await query;
    
    if (error || !data) {
      return NextResponse.json({ success: false, message: "Invalid Coupon" });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// 2. POST: Create a new Coupon
export async function POST(request) {
  try {
    const body = await request.json();
    const { code, discount } = body;
    
    const { data, error } = await supabase
      .from('coupons')
      .insert([{ code: code.toUpperCase(), discount_percent: discount }])
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// 3. DELETE: Remove a Coupon
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  const { error } = await supabase.from('coupons').delete().eq('id', id);
  if (error) return NextResponse.json({ success: false }, { status: 500 });
  
  return NextResponse.json({ success: true });
}