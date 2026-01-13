'use client'

import { startOfYear, eachDayOfInterval, format, getDay, parseISO, isSameDay } from 'date-fns'

export type HeatmapDataPoint = {
    date: string
    xp: number
}

// XP Level Color Mapping
const getColor = (xp: number) => {
    if (xp === 0) return '#0e1117'
    if (xp <= 20) return '#1e293b'
    if (xp <= 40) return '#334155'
    if (xp <= 60) return '#475569'
    if (xp <= 80) return '#64748b'
    return '#10b981' // 81+
}

export default function Heatmap({ data }: { data: HeatmapDataPoint[] }) {
    const today = new Date()
    // Show last 365 days or just current year? "Heatmap (365-day GitHub-style grid)" implies continuous.
    // Usually easier to show current year or fixed 52 weeks. 
    // Let's do last 365 days approach.
    const startDate = new Date()
    startDate.setDate(today.getDate() - 364)

    const dates = eachDayOfInterval({
        start: startDate,
        end: today
    })

    // Group by weeks for the grid
    const weeks: Date[][] = []
    let currentWeek: Date[] = []

    // Pad the first week if startDate isn't Sunday
    // GitHub starts week on Sunday (row 0)
    // We want columns to be weeks.
    // Actually simpler: 7 rows (Sun-Sat), ~52 columns.

    // We can just iterate days and place them.
    // However, CSS Grid is easier if we just render cells and let grid-auto-flow: column handle it with strict 7 rows.

    return (
        <div className="mb-8 w-full overflow-x-auto pb-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
                <span className="w-1 h-3 bg-white block"></span>
                Operational Consistency (365 Days)
            </h3>

            <div className="min-w-[800px] flex gap-2">
                {/* Y-Axis Labels */}
                <div className="flex flex-col justify-between text-[9px] text-slate-600 font-mono py-[2px] h-[98px]">
                    <span>Mon</span>
                    <span>Wed</span>
                    <span>Fri</span>
                </div>

                {/* Grid */}
                <div
                    className="grid grid-rows-7 grid-flow-col gap-[3px]"
                    style={{ height: '98px' }} // 7 * 10px + 6 * 4px gap ~= 98px? 
                // 7 rows * (10px cell + 3px gap) = 91px. 
                >
                    {/* Add empty filler cells for days before start date to align start day correctly? 
                        Actually standard heatmap starts from a specific day.
                        If we want "Last 365 days", main issue is alignment.
                        Let's just render 365 cells.
                        Date-fns 'getDay' returns 0 for Sunday.
                    */}
                    {dates.map((day) => {
                        const dateStr = format(day, 'yyyy-MM-dd')
                        const log = data.find(d => d.date === dateStr)
                        const xp = log?.xp || 0

                        return (
                            <div
                                key={dateStr}
                                className="size-[10px] rounded-[2px] transition-all hover:scale-125 hover:z-10 relative group"
                                style={{ backgroundColor: getColor(xp) }}
                            >
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 whitespace-nowrap bg-black text-white text-[10px] px-2 py-1 rounded border border-border-dark shadow-xl font-mono pointer-events-none">
                                    <p>{format(day, 'MMM d, yyyy')}</p>
                                    <p className="text-primary font-bold">{xp} XP</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
