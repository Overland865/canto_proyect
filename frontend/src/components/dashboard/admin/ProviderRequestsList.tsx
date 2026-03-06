// c:\clone_marlen\canto_proyect\frontend\src\components\dashboard\admin\ProviderRequestsList.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Category {
  name: string;
  description: string;
}

interface ProviderRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  category_id: number;
  categories: Category;
  status: string;
  created_at: string;
  rejection_reason?: string;
}

export function ProviderRequestsList() {
  const [requests, setRequests] = useState<ProviderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/provider-requests?status=${filter}`);
      if (!response.ok) throw new Error('Error al cargar solicitudes');

      const data = await response.json();
      setRequests(data.data || []);
    } catch (err) {
      toast.error('Error al cargar las solicitudes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setApproving(id);
    try {
      const response = await fetch(`/api/admin/provider-requests/${id}/approve`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Error al aprobar solicitud');

      toast.success('Proveedor aprobado exitosamente');
      setRequests(requests.filter((r) => r.id !== id));
    } catch (err) {
      toast.error('Error al aprobar la solicitud');
      console.error(err);
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Debe proporcionar una razón de rechazo');
      return;
    }

    setRejecting(id);
    try {
      const response = await fetch(`/api/admin/provider-requests/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejection_reason: rejectionReason }),
      });

      if (!response.ok) throw new Error('Error al rechazar solicitud');

      toast.success('Solicitud rechazada');
      setRequests(requests.filter((r) => r.id !== id));
      setRejectionReason('');
    } catch (err) {
      toast.error('Error al rechazar la solicitud');
      console.error(err);
    } finally {
      setRejecting(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <Button
          variant="outline"
          className={filter === 'pending' ? 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700 hover:text-white' : 'border-indigo-500/30 hover:bg-indigo-500/20 hover:text-white bg-[#1a103c]/40 text-indigo-300'}
          onClick={() => setFilter('pending')}
        >
          Pendientes
        </Button>
        <Button
          variant="outline"
          className={filter === 'approved' ? 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700 hover:text-white' : 'border-indigo-500/30 hover:bg-indigo-500/20 hover:text-white bg-[#1a103c]/40 text-indigo-300'}
          onClick={() => setFilter('approved')}
        >
          Aprobadas
        </Button>
        <Button
          variant="outline"
          className={filter === 'rejected' ? 'bg-rose-600 text-white border-rose-500 hover:bg-rose-700 hover:text-white' : 'border-indigo-500/30 hover:bg-indigo-500/20 hover:text-white bg-[#1a103c]/40 text-indigo-300'}
          onClick={() => setFilter('rejected')}
        >
          Rechazadas
        </Button>
      </div>

      {loading ? (
        <p className="text-center text-indigo-400">Cargando solicitudes...</p>
      ) : requests.length === 0 ? (
        <p className="text-center text-slate-400">No hay solicitudes en este estado</p>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request.id} className="bg-[#0f0920]/50 border-indigo-500/30 transition-all hover:border-indigo-500/50">
              <CardHeader className="pb-3 border-b border-indigo-500/10 mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-white group-hover:text-indigo-300 transition-colors">{request.name}</CardTitle>
                    <CardDescription className="text-slate-400">{request.email}</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">{request.categories.name}</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-slate-400">Teléfono</p>
                    <p className="font-medium text-slate-200">{request.phone}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Solicitado hace</p>
                    <p className="font-medium text-slate-200">
                      {formatDistanceToNow(new Date(request.created_at), {
                        locale: es,
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-slate-400 text-sm mb-2">Descripción de categoría</p>
                  <p className="text-sm text-slate-200">{request.categories.description}</p>
                </div>

                {request.rejection_reason && (
                  <div className="bg-rose-900/20 border border-rose-500/30 p-3 rounded">
                    <p className="text-rose-400 text-sm font-medium mb-1">Razón del rechazo</p>
                    <p className="text-sm text-slate-300">{request.rejection_reason}</p>
                  </div>
                )}

                {filter === 'pending' && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleApprove(request.id)}
                      disabled={approving === request.id}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {approving === request.id ? 'Aprobando...' : 'Aprobar'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setRejecting(request.id)}
                      disabled={rejecting === request.id}
                      className="flex-1 bg-rose-600/10 border-rose-500/30 hover:bg-rose-600/20 text-rose-400"
                    >
                      {rejecting === request.id ? 'Rechazando...' : 'Rechazar'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={rejecting !== null} onOpenChange={() => setRejecting(null)}>
        <AlertDialogContent className="bg-[#1a103c] border-purple-500/30 text-white">
          <AlertDialogTitle className="text-white">Rechazar solicitud</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            <div className="space-y-3 mt-2">
              <p>¿Por qué deseas rechazar esta solicitud?</p>
              <textarea
                className="w-full border border-indigo-500/30 rounded p-2 bg-[#0f0920]/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Proporciona una razón clara..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end mt-4">
            <AlertDialogCancel className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white mt-0">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => rejecting && handleReject(rejecting)}
              className="bg-gradient-to-r from-red-600 to-rose-600 text-white hover:opacity-90 transition-opacity"
            >
              Rechazar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
