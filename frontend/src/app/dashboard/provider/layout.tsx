"use client"

import { Navbar } from "@/components/shared/navbar"

export default function ProviderDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div
            className="flex flex-col min-h-screen"
            style={{ backgroundColor: "#0F1216" }}
        >
            {/* Decorative radial blobs */}
            <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-0">
                <div
                    className="ls-blob absolute rounded-full"
                    style={{
                        width: 500,
                        height: 500,
                        top: -150,
                        left: -150,
                        background: "radial-gradient(circle, rgba(0,82,212,0.14) 0%, transparent 70%)",
                    }}
                />
                <div
                    className="ls-blob-delay absolute rounded-full"
                    style={{
                        width: 600,
                        height: 600,
                        top: -200,
                        right: -200,
                        background: "radial-gradient(circle, rgba(0,82,212,0.10) 0%, transparent 70%)",
                    }}
                />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1 w-full p-4 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
