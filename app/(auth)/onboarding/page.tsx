import OnboardingFlow from '@/components/auth/OnboardingFlow'
import { Toaster } from 'react-hot-toast'

export default function OnboardingPage() {
    return (
        <div className="min-h-screen bg-background-dark flex items-center justify-center p-4 relative">
            <Toaster position="bottom-right" />
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.05] pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>

            <OnboardingFlow />
        </div>
    )
}
