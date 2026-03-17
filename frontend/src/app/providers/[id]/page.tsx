import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Star, ShieldCheck, Mail, Phone, Globe, ArrowLeft, Instagram, Facebook, Package2 } from "lucide-react"
import type { Metadata } from "next"

// ─── Data fetching (server-side, no races, no re-renders) ───────────────────

async function getProviderData(id: string) {
    const supabase = await createClient()

    // 1. Profile
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle()

    if (profileError || !profile) return null

    // 2. Business details (non-critical)
    const { data: detail } = await supabase
        .from("provider_profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle()

    // 3. Services — only columns that exist in the DB schema
    const { data: services, error: servicesError } = await supabase
        .from("services")
        .select("id, title, description, price, category, image, gallery, unit, is_active")
        .eq("provider_id", id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })

    console.log(`[ProviderPage] services for provider ${id}:`, services?.length ?? 0, 'error:', servicesError)

    // Build image list
    let images: string[] = ["https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2070&auto=format&fit=crop"]
    if (profile.gallery?.length > 0) images = profile.gallery
    else if (profile.cover_image) images = [profile.cover_image]
    else if (profile.avatar_url) images = [profile.avatar_url]

    return {
        id: profile.id,
        name: detail?.business_name || profile.full_name || "Sin nombre",
        description: profile.description || detail?.description || "Sin descripción disponible.",
        location: detail?.location || "Mérida, Yucatán",
        rating: detail?.rating || 5.0,
        reviews: detail?.reviews_count || 0,
        verified: profile.is_verified || false,
        images,
        categories: detail?.categories || ["Servicios"],
        contact: {
            phone: profile.phone || detail?.contact_phone || null,
            email: profile.email || detail?.contact_email || null,
            website: profile.website || detail?.contact_website || null,
        },
        social: {
            instagram: profile.social_media?.instagram || detail?.social_instagram || null,
            facebook: profile.social_media?.facebook || detail?.social_facebook || null,
        },
        services: services || [],
    }
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params
    const provider = await getProviderData(id)
    return {
        title: provider ? `${provider.name} | LocalSpace` : "Proveedor | LocalSpace",
        description: provider?.description ?? "Perfil de proveedor en LocalSpace.",
    }
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function ProviderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const provider = await getProviderData(id)

    if (!provider) notFound()

    return (
        <div className="min-h-screen bg-[#0F1216] text-white">
            {/* Hero Section */}
            <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
                <img
                    src={provider.images[0]}
                    alt={provider.name}
                    className="object-cover w-full h-full brightness-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F1216] via-[#0F1216]/60 to-transparent" />

                {/* Back button */}
                <div className="absolute top-4 left-4 z-10">
                    <Link href="/providers">
                        <Button variant="ghost" size="sm" className="gap-2 text-white bg-white/5 border border-white/10 hover:border-ls-cyan/50 hover:bg-white/10 hover:text-ls-cyan hover:shadow-[0_0_15px_rgba(0,250,255,0.2)] font-inter font-medium rounded-full px-4 transition-all duration-300 backdrop-blur-md">
                            <ArrowLeft className="w-4 h-4" /> Volver
                        </Button>
                    </Link>
                </div>

                {/* Hero info bar */}
                <div className="container absolute bottom-0 left-1/2 -translate-x-1/2 pb-8 md:pb-12">
                    <div className="flex flex-col md:flex-row gap-6 items-end justify-between">
                        <div className="flex flex-col md:flex-row gap-6 items-end">
                            <div className="relative">
                                <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-[#0F1216] shadow-2xl">
                                    <AvatarImage src={provider.images[0]} alt={provider.name} />
                                    <AvatarFallback className="bg-black/50 text-white text-2xl">{provider.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                {provider.verified && (
                                    <div className="absolute -bottom-2 -right-2 bg-ls-cyan text-black p-1.5 rounded-full shadow-[0_0_15px_rgba(0,250,255,0.4)]" title="Verificado">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 space-y-2 mb-2">
                                <h1 className="text-3xl md:text-5xl font-bold font-outfit text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">{provider.name}</h1>
                                <div className="flex flex-wrap gap-2 items-center text-sm md:text-base text-white/70 bg-black/40 backdrop-blur-md border border-white/10 p-2.5 rounded-xl w-fit font-inter">
                                    <MapPin className="w-4 h-4 text-white/50" /> {provider.location}
                                    <span className="mx-2 text-white/30">•</span>
                                    <div className="flex items-center text-ls-lemon font-bold">
                                        <Star className="w-4 h-4 mr-1 fill-ls-lemon" /> {provider.rating}
                                        <span className="text-white/50 font-normal ml-2">({provider.reviews} reseñas)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 mb-2">
                            <Button size="lg" className="ls-btn-cta min-w-[140px] font-inter border-0">Contactar</Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="container py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content — 2/3 width */}
                <div className="lg:col-span-2 space-y-8">
                    {/* About */}
                    <Card className="ls-glass border-white/5 bg-black/40">
                        <CardHeader className="border-b border-white/5 pb-4">
                            <CardTitle className="font-outfit text-white text-2xl">Sobre Nosotros</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <p className="text-lg leading-relaxed text-white/70 font-inter">{provider.description}</p>
                            <div className="flex flex-wrap gap-2 mt-6">
                                {provider.categories.map((cat: string, i: number) => (
                                    <Badge key={i} variant="outline" className="text-sm px-3 py-1 font-inter bg-white/5 text-white/80 border-white/10">
                                        {cat}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Gallery */}
                    <Card className="ls-glass border-white/5 bg-black/40">
                        <CardHeader className="border-b border-white/5 pb-4">
                            <CardTitle className="font-outfit text-white text-2xl">Galería</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {provider.images.map((img: string, index: number) => (
                                    <div key={index} className="aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/50">
                                        <img
                                            src={img}
                                            alt={`Galería ${index + 1}`}
                                            className="object-cover w-full h-full hover:scale-105 transition-transform duration-500 cursor-pointer opacity-90 hover:opacity-100"
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Services */}
                    <Card className="ls-glass border-white/5 bg-black/40">
                        <CardHeader className="border-b border-white/5 pb-4">
                            <CardTitle className="font-outfit text-white text-2xl flex items-center gap-3">
                                <Package2 className="w-6 h-6 text-ls-cyan" />
                                Servicios Disponibles
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {provider.services.length === 0 ? (
                                <p className="text-white/40 font-inter text-sm text-center py-6">Este proveedor no tiene servicios publicados aún.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {provider.services.map((service: any) => (
                                        <div key={service.id} className="group relative rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02] hover:border-ls-cyan/30 hover:shadow-[0_0_20px_rgba(0,250,255,0.08)] transition-all duration-300">
                                            <div className="relative h-40 overflow-hidden bg-black/60">
                                                <img
                                                    src={service.image || (service.gallery && service.gallery[0]) || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200"}
                                                    alt={service.title}
                                                    className="object-cover w-full h-full brightness-75 group-hover:brightness-100 group-hover:scale-105 transition-all duration-500"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                                <div className="absolute top-3 right-3 bg-ls-lemon/90 text-black text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm shadow-lg">
                                                    ${Number(service.price || 0).toLocaleString("es-MX")}
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-outfit font-semibold text-white text-base mb-1 group-hover:text-ls-cyan transition-colors line-clamp-1">
                                                    {service.title}
                                                </h3>
                                                {service.description && (
                                                    <p className="text-white/50 text-xs font-inter line-clamp-2 leading-relaxed">{service.description}</p>
                                                )}
                                                {service.category && (
                                                    <Badge variant="outline" className="mt-3 text-xs font-inter bg-white/5 text-white/60 border-white/10">
                                                        {service.category}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar — 1/3 width */}
                <div className="space-y-6">
                    {(provider.contact.phone || provider.contact.email || provider.contact.website) && (
                        <Card className="ls-glass border-white/5 bg-black/40">
                            <CardHeader className="border-b border-white/5 pb-4">
                                <CardTitle className="font-outfit text-white text-xl">Contacto</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                <div className="grid grid-cols-1 gap-4">
                                    {provider.contact.phone && (
                                        <a href={`tel:${provider.contact.phone}`} className="flex items-center gap-3 p-3 border border-indigo-500/20 bg-[#1a103c]/30 rounded-lg group hover:border-indigo-400/30 transition-all cursor-pointer overflow-hidden">
                                            <div className="h-10 w-10 shrink-0 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/30 group-hover:scale-110 transition-all">
                                                <Phone className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400">Teléfono</p>
                                                <p className="text-sm font-medium text-slate-200 group-hover:text-blue-300 transition-colors">{provider.contact.phone}</p>
                                            </div>
                                        </a>
                                    )}
                                    {provider.contact.email && (
                                        <a href={`mailto:${provider.contact.email}`} className="flex items-center gap-3 p-3 border border-indigo-500/20 bg-[#1a103c]/30 rounded-lg group hover:border-indigo-400/30 transition-all cursor-pointer overflow-hidden">
                                            <div className="h-10 w-10 shrink-0 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/30 group-hover:scale-110 transition-all">
                                                <Mail className="h-5 w-5" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-xs text-slate-400">Email negocio</p>
                                                <p className="text-sm font-medium text-slate-200 truncate group-hover:text-indigo-300 transition-colors">{provider.contact.email}</p>
                                            </div>
                                        </a>
                                    )}
                                    {provider.contact.website && (
                                        <div className="flex items-center gap-3 p-3 border border-indigo-500/20 bg-[#1a103c]/30 rounded-lg col-span-full group hover:border-indigo-400/30 transition-all overflow-hidden">
                                            <div className="h-10 w-10 shrink-0 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/30 group-hover:scale-110 transition-all">
                                                <Globe className="h-5 w-5" />
                                            </div>
                                            <div className="overflow-hidden w-full">
                                                <p className="text-xs text-slate-400">Sitio Web</p>
                                                <a href={provider.contact.website.startsWith('http') ? provider.contact.website : `https://${provider.contact.website}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-cyan-400 hover:text-cyan-300 hover:underline truncate block">
                                                    {provider.contact.website.replace(/^https?:\/\//, '')}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {(provider.social.instagram || provider.social.facebook) && (
                        <Card className="ls-glass border-white/5 bg-black/40">
                            <CardHeader className="border-b border-white/5 pb-4">
                                <CardTitle className="font-outfit text-white text-xl">Redes Sociales</CardTitle>
                            </CardHeader>
                            <CardContent className="flex gap-2 pt-6">
                                {provider.social.instagram && (
                                    <a href={provider.social.instagram.startsWith('http') ? provider.social.instagram : `https://instagram.com/${provider.social.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-pink-500/30 bg-pink-500/5 hover:bg-pink-500/20 hover:scale-105 hover:shadow-[0_0_15px_rgba(236,72,153,0.3)] transition-all group overflow-hidden">
                                        <Instagram className="h-5 w-5 text-pink-400 group-hover:scale-110 transition-transform shrink-0" />
                                        <span className="text-sm font-medium text-pink-400 truncate hidden sm:block">Instagram</span>
                                    </a>
                                )}
                                {provider.social.facebook && (
                                    <a href={provider.social.facebook.startsWith('http') ? provider.social.facebook : `https://facebook.com/${provider.social.facebook}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/20 hover:scale-105 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all group overflow-hidden">
                                        <Facebook className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform shrink-0" />
                                        <span className="text-sm font-medium text-blue-400 truncate hidden sm:block">Facebook</span>
                                    </a>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
