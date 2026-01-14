import { createServerClient } from '@/lib/supabase/server'
import { calculatePotentialXP } from '@/lib/utils/xp-calculator'
import { format } from 'date-fns'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type PublicProfile = {
    id: string
    username: string
    avatar_url: string | null
    domain: string | null
    total_xp: number
    current_streak: number
}

export default async function ProfilePage({ params }: { params: { username: string } }) {
    const supabase = createServerClient()
    const { username } = params

    // Fetch user profile from public view (doesn't expose sensitive data)
    const { data: profile } = await supabase
        .from('public_profiles' as any)
        .select('id, username, avatar_url, domain, total_xp, current_streak')
        .eq('username', username)
        .single() as { data: PublicProfile | null }

    if (!profile) {
        return (
            <div className="w-full pt-8 pb-12 px-6 lg:px-8 max-w-5xl mx-auto text-center">
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Operator Not Found</h1>
                <p className="text-slate-500 mt-4">No operator with username @{username} exists.</p>
                <Link href="/leaderboard" className="mt-8 inline-block px-6 py-3 bg-primary text-black font-bold text-xs uppercase tracking-widest rounded">
                    Back to Leaderboard
                </Link>
            </div>
        )
    }

    // Fetch public logs for this user
    const { data: logs } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', profile.id)
        .eq('is_public', true)
        .order('date', { ascending: false })
        .limit(100)

    return (
        <div className="w-full pt-8 pb-12 px-6 lg:px-8 max-w-5xl mx-auto">
            {/* Profile Header */}
            <header className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6 border-b border-border-dark pb-8">
                <div className="size-20 rounded-full bg-slate-800 overflow-hidden border-2 border-primary/30">
                    {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-2xl">
                            {profile.username?.slice(0, 2).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <p className="text-primary text-[10px] mono-text uppercase tracking-[0.3em] mb-1">{profile.domain} Operator</p>
                    <h1 className="text-4xl font-black tracking-tighter uppercase text-white">@{profile.username}</h1>
                    <div className="flex gap-6 mt-4">
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Total XP</p>
                            <p className="text-xl font-bold text-primary mono-text">{profile.total_xp?.toLocaleString() || 0}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Current Streak</p>
                            <p className="text-xl font-bold text-orange-500 mono-text flex items-center gap-1">
                                <span className="material-symbols-outlined text-lg">local_fire_department</span>
                                {profile.current_streak || 0}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Public Logs</p>
                            <p className="text-xl font-bold text-white mono-text">{logs?.length || 0}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Public Logs */}
            <section>
                <h2 className="text-lg font-black uppercase tracking-tight text-white mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">history</span>
                    War Logs
                </h2>

                {logs && logs.length > 0 ? (
                    <div className="space-y-4">
                        {logs.map((log: any) => {
                            const pillars = []
                            if (log.body_energy) pillars.push({ name: 'Body', value: log.body_energy })
                            if (log.mind_focus) pillars.push({ name: 'Mind', value: log.mind_focus })
                            if (log.money_value > 0) pillars.push({ name: 'Growth', value: log.money_value })
                            if (log.skill_difficulty) pillars.push({ name: 'Skill', value: log.skill_difficulty })

                            const xp = calculatePotentialXP(log)

                            return (
                                <article key={log.id} className="bg-panel-dark border border-border-dark rounded-xl p-6 hover:border-primary/30 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-white font-bold mono-text">{format(new Date(log.date), 'EEEE, MMM dd, yyyy')}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded text-xs font-bold text-primary mono-text">
                                            +{xp} XP
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-3 mb-4">
                                        {pillars.map(p => (
                                            <div key={p.name} className="px-3 py-2 bg-surface border border-border rounded">
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest">{p.name}</p>
                                                <p className="text-lg font-bold text-white mono-text">{p.value}{p.name === 'Growth' ? '' : '/5'}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {log.war_log && (
                                        <p className="text-slate-400 text-sm leading-relaxed italic border-l-2 border-primary/30 pl-4">
                                            "{log.war_log}"
                                        </p>
                                    )}

                                    {log.image_url && (
                                        <div className="mt-4 rounded-lg overflow-hidden border border-border-dark">
                                            <img src={log.image_url} alt="Proof" className="w-full max-h-64 object-cover" />
                                        </div>
                                    )}
                                </article>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 border border-dashed border-border-dark rounded-xl text-slate-500 uppercase tracking-widest text-xs">
                        No public logs available
                    </div>
                )}
            </section>
        </div>
    )
}
