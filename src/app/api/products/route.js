import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 1. GET: Fetch all products (for the shop page)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}

// 2. POST: Add a new product (for the admin page)
export async function POST(request) {
  try {
    const body = await request.json();
    const { data, error } = await supabase
      .from('products')
      .insert([body])
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}