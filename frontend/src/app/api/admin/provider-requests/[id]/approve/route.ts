// c:\clone_marlen\canto_proyect\frontend\src\app\api\admin\provider-requests\[id]\approve\route.ts
// Aprobar solicitud de proveedor

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { sendProviderApprovalEmail } from '@/lib/email-service';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Obtener la solicitud
    const { data: providerRequest, error: fetchError } = await supabase
      .from('provider_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !providerRequest) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      );
    }

    // Crear usuario en auth si no existe
    const { data: emailUsers, error: emailError } = await supabase.auth.admin.listUsers();

    let userId: string | null = null;

    // Buscar si el usuario ya existe
    if (!emailError && emailUsers.users) {
      const existingUser = emailUsers.users.find(
        (u) => u.email === providerRequest.email
      );
      userId = existingUser?.id || null;
    }

    // Si no existe, crear el usuario
    if (!userId) {
      const { data: newUser, error: createError } =
        await supabase.auth.admin.createUser({
          email: providerRequest.email,
          password: Math.random().toString(36).slice(-12),
          email_confirm: true,
        });

      if (createError || !newUser.user) {
        return NextResponse.json(
          { error: 'Error al crear usuario: ' + createError?.message },
          { status: 500 }
        );
      }

      userId = newUser.user.id;
    }

    // Crear proveedor aprobado
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .insert([
        {
          id: userId,
          name: providerRequest.name,
          email: providerRequest.email,
          phone: providerRequest.phone,
          category_id: providerRequest.category_id,
          provider_request_id: id,
          approved_at: new Date(),
        },
      ])
      .select();

    if (providerError) {
      return NextResponse.json(
        { error: 'Error al crear proveedor: ' + providerError.message },
        { status: 500 }
      );
    }

    // Actualizar estado de solicitud
    const { error: updateError } = await supabase
      .from('provider_requests')
      .update({
        status: 'approved',
        reviewed_at: new Date(),
      })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Error al actualizar solicitud: ' + updateError.message },
        { status: 500 }
      );
    }

    // Enviar email de aprobación
    try {
      await sendProviderApprovalEmail(
        providerRequest.email,
        providerRequest.name
      );
    } catch (emailError) {
      console.error('Error al enviar email:', emailError);
      // No fallar la aprobación si el email falla
    }

    return NextResponse.json(
      {
        message: 'Proveedor aprobado exitosamente y email enviado',
        provider: provider[0],
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
