'use client'

export type PillarAverages = {
    body: number // 0-100
    mind: number
    financial: number
    skill: number
}

function Ring({ label, value, color, icon, dashArray }: { label: string, value: number, color: string, icon: string, dashArray: string }) {
    // Convert 0-100 value to stroke-dasharray based on 100 circumference (approx)
    // Circumference of r=15.9155 is ~100.
    // strokeDasharray="value, 100"

    return (
        <div className="bg-panel-dark border border-border-dark p-6 rounded-lg flex flex-col items-center justify-center relative">
            <div className="absolute top-4 left-4 text-xs font-bold uppercase tracking-wider text-slate-400">{label}</div>
            <div className={`absolute top-4 right-4 ${color}`}><span className="material-symbols-outlined">{icon}</span></div>
            <div className="relative size-32 mt-4">
                <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                    <path className="text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5"></path>
                    <path className={color} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${value}, 100`} strokeLinecap="round" strokeWidth="2.5"></path>
                </svg>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className="text-2xl font-bold mono-text text-white">{Math.round(value)}%</span>
                </div>
            </div>
            <div className="mt-4 w-full flex justify-between text-[10px] mono-text text-slate-500 uppercase">
                <span>Avg</span>
                <span className={color}>
                    {value >= 80 ? 'Optimal' : value >= 50 ? 'Stable' : 'Critical'}
                </span>
            </div>
        </div>
    )
}

export default function PillarRings({ averages }: { averages: PillarAverages }) {
    return (
        <section className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
                <span className="w-1 h-3 bg-white block"></span>
                Pillar Performance Analysis (7 Days)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Ring label="Body" value={averages.body} color="text-red-500" icon="fitness_center" dashArray="85, 100" />
                <Ring label="Mind" value={averages.mind} color="text-blue-500" icon="psychology" dashArray="92, 100" />
                <Ring label="Financial" value={averages.financial} color="text-amber-500" icon="payments" dashArray="74, 100" />
                <Ring label="Skill" value={averages.skill} color="text-purple-500" icon="school" dashArray="88, 100" />
            </div>
        </section>
    )
}
