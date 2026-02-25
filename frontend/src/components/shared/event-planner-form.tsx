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
        <form onSubmit={handleSubmit} className="flex flex-col h-full w-full max-w-full overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-6 pb-6">

                <div className="text-center space-y-1 mb-6 mt-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="mx-auto bg-primary/10 w-14 h-14 flex items-center justify-center rounded-full mb-3 shadow-sm ring-4 ring-primary/5">
                        <Sparkles className="text-primary w-7 h-7 animate-pulse" />
                    </div>
                    <h3 className="font-bold text-xl text-slate-900 tracking-tight">Detalles de tu Evento</h3>
                    <p className="text-sm text-muted-foreground px-4">Configura los datos clave para encontrar los mejores servicios.</p>
                </div>

                <div className="space-y-5 px-1 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100 fill-mode-both">
                    <div className="space-y-2">
                        <Label htmlFor="eventName" className="text-sm font-semibold text-slate-700">Nombre del Evento</Label>
                        <Input
                            id="eventName"
                            className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-base hover:border-primary/50"
                            placeholder="Ej. Boda de Ana y Luis..."
                            value={eventName}
                            onChange={(e) => setEventName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700">Fecha</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal h-11 bg-slate-50 border-slate-200 hover:bg-white hover:text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all text-sm",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                                        {date ? format(date, "PPP", { locale: es }) : <span>Elegir fecha</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 z-[100] shadow-xl border-slate-200" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                        disabled={(day) => day < new Date(new Date().setHours(0, 0, 0, 0))}
                                        className="bg-white rounded-md"
                                    />
                                </PopoverContent>
                            </Popover>
                            {/* Hidden input to enforce requirement natively just in case */}
                            <input type="text" className="h-0 w-0 absolute opacity-0" required value={date ? date.toISOString() : ""} onChange={() => { }} tabIndex={-1} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="time" className="text-sm font-semibold text-slate-700">Hora</Label>
                            <div className="relative group">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                                <Input
                                    id="time"
                                    type="time"
                                    className="h-11 pl-9 pr-3 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-sm w-full dark:[color-scheme:light] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="budget" className="text-sm font-semibold text-slate-700">Presupuesto máx.</Label>
                            <div className="relative group">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                                <Input
                                    id="budget"
                                    type="number"
                                    min="0"
                                    className="h-11 pl-9 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-base hover:border-primary/50"
                                    placeholder="0.00"
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="guests" className="text-sm font-semibold text-slate-700">Total Invitados</Label>
                            <div className="relative group">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                                <Input
                                    id="guests"
                                    type="number"
                                    min="1"
                                    className="h-11 pl-9 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-base hover:border-primary/50"
                                    placeholder="Ej. 100"
                                    value={guests}
                                    onChange={(e) => setGuests(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className={`mt-2 p-4 rounded-xl border-2 transition-all duration-300 shadow-sm ${requiresVenue ? "border-primary/40 bg-primary/5 ring-4 ring-primary/5" : "border-slate-100 bg-slate-50/50"}`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-md transition-colors ${requiresVenue ? "bg-primary/20 text-primary" : "bg-slate-200 text-slate-500"}`}>
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <Label className="text-sm font-bold cursor-pointer text-slate-800" htmlFor="venue-switch">¿Requieres rentar local?</Label>
                            </div>
                            <Switch
                                id="venue-switch"
                                checked={requiresVenue}
                                onCheckedChange={setRequiresVenue}
                                className="data-[state=checked]:bg-primary"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground ml-9 leading-relaxed">
                            {requiresVenue
                                ? "Te ayudaremos a encontrar el salón o jardín ideal para tu cantidad de invitados."
                                : "Desactiva esto si el evento será en tu casa o en un lugar que ya rentaste."}
                        </p>
                    </div>

                    {!requiresVenue && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300 pt-2">
                            <Label htmlFor="venueAddress" className="text-sm font-semibold text-slate-700">Dirección del Evento</Label>
                            <div className="relative group">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                                <Input
                                    id="venueAddress"
                                    className="h-11 pl-9 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all text-base hover:border-primary/50"
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

            <div className="pt-4 mt-auto bg-background flex items-center justify-between gap-3 sticky bottom-0 z-10 border-t">
                <Button type="button" variant="outline" className="flex-1 h-12 text-base font-semibold border-slate-200 hover:bg-slate-50" onClick={onComplete}>
                    Cancelar
                </Button>
                <Button type="submit" className="flex-1 h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                    Guardar Plan
                </Button>
            </div>
        </form>
    )
}
