import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function LeaderboardPage() {
    const supabase = createServerClient()

    const { data: players } = await supabase
        .from('users')
        .select('id, username, avatar_url, total_xp, current_streak, domain')
        .order('total_xp', { ascending: false })
        .limit(50)

    return (
        <div className="w-full pt-8 pb-12 px-6 lg:px-8 max-w-5xl mx-auto">
            <header className="mb-10 text-center">
                <p className="text-primary text-[10px] mono-text uppercase tracking-[0.3em] mb-2">Elite Operators</p>
                <h2 className="text-4xl font-black tracking-tighter uppercase text-white">Leaderboard</h2>
            </header>

            <div className="bg-panel-dark border border-border-dark rounded-xl overflow-hidden shadow-2xl">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-surface border-b border-border-dark text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <div className="col-span-1">Rank</div>
                    <div className="col-span-6 md:col-span-5">Operator</div>
                    <div className="col-span-3 md:col-span-2 text-right">XP</div>
                    <div className="col-span-2 md:col-span-2 text-center">Streak</div>
                    <div className="hidden md:block md:col-span-2 text-right">Domain</div>
                </div>

                <div className="divide-y divide-border-dark">
                    {players?.map((player: any, index: number) => (
                        <Link
                            key={player.id}
                            href={`/profile/${player.username}`}
                            className={`grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-white/5 transition-colors cursor-pointer ${index < 3 ? 'bg-gradient-to-r from-primary/5 to-transparent' : ''}`}
                        >
                            <div className="col-span-1">
                                <span className={`font-black mono-text text-lg ${index === 0 ? 'text-amber-500' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-amber-700' : 'text-slate-600'}`}>
                                    #{index + 1}
                                </span>
                            </div>
                            <div className="col-span-6 md:col-span-5 flex items-center gap-4">
                                <div className="size-10 rounded-full bg-slate-800 overflow-hidden border border-border-dark">
                                    {player.avatar_url ? (
                                        <img src={player.avatar_url} alt={player.username} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-xs">
                                            {player.username?.slice(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm tracking-tight">@{player.username}</p>
                                    {index === 0 && <span className="text-[9px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded font-bold uppercase mt-1 inline-block">King</span>}
                                </div>
                            </div>
                            <div className="col-span-3 md:col-span-2 text-right">
                                <p className="text-primary font-bold mono-text text-sm tracking-tight">{player.total_xp.toLocaleString()}</p>
                            </div>
                            <div className="col-span-2 md:col-span-2 text-center">
                                <div className="inline-flex items-center gap-1 bg-surface px-2 py-1 rounded border border-border-dark">
                                    <span className="material-symbols-outlined text-orange-500 text-[14px]">local_fire_department</span>
                                    <span className="text-white font-bold text-xs mono-text">{player.current_streak}</span>
                                </div>
                            </div>
                            <div className="hidden md:block md:col-span-2 text-right">
                                <span className="text-[10px] mono-text text-slate-500 uppercase tracking-wider">{player.domain}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
