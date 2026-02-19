import { Badge } from "@/components/ui/badge"

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className="container py-20 max-w-3xl mx-auto">
                <div className="mb-12">
                    <Badge variant="secondary" className="mb-4">Legal</Badge>
                    <h1 className="text-4xl font-bold tracking-tight mb-3">Política de Privacidad</h1>
                    <p className="text-muted-foreground">Última actualización: 19 de febrero de 2026</p>
                </div>

                <div className="prose prose-slate max-w-none space-y-8 text-slate-700">
                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">1. Información que Recopilamos</h2>
                        <p className="leading-relaxed">Recopilamos información que nos proporcionas directamente al crear una cuenta (nombre, email, teléfono), al realizar reservas, y al configurar tu perfil. También recopilamos datos de uso de la plataforma de forma automática.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">2. Uso de la Información</h2>
                        <p className="leading-relaxed">Utilizamos tu información para:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Gestionar tu cuenta y reservas</li>
                            <li>Conectarte con proveedores de servicios</li>
                            <li>Procesar pagos de forma segura</li>
                            <li>Enviarte notificaciones sobre tus solicitudes</li>
                            <li>Mejorar nuestros servicios</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">3. Compartir Información</h2>
                        <p className="leading-relaxed">No vendemos tu información personal a terceros. Compartimos solo la información necesaria con los proveedores para coordinar servicios, y con procesadores de pago (Stripe) para completar transacciones.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">4. Seguridad de los Datos</h2>
                        <p className="leading-relaxed">Implementamos medidas de seguridad técnicas y organizativas para proteger tu información, incluyendo cifrado SSL, autenticación segura a través de Supabase, y acceso restringido a datos sensibles.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">5. Cookies</h2>
                        <p className="leading-relaxed">Utilizamos cookies esenciales para mantener tu sesión activa y mejorar tu experiencia de navegación. No utilizamos cookies de seguimiento de terceros para publicidad.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">6. Tus Derechos</h2>
                        <p className="leading-relaxed">Tienes derecho a acceder, corregir o eliminar tu información personal en cualquier momento desde la configuración de tu cuenta. Para solicitudes adicionales, contáctanos en privacidad@localspace.mx.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">7. Retención de Datos</h2>
                        <p className="leading-relaxed">Conservamos tu información mientras tu cuenta esté activa o según sea necesario para cumplir con obligaciones legales. Puedes solicitar la eliminación de tu cuenta en cualquier momento.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">8. Cambios a esta Política</h2>
                        <p className="leading-relaxed">Podemos actualizar esta política periódicamente. Te notificaremos sobre cambios significativos por email o mediante un aviso en la plataforma.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">9. Contacto</h2>
                        <p className="leading-relaxed">Para preguntas sobre privacidad: <a href="mailto:privacidad@localspace.mx" className="text-primary hover:underline">privacidad@localspace.mx</a></p>
                    </section>
                </div>
            </div>
        </div>
    )
}
