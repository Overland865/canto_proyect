// c:\clone_marlen\canto_proyect\frontend\src\app\api\admin\provider-requests\route.ts
// Obtener solicitudes de proveedores pendientes

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get('status') || 'pending';

    const { data, error } = await supabase
      .from('provider_requests')
      .select(
        `
        id,
        name,
        email,
        phone,
        category_id,
        categories (name, description),
        status,
        created_at,
        rejection_reason
        `
      )
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Error al obtener solicitudes: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
