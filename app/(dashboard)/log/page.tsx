'use client'

import { useDailyLog } from '@/lib/hooks/useDailyLog'
import PillarSection from '@/components/logger/PillarSection'
import FinancialInput from '@/components/logger/FinancialInput'
import { WarLogTextarea, ImageUpload } from '@/components/logger/WarLogTextarea'
import { calculatePotentialXP } from '@/lib/utils/xp-calculator'
import { Toaster } from 'react-hot-toast'
import React, { useMemo } from 'react'

export default function LogPage() {
    const { date, setDate, loading, logData, updateLog, submitLog } = useDailyLog()

    const currentXP = useMemo(() => calculatePotentialXP({
        body_unhealthy_flag: logData.body_unhealthy_flag,
        body_energy: logData.body_energy,
        mind_read_flag: logData.mind_read_flag,
        mind_focus: logData.mind_focus,
        money_value: logData.money_value,
        money_speed: logData.money_speed,
        skill_practice_flag: logData.skill_practice_flag,
        skill_difficulty: logData.skill_difficulty
    }), [logData])

    return (
        <div className="bg-background-dark font-display text-white min-h-screen pb-32">
            <Toaster position="bottom-right" />

            <div className="max-w-4xl mx-auto p-6 md:p-12">
                <header className="flex flex-wrap justify-between items-end gap-6 mb-12 border-l-4 border-primary pl-6">
                    <div className="space-y-2">
                        <p className="text-primary text-xs font-black tracking-[0.2em] uppercase">Tactical Entry</p>
                        <h1 className="text-4xl md:text-6xl font-black leading-none tracking-tighter uppercase">Daily War Log</h1>
                        <div className="flex items-center gap-4 text-[#9db9b0] font-mono text-sm max-w-xs">
                            <input
                                type="date"
                                value={date}
                                max={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setDate(e.target.value)}
                                className="bg-transparent border-b border-border-dark focus:border-primary focus:outline-none uppercase"
                            />
                            <span className="text-border px-2">|</span>
                            <span>SYNC_STATUS: {loading ? 'FETCHING...' : 'READY'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-surface px-3 py-2 rounded-lg border border-border">
                            <span className={`material-symbols-outlined text-sm ${logData.is_public ? 'text-emerald-500' : 'text-red-500'}`}>
                                {logData.is_public ? 'public' : 'lock'}
                            </span>
                            <select
                                value={logData.is_public ? 'public' : 'private'}
                                onChange={(e) => updateLog({ is_public: e.target.value === 'public' })}
                                className="bg-transparent text-xs font-bold uppercase focus:outline-none text-slate-300"
                            >
                                <option value="public">Visible (Public)</option>
                                <option value="private">Classified (Private)</option>
                            </select>
                        </div>
                    </div>
                </header>

                <div className="space-y-8">
                    {/* 1. BODY */}
                    <PillarSection
                        title="01. BODY"
                        icon="fitness_center"
                        colorClass="text-red-500"
                        bgClass="bg-red-500/5"
                        borderClass="hover:border-red-500/50"
                        sliderClass="body-slider"
                        mainLabel="Energy Output"
                        minLabel="Lethargic"
                        maxLabel="Peak State"
                        mainValue={logData.body_energy}
                        onMainValueChange={(v) => updateLog({ body_energy: v })}
                        flagLabel="Zero Poison Protocol (Clean Eating)"
                        flagIcon="no_drinks"
                        flagValue={!logData.body_unhealthy_flag} // UI shows "Clean", data stores "Unhealthy" flag
                        onFlagChange={(cleaned) => updateLog({ body_unhealthy_flag: !cleaned })}
                    />

                    {/* 2. MIND */}
                    <PillarSection
                        title="02. MIND"
                        icon="psychology"
                        colorClass="text-blue-500"
                        bgClass="bg-blue-500/5"
                        borderClass="hover:border-blue-500/50"
                        sliderClass="mind-slider"
                        mainLabel="Focus Depth"
                        minLabel="Distracted"
                        maxLabel="Flow State"
                        mainValue={logData.mind_focus}
                        onMainValueChange={(v) => updateLog({ mind_focus: v })}
                        flagLabel="Daily Intel Synthesis (Reading)"
                        flagIcon="menu_book"
                        flagValue={logData.mind_read_flag}
                        onFlagChange={(v) => updateLog({ mind_read_flag: v })}
                    />

                    {/* 3. FINANCIAL */}
                    <FinancialInput
                        value={logData.money_value}
                        currency={logData.money_currency}
                        speed={logData.money_speed}
                        onValueChange={(v) => updateLog({ money_value: v })}
                        onCurrencyChange={(c) => updateLog({ money_currency: c })}
                        onSpeedChange={(v) => updateLog({ money_speed: v })}
                    />

                    {/* 4. SKILL */}
                    <PillarSection
                        title="04. SKILL"
                        icon="school"
                        colorClass="text-purple-500"
                        bgClass="bg-purple-500/5"
                        borderClass="hover:border-purple-500/50"
                        sliderClass="skill-slider"
                        mainLabel="Practice Difficulty"
                        minLabel="Routine"
                        maxLabel="Extreme"
                        mainValue={logData.skill_difficulty}
                        onMainValueChange={(v) => updateLog({ skill_difficulty: v })}
                        flagLabel="Applied Deliberate Practice"
                        flagIcon="model_training"
                        flagValue={logData.skill_practice_flag}
                        onFlagChange={(v) => updateLog({ skill_practice_flag: v })}
                    />

                    {/* SOUL */}
                    <div className="bg-surface border border-border rounded-xl p-6 space-y-6 shadow-2xl">
                        <WarLogTextarea
                            value={logData.war_log}
                            onChange={(v) => updateLog({ war_log: v })}
                        />

                        {logData.image_url ? (
                            <div className="relative group rounded-xl overflow-hidden border border-border">
                                <img src={logData.image_url} alt="Proof" className="w-full h-64 object-cover" />
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                    <button
                                        onClick={() => updateLog({ image_url: null })}
                                        className="bg-red-500 text-white px-4 py-2 rounded font-bold uppercase text-xs hover:bg-red-600"
                                    >
                                        Remove Proof
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <ImageUpload onUploadComplete={(url) => updateLog({ image_url: url })} />
                        )}
                    </div>

                    {/* SUBMIT */}
                    <button
                        onClick={submitLog}
                        className="w-full bg-primary hover:bg-primary/90 text-background-dark font-black text-xl py-6 rounded-xl transition-all active:scale-[0.98] shadow-[0_0_30px_rgba(16,183,127,0.3)] flex items-center justify-center gap-3 group mt-8"
                    >
                        <span className="material-symbols-outlined font-black group-hover:translate-x-1 transition-transform">send</span>
                        <span>EXECUTE LOG SUBMISSION</span>
                    </button>
                </div>
            </div>

            {/* Floating XP Preview */}
            <div className="fixed bottom-8 right-8 z-40 animate-in slide-in-from-right duration-500">
                <div className="bg-surface/90 border border-primary/50 backdrop-blur-xl rounded-2xl p-4 shadow-[0_0_40px_rgba(16,183,127,0.15)] flex items-center gap-6 min-w-[240px]">
                    <div className="flex-1">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-[10px] font-black text-primary tracking-widest uppercase">Projected Yield</span>
                            <span className="text-primary font-mono font-bold">+{currentXP} XP</span>
                        </div>
                        <div className="w-full h-1.5 bg-primary/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${Math.min((currentXP / 100) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="size-12 rounded-full border-2 border-primary flex items-center justify-center text-primary font-black bg-primary/10 text-lg">
                        XP
                    </div>
                </div>
            </div>
        </div>
    )
}
