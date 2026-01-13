'use client'

interface EmptyStateProps {
    icon: string
    title: string
    description: string
    actionText?: string
    actionHref?: string
}

export default function EmptyState({ icon, title, description, actionText, actionHref }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="size-20 rounded-full bg-surface border border-border-dark flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-4xl text-slate-600">{icon}</span>
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">{title}</h3>
            <p className="text-slate-500 text-sm max-w-sm">{description}</p>
            {actionText && actionHref && (
                <a
                    href={actionHref}
                    className="mt-6 px-6 py-3 bg-primary text-black text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-primary/90 transition-colors"
                >
                    {actionText}
                </a>
            )}
        </div>
    )
}
