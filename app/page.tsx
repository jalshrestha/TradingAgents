import { Dashboard } from '@/components/dashboard/dashboard'
import { Header } from '@/components/layout/header'
import { Navigation } from '@/components/layout/navigation'
import { Footer } from '@/components/layout/footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
      <Header />
      <div className="flex flex-1">
        <Navigation />
        <main className="flex-1 p-6">
          <div className="animate-fadeIn">
            <Dashboard />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
} 