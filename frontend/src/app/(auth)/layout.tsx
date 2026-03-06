export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div
            className="flex min-h-screen items-center justify-center p-4"
            style={{ backgroundColor: "#0F1216" }}
        >
            {/* Decorative radial blobs for auth background */}
            <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-0">
                <div
                    className="ls-blob absolute rounded-full"
                    style={{
                        width: 500, height: 500, top: -150, left: -150,
                        background: "radial-gradient(circle, rgba(0,82,212,0.14) 0%, transparent 70%)"
                    }}
                />
                <div
                    className="ls-blob-delay absolute rounded-full"
                    style={{
                        width: 600, height: 600, bottom: -200, right: -200,
                        background: "radial-gradient(circle, rgba(152,255,0,0.08) 0%, transparent 70%)"
                    }}
                />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {children}
            </div>
        </div>
    )
}
