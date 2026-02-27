// c:\clone_marlen\canto_proyect\frontend\src\app\api\providers\request\route.ts
// Crear nueva solicitud de proveedor con categoría

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, category_id } = body;

    if (!name || !email || !category_id) {
      return NextResponse.json(
        { error: 'Campos requeridos: name, email, category_id' },
        { status: 400 }
      );
    }

    // Validar que la categoría existe
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('id', category_id)
      .single();

    if (categoryError || !category) {
      return NextResponse.json(
        { error: 'Categoría no válida' },
        { status: 400 }
      );
    }

    // Crear solicitud de proveedor
    const { data, error } = await supabase
      .from('provider_requests')
      .insert([
        {
          name,
          email,
          phone,
          category_id,
          status: 'pending',
        },
      ])
      .select();

    if (error) {
      return NextResponse.json(
        { error: 'Error al crear solicitud: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Solicitud exitosa. Esperando aprobación del administrador.',
        data: data[0],
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
