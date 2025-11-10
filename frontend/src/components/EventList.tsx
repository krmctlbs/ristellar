import { useState, useEffect } from 'react'
import { Calendar, Users, Ticket } from 'lucide-react'
import { useStellar } from '../context/StellarContext'

interface Event {
  id: number
  name: string
  description: string
  date: number
  total_tickets: number
  price: number
  sold: number
}

export default function EventList() {
  const { contract, rpc, walletAddress } = useStellar()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [purchasing, setPurchasing] = useState<number | null>(null)

  useEffect(() => {
    loadEvents()
  }, [contract])

  const loadEvents = async () => {
    if (!contract || !rpc) {
      setError('Contract not configured. Please set contract ID in settings.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      // Call get_all_events
      // Note: In a real implementation, you would properly decode the XDR response
      // For now, this is a placeholder that shows the UI structure
      const eventsList: Event[] = []
      setEvents(eventsList)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to load events')
      console.error('Error loading events:', err)
    } finally {
      setLoading(false)
    }
  }

  const purchaseTicket = async (eventId: number) => {
    if (!contract || !rpc || !walletAddress) {
      alert('Please connect your wallet first')
      return
    }

    try {
      setPurchasing(eventId)
      // In a real implementation, you would:
      // 1. Build and sign the transaction
      // 2. Submit it to the network
      // 3. Wait for confirmation
      alert('Ticket purchase functionality requires wallet integration')
    } catch (err: any) {
      alert('Failed to purchase ticket: ' + err.message)
    } finally {
      setPurchasing(null)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPrice = (stroops: number) => {
    return (stroops / 10_000_000).toFixed(2) + ' XLM'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stellar-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-red-400 mb-4">{error}</div>
        <button onClick={loadEvents} className="btn-primary">
          Retry
        </button>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="card text-center py-12">
        <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <h3 className="text-xl font-semibold mb-2">No Events Yet</h3>
        <p className="text-gray-400 mb-6">
          Create your first event to get started!
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Upcoming Events</h2>
        <button onClick={loadEvents} className="btn-secondary text-sm">
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => {
          const available = event.total_tickets - event.sold
          const progress = (event.sold / event.total_tickets) * 100

          return (
            <div key={event.id} className="card hover:border-stellar-primary transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{event.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{event.description}</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>
                    {event.sold} / {event.total_tickets} tickets sold
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-stellar-secondary">
                  <Ticket className="w-4 h-4" />
                  <span>{formatPrice(event.price)}</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Availability</span>
                  <span>{available} remaining</span>
                </div>
                <div className="w-full bg-stellar-dark rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-stellar-primary to-stellar-secondary h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <button
                onClick={() => purchaseTicket(event.id)}
                disabled={available === 0 || purchasing === event.id}
                className={`w-full ${
                  available === 0
                    ? 'btn-secondary opacity-50 cursor-not-allowed'
                    : 'btn-primary'
                }`}
              >
                {purchasing === event.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </span>
                ) : available === 0 ? (
                  'Sold Out'
                ) : (
                  'Purchase Ticket'
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

