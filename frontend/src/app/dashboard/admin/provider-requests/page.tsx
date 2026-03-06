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

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminProviderRequestsPage() {
  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin">
          <Button variant="outline" size="icon" className="border-purple-500/30 hover:bg-purple-500/20 hover:text-white bg-[#1a103c]/50 text-slate-300">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-transparent bg-clip-text pb-1">Solicitudes de Proveedores</h1>
          <p className="text-slate-400 mt-1">
            Revisa y aprueba las solicitudes de nuevos proveedores en la plataforma
          </p>
        </div>
      </div>

      <Card className="bg-[#1a103f]/60 backdrop-blur-xl border-indigo-500/20 shadow-lg shadow-indigo-900/10">
        <CardHeader>
          <CardTitle className="text-indigo-300">Gestión de Solicitudes</CardTitle>
          <CardDescription className="text-slate-400">
            Administra todas las solicitudes de registro de proveedores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProviderRequestsList />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-yellow-900/20 border-yellow-500/30 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-yellow-400">Solicitudes Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-400">0</p>
            <p className="text-xs text-yellow-500/70 mt-1">Requieren acción</p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-900/20 border-emerald-500/30 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-emerald-400">Aprobadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-400">0</p>
            <p className="text-xs text-emerald-500/70 mt-1">Proveedores activos</p>
          </CardContent>
        </Card>

        <Card className="bg-rose-900/20 border-rose-500/30 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-rose-400">Rechazadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-rose-400">0</p>
            <p className="text-xs text-rose-500/70 mt-1">Solicitudes rechazadas</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
