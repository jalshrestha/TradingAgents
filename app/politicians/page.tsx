import { PoliticiansGrid } from '@/components/politicians/politicians-grid'
import { Header } from '@/components/layout/header'
import { Navigation } from '@/components/layout/navigation'
import { Footer } from '@/components/layout/footer'

export default function PoliticiansPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Navigation />
        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Politicians</h2>
              <p className="text-gray-600">
                View STOCK Act disclosure trading activity by individual politicians
              </p>
            </div>
            <PoliticiansGrid />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
} 