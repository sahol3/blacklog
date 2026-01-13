'use client'

import { useState } from 'react'
import RespectButton from '@/components/social/RespectButton'
import { formatDistanceToNow } from 'date-fns'

type GridLog = {
    id: string
    username: string
    avatar_url: string | null
    domain: string
    date: string
    pillars: string[]
    war_log: string | null
    image_url: string | null
    xp: number
    respect_count: number
    has_respected: boolean // Needs to be computed on fetch
}

export default function GridFeed({ initialLogs }: { initialLogs: GridLog[] }) {
    const [filter, setFilter] = useState<'ALL' | 'BODY' | 'MIND' | 'FINANCIAL' | 'SKILL'>('ALL')
    const [logs, setLogs] = useState(initialLogs)

    const filteredLogs = logs.filter(log => {
        if (filter === 'ALL') return true
        // Map filter to pillar keywords
        const keyword = filter === 'FINANCIAL' ? 'Growth' : filter.charAt(0) + filter.slice(1).toLowerCase() // 'Body', 'Mind', 'Skill'
        return log.pillars.includes(keyword)
    })

    return (
        <div>
            {/* Filters */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                {['ALL', 'BODY', 'MIND', 'FINANCIAL', 'SKILL'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${filter === f
                            ? 'bg-white text-black'
                            : 'bg-surface border border-border-dark text-slate-500 hover:text-white'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {filteredLogs.length === 0 ? (
                <div className="col-span-full py-16 text-center">
                    <div className="size-16 rounded-full bg-surface border border-border-dark flex items-center justify-center mb-4 mx-auto">
                        <span className="material-symbols-outlined text-3xl text-slate-600">grid_off</span>
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">No Logs Found</h3>
                    <p className="text-slate-500 text-sm">{filter === 'ALL' ? 'No public logs yet. Be the first to share!' : `No logs with ${filter} pillar.`}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLogs.map(log => (
                        <article key={log.id} className="bg-panel-dark border border-border-dark rounded-xl overflow-hidden hover:border-border transition-all flex flex-col group">
                            <div className="p-5 flex items-center justify-between border-b border-border-dark bg-surface/50">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-slate-800 overflow-hidden border border-border-dark">
                                        {log.avatar_url ? (
                                            <img src={log.avatar_url} alt={log.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-xs">
                                                {log.username.slice(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm tracking-tight leading-none">@{log.username}</p>
                                        <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1.5">{log.domain} OP</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wide">{formatDistanceToNow(new Date(log.date), { addSuffix: true })}</p>
                                </div>
                            </div>

                            <div className="p-5 flex-1">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {log.pillars.map(p => (
                                        <span key={p} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-bold uppercase tracking-wide text-slate-300">
                                            {p}
                                        </span>
                                    ))}
                                    <span className="px-2 py-1 bg-primary/10 border border-primary/20 rounded text-[10px] font-bold uppercase tracking-wide text-primary">
                                        +{log.xp} XP
                                    </span>
                                </div>

                                {log.war_log && (
                                    <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-4 font-serif italic">
                                        "{log.war_log}"
                                    </p>
                                )}

                                {log.image_url && (
                                    <div className="rounded-lg overflow-hidden mb-4 border border-border-dark bg-black">
                                        <img src={log.image_url} alt="Proof" className="w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-border-dark bg-surface/30 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <RespectButton logId={log.id} initialCount={log.respect_count} hasRespected={log.has_respected} />
                                </div>
                                <button className="text-slate-500 hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-lg">share</span>
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    )
}
