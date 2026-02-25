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
        <div className="sticky top-16 z-30 w-full bg-background/95 backdrop-blur-md border-b shadow-sm transition-shadow duration-300">
            <div className="container max-w-[1920px] py-4 space-y-4">

                {/* Top Row: Search & Primary Actions */}
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full md:w-auto group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            type="text"
                            placeholder="¿Qué servicio o lugar buscas?"
                            className="pl-10 h-12 text-lg shadow-sm focus-visible:ring-1"
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                    <Button size="lg" className="h-12 px-8 w-full md:w-auto font-bold shadow-md">
                        Buscar
                    </Button>
                </div>

                {/* Bottom Row: Filters */}
                <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">

                    {/* Category Filter */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={`h-10 rounded-full border-muted-foreground/20 hover:border-primary hover:bg-primary/5 transition-colors ${selectedCategories.length > 0 ? "border-primary bg-primary/5 text-primary" : ""}`}>
                                <Filter className="mr-2 h-4 w-4" />
                                Categoría
                                {selectedCategories.length > 0 && (
                                    <Badge variant="secondary" className="ml-2 h-5 rounded-sm px-1 font-normal bg-primary text-primary-foreground">
                                        {selectedCategories.length}
                                    </Badge>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[280px] p-4" align="start">
                            <div className="space-y-4">
                                <h4 className="font-medium leading-none mb-2">Categorías</h4>
                                <div className="grid gap-2">
                                    {categories.map((cat) => (
                                        <div key={cat} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`filter-${cat}`}
                                                checked={selectedCategories.includes(cat)}
                                                onCheckedChange={() => onCategoryChange(cat)}
                                            />
                                            <Label htmlFor={`filter-${cat}`} className="text-sm cursor-pointer flex-1">
                                                {cat}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                                {selectedCategories.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full mt-2 text-muted-foreground hover:text-foreground"
                                        onClick={() => categories.forEach(c => selectedCategories.includes(c) && onCategoryChange(c))}
                                    >
                                        Limpiar categorías
                                    </Button>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Separator orientation="vertical" className="h-8 hidden md:block" />

                    {/* Price Filter */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="h-10 rounded-full border-muted-foreground/20 hover:border-primary hover:bg-primary/5 transition-colors">
                                Precio
                                <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-4" align="start">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium leading-none">Rango de Precio</h4>
                                    <span className="text-sm text-muted-foreground">
                                        Max: ${priceRange[0].toLocaleString()}
                                    </span>
                                </div>
                                <Slider
                                    defaultValue={priceRange}
                                    max={50000}
                                    step={500}
                                    value={priceRange}
                                    onValueChange={onPriceChange}
                                    className="py-4"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>$0</span>
                                    <span>$50,000+</span>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>



                    {/* Rating Filter */}
                    <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-muted-foreground" />
                        <Select value={String(minRating)} onValueChange={(v) => onRatingChange(parseFloat(v))}>
                            <SelectTrigger className="h-10 w-[160px] rounded-full border-muted-foreground/20 hover:border-primary hover:bg-primary/5 transition-colors">
                                <SelectValue placeholder="Rating min." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Cualquier rating</SelectItem>
                                <SelectItem value="4.5">4.5+ estrellas</SelectItem>
                                <SelectItem value="4">4.0+ estrellas</SelectItem>
                                <SelectItem value="3">3.0+ estrellas</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator orientation="vertical" className="h-8 hidden md:block" />

                    {/* Sort By */}
                    <Select onValueChange={onSortChange}>
                        <SelectTrigger className="h-10 w-[200px] rounded-full border-muted-foreground/20 hover:border-primary hover:bg-primary/5 transition-colors">
                            <SelectValue placeholder="Ordenar por..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="recommended">Recomendados</SelectItem>
                            <SelectItem value="price_asc">Precio: Menor a Mayor</SelectItem>
                            <SelectItem value="price_desc">Precio: Mayor a Menor</SelectItem>
                            <SelectItem value="rating">Mejor Calificados</SelectItem>
                        </SelectContent>
                    </Select>

                    <Separator orientation="vertical" className="h-8 hidden md:block" />

                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-colors px-4"
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
