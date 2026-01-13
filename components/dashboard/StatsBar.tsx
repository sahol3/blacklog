'use client'

export type Stats = {
    streak: number
    totalXP: number
    rank: string
    consistency: number
    consistencyChange: number
}

export default function StatsBar({ stats }: { stats: Stats }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-panel-dark border border-border-dark p-5 rounded-lg flex flex-col justify-between group hover:border-border-dark/80 transition-all">
                <div className="flex justify-between items-start">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Current Streak</p>
                    <span className="material-symbols-outlined text-orange-500 text-lg group-hover:scale-110 transition-transform">local_fire_department</span>
                </div>
                <div className="mt-4">
                    <p className="text-3xl font-bold mono-text tracking-tight text-white">{stats.streak}<span className="text-base text-slate-500 ml-1">DAYS</span></p>
                    <div className="w-full bg-gray-800 h-1 mt-3 rounded-full overflow-hidden">
                        <div className="bg-orange-500 h-full transition-all duration-1000" style={{ width: `${Math.min(stats.streak, 100)}%` }}></div>
                    </div>
                </div>
            </div>
            <div className="bg-panel-dark border border-border-dark p-5 rounded-lg flex flex-col justify-between group hover:border-border-dark/80 transition-all">
                <div className="flex justify-between items-start">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total XP</p>
                    <span className="material-symbols-outlined text-primary text-lg group-hover:scale-110 transition-transform">token</span>
                </div>
                <div className="mt-4">
                    <p className="text-3xl font-bold mono-text tracking-tight text-white">{stats.totalXP.toLocaleString()}</p>
                    <p className="text-primary text-[10px] font-bold mt-2 font-mono">&gt; KEEP GRINDING</p>
                </div>
            </div>
            <div className="bg-panel-dark border border-border-dark p-5 rounded-lg flex flex-col justify-between border-l-4 border-l-primary/80 group hover:border-t hover:border-r hover:border-b hover:border-border-dark/80 transition-all">
                <div className="flex justify-between items-start">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Rank</p>
                    <span className="material-symbols-outlined text-slate-400 text-lg group-hover:scale-110 transition-transform">military_tech</span>
                </div>
                <div className="mt-4">
                    <p className="text-2xl font-black tracking-tight uppercase text-white">{stats.rank}</p>
                    <p className="text-slate-500 text-[10px] font-bold mt-1">Based on Total XP</p>
                </div>
            </div>
            <div className="bg-panel-dark border border-border-dark p-5 rounded-lg flex flex-col justify-between group hover:border-border-dark/80 transition-all">
                <div className="flex justify-between items-start">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Consistency</p>
                    <span className="material-symbols-outlined text-blue-500 text-lg group-hover:scale-110 transition-transform">bolt</span>
                </div>
                <div className="mt-4">
                    <p className="text-3xl font-bold mono-text tracking-tight text-white">{stats.consistency}%</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold flex items-center ${stats.consistencyChange >= 0 ? 'text-primary' : 'text-red-500'}`}>
                            <span className="material-symbols-outlined text-[10px]">
                                {stats.consistencyChange >= 0 ? 'arrow_upward' : 'arrow_downward'}
                            </span>
                            {Math.abs(stats.consistencyChange)}%
                        </span>
                        <span className="text-slate-600 text-[10px]">vs last week</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
