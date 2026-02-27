// c:\clone_marlen\canto_proyect\frontend\src\app\api\admin\provider-requests\[id]\reject\route.ts
// Rechazar solicitud de proveedor

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { sendProviderRejectionEmail } from '@/lib/email-service';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { rejection_reason } = body;

    if (!rejection_reason) {
      return NextResponse.json(
        { error: 'La razón de rechazo es requerida' },
        { status: 400 }
      );
    }

    // Actualizar estado de solicitud
    const { error: updateError } = await supabase
      .from('provider_requests')
      .update({
        status: 'rejected',
        rejection_reason,
        reviewed_at: new Date(),
      })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Error al rechazar solicitud: ' + updateError.message },
        { status: 500 }
      );
    }

    // Obtener email del proveedor para enviar notificación
    const { data: requestData } = await supabase
      .from('provider_requests')
      .select('name, email')
      .eq('id', id)
      .single();

    if (requestData) {
      try {
        await sendProviderRejectionEmail(
          requestData.email,
          requestData.name,
          rejection_reason
        );
      } catch (emailError) {
        console.error('Error al enviar email de rechazo:', emailError);
        // No fallar la operación si el email falla
      }
    }

    return NextResponse.json(
      { message: 'Solicitud rechazada y email de notificación enviado' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
