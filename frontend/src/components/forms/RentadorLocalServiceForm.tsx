'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface RentadorLocalServiceFormProps {
  onComplete?: () => void;
}

export function RentadorLocalServiceForm({ onComplete }: RentadorLocalServiceFormProps) {
  const { user } = useAuth();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    venueName: '',
    description: '',
    capacity: '',
    squareMeters: '',
    pricePerHour: '',
    pricePerDay: '',
    location: '',
    amenities: '',
    parking: '',
    catering: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (
      !formData.venueName.trim() ||
      !formData.description.trim() ||
      !formData.capacity ||
      !formData.pricePerHour
    ) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);

    try {
      // Actualizar datos en tabla de servicios
      const { error: updateError } = await supabase
        .from('provider_services')
        .upsert(
          {
            provider_id: user?.id,
            category: 'rentador-local',
            service_name: formData.venueName,
            description: formData.description,
            capacity: parseInt(formData.capacity),
            square_meters: parseInt(formData.squareMeters) || null,
            price_per_hour: parseFloat(formData.pricePerHour),
            price_per_day: formData.pricePerDay ? parseFloat(formData.pricePerDay) : null,
            location: formData.location,
            amenities: formData.amenities,
            parking_available: formData.parking.toLowerCase().includes('sí') ||
              formData.parking.toLowerCase().includes('yes'),
            catering_allowed: formData.catering.toLowerCase().includes('sí') ||
              formData.catering.toLowerCase().includes('yes'),
            updated_at: new Date(),
          },
          { onConflict: 'provider_id' }
        );

      if (updateError) {
        throw updateError;
      }

      toast.success('¡Perfil completado exitosamente!');

      // Llamar callback si existe
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Información del Local</CardTitle>
        <CardDescription>
          Proporciona detalles sobre tu espacio disponible para alquilar
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="venueName">Nombre del Local *</Label>
            <Input
              id="venueName"
              name="venueName"
              placeholder="Mi Salón de Eventos"
              value={formData.venueName}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción del Espacio *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe tu local, estilo, capacidad de adaptación, servicios..."
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Ubicación/Dirección</Label>
            <Textarea
              id="location"
              name="location"
              placeholder="Ciudad, zona, referencias de ubicación"
              value={formData.location}
              onChange={handleChange}
              disabled={loading}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidad Máxima *</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                placeholder="Ej: 200"
                value={formData.capacity}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="squareMeters">Metros Cuadrados</Label>
              <Input
                id="squareMeters"
                name="squareMeters"
                type="number"
                placeholder="Ej: 500"
                value={formData.squareMeters}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pricePerHour">Precio por Hora (€) *</Label>
              <Input
                id="pricePerHour"
                name="pricePerHour"
                type="number"
                step="0.01"
                placeholder="Ej: 50"
                value={formData.pricePerHour}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricePerDay">Precio por Día (€)</Label>
              <Input
                id="pricePerDay"
                name="pricePerDay"
                type="number"
                step="0.01"
                placeholder="Ej: 300"
                value={formData.pricePerDay}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amenities">Amenidades</Label>
            <Textarea
              id="amenities"
              name="amenities"
              placeholder="Ej: Aire acondicionado, Catering interno, Escenario, Iluminación LED..."
              value={formData.amenities}
              onChange={handleChange}
              disabled={loading}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parking">¿Tiene Estacionamiento? (Sí/No)</Label>
            <Input
              id="parking"
              name="parking"
              placeholder="Sí/No, y describe detalles si es necesario"
              value={formData.parking}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="catering">¿Permite Catering Externo? (Sí/No)</Label>
            <Input
              id="catering"
              name="catering"
              placeholder="Sí/No, con restricciones si aplica"
              value={formData.catering}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Guardando...' : 'Completar Perfil'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
