// c:\clone_marlen\canto_proyect\frontend\src\lib\email-service.ts
// Servicio para enviar emails de notificación

import nodemailer from 'nodemailer';

// Configuración del transporte (ajusta según tu proveedor)
const getTransporter = () => {
  // Usar Resend (recomendado para Next.js)
  if (process.env.RESEND_API_KEY) {
    return {
      host: 'smtp.resend.dev',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: process.env.RESEND_API_KEY,
      },
    };
  }

  // Fallback: Gmail u otro SMTP
  return {
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  };
};

export interface EmailData {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

/**
 * Envía un email usando nodemailer
 * Nota: Configura las variables de entorno según tu proveedor
 */
export async function sendEmail(data: EmailData): Promise<void> {
  try {
    const transporter = nodemailer.createTransport(getTransporter());

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@canto.com',
      to: data.to,
      subject: data.subject,
      html: data.htmlContent,
      text: data.textContent || data.htmlContent.replace(/<[^>]*>/g, ''),
    });

    console.log(`Email enviado a: ${data.to}`);
  } catch (error) {
    console.error('Error al enviar email:', error);
    throw error;
  }
}

/**
 * Email de aprobación de solicitud de proveedor
 */
export async function sendProviderApprovalEmail(
  providerEmail: string,
  providerName: string,
  tempPassword?: string
): Promise<void> {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">¡Bienvenido a Canto!</h1>
      </div>

      <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
        <h2>Hola ${providerName},</h2>

        <p>
          ¡Excelente noticia! Tu solicitud para ser proveedor en nuestra plataforma 
          <strong>ha sido aprobada</strong> ✅
        </p>

        <p>
          Ahora puedes acceder a tu cuenta y completar tu perfil con la información 
          específica de tu categoría de servicio.
        </p>

        <div style="background-color: #fff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Tus credenciales de acceso:</h3>
          <p><strong>Email:</strong> ${providerEmail}</p>
          ${tempPassword ? `<p><strong>Contraseña temporal:</strong> ${tempPassword}</p>` : ''}
          <p style="color: #6b7280; font-size: 12px;">
            ⚠️ Si recibiste una contraseña temporal, por favor cámbiala en la primera sesión.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/provider/profile"
             style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Acceder a Mi Cuenta
          </a>
        </div>

        <h3>Próximos pasos:</h3>
        <ol>
          <li>Inicia sesión en tu cuenta</li>
          <li>Completa tu perfil con la información de tu servicio</li>
          <li>Agrega fotos y descripción de tu negocio</li>
          <li>¡Comienza a recibir reservas!</li>
        </ol>

        <p style="color: #6b7280; font-size: 14px;">
          Si tienes preguntas, no dudes en contactarnos en: <strong>soporte@canto.com</strong>
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          © 2026 Canto. Todos los derechos reservados.
        </p>
      </div>
    </div>
  `;

  await sendEmail({
    to: providerEmail,
    subject: '✅ Tu solicitud ha sido aprobada - Bienvenido a Canto',
    htmlContent,
  });
}

/**
 * Email de rechazo de solicitud de proveedor
 */
export async function sendProviderRejectionEmail(
  providerEmail: string,
  providerName: string,
  rejectionReason: string
): Promise<void> {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">Solicitud Revisada</h1>
      </div>

      <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
        <h2>Hola ${providerName},</h2>

        <p>
          Lamentablemente, después de revisar tu solicitud para ser proveedor en Canto, 
          hemos decidido <strong>no aprovecharla en este momento</strong>.
        </p>

        <div style="background-color: #fff; padding: 20px; border: 1px solid #fee2e2; border-left: 4px solid #ef4444; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #991b1b;">Razón:</h3>
          <p>${rejectionReason}</p>
        </div>

        <p>
          Entendemos que esto puede ser decepcionante, pero nos ayuda a mantener la calidad 
          de nuestros servicios. Si crees que hay un error o deseas apelar esta decisión, 
          no dudes en contactarnos.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="mailto:soporte@canto.com"
             style="background-color: #6b7280; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Contactar Soporte
          </a>
        </div>

        <p style="color: #6b7280; font-size: 14px;">
          Email de soporte: <strong>soporte@canto.com</strong>
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          © 2026 Canto. Todos los derechos reservados.
        </p>
      </div>
    </div>
  `;

  await sendEmail({
    to: providerEmail,
    subject: '📋 Actualización sobre tu solicitud en Canto',
    htmlContent,
  });
}

/**
 * Email de recordatorio para completar perfil
 */
export async function sendCompleteProfileReminder(
  providerEmail: string,
  providerName: string
): Promise<void> {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">Completa tu Perfil</h1>
      </div>

      <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
        <h2>Hola ${providerName},</h2>

        <p>
          Notamos que aún no has completado tu perfil en Canto. 
          ¡Esto es importante para que recibas reservas!
        </p>

        <p>
          Te falta:
        </p>
        <ul>
          <li>Información de tu servicio</li>
          <li>Fotos del evento / negocio</li>
          <li>Horarios de disponibilidad</li>
          <li>Precios y paquetes</li>
        </ul>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/provider/profile"
             style="background-color: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Completar Perfil Ahora
          </a>
        </div>

        <p style="color: #6b7280; font-size: 14px;">
          Si tienes dudas, contáctanos: <strong>soporte@canto.com</strong>
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          © 2026 Canto. Todos los derechos reservados.
        </p>
      </div>
    </div>
  `;

  await sendEmail({
    to: providerEmail,
    subject: '📝 Completa tu perfil en Canto para recibir reservas',
    htmlContent,
  });
}
