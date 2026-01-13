'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export type LogData = {
    // Pillars
    body_unhealthy_flag: boolean
    body_energy: number
    mind_read_flag: boolean
    mind_focus: number
    money_value: number
    money_currency: 'BDT' | 'USD'
    money_speed: number
    skill_practice_flag: boolean
    skill_difficulty: number
    // Soul
    war_log: string
    image_url: string | null
    is_public: boolean
}

const DEFAULT_LOG: LogData = {
    body_unhealthy_flag: false,
    body_energy: 3,
    mind_read_flag: false,
    mind_focus: 3,
    money_value: 0,
    money_currency: 'USD',
    money_speed: 3,
    skill_practice_flag: false,
    skill_difficulty: 3,
    war_log: '',
    image_url: null,
    is_public: true
}

export function useDailyLog() {
    const supabase = createClient()
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
    const [loading, setLoading] = useState(true)
    const [logId, setLogId] = useState<string | null>(null)
    const [logData, setLogData] = useState<LogData>(DEFAULT_LOG)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

    const fetchLog = useCallback(async (selectedDate: string) => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('daily_logs')
                .select('*')
                .eq('user_id', user.id)
                .eq('date', selectedDate)
                .single()

            if (error && error.code !== 'PGRST116') throw error

            if (data) {
                setLogId(data.id)
                setLogData({
                    body_unhealthy_flag: data.body_unhealthy_flag,
                    body_energy: data.body_energy || 3,
                    mind_read_flag: data.mind_read_flag,
                    mind_focus: data.mind_focus || 3,
                    money_value: data.money_value || 0,
                    money_currency: data.money_currency || 'USD',
                    money_speed: data.money_speed || 3,
                    skill_practice_flag: data.skill_practice_flag,
                    skill_difficulty: data.skill_difficulty || 3,
                    war_log: data.war_log || '',
                    image_url: data.image_url,
                    is_public: data.is_public ?? true
                })
            } else {
                setLogId(null)
                // Check local storage for draft
                const draft = localStorage.getItem(`draft_${selectedDate}`)
                if (draft) {
                    setLogData(JSON.parse(draft))
                    toast('Draft recovered', { icon: '📂' })
                } else {
                    setLogData(DEFAULT_LOG)
                }
            }
        } catch (error) {
            console.error(error)
            toast.error('Failed to load log')
        } finally {
            setLoading(false)
        }
    }, [supabase])

    // Fetch when date changes
    useEffect(() => {
        fetchLog(date)
    }, [date, fetchLog])

    // Autosave Draft
    useEffect(() => {
        if (!hasUnsavedChanges) return
        const timer = setTimeout(() => {
            localStorage.setItem(`draft_${date}`, JSON.stringify(logData))
        }, 2000)
        return () => clearTimeout(timer)
    }, [logData, date, hasUnsavedChanges])

    const updateLog = (updates: Partial<LogData>) => {
        setLogData(prev => ({ ...prev, ...updates }))
        setHasUnsavedChanges(true)
    }

    const submitLog = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const payload = {
                user_id: user.id,
                date: date,
                ...logData,
                // Ensure numeric constraints
                body_energy: Math.max(1, Math.min(5, logData.body_energy)),
                mind_focus: Math.max(1, Math.min(5, logData.mind_focus)),
                money_speed: Math.max(1, Math.min(5, logData.money_speed)),
                skill_difficulty: Math.max(1, Math.min(5, logData.skill_difficulty)),
            }

            const { error } = await supabase
                .from('daily_logs')
                .upsert(payload, { onConflict: 'user_id, date' })

            if (error) throw error

            toast.success('Log Synchronized')
            localStorage.removeItem(`draft_${date}`)
            setHasUnsavedChanges(false)
            // Refetch to ensure ID is set
            fetchLog(date)
        } catch (error) {
            console.error(error)
            toast.error('Sync Failed')
        }
    }

    return {
        date,
        setDate,
        loading,
        logData,
        updateLog,
        submitLog
    }
}
