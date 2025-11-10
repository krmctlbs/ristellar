import { useState } from 'react'
import { Calendar, Ticket, Plus, Settings } from 'lucide-react'
import EventList from './components/EventList'
import CreateEvent from './components/CreateEvent'
import MyTickets from './components/MyTickets'
import SettingsComponent from './components/Settings'
import { StellarProvider } from './context/StellarContext'

function App() {
  const [activeTab, setActiveTab] = useState<'events' | 'create' | 'tickets' | 'settings'>('events')

  return (
    <StellarProvider>
      <div className="min-h-screen bg-gradient-to-br from-stellar-dark via-purple-900 to-stellar-dark">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-stellar-primary to-stellar-secondary rounded-xl flex items-center justify-center">
                  <Ticket className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-stellar-primary to-stellar-secondary bg-clip-text text-transparent">
                    Stellar Events
                  </h1>
                  <p className="text-gray-400 text-sm">Blockchain-powered ticketing</p>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 bg-stellar-light rounded-xl p-2 border border-gray-800">
              <button
                onClick={() => setActiveTab('events')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
                  activeTab === 'events'
                    ? 'bg-stellar-primary text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Events</span>
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
                  activeTab === 'create'
                    ? 'bg-stellar-primary text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Create Event</span>
              </button>
              <button
                onClick={() => setActiveTab('tickets')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
                  activeTab === 'tickets'
                    ? 'bg-stellar-primary text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Ticket className="w-5 h-5" />
                <span className="font-medium">My Tickets</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
                  activeTab === 'settings'
                    ? 'bg-stellar-primary text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Main Content */}
          <main>
            {activeTab === 'events' && <EventList />}
            {activeTab === 'create' && <CreateEvent />}
            {activeTab === 'tickets' && <MyTickets />}
            {activeTab === 'settings' && <SettingsComponent />}
          </main>

          {/* Footer */}
          <footer className="mt-12 text-center text-gray-500 text-sm">
            <p>Powered by Stellar Soroban Smart Contracts</p>
          </footer>
        </div>
      </div>
    </StellarProvider>
  )
}

export default App

