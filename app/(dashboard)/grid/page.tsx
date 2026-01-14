import { createServerClient } from '@/lib/supabase/server'
import GridFeed from '@/components/social/GridFeed'
import { calculatePotentialXP } from '@/lib/utils/xp-calculator'

export const dynamic = 'force-dynamic'

type PublicLog = {
    id: string
    user_id: string
    date: string
    body_energy: number | null
    mind_focus: number | null
    skill_difficulty: number | null
    war_log: string | null
    image_url: string | null
    created_at: string
    username: string
    avatar_url: string | null
    domain: string | null
}

export default async function GridPage() {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch from public_logs view (secure - no sensitive data)
    const { data: logs } = await supabase
        .from('public_logs' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50) as { data: PublicLog[] | null }

    // Get respect counts separately
    const logIds = logs?.map(l => l.id) || []
    const { data: respects } = await supabase
        .from('respect_reactions')
        .select('log_id, user_id')
        .in('log_id', logIds)

    if (!logs) return <div className="p-12 text-center text-red-500">GRID OFFLINE</div>

    const formattedLogs = logs.map((log) => {
        const pillars = []
        if (log.body_energy) pillars.push('Body')
        if (log.mind_focus) pillars.push('Mind')
        if (log.skill_difficulty) pillars.push('Skill')

        const logRespects = respects?.filter(r => r.log_id === log.id) || []
        const hasRespected = user ? logRespects.some((r: any) => r.user_id === user.id) : false

        return {
            id: log.id,
            username: log.username || 'Unknown',
            avatar_url: log.avatar_url,
            domain: log.domain || 'Operator',
            date: log.date,
            pillars,
            war_log: log.war_log,
            image_url: log.image_url,
            xp: calculatePotentialXP({
                body_energy: log.body_energy,
                mind_focus: log.mind_focus,
                skill_difficulty: log.skill_difficulty,
                money_value: 0 // Hidden for security
            }),
            respect_count: logRespects.length,
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
