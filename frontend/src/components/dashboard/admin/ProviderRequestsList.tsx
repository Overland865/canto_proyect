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
          variant={filter === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilter('pending')}
        >
          Pendientes
        </Button>
        <Button
          variant={filter === 'approved' ? 'default' : 'outline'}
          onClick={() => setFilter('approved')}
        >
          Aprobadas
        </Button>
        <Button
          variant={filter === 'rejected' ? 'default' : 'outline'}
          onClick={() => setFilter('rejected')}
        >
          Rechazadas
        </Button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Cargando solicitudes...</p>
      ) : requests.length === 0 ? (
        <p className="text-center text-gray-500">No hay solicitudes en este estado</p>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{request.name}</CardTitle>
                    <CardDescription>{request.email}</CardDescription>
                  </div>
                  <Badge>{request.categories.name}</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Teléfono</p>
                    <p className="font-medium">{request.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Solicitado hace</p>
                    <p className="font-medium">
                      {formatDistanceToNow(new Date(request.created_at), {
                        locale: es,
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-500 text-sm mb-2">Descripción de categoría</p>
                  <p className="text-sm">{request.categories.description}</p>
                </div>

                {request.rejection_reason && (
                  <div className="bg-red-50 p-3 rounded">
                    <p className="text-gray-500 text-sm">Razón del rechazo</p>
                    <p className="text-sm">{request.rejection_reason}</p>
                  </div>
                )}

                {filter === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(request.id)}
                      disabled={approving === request.id}
                      className="flex-1"
                    >
                      {approving === request.id ? 'Aprobando...' : 'Aprobar'}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setRejecting(request.id)}
                      disabled={rejecting === request.id}
                      className="flex-1"
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
        <AlertDialogContent>
          <AlertDialogTitle>Rechazar solicitud</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="space-y-3">
              <p>¿Por qué deseas rechazar esta solicitud?</p>
              <textarea
                className="w-full border rounded p-2 text-black"
                placeholder="Proporciona una razón clara..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </AlertDialogDescription>
          <div className="flex gap-2">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => rejecting && handleReject(rejecting)}
              className="bg-red-600 hover:bg-red-700"
            >
              Rechazar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
