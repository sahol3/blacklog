'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function RespectButton({ logId, initialCount, hasRespected: initialHasRespected }: { logId: string, initialCount: number, hasRespected: boolean }) {
    const [count, setCount] = useState(initialCount)
    const [hasRespected, setHasRespected] = useState(initialHasRespected)
    const [particles, setParticles] = useState<{ id: number, x: number, y: number }[]>([])
    const supabase = createClient()

    const handleClick = async () => {
        // Optimistic Update
        const newHasRespected = !hasRespected
        setHasRespected(newHasRespected)
        setCount(prev => newHasRespected ? prev + 1 : prev - 1)

        // Particle Effect
        if (newHasRespected) {
            const newParticles = Array.from({ length: 8 }).map((_, i) => ({
                id: Date.now() + i,
                x: (Math.random() - 0.5) * 50,
                y: (Math.random() - 0.5) * 50 - 20 // Tend upwards
            }))
            setParticles(newParticles)
            setTimeout(() => setParticles([]), 1000)
        }

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                toast.error('Login to give Respect')
                // Revert
                setHasRespected(!newHasRespected)
                setCount(prev => !newHasRespected ? prev + 1 : prev - 1)
                return
            }

            if (newHasRespected) {
                await supabase.from('respect_reactions').insert({ log_id: logId, user_id: user.id })
            } else {
                await supabase.from('respect_reactions').delete().match({ log_id: logId, user_id: user.id })
            }
        } catch (error) {
            console.error(error)
            // Revert on error
            setHasRespected(!newHasRespected)
            setCount(prev => !newHasRespected ? prev + 1 : prev - 1)
        }
    }

    return (
        <div className="relative inline-block">
            <button
                onClick={handleClick}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all active:scale-90 ${hasRespected
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-surface border-border-dark text-slate-500 hover:text-primary hover:border-primary/50'
                    }`}
            >
                <span className="material-symbols-outlined text-[16px]">{hasRespected ? 'handshake' : 'handshake'}</span>
                <span className="text-xs font-bold mono-text">{count}</span>
            </button>

            <AnimatePresence>
                {particles.map(p => (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 1, x: 0, y: 0, scale: 0 }}
                        animate={{ opacity: 0, x: p.x, y: p.y, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="absolute top-1/2 left-1/2 w-1 h-1 bg-primary rounded-full pointer-events-none"
                    />
                ))}
            </AnimatePresence>
        </div>
    )
}
