import { redirect } from "next/navigation"

export default function AdminDashboardRedirect() {
    // Redirigir la raíz del admin al panel de proveedores (la página que sí existe)
    redirect("/dashboard/admin/providers")
}
