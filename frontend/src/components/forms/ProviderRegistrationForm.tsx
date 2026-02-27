// c:\clone_marlen\canto_proyect\frontend\src\components\forms\ProviderRegistrationForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export function ProviderRegistrationForm() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category_id: '',
  });

  useEffect(() => {
    // Obtener categorías disponibles
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('Error al cargar categorías');

        const data = await response.json();
        setCategories(data.data || []);
      } catch (err) {
        setError('No se pudieron cargar las categorías');
        console.error(err);
      } finally {
        setFormLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      category_id: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('El email es requerido y debe ser válido');
      return;
    }

    if (!formData.phone.trim()) {
      setError('El teléfono es requerido');
      return;
    }

    if (!formData.category_id) {
      setError('Debe seleccionar una categoría');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/providers/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          category_id: parseInt(formData.category_id),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar solicitud');
      }

      toast.success('¡Solicitud enviada! Recibirás un email cuando sea aprobada.');
      
      // Redirigir después de un pequeño delay
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (formLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">Cargando formulario...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Registro de Proveedor</CardTitle>
        <CardDescription>
          Selecciona tu categoría y proporciona tu información de contacto
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nombre o Razón Social</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Mi Empresa"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="contacto@empresa.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+34 XXX XX XX XX"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría de Servicios</Label>
            <Select value={formData.category_id} onValueChange={handleCategoryChange} disabled={loading}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecciona tu categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-xs text-gray-500">{category.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.category_id && (
            <Alert>
              <AlertDescription>
                {categories
                  .find((c) => c.id.toString() === formData.category_id)
                  ?.description || ''}
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Enviando solicitud...' : 'Enviar Solicitud'}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Tu solicitud será revisada por nuestro equipo administrativo
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
