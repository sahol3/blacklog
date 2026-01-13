import Sidebar from '@/components/dashboard/Sidebar'
import MobileHeader from '@/components/dashboard/MobileHeader'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background-dark">
            <Sidebar />
            <MobileHeader />
            <main className="md:pl-64 pt-16 md:pt-0 min-h-screen">
                {children}
            </main>
        </div>
    )
}
