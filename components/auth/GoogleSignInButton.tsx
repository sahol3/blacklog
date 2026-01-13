'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function GoogleSignInButton() {
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()

    const handleSignIn = async () => {
        try {
            setIsLoading(true)
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/api/auth/callback`,
                },
            })

            if (error) {
                throw error
            }
        } catch (error) {
            toast.error('Failed to initiate login')
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="flex items-center justify-center gap-3 w-full bg-white text-black font-bold py-3 px-6 rounded-lg hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
            {isLoading ? (
                <span className="animate-spin text-xl material-symbols-outlined">refresh</span>
            ) : (
                <img
                    src="https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA"
                    alt="Google"
                    className="w-5 h-5"
                />
            )}
            <span className="uppercase tracking-widest text-sm">
                {isLoading ? 'Connecting...' : 'Continue with Google'}
            </span>
        </button>
    )
}
