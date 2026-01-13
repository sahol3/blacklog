'use client'

export function StatSkeleton() {
    return (
        <div className="bg-panel-dark border border-border-dark rounded-xl p-6 animate-pulse">
            <div className="h-3 bg-slate-800 rounded w-20 mb-3"></div>
            <div className="h-8 bg-slate-800 rounded w-16 mb-2"></div>
            <div className="h-2 bg-slate-800 rounded w-24"></div>
        </div>
    )
}

export function RingSkeleton() {
    return (
        <div className="bg-panel-dark border border-border-dark rounded-xl p-6 flex flex-col items-center animate-pulse">
            <div className="size-24 rounded-full border-8 border-slate-800 mb-4"></div>
            <div className="h-3 bg-slate-800 rounded w-12"></div>
        </div>
    )
}

export function HeatmapSkeleton() {
    return (
        <div className="bg-panel-dark border border-border-dark rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-slate-800 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-[repeat(52,1fr)] gap-[3px]">
                {Array.from({ length: 364 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-slate-800 rounded-[2px]"></div>
                ))}
            </div>
        </div>
    )
}

export function FeedSkeleton() {
    return (
        <div className="space-y-3">
            {[1, 2, 3].map(i => (
                <div key={i} className="bg-panel-dark border border-border-dark rounded-xl p-4 animate-pulse flex gap-4">
                    <div className="h-4 bg-slate-800 rounded w-24"></div>
                    <div className="h-4 bg-slate-800 rounded w-16"></div>
                    <div className="flex-1"></div>
                    <div className="h-4 bg-slate-800 rounded w-12"></div>
                </div>
            ))}
        </div>
    )
}

export function DashboardSkeleton() {
    return (
        <div className="w-full pt-8 pb-12 px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
            {/* Header Skeleton */}
            <div className="flex justify-between items-end border-b border-border-dark pb-6">
                <div>
                    <div className="h-3 bg-slate-800 rounded w-24 mb-2 animate-pulse"></div>
                    <div className="h-8 bg-slate-800 rounded w-48 animate-pulse"></div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
            </div>

            {/* Pillar Rings */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <RingSkeleton />
                <RingSkeleton />
                <RingSkeleton />
                <RingSkeleton />
            </div>

            {/* Heatmap */}
            <HeatmapSkeleton />

            {/* Feed */}
            <div>
                <div className="h-5 bg-slate-800 rounded w-32 mb-4 animate-pulse"></div>
                <FeedSkeleton />
            </div>
        </div>
    )
}
