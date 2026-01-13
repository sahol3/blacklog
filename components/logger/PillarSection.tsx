'use client'

interface PillarSectionProps {
    title: string
    icon: string
    colorClass: string // e.g. 'text-red-500'
    bgClass: string // e.g. 'bg-red-500/5'
    borderClass: string // e.g. 'hover:border-red-500/50'
    sliderClass: string // e.g. 'body-slider'

    mainValue: number
    onMainValueChange: (val: number) => void
    mainLabel: string

    flagValue: boolean
    onFlagChange: (val: boolean) => void
    flagLabel: string
    flagIcon: string

    minLabel?: string
    maxLabel?: string
}

export default function PillarSection({
    title, icon, colorClass, bgClass, borderClass, sliderClass,
    mainValue, onMainValueChange, mainLabel,
    flagValue, onFlagChange, flagLabel, flagIcon,
    minLabel = 'Low', maxLabel = 'High'
}: PillarSectionProps) {

    return (
        <section className="bg-surface border border-border rounded-xl overflow-hidden shadow-2xl">
            <div className={`flex items-center gap-4 ${bgClass} px-6 py-4 border-b border-border`}>
                <div className={`${colorClass} flex items-center justify-center rounded-lg bg-white/5 size-10`}>
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
                <h2 className="text-white text-lg font-bold tracking-tight">{title}</h2>
            </div>
            <div className="p-6 space-y-8">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-[#9db9b0] text-sm font-medium uppercase tracking-wider">{mainLabel}</label>
                        <span className={`${colorClass} font-mono font-bold text-xl`}>{mainValue}/5</span>
                    </div>
                    <input
                        className={`w-full ${sliderClass}`}
                        max="5"
                        min="1"
                        type="range"
                        value={mainValue}
                        onChange={(e) => onMainValueChange(parseInt(e.target.value))}
                    />
                    <div className="flex justify-between text-[10px] text-[#4a5e57] font-mono">
                        <span>{minLabel}</span>
                        <span>{maxLabel}</span>
                    </div>
                </div>
                <label className={`flex items-center justify-between p-4 rounded-lg bg-surface-highlight border border-border cursor-pointer ${borderClass} transition-all group select-none`}>
                    <div className="flex items-center gap-3">
                        <span className={`material-symbols-outlined ${colorClass}`}>{flagIcon}</span>
                        <span className="text-white font-medium">{flagLabel}</span>
                    </div>
                    <input
                        checked={flagValue}
                        onChange={(e) => onFlagChange(e.target.checked)}
                        className={`rounded border-border bg-background-dark ${colorClass} focus:ring-0 size-6`}
                        type="checkbox"
                    />
                </label>
            </div>
        </section>
    )
}
