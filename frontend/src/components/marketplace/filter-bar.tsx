"use client"

import * as React from "react"
import { Search, Filter, ChevronDown, Check, MapPin, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface FilterBarProps {
    categories: string[]
    selectedCategories: string[]
    onCategoryChange: (category: string) => void
    priceRange: number[]
    onPriceChange: (value: number[]) => void
    searchValue: string
    onSearchChange: (value: string) => void

    minRating: number
    onRatingChange: (value: number) => void
    onSortChange?: (value: string) => void
}

export function FilterBar({
    categories,
    selectedCategories,
    onCategoryChange,
    priceRange,
    onPriceChange,
    searchValue,
    onSearchChange,

    minRating,
    onRatingChange,
    onSortChange
}: FilterBarProps) {
    return (
        <div className="sticky top-16 z-30 w-full bg-[#0F1216]/80 backdrop-blur-xl border-b border-white/10 shadow-lg transition-shadow duration-300">
            <div className="container max-w-[1920px] py-4 space-y-4">

                {/* Top Row: Search & Primary Actions */}
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full md:w-auto group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 group-focus-within:text-ls-cyan transition-colors" />
                        <Input
                            type="text"
                            placeholder="¿Qué servicio o lugar buscas?"
                            className="pl-10 h-12 text-lg ls-input bg-black/40 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-1 focus-visible:ring-ls-cyan shadow-sm"
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                    <Button size="lg" className="h-12 px-8 w-full md:w-auto font-bold shadow-md ls-btn-cta">
                        Buscar
                    </Button>
                </div>

                {/* Bottom Row: Filters */}
                <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">

                    {/* Category Filter */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={`h-10 rounded-full bg-black/40 border-white/20 text-white hover:bg-white/10 hover:text-white transition-colors ${selectedCategories.length > 0 ? "border-ls-cyan bg-ls-cyan/10 text-ls-cyan" : ""}`}>
                                <Filter className="mr-2 h-4 w-4" />
                                Categoría
                                {selectedCategories.length > 0 && (
                                    <Badge variant="secondary" className="ml-2 h-5 rounded-sm px-1 font-normal bg-ls-cyan text-[#0F1216] border-none">
                                        {selectedCategories.length}
                                    </Badge>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[280px] p-4 ls-glass bg-[#1A1F25]/95 border-white/10 shadow-2xl backdrop-blur-xl" align="start">
                            <div className="space-y-4">
                                <h4 className="font-outfit font-medium text-white mb-2">Categorías</h4>
                                <div className="grid gap-2">
                                    {categories.map((cat) => (
                                        <div key={cat} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`filter-${cat}`}
                                                checked={selectedCategories.includes(cat)}
                                                onCheckedChange={() => onCategoryChange(cat)}
                                                className="border-white/30 data-[state=checked]:bg-ls-cyan data-[state=checked]:text-[#0F1216] data-[state=checked]:border-ls-cyan"
                                            />
                                            <Label htmlFor={`filter-${cat}`} className="text-sm cursor-pointer flex-1 text-white/80 hover:text-white transition-colors">
                                                {cat}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                                {selectedCategories.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full mt-2 text-white/60 hover:text-white hover:bg-white/5"
                                        onClick={() => categories.forEach(c => selectedCategories.includes(c) && onCategoryChange(c))}
                                    >
                                        Limpiar categorías
                                    </Button>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Separator orientation="vertical" className="h-8 hidden md:block bg-white/10" />

                    {/* Price Filter */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="h-10 rounded-full bg-black/40 border-white/20 text-white hover:bg-white/10 hover:text-white transition-colors">
                                Precio
                                <ChevronDown className="ml-2 h-4 w-4 text-white/50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-4 ls-glass bg-[#1A1F25]/95 border-white/10 shadow-2xl backdrop-blur-xl" align="start">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-white">
                                    <h4 className="font-outfit font-medium">Rango de Precio</h4>
                                    <span className="text-sm text-ls-lemon font-bold">
                                        Max: ${priceRange[0].toLocaleString()}
                                    </span>
                                </div>
                                <Slider
                                    defaultValue={priceRange}
                                    max={50000}
                                    step={500}
                                    value={priceRange}
                                    onValueChange={onPriceChange}
                                    className="py-4 [&_[role=slider]]:border-ls-cyan [&_[role=slider]]:bg-ls-cyan [&>.relative>.absolute]:bg-ls-cyan"
                                />
                                <div className="flex justify-between text-xs text-white/50">
                                    <span>$0</span>
                                    <span>$50,000+</span>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>



                    {/* Rating Filter */}
                    <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-ls-golden" />
                        <Select value={String(minRating)} onValueChange={(v) => onRatingChange(parseFloat(v))}>
                            <SelectTrigger className="h-10 w-[160px] rounded-full bg-black/40 border-white/20 text-white hover:bg-white/10 transition-colors">
                                <SelectValue placeholder="Rating min." />
                            </SelectTrigger>
                            <SelectContent className="ls-glass bg-[#1A1F25]/95 border-white/10 shadow-2xl text-white">
                                <SelectItem value="0" className="focus:bg-white/10 focus:text-white">Cualquier rating</SelectItem>
                                <SelectItem value="4.5" className="focus:bg-white/10 focus:text-white">4.5+ estrellas</SelectItem>
                                <SelectItem value="4" className="focus:bg-white/10 focus:text-white">4.0+ estrellas</SelectItem>
                                <SelectItem value="3" className="focus:bg-white/10 focus:text-white">3.0+ estrellas</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator orientation="vertical" className="h-8 hidden md:block bg-white/10" />

                    {/* Sort By */}
                    <Select onValueChange={onSortChange}>
                        <SelectTrigger className="h-10 w-[200px] rounded-full bg-black/40 border-white/20 text-white hover:bg-white/10 transition-colors">
                            <SelectValue placeholder="Ordenar por..." />
                        </SelectTrigger>
                        <SelectContent className="ls-glass bg-[#1A1F25]/95 border-white/10 shadow-2xl text-white">
                            <SelectItem value="recommended" className="focus:bg-white/10 focus:text-white">Recomendados</SelectItem>
                            <SelectItem value="price_asc" className="focus:bg-white/10 focus:text-white">Precio: Menor a Mayor</SelectItem>
                            <SelectItem value="price_desc" className="focus:bg-white/10 focus:text-white">Precio: Mayor a Menor</SelectItem>
                            <SelectItem value="rating" className="focus:bg-white/10 focus:text-white">Mejor Calificados</SelectItem>
                        </SelectContent>
                    </Select>

                    <Separator orientation="vertical" className="h-8 hidden md:block bg-white/10" />

                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors px-4"
                        onClick={() => {
                            onCategoryChange("clear_all");
                            onPriceChange([50000]);
                            onRatingChange(0);
                            onSearchChange("");
                            if (onSortChange) onSortChange("recommended");
                        }}
                    >
                        Limpiar filtros
                    </Button>

                </div>
            </div>
        </div>
    )
}
