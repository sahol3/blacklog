'use client'

import { useState } from 'react'

interface FinancialInputProps {
    value: number
    currency: 'USD' | 'BDT'
    speed: number
    onValueChange: (val: number) => void
    onCurrencyChange: (curr: 'USD' | 'BDT') => void
    onSpeedChange: (val: number) => void
}

export default function FinancialInput({
    value,
    currency,
    speed,
    onValueChange,
    onCurrencyChange,
    onSpeedChange
}: FinancialInputProps) {
    const [isFocused, setIsFocused] = useState(false)

    return (
        <section className="bg-surface border border-border rounded-xl overflow-hidden shadow-2xl transition-all hover:border-primary/30">
            <div className="flex items-center gap-4 bg-primary/5 px-6 py-4 border-b border-border">
                <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 size-10">
                    <span className="material-symbols-outlined">payments</span>
                </div>
                <h2 className="text-white text-lg font-bold tracking-tight">03. FINANCIAL</h2>
            </div>

            <div className="p-6 space-y-8">
                <div className="space-y-3">
                    <label className="text-[#9db9b0] text-sm font-medium uppercase tracking-wider">Revenue Captured Today</label>
                    <div className={`relative transition-all duration-300 ${value > 0 ? 'scale-[1.02]' : ''}`}>
                        <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4 z-10">
                            <select
                                value={currency}
                                onChange={(e) => onCurrencyChange(e.target.value as 'USD' | 'BDT')}
                                className="bg-transparent text-primary font-black text-xl border-none focus:outline-none cursor-pointer appearance-none pr-2"
                            >
                                <option value="USD">$</option>
                                <option value="BDT">৳</option>
                            </select>
                        </div>

                        <input
                            className={`w-full bg-background-dark border-2 rounded-xl py-6 pl-16 pr-6 text-4xl font-black font-mono text-white placeholder:text-primary/20 transition-all outline-none 
                        ${value > 0 ? 'border-primary shadow-[0_0_30px_rgba(16,183,127,0.2)]' : 'border-primary/30 focus:border-primary'}`}
                            placeholder="0.00"
                            type="number"
                            step="0.01"
                            value={value === 0 ? '' : value}
                            onChange={(e) => onValueChange(parseFloat(e.target.value) || 0)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-[#9db9b0] text-sm font-medium uppercase tracking-wider">Execution Speed</label>
                        <span className="text-primary font-mono font-bold text-xl">{speed}/5</span>
                    </div>
                    <input
                        className="w-full fin-slider"
                        max="5"
                        min="1"
                        type="range"
                        value={speed}
                        onChange={(e) => onSpeedChange(parseInt(e.target.value))}
                    />
                </div>
            </div>
        </section>
    )
}
