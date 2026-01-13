'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const links = [
    { name: 'Dash', href: '/dashboard', icon: 'dashboard' },
    { name: 'Log', href: '/log', icon: 'edit_note' },
    { name: 'Rank', href: '/leaderboard', icon: 'military_tech' },
    { name: 'Grid', href: '/grid', icon: 'grid_view' },
    { name: 'AI', href: '/reviews', icon: 'rate_review' },
]

export default function MobileHeader() {
    const pathname = usePathname()

    return (
        <>
            <header className="fixed top-0 left-0 w-full h-16 bg-sidebar-bg/90 backdrop-blur-md border-b border-border-dark flex items-center justify-between px-4 md:hidden z-50">
                <div className="flex items-center gap-2">
                    <img src="/logo.svg" alt="Blacklog" className="size-8" />
                    <span className="font-black text-lg text-white uppercase tracking-tighter">Blacklog</span>
                </div>
                <div className="size-8 rounded-full bg-slate-800"></div>
            </header>

            <nav className="fixed bottom-0 left-0 w-full bg-sidebar-bg border-t border-border-dark flex justify-around p-2 md:hidden z-50 pb-safe">
                {links.map((link) => {
                    const isActive = pathname === link.href
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${isActive ? 'text-primary' : 'text-slate-500'
                                }`}
                        >
                            <span className={`material-symbols-outlined ${isActive ? 'filled' : ''}`}>
                                {link.icon}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wide">{link.name}</span>
                        </Link>
                    )
                })}
            </nav>
        </>
    )
}
