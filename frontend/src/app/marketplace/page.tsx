import { Suspense } from "react"
import { MarketplaceContent } from "@/components/marketplace/marketplace-content"
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Catálogo de Servicios | LocalSpace',
    description: 'Explora nuestra amplia variedad de servicios para eventos: locales, banquetes, música y más.',
}

export default function MarketplacePage({ searchParams }: { searchParams: { category?: string, search?: string } }) {
    return (
        <Suspense fallback={<div className="container py-8 flex justify-center text-muted-foreground">Cargando catálogo...</div>}>
            <MarketplaceContent
                initialCategory={searchParams.category}
                initialSearch={searchParams.search}
            />
        </Suspense>
    )
}
