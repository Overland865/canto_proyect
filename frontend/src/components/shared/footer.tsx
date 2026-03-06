import Link from "next/link"

export function Footer() {
    return (
        <footer className="border-t border-white/10 bg-[#0F1216]">
            <div className="container flex flex-col gap-8 py-10 md:flex-row md:py-16">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center space-x-2">
                        <span className="font-bold text-white font-outfit text-xl tracking-tight">Local_Space</span>
                    </div>
                    <p className="text-sm text-balance leading-relaxed text-white/50 max-w-xs font-inter">
                        Centralizando la organización de eventos. Encuentra todo lo que necesitas en un solo lugar.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
                    <div className="flex flex-col gap-3">
                        <h3 className="font-semibold text-white font-outfit">Plataforma</h3>
                        <Link href="/marketplace" className="text-sm text-white/50 hover:text-ls-cyan hover:drop-shadow-[0_0_8px_rgba(0,250,255,0.5)] transition-all font-inter">
                            Explorar
                        </Link>
                        <Link href="/pricing" className="text-sm text-white/50 hover:text-ls-cyan hover:drop-shadow-[0_0_8px_rgba(0,250,255,0.5)] transition-all font-inter">
                            Precios
                        </Link>
                    </div>
                    <div className="flex flex-col gap-3">
                        <h3 className="font-semibold text-white font-outfit">Soporte</h3>
                        <Link href="/help" className="text-sm text-white/50 hover:text-ls-cyan hover:drop-shadow-[0_0_8px_rgba(0,250,255,0.5)] transition-all font-inter">
                            Ayuda
                        </Link>
                        <Link href="/contact" className="text-sm text-white/50 hover:text-ls-cyan hover:drop-shadow-[0_0_8px_rgba(0,250,255,0.5)] transition-all font-inter">
                            Contacto
                        </Link>
                    </div>
                    <div className="flex flex-col gap-3">
                        <h3 className="font-semibold text-white font-outfit">Legal</h3>
                        <Link href="/terms" className="text-sm text-white/50 hover:text-ls-cyan hover:drop-shadow-[0_0_8px_rgba(0,250,255,0.5)] transition-all font-inter">
                            Términos
                        </Link>
                        <Link href="/privacy" className="text-sm text-white/50 hover:text-ls-cyan hover:drop-shadow-[0_0_8px_rgba(0,250,255,0.5)] transition-all font-inter">
                            Privacidad
                        </Link>
                    </div>
                </div>
            </div>
            <div className="container border-t border-white/5 py-8">
                <p className="text-center text-sm text-white/40 font-inter">
                    © 2024 Local_Space. Todos los derechos reservados.
                </p>
            </div>
        </footer>
    )
}
