import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    // Create a unique filename (e.g., 17458239-messi.png)
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('jerseys')
      .upload(fileName, file);

    if (error) throw error;

    // Get the Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('jerseys')
      .getPublicUrl(fileName);

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}