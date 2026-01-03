import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 1. GET: Fetch products (All OR Single)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    let query = supabase.from('products').select('*');

    if (id) {
      // If ?id=1 is passed, fetch just that one
      query = query.eq('id', id).single();
    } else {
      // Otherwise fetch all, ordered by ID
      query = query.order('id', { ascending: true });
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. POST: Add a new product
export async function POST(request) {
  try {
    const body = await request.json();
    const { data, error } = await supabase
      .from('products')
      .insert([{ ...body, in_stock: true }])
      .select();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// 3. PUT: Update Stock
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, in_stock } = body;
    const { error } = await supabase
      .from('products')
      .update({ in_stock })
      .eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// 4. DELETE: Remove a product
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}