// c:\clone_marlen\canto_proyect\frontend\src\components\dashboard\ProviderAuthGuard.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { getProviderStatus } from '@/lib/provider-auth';

interface ProviderAuthGuardProps {
  children: React.ReactNode;
}

/**
 * Guard que verifica el estado de aprobación y perfil del proveedor
 * Redirige a /complete-profile si el perfil no está completo
 * Redirige a /login si no es proveedor aprobado
 */
export function ProviderAuthGuard({ children }: ProviderAuthGuardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkProviderStatus = async () => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const status = await getProviderStatus(user.id);

        if (!status.isApproved) {
          // Si no está aprobado, redirigir a homepage
          router.push('/');
          return;
        }

        if (status.needsCompleteProfile) {
          // Si necesita completar perfil y no está en esa página, redirigir
          if (!pathname?.includes('complete-profile')) {
            router.push('/dashboard/provider/complete-profile');
          }
        }

        setAuthorized(true);
      } catch (error) {
        console.error('Error checking provider status:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    checkProviderStatus();
  }, [user, router, pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">No tienes autorización para acceder a esta página</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
