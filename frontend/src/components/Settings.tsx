import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Save, CheckCircle, Wallet } from 'lucide-react'
import { useStellar } from '../context/StellarContext'

export default function Settings() {
  const { contractId, setContractId, walletAddress, setWalletAddress, network, setNetwork, connectWallet, isFreighterInstalled } = useStellar()
  const [connecting, setConnecting] = useState(false)
  const [freighterAvailable, setFreighterAvailable] = useState<boolean | null>(null)
  const [tempContractId, setTempContractId] = useState(contractId || '')
  const [tempWalletAddress, setTempWalletAddress] = useState(walletAddress || '')
  const [saved, setSaved] = useState(false)

  // Check Freighter availability on mount
  useEffect(() => {
    isFreighterInstalled().then(setFreighterAvailable).catch(() => setFreighterAvailable(false))
  }, [isFreighterInstalled])

  const handleSave = () => {
    if (tempContractId.trim()) {
      setContractId(tempContractId.trim())
    }
    if (tempWalletAddress.trim()) {
      setWalletAddress(tempWalletAddress.trim())
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-stellar-primary rounded-lg flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Settings</h2>
            <p className="text-gray-400 text-sm">Configure your Stellar contract and wallet</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Network
            </label>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="input-field"
            >
              <option value="testnet">Testnet</option>
              <option value="mainnet">Mainnet</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Current network: <span className="font-semibold">{network}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Contract ID
            </label>
            <input
              type="text"
              value={tempContractId}
              onChange={(e) => setTempContractId(e.target.value)}
              className="input-field font-mono text-sm"
              placeholder="Enter your deployed contract ID"
            />
            <p className="text-xs text-gray-500 mt-1">
              Get this from your contract deployment
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              Wallet Connection
            </label>
            {walletAddress ? (
              <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
                <p className="text-green-400 text-sm mb-2">
                  ✓ Connected: <span className="font-mono text-xs">{walletAddress}</span>
                </p>
                <button
                  onClick={() => setWalletAddress(null)}
                  className="btn-secondary text-sm mt-2"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div>
                {freighterAvailable === null ? (
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <p className="text-gray-400 text-sm">Checking Freighter...</p>
                  </div>
                ) : freighterAvailable ? (
                  <button
                    onClick={async () => {
                      try {
                        setConnecting(true)
                        await connectWallet()
                      } catch (err: any) {
                        alert('Failed to connect wallet: ' + err.message)
                      } finally {
                        setConnecting(false)
                      }
                    }}
                    disabled={connecting}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {connecting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Wallet className="w-5 h-5" />
                        Connect Freighter Wallet
                      </>
                    )}
                  </button>
                ) : (
                  <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                    <p className="text-yellow-400 text-sm mb-2">
                      ⚠️ Freighter wallet is not installed
                    </p>
                    <a
                      href="https://freighter.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stellar-primary hover:underline text-sm"
                    >
                      Install Freighter →
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              onClick={handleSave}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {saved ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Settings
                </>
              )}
            </button>
          </div>

          {contractId && (
            <div className="mt-6 p-4 bg-green-900/20 border border-green-700 rounded-lg">
              <p className="text-green-400 text-sm">
                ✓ Contract configured: <span className="font-mono text-xs">{contractId}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

