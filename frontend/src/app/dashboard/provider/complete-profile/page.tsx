// c:\clone_marlen\canto_proyect\frontend\src\app\dashboard\provider\complete-profile\page.tsx

import { ProfileCompletionForm } from '@/components/forms/ProfileCompletionForm';

export const metadata = {
  title: 'Completar Perfil',
  description: 'Completa tu perfil como proveedor',
};

export default function CompleteProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="container mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Último paso</h1>
          <p className="text-gray-600">
            Completa tu información para comenzar a recibir reservas en Canto
          </p>
        </div>

        <ProfileCompletionForm />

        <div className="mt-12 max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm">
                ✓
              </div>
              <p className="ml-2 font-semibold text-green-700">Solicitud Aprobada</p>
            </div>
            <p className="text-xs text-gray-600">Tu solicitud ha sido aceptada</p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 md:border-blue-400 md:bg-blue-50">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <p className="ml-2 font-semibold text-blue-700">Completando Perfil</p>
            </div>
            <p className="text-xs text-gray-600">Rellena esta información</p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <p className="ml-2 font-semibold text-gray-400">Listo para Reservas</p>
            </div>
            <p className="text-xs text-gray-600">Comienza a recibir solicitides</p>
          </div>
        </div>
      </div>
    </div>
  );
}
