import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export function ServiceCardSkeleton() {
    return (
        <Card className="h-full overflow-hidden animate-pulse border-muted">
            <div className="relative aspect-[4/3] bg-muted" />
            <CardHeader className="p-4 pb-2 space-y-2">
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="flex gap-2">
                    <div className="h-4 w-1/4 bg-muted rounded" />
                    <div className="h-4 w-1/2 bg-muted rounded" />
                </div>
            </CardHeader>
            <CardFooter className="p-4 pt-0 mt-2 flex justify-between border-t border-dashed">
                <div className="h-6 w-1/4 bg-muted rounded" />
                <div className="h-8 w-1/3 bg-muted rounded" />
            </CardFooter>
        </Card>
    )
}
