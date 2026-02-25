import { Suspense } from "react"
import { MarketplaceContent } from "@/components/marketplace/marketplace-content"
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Catálogo de Servicios | LocalSpace',
    description: 'Explora nuestra amplia variedad de servicios para eventos: locales, banquetes, música y más.',
}

export default async function MarketplacePage({ searchParams }: { searchParams: Promise<{ category?: string, search?: string }> }) {
    const sp = await searchParams;
    return (
        <Suspense fallback={<div className="container py-8 flex justify-center text-muted-foreground">Cargando catálogo...</div>}>
            <MarketplaceContent
                initialCategory={sp.category}
                initialSearch={sp.search}
            />
        </Suspense>
    )
}
