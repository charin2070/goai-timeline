import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    
    // Perform a simple query to test the connection.
    // We use { head: true } to not retrieve data, just check for a successful response.
    const { error } = await supabase.from('notes').select('*', { head: true, count: 'exact' });

    if (error) {
      throw new Error(error.message);
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const displayUrl = url.replace('https://', 'supabase://');

    return NextResponse.json({ 
      success: true, 
      message: 'Успешно.',
      url: displayUrl
    });
  } catch (error: any) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not configured';
    const displayUrl = url.replace('https://', 'supabase://');
    return NextResponse.json({ 
      success: false, 
      message: error.message,
      url: displayUrl
    }, { status: 500 });
  }
}
