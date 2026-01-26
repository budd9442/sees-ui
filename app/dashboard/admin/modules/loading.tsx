import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/layout/page-header"

export default function Loading() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Module Management"
                description="Create and manage academic modules"
            />

            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-[380px]" />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Modules</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="space-y-4 p-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[100px]" />
                                    <Skeleton className="h-4 w-[200px]" />
                                </div>
                                <Skeleton className="h-8 w-[100px]" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
