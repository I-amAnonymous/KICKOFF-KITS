import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 1. GET: Fetch current site content
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. PUT: Update site content (Admin only)
export async function PUT(request) {
  try {
    const body = await request.json();
    const { hero_headline, hero_subheadline, hero_image } = body;

    const { error } = await supabase
      .from('site_content')
      .update({ hero_headline, hero_subheadline, hero_image })
      .eq('id', 1);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}