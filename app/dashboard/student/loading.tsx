export default function StudentDashboardLoading() {
    return (
        <div className="space-y-6 animate-pulse p-1">
            <div className="first-letter:flex items-center justify-between space-y-2 mb-8">
                <div className="space-y-2">
                    <div className="h-8 w-64 bg-muted/60 rounded" />
                    <div className="h-4 w-96 bg-muted/40 rounded" />
                </div>
                <div className="h-10 w-32 bg-muted/60 rounded" />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 rounded-xl bg-muted/20 border border-muted/30" />
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-3 h-96">
                <div className="md:col-span-2 rounded-xl bg-muted/20 border border-muted/30" />
                <div className="rounded-xl bg-muted/20 border border-muted/30" />
            </div>
        </div>
    );
}
