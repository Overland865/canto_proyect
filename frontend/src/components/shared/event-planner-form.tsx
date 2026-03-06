"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useCart } from "@/context/cart-context"
import { Calendar as CalendarIcon, Clock, DollarSign, Users, MapPin, Sparkles, Building2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function EventPlannerForm({ onComplete }: { onComplete: () => void }) {
    const { eventPlan, setEventPlan } = useCart()

    const [eventName, setEventName] = useState(eventPlan?.eventName || "")
    const [date, setDate] = useState<Date | undefined>(eventPlan?.date ? new Date(eventPlan.date + "T00:00:00") : undefined)
    const [time, setTime] = useState(eventPlan?.time || "")
    const [budget, setBudget] = useState(eventPlan?.budget ? eventPlan.budget.toString() : "")
    const [guests, setGuests] = useState(eventPlan?.guests ? eventPlan.guests.toString() : "")
    const [requiresVenue, setRequiresVenue] = useState(eventPlan ? eventPlan.requiresVenue : true)
    const [venueAddress, setVenueAddress] = useState(eventPlan?.venueAddress || "")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!date) return

        setEventPlan({
            eventName,
            date: format(date, "yyyy-MM-dd"),
            time,
            budget: Number(budget) || 0,
            guests: Number(guests) || 0,
            requiresVenue,
            venueAddress: requiresVenue ? undefined : venueAddress,
        })

        onComplete()
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full w-full overflow-hidden text-white pt-6">
            <div className="flex-1 overflow-y-auto space-y-6 pb-6 px-1 custom-scrollbar overflow-x-hidden">

                <div className="text-center space-y-2 mb-6 mt-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="mx-auto bg-ls-cyan/10 w-14 h-14 flex items-center justify-center rounded-full mb-3 shadow-[0_0_15px_rgba(0,250,255,0.15)] ring-1 ring-ls-cyan/20">
                        <Sparkles className="text-ls-cyan w-6 h-6 animate-pulse" />
                    </div>
                    <h3 className="font-bold text-xl text-white font-outfit tracking-tight">Detalles de tu Evento</h3>
                    <p className="text-sm text-white/60 font-inter px-4">Configura los datos clave para encontrar los mejores servicios.</p>
                </div>

                <div className="space-y-5 px-1 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100 fill-mode-both">
                    <div className="space-y-2">
                        <Label htmlFor="eventName" className="text-sm font-semibold text-white/80 font-inter">Nombre del Evento</Label>
                        <Input
                            id="eventName"
                            className="h-11 ls-input bg-black/40 border-white/10 text-white placeholder-white/40 focus:bg-black/60 focus:ring-2 focus:ring-ls-cyan/30 focus:border-ls-cyan/50 transition-all font-inter text-base"
                            placeholder="Ej. Boda de Ana y Luis..."
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-white/80 font-inter">Fecha</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal h-11 bg-black/40 border-white/10 hover:bg-ls-cyan/5 hover:text-white focus:ring-2 focus:ring-ls-cyan/30 focus:border-ls-cyan/50 transition-all text-sm font-inter text-white",
                                            !date && "text-white/40 font-inter"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-white/40 group-hover:text-ls-cyan transition-colors" />
                                        {date ? format(date, "PPP", { locale: es }) : <span>Elegir fecha</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 z-[100] shadow-xl border-white/10 bg-[#1A1F25] text-white" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                        disabled={(day) => day < new Date(new Date().setHours(0, 0, 0, 0))}
                                        className="bg-[#1A1F25] text-white rounded-md"
                                    />
                                </PopoverContent>
                            </Popover>
                            {/* Hidden input to enforce requirement natively just in case */}
                            <input type="text" className="h-0 w-0 absolute opacity-0" required value={date ? date.toISOString() : ""} onChange={() => { }} tabIndex={-1} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="time" className="text-sm font-semibold text-white/80 font-inter">Hora</Label>
                            <div className="relative group">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-ls-cyan transition-colors pointer-events-none z-10" />
                                <Input
                                    id="time"
                                    type="time"
                                    className="h-11 pl-9 pr-3 bg-black/40 border-white/10 text-white placeholder-white/40 focus:bg-black/60 focus:ring-2 focus:ring-ls-cyan/30 focus:border-ls-cyan/50 transition-all text-sm w-full dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full font-inter"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="budget" className="text-sm font-semibold text-white/80 font-inter">Presupuesto máx.</Label>
                            <div className="relative group">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-ls-lemon transition-colors pointer-events-none" />
                                <Input
                                    id="budget"
                                    type="number"
                                    min="0"
                                    className="ls-input h-11 pl-9 bg-black/40 border-white/10 text-white placeholder-white/40 focus:bg-black/60 focus:ring-2 focus:ring-ls-cyan/30 focus:border-ls-cyan/50 transition-all text-base hover:border-white/20 font-inter"
                                    placeholder="0.00"
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="guests" className="text-sm font-semibold text-white/80 font-inter">Total Invitados</Label>
                            <div className="relative group">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-ls-cyan transition-colors pointer-events-none" />
                                <Input
                                    id="guests"
                                    type="number"
                                    min="1"
                                    className="ls-input h-11 pl-9 bg-black/40 border-white/10 text-white placeholder-white/40 focus:bg-black/60 focus:ring-2 focus:ring-ls-cyan/30 focus:border-ls-cyan/50 transition-all text-base hover:border-white/20 font-inter"
                                    placeholder="Ej. 100"
                                    value={guests}
                                    onChange={(e) => setGuests(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className={`mt-2 p-4 rounded-xl border transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)] ${requiresVenue ? "border-ls-cyan/40 bg-ls-cyan/5" : "border-white/5 bg-black/40"}`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-md transition-colors ${requiresVenue ? "bg-ls-cyan/20 text-ls-cyan" : "bg-white/5 text-white/40"}`}>
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <Label className="text-sm font-bold cursor-pointer text-white font-inter" htmlFor="venue-switch">¿Requieres rentar local?</Label>
                            </div>
                            <Switch
                                id="venue-switch"
                                checked={requiresVenue}
                                onCheckedChange={setRequiresVenue}
                                className="data-[state=checked]:bg-ls-cyan"
                            />
                        </div>
                        <p className="text-[13px] text-white/50 ml-9 leading-relaxed font-inter">
                            {requiresVenue
                                ? "Te ayudaremos a encontrar el salón o jardín ideal para tu cantidad de invitados."
                                : "Desactiva esto si el evento será en tu casa o en un lugar que ya rentaste."}
                        </p>
                    </div>

                    {!requiresVenue && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300 pt-2">
                            <Label htmlFor="venueAddress" className="text-sm font-semibold text-white/80 font-inter">Dirección del Evento</Label>
                            <div className="relative group">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-ls-cyan transition-colors pointer-events-none" />
                                <Input
                                    id="venueAddress"
                                    className="ls-input h-11 pl-9 bg-black/40 border-white/10 text-white placeholder-white/40 focus:bg-black/60 focus:ring-2 focus:ring-ls-cyan/30 focus:border-ls-cyan/50 transition-all text-base hover:border-white/20 font-inter"
                                    placeholder="Ej. Av. Reforma 123, Col. Centro"
                                    value={venueAddress}
                                    onChange={(e) => setVenueAddress(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-4 mt-auto border-t border-white/10 bg-[#0F1216]/95 backdrop-blur-md flex items-center justify-between gap-3 sticky bottom-0 z-10 px-1">
                <Button type="button" variant="outline" className="flex-1 h-11 text-base font-inter font-semibold bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white transition-colors" onClick={onComplete}>
                    Cancelar
                </Button>
                <Button type="submit" className="flex-1 h-11 text-base font-inter font-semibold ls-btn-cta shadow-lg shadow-ls-cyan/20">
                    Guardar Plan
                </Button>
            </div>
        </form>
    )
}
