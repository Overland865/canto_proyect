import { Badge } from "@/components/ui/badge"

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className="container py-20 max-w-3xl mx-auto">
                <div className="mb-12">
                    <Badge variant="secondary" className="mb-4">Legal</Badge>
                    <h1 className="text-4xl font-bold tracking-tight mb-3">Términos y Condiciones</h1>
                    <p className="text-muted-foreground">Última actualización: 19 de febrero de 2026</p>
                </div>

                <div className="prose prose-slate max-w-none space-y-8 text-slate-700">
                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">1. Aceptación de los Términos</h2>
                        <p className="leading-relaxed">Al acceder y utilizar la plataforma Local_Space, aceptas quedar vinculado por estos Términos y Condiciones. Si no estás de acuerdo con alguna parte de estos términos, no podrás acceder al servicio.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">2. Descripción del Servicio</h2>
                        <p className="leading-relaxed">Local_Space es una plataforma digital que conecta a usuarios con proveedores de servicios para eventos sociales y empresariales. Actuamos como intermediario y no somos responsables directos de los servicios ofrecidos por los proveedores.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">3. Registro de Cuenta</h2>
                        <p className="leading-relaxed">Para utilizar ciertas funcionalidades, deberás crear una cuenta proporcionando información veraz y completa. Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades bajo tu cuenta.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">4. Proveedores</h2>
                        <p className="leading-relaxed">Los proveedores deben someterse a un proceso de verificación antes de publicar sus servicios. Local_Space se reserva el derecho de rechazar o suspender cuentas de proveedores que no cumplan con nuestros estándares de calidad.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">5. Pagos y Precios</h2>
                        <p className="leading-relaxed">Los precios de los servicios son establecidos por los proveedores. Los pagos se procesan de forma segura a través de Stripe. Local_Space puede cobrar una comisión por el uso de la plataforma.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">6. Cancelaciones y Reembolsos</h2>
                        <p className="leading-relaxed">Las políticas de cancelación y reembolso varían según cada proveedor. Recomendamos revisar estas políticas antes de confirmar una reserva. Local_Space facilitará la comunicación entre las partes.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">7. Limitación de Responsabilidad</h2>
                        <p className="leading-relaxed">Local_Space no será responsable por daños directos, indirectos, incidentales o consecuentes que resulten del uso de la plataforma o de los servicios contratados a través de ella.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">8. Modificaciones</h2>
                        <p className="leading-relaxed">Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación. El uso continuado de la plataforma constituye aceptación de los nuevos términos.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">9. Contacto</h2>
                        <p className="leading-relaxed">Para preguntas sobre estos términos, contáctanos en: <a href="mailto:legal@localspace.mx" className="text-primary hover:underline">legal@localspace.mx</a></p>
                    </section>
                </div>
            </div>
        </div>
    )
}
