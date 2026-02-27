// c:\clone_marlen\canto_proyect\frontend\src\app\(auth)\provider-register\page.tsx

import { ProviderRegistrationForm } from '@/components/forms/ProviderRegistrationForm';

export const metadata = {
  title: 'Registro de Proveedor',
  description: 'Solicita acceso como proveedor en nuestra plataforma',
};

export default function ProviderRegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Únete a Nuestra Plataforma</h1>
          <p className="text-gray-600">
            ¿Eres un proveedor de servicios? Registrate aquí para empezar a ofrecer tus servicios
          </p>
        </div>

        <ProviderRegistrationForm />

        <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
          <h3 className="font-semibold text-sm mb-2">¿Cómo funciona?</h3>
          <ol className="text-xs space-y-1 text-gray-600">
            <li>1. Completa tu solicitud de registro</li>
            <li>2. Nuestro equipo revisa tu perfil</li>
            <li>3. Te enviamos un email de confirmación</li>
            <li>4. Completa tu perfil y comienza a ofrecer servicios</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
