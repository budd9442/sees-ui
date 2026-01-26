export default function DashboardLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Page Header Skeleton */}
            <div className="flex items-center justify-between space-y-2">
                <div className="space-y-2">
                    <div className="h-8 w-64 bg-muted rounded" />
                    <div className="h-4 w-96 bg-muted rounded" />
                </div>
                <div className="h-10 w-32 bg-muted rounded" />
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-xl border bg-card text-card-foreground shadow">
                        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="h-4 w-24 bg-muted rounded" />
                            <div className="h-4 w-4 bg-muted rounded" />
                        </div>
                        <div className="p-6 pt-0">
                            <div className="h-8 w-16 bg-primary/10 rounded mt-2" />
                            <div className="h-3 w-32 bg-muted rounded mt-2" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Grid Skeleton */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl border bg-card p-6">
                    <div className="h-[350px] bg-muted rounded" />
                </div>
                <div className="col-span-3 rounded-xl border bg-card p-6">
                    <div className="h-[350px] bg-muted rounded" />
                </div>
            </div>
        </div>
    );
}
