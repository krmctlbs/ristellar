import { useState, useEffect } from 'react'
import { Ticket, Calendar, CheckCircle, Send } from 'lucide-react'
import { useStellar } from '../context/StellarContext'

interface TicketData {
  id: number
  event_id: number
  purchased_at: number
}

export default function MyTickets() {
  const { contract, rpc, walletAddress } = useStellar()
  const [tickets, setTickets] = useState<TicketData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [transferring, setTransferring] = useState<number | null>(null)
  const [transferAddress, setTransferAddress] = useState('')

  useEffect(() => {
    if (walletAddress) {
      loadTickets()
    } else {
      setLoading(false)
    }
  }, [walletAddress, contract])

  const loadTickets = async () => {
    if (!contract || !rpc || !walletAddress) {
      setError('Please connect your wallet')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      // Call get_user_tickets
      // In a real implementation, you would parse the XDR response
      setTickets([])
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to load tickets')
      console.error('Error loading tickets:', err)
    } finally {
      setLoading(false)
    }
  }

  const transferTicket = async (ticketId: number) => {
    if (!contract || !rpc || !walletAddress || !transferAddress) {
      alert('Please enter a recipient address')
      return
    }

    try {
      setTransferring(ticketId)
      // In a real implementation, you would:
      // 1. Build and sign the transaction
      // 2. Submit it to the network
      // 3. Wait for confirmation
      alert('Ticket transfer requires wallet integration')
      setTransferAddress('')
    } catch (err: any) {
      alert('Failed to transfer ticket: ' + err.message)
    } finally {
      setTransferring(null)
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

  if (!walletAddress) {
    return (
      <div className="card text-center py-12">
        <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
        <p className="text-gray-400">
          Please connect your Stellar wallet to view your tickets
        </p>
      </div>
    )
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
        <button onClick={loadTickets} className="btn-primary">
          Retry
        </button>
      </div>
    )
  }

  if (tickets.length === 0) {
    return (
      <div className="card text-center py-12">
        <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <h3 className="text-xl font-semibold mb-2">No Tickets Yet</h3>
        <p className="text-gray-400 mb-6">
          Purchase tickets from events to see them here
        </p>
        <button onClick={loadTickets} className="btn-secondary">
          Refresh
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Tickets</h2>
        <button onClick={loadTickets} className="btn-secondary text-sm">
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="card hover:border-stellar-primary transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="font-semibold">Ticket #{ticket.id}</span>
                </div>
                <p className="text-sm text-gray-400">Event ID: {ticket.event_id}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Purchased: {formatDate(ticket.purchased_at)}</span>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <div className="mb-3">
                <input
                  type="text"
                  value={transferAddress}
                  onChange={(e) => setTransferAddress(e.target.value)}
                  placeholder="Recipient address"
                  className="input-field text-sm mb-2"
                />
                <button
                  onClick={() => transferTicket(ticket.id)}
                  disabled={transferring === ticket.id || !transferAddress}
                  className="btn-secondary w-full text-sm flex items-center justify-center gap-2"
                >
                  {transferring === ticket.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Transferring...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Transfer Ticket
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

