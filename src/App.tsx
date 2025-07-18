import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import { Sidebar } from './components/layout/Sidebar'
import { Dashboard } from './components/pages/Dashboard'
import Positions from './components/pages/Positions'
import Strategy from './components/pages/Strategy'
import { Toaster } from './components/ui/toaster'
import { Loader2 } from 'lucide-react'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('dashboard')

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-lg">Loading Binance Manager...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Please sign in to continue</h1>
          <p className="text-muted-foreground">You need to be authenticated to access the trading dashboard</p>
        </div>
      </div>
    )
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'portfolio':
        return <div className="p-8 text-center text-muted-foreground">Portfolio page coming soon...</div>
      case 'positions':
        return <Positions />
      case 'orders':
        return <div className="p-8 text-center text-muted-foreground">Orders page coming soon...</div>
      case 'analytics':
        return <div className="p-8 text-center text-muted-foreground">Analytics page coming soon...</div>
      case 'strategy':
        return <Strategy />
      case 'settings':
        return <div className="p-8 text-center text-muted-foreground">Settings page coming soon...</div>
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main className="lg:pl-64">
        <div className="p-6 lg:p-8 pt-16 lg:pt-8">
          {renderPage()}
        </div>
      </main>

      <Toaster />
    </div>
  )
}

export default App