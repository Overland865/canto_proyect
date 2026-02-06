import Link from "next/link"

export function Footer() {
    return (
        <footer className="border-t bg-muted/40">
            <div className="container flex flex-col gap-8 py-8 md:flex-row md:py-12">
                <div className="flex-1 space-y-4">
                    <h2 className="font-bold">Local_Space</h2>
                    <p className="text-sm text-balance leading-relaxed text-muted-foreground max-w-xs">
                        Centralizando la organización de eventos. Encuentra todo lo que necesitas en un solo lugar.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
                    <div className="flex flex-col gap-2">
                        <h3 className="font-semibold">Plataforma</h3>
                        <Link href="/marketplace" className="text-sm text-muted-foreground hover:underline">
                            Explorar
                        </Link>
                        <Link href="/pricing" className="text-sm text-muted-foreground hover:underline">
                            Precios
                        </Link>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h3 className="font-semibold">Soporte</h3>
                        <Link href="/help" className="text-sm text-muted-foreground hover:underline">
                            Ayuda
                        </Link>
                        <Link href="/contact" className="text-sm text-muted-foreground hover:underline">
                            Contacto
                        </Link>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h3 className="font-semibold">Legal</h3>
                        <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
                            Términos
                        </Link>
                        <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
                            Privacidad
                        </Link>
                    </div>
                </div>
            </div>
            <div className="container border-t py-6">
                <p className="text-center text-sm text-muted-foreground">
                    © 2024 Local_Space. Todos los derechos reservados.
                </p>
            </div>
        </footer>
    )
}
