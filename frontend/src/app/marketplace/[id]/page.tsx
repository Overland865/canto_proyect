import { ServiceDetailContent } from "@/components/marketplace/service-detail-content"
import { Metadata } from 'next'

// Since we are using client contexts to manage state, we still render the detail as a client island.
// But the root page.tsx can now have static or dynamic metadata.
// For dynamic metadata, we would need to fetch the service on the server side too.

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    // In a real production app, we would fetch simple service data here via an edge route or direct supabase call
    // For now, providing a descriptive fallback
    return {
        title: `Servicio en LocalSpace`,
        description: 'Encuentra y reserva los mejores servicios para tus eventos en LocalSpace.',
    }
}

export default function ServiceDetailPage({ params }: { params: { id: string } }) {
    return <ServiceDetailContent id={params.id} />
}
