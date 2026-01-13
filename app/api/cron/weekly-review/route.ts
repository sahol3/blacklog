import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateWeeklyReview } from '@/lib/ai/nvidia'
import { subDays, format } from 'date-fns'

export async function POST(request: Request) {
    const supabase = createServerClient()

    // Check Auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { data: userProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

        const endDate = subDays(new Date(), 0) // Today
        const startDate = subDays(endDate, 7)

        const { data: logs } = await supabase
            .from('daily_logs')
            .select('*')
            .eq('user_id', user.id)
            .gte('date', format(startDate, 'yyyy-MM-dd'))
            .lte('date', format(endDate, 'yyyy-MM-dd'))

        if (!logs || logs.length < 3) {
            return NextResponse.json({ error: 'Not enough data for review (min 3 logs)' }, { status: 400 })
        }

        const reviewContent = await generateWeeklyReview(logs, userProfile)

        const { data: review, error } = await supabase
            .from('weekly_reviews')
            .insert({
                user_id: user.id,
                week_start: format(startDate, 'yyyy-MM-dd'),
                week_end: format(endDate, 'yyyy-MM-dd'),
                ai_review: reviewContent
            })
            .select()
            .single()

        if (error) {
            if (error.code === '23505') {
                const { data: updated } = await supabase
                    .from('weekly_reviews')
                    .update({ ai_review: reviewContent, created_at: new Date().toISOString() })
                    .eq('user_id', user.id)
                    .eq('week_start', format(startDate, 'yyyy-MM-dd'))
                    .select()
                    .single()
                return NextResponse.json({ review: updated })
            }
            throw error
        }

        return NextResponse.json({ review })

    } catch (error: any) {
        console.error(error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
