// c:\clone_marlen\canto_proyect\frontend\src\components\forms\ProfileCompletionForm.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { BanqueteroForm } from './BanqueteroForm';
import { RentadorLocalServiceForm } from './RentadorLocalServiceForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

interface Provider {
  id: string;
  category_id: number;
  profile_completed: boolean;
}

type FormComponentType = typeof BanqueteroForm | typeof RentadorLocalServiceForm | null;

export function ProfileCompletionForm() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [provider, setProvider] = useState<Provider | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completionStep, setCompletionStep] = useState(0);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchProviderData = async () => {
      try {
        // Obtener datos del proveedor
        const { data: providerData, error: providerError } = await supabase
          .from('providers')
          .select('id, category_id, profile_completed')
          .eq('id', user.id)
          .single();

        if (providerError || !providerData) {
          setError('No se encontraron datos de proveedor');
          return;
        }

        // Si el perfil ya está completado, redirigir al dashboard
        if (providerData.profile_completed) {
          router.push('/dashboard/provider');
          return;
        }

        setProvider(providerData);

        // Obtener categoría
        const { data: categoryData } = await supabase
          .from('categories')
          .select('*')
          .eq('id', providerData.category_id)
          .single();

        if (categoryData) {
          setCategory(categoryData);
        }
      } catch (err) {
        console.error(err);
        setError('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    fetchProviderData();
  }, [user, router, supabase]);

  const handleCompletion = async () => {
    try {
      // Marcar perfil como completado
      const { error } = await supabase
        .from('providers')
        .update({ profile_completed: true })
        .eq('id', user?.id);

      if (error) throw error;

      toast.success('¡Perfil completado! Redirigiendo al dashboard...');

      // Redirigir al dashboard
      setTimeout(() => {
        router.push('/dashboard/provider');
      }, 1500);
    } catch (err) {
      toast.error('Error al completar perfil');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">Cargando información...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !provider || !category) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertDescription>{error || 'Error al cargar información'}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Seleccionar el formulario correcto según la categoría
  const getCategoryForm = () => {
    const slug = category?.slug.toLowerCase();
    
    switch (slug) {
      case 'banquetero':
        return <BanqueteroForm onComplete={handleCompletion} />;
      case 'rentador-local':
        return <RentadorLocalServiceForm onComplete={handleCompletion} />;
      default:
        return (
          <Alert>
            <AlertDescription>
              Categoría no tiene formulario específico todavía. Por favor contacta soporte.
            </AlertDescription>
          </Alert>
        );
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Completa tu Perfil</CardTitle>
        <CardDescription>
          Información específica de tu categoría: <strong>{category?.name}</strong>
        </CardDescription>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${completionStep}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Alert className="bg-blue-50">
          <AlertDescription>
            <strong>Importante:</strong> Completa todos los campos para que tu perfil sea visible
            en el marketplace y puedas recibir reservas.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {getCategoryForm()}
        </div>
      </CardContent>
    </Card>
  );
}
