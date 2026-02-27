// c:\clone_marlen\canto_proyect\frontend\src\lib\provider-auth.ts
// Utilidades para autenticación y autorización de proveedores

import { createClient } from '@/lib/supabase/client';

export interface ProviderStatus {
  isProvider: boolean;
  isApproved: boolean;
  profileCompleted: boolean;
  categoryId?: number;
  categoryName?: string;
  needsCompleteProfile: boolean;
}

/**
 * Obtiene el estado de aprobación y perfil de un proveedor
 */
export async function getProviderStatus(userId: string): Promise<ProviderStatus> {
  const supabase = createClient();

  try {
    // Consultar tabla providers
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select(
        `
        approved_at,
        profile_completed,
        category_id,
        categories(name)
        `
      )
      .eq('id', userId)
      .single();

    if (providerError || !provider) {
      return {
        isProvider: false,
        isApproved: false,
        profileCompleted: false,
        needsCompleteProfile: false,
      };
    }

    const isApproved = provider.approved_at !== null;
    const profileCompleted = provider.profile_completed === true;
    let categoryName: string | undefined;

    if (provider.categories) {
      if (Array.isArray(provider.categories)) {
        categoryName = (provider.categories as any[])[0]?.name;
      } else {
        categoryName = (provider.categories as any)?.name;
      }
    }

    return {
      isProvider: true,
      isApproved,
      profileCompleted,
      categoryId: provider.category_id,
      categoryName,
      needsCompleteProfile: isApproved && !profileCompleted,
    };
  } catch (error) {
    console.error('Error getting provider status:', error);
    return {
      isProvider: false,
      isApproved: false,
      profileCompleted: false,
      needsCompleteProfile: false,
    };
  }
}

/**
 * Verifica si un usuario es proveedor aprobado
 */
export async function isApprovedProvider(userId: string): Promise<boolean> {
  const status = await getProviderStatus(userId);
  return status.isApproved;
}

/**
 * Verifica si el perfil del proveedor está completo
 */
export async function isProfileComplete(userId: string): Promise<boolean> {
  const status = await getProviderStatus(userId);
  return status.profileCompleted;
}

/**
 * Obtiene la categoría de un proveedor
 */
export async function getProviderCategory(userId: string): Promise<{
  categoryId: number;
  categoryName: string;
} | null> {
  const status = await getProviderStatus(userId);

  if (!status.isProvider || !status.categoryId || !status.categoryName) {
    return null;
  }

  return {
    categoryId: status.categoryId,
    categoryName: status.categoryName,
  };
}
