import { createServerClient } from '@/lib/supabase/server'
import GridFeed from '@/components/social/GridFeed'
import { calculatePotentialXP } from '@/lib/utils/xp-calculator'

export const dynamic = 'force-dynamic'

export default async function GridPage() {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch Public Logs with User Info and Respect Counts
    const { data: logs, error } = await supabase
        .from('daily_logs')
        .select(`
        *,
        users (username, avatar_url, domain),
        respect_reactions (user_id)
    `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50)

    if (!logs) return <div className="p-12 text-center text-red-500">GRID OFFLINE</div>

    const formattedLogs = logs.map((log: any) => {
        const pillars = []
        if (log.body_energy) pillars.push('Body')
        if (log.mind_focus) pillars.push('Mind')
        if (log.money_value > 0) pillars.push('Growth')
        if (log.skill_difficulty) pillars.push('Skill')

        const hasRespected = user ? log.respect_reactions.some((r: any) => r.user_id === user.id) : false

        return {
            id: log.id,
            username: log.users?.username || 'Unknown',
            avatar_url: log.users?.avatar_url,
            domain: log.users?.domain || 'Operator',
            date: log.date,
            pillars,
            war_log: log.war_log,
            image_url: log.image_url,
            xp: calculatePotentialXP(log), // Helper reuse
            respect_count: log.respect_reactions.length,
            has_respected: hasRespected
        }
    })

    return (
        <div className="w-full pt-8 pb-12 px-6 lg:px-8 max-w-7xl mx-auto">
            <header className="mb-10">
                <p className="text-primary text-[10px] mono-text uppercase tracking-[0.3em] mb-2">Global Feed</p>
                <h2 className="text-4xl font-black tracking-tighter uppercase text-white">The Grid</h2>
                <p className="text-slate-500 text-sm mt-2 max-w-xl">Live operational updates from the network.</p>
            </header>

            <GridFeed initialLogs={formattedLogs} />
        </div>
    )
}
