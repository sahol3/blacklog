'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import StatsBar, { Stats } from '@/components/dashboard/StatsBar'
import PillarRings, { PillarAverages } from '@/components/dashboard/PillarRings'
import Heatmap, { HeatmapDataPoint } from '@/components/dashboard/Heatmap'
import PersonalFeed, { FeedLog } from '@/components/dashboard/PersonalFeed'
import { DashboardSkeleton } from '@/components/ui/Skeletons'
import Link from 'next/link'
import { calculatePotentialXP } from '@/lib/utils/xp-calculator'
import { format } from 'date-fns'

// Helper to calc averages
const calcPillarAvg = (logs: any[], field: string) => {
    if (!logs.length) return 0
    // Normalizing 1-5 to 0-100%
    const sum = logs.reduce((acc, log) => acc + (log[field] || 0), 0)
    return (sum / logs.length) * 20
}

export default function DashboardPage() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<Stats>({
        streak: 0,
        totalXP: 0,
        rank: 'Recruit',
        consistency: 0,
        consistencyChange: 0
    })
    const [averages, setAverages] = useState<PillarAverages>({
        body: 0, mind: 0, financial: 0, skill: 0
    })
    const [heatmapData, setHeatmapData] = useState<HeatmapDataPoint[]>([])
    const [feedLogs, setFeedLogs] = useState<FeedLog[]>([])

    const supabase = createClient()

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                // 1. Fetch User Stats
                const { data: userData } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                // 2. Fetch Logs (Last 365)
                // Only select needed fields
                const { data: logs } = await supabase
                    .from('daily_logs')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('date', { ascending: false })
                    .limit(365)

                if (userData && logs) {
                    // Stats
                    setStats({
                        streak: userData.current_streak,
                        totalXP: userData.total_xp,
                        rank: userData.total_xp > 10000 ? 'Vanguard' : userData.total_xp > 5000 ? 'Operative' : 'Recruit',
                        consistency: 98.2, // Mocked for now, strictly needs complex formulation
                        consistencyChange: 0.4
                    })

                    // Heatmap
                    const heatmapPoints = logs.map((log: any) => ({
                        date: log.date,
                        xp: calculatePotentialXP(log) // Re-calculate XP on fly or store it? DB func calculates it. 
                        // Wait, we don't store XP in daily_logs directly, we update user total.
                        // But we CAN calculate it from the log data client side for the heatmap visualization.
                    }))
                    setHeatmapData(heatmapPoints)

                    // Feed (Last 30)
                    const feed = logs.slice(0, 30).map((log: any) => {
                        const pillars = []
                        if (log.body_energy) pillars.push('Body')
                        if (log.mind_focus) pillars.push('Mind')
                        if (log.money_value > 0) pillars.push('Growth')
                        if (log.skill_difficulty) pillars.push('Skill')

                        return {
                            id: log.id,
                            date: log.date,
                            xp: calculatePotentialXP(log),
                            pillars: pillars.slice(0, 2), // Show max 2
                            is_public: log.is_public
                        }
                    })
                    setFeedLogs(feed)

                    // Averages (Last 7 days)
                    const last7 = logs.filter((l: any) => {
                        const d = new Date(l.date)
                        const now = new Date()
                        const diffTime = Math.abs(now.getTime() - d.getTime())
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                        return diffDays <= 7
                    })

                    if (last7.length > 0) {
                        setAverages({
                            body: calcPillarAvg(last7, 'body_energy'),
                            mind: calcPillarAvg(last7, 'mind_focus'),
                            financial: (last7.filter((l: any) => l.money_value > 0).length / 7) * 100, // % of days with money
                            skill: calcPillarAvg(last7, 'skill_difficulty')
                        })
                    }
                }

            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, []) // Empty dep array = run once on mount

    if (loading) return <DashboardSkeleton />

    return (
        <div className="w-full pt-8 pb-12 relative px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none fixed h-full w-full z-0"></div>

            <header className="relative z-10 flex flex-wrap justify-between items-end mb-10 border-b border-border-dark pb-6 gap-4">
                <div className="flex-1">
                    <p className="text-primary text-[10px] mono-text uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                        System Online
                    </p>
                    <div className="flex items-center gap-6">
                        <h2 className="text-3xl font-black tracking-tighter uppercase text-white">Command Center</h2>
                        <Link href="/log" className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded bg-white text-background-dark text-[10px] font-bold uppercase tracking-wider transition-transform active:scale-95 hover:bg-slate-200">
                            <span className="material-symbols-outlined text-sm">add</span>
                            <span>New Log</span>
                        </Link>
                    </div>
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-slate-500 text-[10px] mono-text uppercase tracking-widest">Local Operations Time</p>
                    <p className="text-lg mono-text font-bold text-white">{format(new Date(), 'HH:mm:ss')} <span className="text-slate-600 text-sm">UTC+6</span></p>
                </div>
            </header>

            <StatsBar stats={stats} />
            <PillarRings averages={averages} />
            <Heatmap data={heatmapData} />
            <PersonalFeed logs={feedLogs} />
        </div>
    )
}
