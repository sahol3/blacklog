'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

type Step = 1 | 2 | 3

export default function OnboardingFlow() {
    const router = useRouter()
    const supabase = createClient()
    const [step, setStep] = useState<Step>(1)
    const [loading, setLoading] = useState(false)
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)

    const [formData, setFormData] = useState({
        username: '',
        full_name: '', // Will be pre-filled from auth
        domain: 'Student' as const,
        main_quest: '',
        financial_target: '',
        money_currency: 'USD',
        the_enemy: ''
    })

    // Prefill Full Name
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user?.user_metadata?.full_name) {
                setFormData(prev => ({ ...prev, full_name: user.user_metadata.full_name }))
            }
        }
        fetchUser()
    }, [])

    // Username Check Debounce
    useEffect(() => {
        const checkUsername = async () => {
            if (formData.username.length < 3) {
                setUsernameAvailable(null)
                return
            }

            const { data: { user } } = await supabase.auth.getUser()

            const { data } = await supabase
                .from('users')
                .select('username, id')
                .eq('username', formData.username)
                .single() as { data: { username: string; id: string } | null }

            // Available if no user has it, or if current user already owns it
            setUsernameAvailable(!data || data.id === user?.id)
        }

        const timeoutId = setTimeout(checkUsername, 500)
        return () => clearTimeout(timeoutId)
    }, [formData.username])

    const calculateDelay = async () => {
        // Artificial delay for specific actions if needed
        return new Promise(resolve => setTimeout(resolve, 500))
    }

    const handleNext = async () => {
        if (step === 1) {
            if (!usernameAvailable) return toast.error('Username taken or invalid')
            if (formData.username.length < 3) return toast.error('Username too short')
            if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) return toast.error('Invalid characters in username')
            setStep(2)
        } else if (step === 2) {
            if (!formData.main_quest) return toast.error('Define your main quest')
            if (!formData.financial_target) return toast.error('Set a financial target')
            setStep(3)
            handleSubmit()
        }
    }

    const handleSubmit = async () => {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) throw new Error('No user found')

            const { error } = await supabase
                .from('users')
                .upsert({
                    id: user.id,
                    email: user.email!,
                    username: formData.username,
                    full_name: formData.full_name,
                    avatar_url: user.user_metadata.avatar_url,
                    domain: formData.domain,
                    goals_json: {
                        main_quest: formData.main_quest,
                        financial_target: `${formData.money_currency} ${formData.financial_target}`,
                        the_enemy: formData.the_enemy
                    }
                } as any, { onConflict: 'id' })

            if (error) throw error

            // Success Animation trigger here if needed
            toast.success('Identity Established')

            setTimeout(() => {
                router.push('/dashboard')
                router.refresh()
            }, 3000)

        } catch (error) {
            console.error(error)
            toast.error('Failed to create profile')
            setStep(2) // Go back
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto p-6 md:p-8 bg-panel-dark border border-border-dark rounded-2xl shadow-2xl backdrop-blur-sm relative overflow-hidden">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">System Initialization</h2>
                    <p className="text-slate-500 text-xs font-mono tracking-widest mt-1">Step {step} of 3</p>
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className={`h-1.5 w-8 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-border-dark'}`} />
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Identify Yourself (Username)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3.5 text-slate-500 font-bold">@</span>
                                <input
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                    className={`w-full bg-surface border ${usernameAvailable === true ? 'border-primary/50 focus:border-primary' :
                                        usernameAvailable === false ? 'border-red-500/50 focus:border-red-500' :
                                            'border-border-dark focus:border-slate-500'
                                        } rounded-lg py-3 pl-8 pr-4 text-white font-mono placeholder:text-slate-700 focus:outline-none transition-all`}
                                    placeholder="operator_01"
                                />
                                {usernameAvailable === true && (
                                    <span className="absolute right-4 top-3.5 text-primary text-xs font-bold">AVAILABLE</span>
                                )}
                                {usernameAvailable === false && (
                                    <span className="absolute right-4 top-3.5 text-red-500 text-xs font-bold">TAKEN</span>
                                )}
                            </div>
                            <p className="text-[10px] text-slate-600 mt-2">3-20 characters. Letters, numbers, underscore only.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Operational Domain</label>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                {['Dev', 'Designer', 'Agency', 'Student', 'Other'].map((d) => (
                                    <button
                                        key={d}
                                        onClick={() => setFormData({ ...formData, domain: d as any })}
                                        className={`px-2 py-3 rounded-lg text-xs font-bold uppercase tracking-wide border transition-all ${formData.domain === d
                                            ? 'bg-primary/10 border-primary text-primary'
                                            : 'bg-surface border-border-dark text-slate-500 hover:border-slate-600'
                                            }`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleNext}
                            disabled={!usernameAvailable || formData.username.length < 3}
                            className="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8 uppercase tracking-widest text-sm"
                        >
                            Initialize Profile
                        </button>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Main Quest (The Goal)</label>
                            <textarea
                                value={formData.main_quest}
                                onChange={(e) => setFormData({ ...formData, main_quest: e.target.value })}
                                className="w-full bg-surface border border-border-dark rounded-lg p-4 text-white placeholder:text-slate-700 focus:border-primary focus:outline-none transition-all h-24 resize-none"
                                placeholder="e.g. Scale SaaS to $10k MRR this year..."
                                maxLength={200}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Financial Target</label>
                                <div className="relative">
                                    <select
                                        value={formData.money_currency}
                                        onChange={(e) => setFormData({ ...formData, money_currency: e.target.value })}
                                        className="absolute left-2 top-2 bottom-2 bg-background-dark border border-border-dark rounded text-xs text-slate-300 px-2 font-mono focus:outline-none"
                                    >
                                        <option value="USD">USD</option>
                                        <option value="BDT">BDT</option>
                                    </select>
                                    <input
                                        type="number"
                                        value={formData.financial_target}
                                        onChange={(e) => setFormData({ ...formData, financial_target: e.target.value })}
                                        className="w-full bg-surface border border-border-dark rounded-lg py-3 pl-20 pr-4 text-white font-mono placeholder:text-slate-700 focus:border-primary focus:outline-none"
                                        placeholder="10000"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">The Enemy (Anti-Goal)</label>
                                <input
                                    value={formData.the_enemy}
                                    onChange={(e) => setFormData({ ...formData, the_enemy: e.target.value })}
                                    className="w-full bg-surface border border-border-dark rounded-lg py-3 px-4 text-white placeholder:text-slate-700 focus:border-red-500 focus:outline-none transition-all"
                                    placeholder="e.g. Procrastination, Comfort..."
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleNext}
                            className="w-full bg-primary hover:bg-primary/90 text-background-dark font-black py-4 rounded-lg transition-all mt-8 uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                        >
                            Confirm Protocols
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12"
                    >
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 text-primary mb-6 border border-primary animate-pulse">
                            <span className="material-symbols-outlined text-4xl">check_circle</span>
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Access Granted</h2>
                        <p className="text-slate-400 text-sm mb-8">Welcome to the machine, <span className="text-white font-bold">@{formData.username}</span>.</p>
                        <p className="text-[10px] text-slate-600 font-mono">REDIRECTING TO COMMAND CENTER...</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
