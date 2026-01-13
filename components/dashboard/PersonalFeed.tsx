'use client'

import Link from 'next/link'
import { format } from 'date-fns'

export type FeedLog = {
    id: string
    date: string
    xp: number
    pillars: string[] // ['Body', 'Mind']
    is_public: boolean
}

export default function PersonalFeed({ logs }: { logs: FeedLog[] }) {
    return (
        <section>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
                <span className="w-1 h-3 bg-white block"></span>
                Recent War Logs // AAR
            </h3>
            <div className="flex flex-col gap-3">
                {logs.map((log) => (
                    <Link key={log.id} href={`/log?date=${log.date}`}>
                        <div className="bg-panel-dark border border-border-dark p-4 rounded-lg flex items-center justify-between group hover:border-primary/40 transition-all cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                                    <span className="material-symbols-outlined">
                                        {log.pillars.includes('Body') ? 'fitness_center' :
                                            log.pillars.includes('Mind') ? 'psychology' : 'edit_note'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors uppercase">
                                        O_01 // {log.pillars.join('_') || 'MISSION'}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] mono-text text-slate-500">
                                            {format(new Date(log.date), 'HH:mm')} // {format(new Date(log.date), 'MMM_dd_yyyy').toUpperCase()}
                                        </span>
                                        {log.pillars.map(p => (
                                            <span key={p} className="px-2 py-[2px] rounded-sm bg-emerald-500/10 text-[9px] mono-text text-emerald-500 uppercase border border-emerald-500/20">
                                                {p}
                                            </span>
                                        ))}
                                        {!log.is_public && (
                                            <span className="text-[10px] text-red-500 flex items-center"><span className="material-symbols-outlined text-[10px] mr-1">lock</span>Classified</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-emerald-500 mono-text font-bold">+{log.xp} XP</p>
                                <p className="text-[10px] mono-text text-slate-500 uppercase">Verified</p>
                            </div>
                        </div>
                    </Link>
                ))}
                {logs.length === 0 && (
                    <div className="text-center py-8 text-slate-600 text-xs uppercase tracking-widest border border-dashed border-border-dark rounded-lg">
                        No Logs Recorded
                    </div>
                )}
            </div>
            <Link
                href="/log"
                className="w-full mt-4 py-4 border border-dashed border-border-dark hover:border-primary/50 text-slate-500 hover:text-white hover:bg-white/5 transition-all rounded-lg text-xs font-bold uppercase tracking-widest mono-text flex items-center justify-center gap-2"
            >
                <span>Record New Mission</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
        </section>
    )
}
