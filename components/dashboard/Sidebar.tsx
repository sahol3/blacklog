'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const links = [
    { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { name: 'Log Day', href: '/log', icon: 'edit_note' },
    { name: 'Leaderboard', href: '/leaderboard', icon: 'military_tech' },
    { name: 'The Grid', href: '/grid', icon: 'grid_view' },
    { name: 'Reviews', href: '/reviews', icon: 'rate_review' },
]

export default function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar-bg border-r border-border-dark flex-col hidden md:flex z-50">
            <div className="p-6 border-b border-border-dark flex items-center gap-3">
                <img src="/logo.svg" alt="Blacklog" className="size-8" />
                <div>
                    <h1 className="font-black text-xl text-white tracking-tighter uppercase">Blacklog</h1>
                    <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">V2.0 // COMMAND</p>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {links.map((link) => {
                    const isActive = pathname === link.href
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all group ${isActive
                                ? 'bg-primary/10 text-primary border border-primary/20'
                                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-[20px] ${isActive ? 'filled' : ''} group-hover:scale-110 transition-transform`}>
                                {link.icon}
                            </span>
                            {link.name}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-border-dark">
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-bold uppercase tracking-wider text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all group"
                >
                    <span className="material-symbols-outlined text-[20px] group-hover:rotate-180 transition-transform">logout</span>
                    Sign Out
                </button>
            </div>
        </aside>
    )
}
