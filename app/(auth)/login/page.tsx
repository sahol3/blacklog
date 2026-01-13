import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
import { Toaster } from 'react-hot-toast'

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <Toaster position="bottom-right" />

            {/* Background Grid */}
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.05] pointer-events-none"></div>

            {/* Glow Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-panel-dark border border-border-dark p-8 rounded-2xl shadow-2xl backdrop-blur-xl">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6 border border-primary/20">
                            <span className="material-symbols-outlined text-3xl text-primary">verified_user</span>
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tighter mb-2 uppercase">Blacklog</h1>
                        <p className="text-slate-500 text-xs font-mono tracking-widest uppercase">System Access Required</p>
                    </div>

                    <div className="space-y-6">
                        <div className="p-4 bg-surface rounded-lg border border-border text-center">
                            <p className="text-[#9db9b0] text-sm">
                                "We do not rise to the level of our expectations. We fall to the level of our training."
                            </p>
                        </div>

                        <GoogleSignInButton />

                        <p className="text-center text-[10px] text-slate-600 uppercase tracking-widest">
                            Restricted Area // Operators Only
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
