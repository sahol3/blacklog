'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
// Prompt didn't say install react-markdown. I'll use simple whitespace-pre-wrap div, or better, basic formatting.
// I'll assume simple text display for now to avoid dependency issues, or use a simple parser if needed.
// Actually, I'll just use whitespace-pre-line and some regex for bolding if I can, or just text.
// Review output is Markdown headers.

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const supabase = createClient()

    const fetchReviews = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from('weekly_reviews')
            .select('*')
            .eq('user_id', user.id)
            .order('week_start', { ascending: false })

        if (data) setReviews(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchReviews()
    }, [])

    const handleGenerate = async () => {
        setGenerating(true)
        try {
            const res = await fetch('/api/cron/weekly-review', { method: 'POST' })
            const data = await res.json()
            if (res.ok) {
                fetchReviews()
            } else {
                alert(data.error || 'Failed')
            }
        } catch (e) {
            alert('Error')
        } finally {
            setGenerating(false)
        }
    }

    return (
        <div className="w-full pt-8 pb-12 px-6 lg:px-8 max-w-4xl mx-auto">
            <header className="flex justify-between items-end mb-10">
                <div>
                    <p className="text-primary text-[10px] mono-text uppercase tracking-[0.3em] mb-2">Performance Audit</p>
                    <h2 className="text-4xl font-black tracking-tighter uppercase text-white">Weekly Reviews</h2>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="bg-white text-black px-6 py-3 rounded text-xs font-bold uppercase tracking-widest hover:bg-slate-200 disabled:opacity-50"
                >
                    {generating ? 'Negotiating with AI...' : 'Request Audit'}
                </button>
            </header>

            {loading ? (
                <div className="space-y-8">
                    {[1, 2].map(i => (
                        <div key={i} className="bg-panel-dark border border-border-dark rounded-xl p-8 animate-pulse">
                            <div className="h-4 bg-slate-800 rounded w-48 mb-6"></div>
                            <div className="space-y-3">
                                <div className="h-3 bg-slate-800 rounded w-full"></div>
                                <div className="h-3 bg-slate-800 rounded w-5/6"></div>
                                <div className="h-3 bg-slate-800 rounded w-4/6"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-8">
                    {reviews.map((review) => (
                        <article key={review.id} className="bg-panel-dark border border-border-dark rounded-xl p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <span className="material-symbols-outlined text-6xl text-white">rate_review</span>
                            </div>
                            <div className="mb-6 border-b border-border-dark pb-4">
                                <p className="text-primary font-mono text-xs uppercase tracking-widest font-bold">
                                    Week: {format(new Date(review.week_start), 'MMM dd')} - {format(new Date(review.week_end), 'MMM dd')}
                                </p>
                            </div>
                            <div className="prose prose-invert prose-sm max-w-none font-mono">
                                {/* Simple markdown rendering attempt */}
                                {review.ai_review.split('\n').map((line: string, i: number) => {
                                    if (line.startsWith('## ')) return <h3 key={i} className="text-white font-black text-lg uppercase mt-6 mb-2">{line.replace('## ', '')}</h3>
                                    if (line.startsWith('- ')) return <li key={i} className="text-slate-300 ml-4 list-disc">{line.replace('- ', '')}</li>
                                    if (line.trim() === '') return <br key={i} />
                                    return <p key={i} className="text-slate-400 mb-2">{line}</p>
                                })}
                            </div>
                        </article>
                    ))}

                    {!loading && reviews.length === 0 && (
                        <div className="text-center py-16">
                            <div className="size-16 rounded-full bg-surface border border-border-dark flex items-center justify-center mb-4 mx-auto">
                                <span className="material-symbols-outlined text-3xl text-slate-600">psychology</span>
                            </div>
                            <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">No Audits Yet</h3>
                            <p className="text-slate-500 text-sm max-w-sm mx-auto">Click "Request Audit" to get your first AI-powered performance review.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
