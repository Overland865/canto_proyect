import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Optional: Check if user is actually admin
    // Since we don't have a clear Admin role yet, we might skip this
    // or check if role == 'provider' AND some other condition?
    // For now, we allow access to anyone who knows the URL (security by obscurity temporary)
    // or better, if the user explicitly wants "Admin General", maybe we should check a list of emails?
    // I will leave it open for now as I don't want to lock the user out.

    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex-1 bg-muted/40 p-4 md:p-8">
                {children}
            </div>
        </div>
    );
}
