import { Navbar } from "@/components/shared/navbar"
import { Footer } from "@/components/shared/footer"

export default function MarketplaceLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 bg-slate-50 dark:bg-slate-950">
                {children}
            </main>
            <Footer />
        </div>
    )
}
