"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User as UserIcon, Home, LogOut } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { CartSheet } from "@/components/shared/cart-sheet"
import { NotificationBell } from "@/components/shared/notification-bell"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState } from "react"

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    // Style Update : Dark Glassmorphism 
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0F1216]/80 backdrop-blur-xl text-white shadow-lg shadow-black/20">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2 group">
            <div className="bg-ls-cyan/10 p-1.5 rounded-lg border border-ls-cyan/20 group-hover:bg-ls-cyan/20 transition-colors shadow-[0_0_10px_rgba(0,250,255,0.1)]">
              <Home className="h-5 w-5 text-ls-cyan group-hover:drop-shadow-[0_0_8px_rgba(0,250,255,0.5)] transition-all" />
            </div>
            <span className="font-bold text-white hidden sm:inline-block font-outfit text-xl tracking-tight">Local_Space</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {user?.role === 'provider' ? (
              <Link
                href="/dashboard/provider"
                className="transition-colors text-white/70 hover:text-ls-cyan hover:drop-shadow-[0_0_8px_rgba(0,250,255,0.5)] font-inter font-medium"
              >
                Ir a mi Panel
              </Link>
            ) : (
              <>
                <Link
                  href="/marketplace"
                  className="transition-colors text-white/70 hover:text-ls-cyan hover:drop-shadow-[0_0_8px_rgba(0,250,255,0.5)] font-inter font-medium"
                >
                  Catálogo
                </Link>
                <Link
                  href="/providers"
                  className="transition-colors text-white/70 hover:text-ls-cyan hover:drop-shadow-[0_0_8px_rgba(0,250,255,0.5)] font-inter font-medium"
                >
                  Proveedor
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Mobile Menu Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <button
              className="mr-2 px-0 text-base md:hidden text-white hover:bg-white/10 hover:text-ls-cyan outline-none focus:ring-2 focus:ring-ls-cyan inline-flex items-center justify-center p-2 rounded-md transition-colors"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0 bg-[#0F1216]/95 backdrop-blur-xl border-r border-white/10 text-white shadow-2xl">
            <Link href="/" className="flex items-center text-white mb-6">
              <div className="bg-ls-cyan/10 p-1.5 rounded-lg border border-ls-cyan/20 mr-3 shadow-[0_0_10px_rgba(0,250,255,0.1)]">
                <Home className="h-5 w-5 text-ls-cyan" />
              </div>
              <span className="font-bold font-outfit text-xl tracking-tight">Local_Space</span>
            </Link>
            <nav className="flex flex-col gap-3 mt-4 pr-6">
              {user?.role === 'provider' ? (
                <Link
                  href="/dashboard/provider"
                  className="block px-4 py-3 text-lg font-outfit text-ls-cyan bg-ls-cyan/5 rounded-xl border border-ls-cyan/20 shadow-[0_0_15px_rgba(0,250,255,0.05)]"
                >
                  Ir a mi Panel
                </Link>
              ) : (
                <>
                  <Link
                    href="/marketplace"
                    className="block px-4 py-3 text-lg text-white/80 hover:text-ls-cyan hover:bg-white/5 rounded-xl transition-colors border border-transparent font-inter"
                  >
                    Catálogo
                  </Link>
                  <Link
                    href="/providers"
                    className="block px-4 py-3 text-lg text-white/80 hover:text-ls-cyan hover:bg-white/5 rounded-xl transition-colors border border-transparent font-inter"
                  >
                    Proveedor
                  </Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search bar placeholder */}
          </div>
          <nav className="flex items-center gap-2 min-h-[32px]">
            <NotificationBell />
            {user?.role !== 'provider' && <CartSheet />}
            {mounted ? (
              isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="relative h-8 w-8 rounded-full hover:bg-white/10 outline-none focus:ring-2 focus:ring-ls-cyan/50 ring-offset-0 transition-all group">
                      <Avatar className="h-8 w-8 ring-2 ring-transparent group-hover:ring-ls-cyan/50 transition-all">
                        <AvatarImage src={user?.avatar_url || "/avatars/01.png"} alt={user?.name} />
                        <AvatarFallback className="bg-[#1A1F25] text-ls-cyan font-bold border border-ls-cyan/20">
                          {user?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-[#1A1F25]/95 backdrop-blur-xl text-white border border-white/10 shadow-2xl rounded-xl" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal font-inter">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none text-white">{user?.name} {user?.lastname}</p>
                        <p className="text-xs leading-none text-white/50">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    {user?.role !== 'provider' && (
                      <DropdownMenuItem asChild className="focus:bg-white/5 focus:text-ls-cyan text-white cursor-pointer font-inter transition-colors">
                        <Link href="/dashboard/user/profile">
                          Perfil
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user?.role === 'provider' && (
                      <DropdownMenuItem asChild className="focus:bg-white/5 focus:text-ls-cyan text-white cursor-pointer font-inter transition-colors">
                        <Link href="/dashboard/provider">
                          Mi Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem
                      onSelect={(e) => { e.preventDefault(); setShowLogoutDialog(true); }}
                      className="focus:bg-red-500/10 focus:text-red-400 text-red-400 cursor-pointer font-inter transition-colors"
                    >
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-ls-cyan font-inter transition-colors">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="ls-btn-cta h-9 px-4 font-inter text-sm shadow-[0_0_10px_rgba(0,250,255,0.2)] hover:shadow-[0_0_15px_rgba(0,250,255,0.4)]">
                      Registrarse
                    </Button>
                  </Link>
                </>
              )
            ) : (
              <div className="w-[140px] h-8" /> // Placeholder to prevent layout shift
            )}
          </nav>
        </div>
      </div>

      {/* Logout Confirmation Dialog (Premium Glassmorphism) */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent
          className="sm:max-w-[400px] border-white/10 text-white shadow-2xl backdrop-blur-2xl bg-[#0f1216]/95 overflow-hidden p-0"
        >
          {/* Subtle gradient glow behind the content */}
          <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 to-transparent pointer-events-none" />

          <div className="p-6 pt-8">
            <DialogHeader className="flex flex-col items-center text-center space-y-3 relative z-10">
              <div className="h-14 w-14 rounded-full bg-red-500/10 border border-red-500/20 flex flex-col items-center justify-center mb-2 shadow-[0_0_15px_rgba(239,68,68,0.15)] hidden sm:flex">
                {/* <LogOut className="h-6 w-6 text-red-500 ml-1" /> */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out text-red-500 ml-1"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
              </div>
              <DialogTitle className="font-outfit text-2xl font-bold text-white tracking-wide">
                ¿Cerrar Sesión?
              </DialogTitle>
              <DialogDescription className="text-white/60 font-inter text-sm max-w-[280px] mx-auto leading-relaxed">
                Estás a punto de salir de tu cuenta. Tendrás que iniciar sesión la próxima vez que ingreses.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="gap-3 sm:gap-3 mt-8 relative z-10 flex-col sm:flex-row w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLogoutDialog(false)}
                className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white transition-all rounded-xl h-11 font-medium"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowLogoutDialog(false);
                  logout();
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white border-0 shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all rounded-xl h-11 font-medium"
              >
                Cerrar Sesión
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )
}
