// c:\clone_marlen\canto_proyect\frontend\src\app\dashboard\admin\provider-requests\page.tsx

import { ProviderRequestsList } from '@/components/dashboard/admin/ProviderRequestsList';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const metadata = {
  title: 'Solicitudes de Proveedores',
  description: 'Aprueba o rechaza solicitudes de proveedores',
};

export default function AdminProviderRequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Solicitudes de Proveedores</h1>
        <p className="text-gray-600 mt-2">
          Revisa y aprueba las solicitudes de nuevos proveedores en la plataforma
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestión de Solicitudes</CardTitle>
          <CardDescription>
            Administra todas las solicitudes de registro de proveedores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProviderRequestsList />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-700">0</p>
            <p className="text-xs text-yellow-600 mt-1">Requieren acción</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-700">0</p>
            <p className="text-xs text-green-600 mt-1">Proveedores activos</p>
          </CardContent>
        </Card>

        <Card className="bg-red-50">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Rechazadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-700">0</p>
            <p className="text-xs text-red-600 mt-1">Solicitudes rechazadas</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
