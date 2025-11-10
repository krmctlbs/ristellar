import { useState } from 'react'
import { Plus, Calendar, DollarSign, Users } from 'lucide-react'
import { useStellar } from '../context/StellarContext'
import { xdr, Address } from '@stellar/stellar-sdk'

export default function CreateEvent() {
  const { contract, rpc, walletAddress, invokeContract } = useStellar()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    totalTickets: '',
    price: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!contract || !rpc || !walletAddress) {
      alert('Please connect your wallet and configure contract first')
      return
    }

    try {
      setLoading(true)

      // Convert date to Unix timestamp
      const dateTimestamp = Math.floor(new Date(formData.date).getTime() / 1000)
      
      // Convert price to stroops (1 XLM = 10,000,000 stroops)
      const priceStroopsNum = Math.floor(parseFloat(formData.price) * 10_000_000)
      
      // Convert name and description to symbols (max 9 characters for symbol_short)
      const nameSymbol = formData.name.substring(0, 9).toUpperCase().replace(/[^A-Z0-9_]/g, '_')
      const descSymbol = formData.description.substring(0, 9).toUpperCase().replace(/[^A-Z0-9_]/g, '_')
      
      // Create i128 from number manually
      // For values < 2^63, hi will be 0
      const priceBigInt = BigInt(priceStroopsNum)
      const lowMask = BigInt('0xFFFFFFFFFFFFFFFF') // 64-bit mask
      const lo = priceBigInt & lowMask
      const hi = priceBigInt >> BigInt(64)
      
      // Build contract arguments
      const args: xdr.ScVal[] = [
        // organizer: Address
        new Address(walletAddress!).toScVal(),
        // name: Symbol - convert string to Uint8Array for symbol
        xdr.ScVal.scvSymbol(new TextEncoder().encode(nameSymbol)),
        // description: Symbol
        xdr.ScVal.scvSymbol(new TextEncoder().encode(descSymbol)),
        // date: u64
        xdr.ScVal.scvU64(xdr.Uint64.fromString(dateTimestamp.toString())),
        // total_tickets: u32
        xdr.ScVal.scvU32(parseInt(formData.totalTickets)),
        // price: i128 (stroops) - create manually
        xdr.ScVal.scvI128(
          new xdr.Int128Parts({
            hi: xdr.Int64.fromString(hi.toString(10)),
            lo: xdr.Uint64.fromString(lo.toString(10)),
          })
        ),
      ]

      // Debug: Log arguments before sending
      console.log('Contract arguments:', args)
      console.log('Price stroops:', priceStroopsNum)
      console.log('Name symbol:', nameSymbol)
      console.log('Desc symbol:', descSymbol)

      // Invoke contract
      await invokeContract('create_event', args)

      alert('Event created successfully!')

      // Reset form
      setFormData({
        name: '',
        description: '',
        date: '',
        totalTickets: '',
        price: '',
      })
    } catch (err: any) {
      alert('Failed to create event: ' + err.message)
      console.error('Error creating event:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-stellar-primary rounded-lg flex items-center justify-center">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Create New Event</h2>
            <p className="text-gray-400 text-sm">Set up your event on the blockchain</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Event Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="e.g., Summer Music Festival"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="input-field min-h-[100px] resize-none"
              placeholder="Describe your event..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                <Calendar className="w-4 h-4 inline mr-2" />
                Event Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                <Users className="w-4 h-4 inline mr-2" />
                Total Tickets
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.totalTickets}
                onChange={(e) =>
                  setFormData({ ...formData, totalTickets: e.target.value })
                }
                className="input-field"
                placeholder="100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Ticket Price (XLM)
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="input-field"
              placeholder="1.00"
            />
            <p className="text-xs text-gray-500 mt-1">
              Price per ticket in XLM
            </p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating Event...
                </span>
              ) : (
                'Create Event'
              )}
            </button>
          </div>
        </form>

        {!walletAddress && (
          <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
            <p className="text-yellow-400 text-sm">
              ⚠️ Please connect your wallet to create events
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

