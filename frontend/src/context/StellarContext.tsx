import { createContext, useContext, useState, ReactNode } from 'react'
import { Contract, SorobanRpc, xdr, Networks, TransactionBuilder, Account, Operation } from '@stellar/stellar-sdk'
import { isConnected, requestAccess, getAddress, signTransaction } from '@stellar/freighter-api'

interface StellarContextType {
  contractId: string | null
  setContractId: (id: string) => void
  network: string
  setNetwork: (network: string) => void
  contract: Contract | null
  rpc: SorobanRpc.Server | null
  walletAddress: string | null
  setWalletAddress: (address: string | null) => void
  connectWallet: () => Promise<void>
  invokeContract: (functionName: string, args: xdr.ScVal[]) => Promise<any>
  isFreighterInstalled: () => Promise<boolean>
}

const StellarContext = createContext<StellarContextType | undefined>(undefined)

export function StellarProvider({ children }: { children: ReactNode }) {
  const [contractId, setContractId] = useState<string | null>(
    localStorage.getItem('contractId')
  )
  const [network, setNetwork] = useState<string>('testnet')
  const [walletAddress, setWalletAddress] = useState<string | null>(
    localStorage.getItem('walletAddress')
  )

  const rpc =
    network === 'testnet'
      ? new SorobanRpc.Server('https://soroban-testnet.stellar.org')
      : new SorobanRpc.Server('https://soroban-rpc.mainnet.stellar.org')

  const contract = contractId ? new Contract(contractId) : null

  const isFreighterInstalled = async (): Promise<boolean> => {
    try {
      const result = await isConnected()
      if (result.error) {
        return false
      }
      return result.isConnected
    } catch {
      return false
    }
  }

  const connectWallet = async (): Promise<void> => {
    try {
      // Check if Freighter is installed
      const connectedResult = await isConnected()
      if (connectedResult.error || !connectedResult.isConnected) {
        throw new Error('Freighter wallet is not installed. Please install it from https://freighter.app')
      }

      // Request access
      const accessResult = await requestAccess()
      if (accessResult.error) {
        throw new Error(accessResult.error.message || 'Access denied')
      }

      // Get address
      const addressResult = await getAddress()
      if (addressResult.error) {
        throw new Error(addressResult.error.message || 'Failed to get address')
      }

      setWalletAddress(addressResult.address)
      localStorage.setItem('walletAddress', addressResult.address)
    } catch (error: any) {
      throw new Error('Failed to connect wallet: ' + (error.message || 'Unknown error'))
    }
  }

  const invokeContract = async (functionName: string, args: xdr.ScVal[]): Promise<any> => {
    if (!contract || !rpc || !walletAddress) {
      throw new Error('Contract, RPC, or wallet not configured')
    }

    // Check if Freighter is connected
    const connectedResult = await isConnected()
    if (connectedResult.error || !connectedResult.isConnected) {
      throw new Error('Freighter wallet is not connected')
    }

    try {
      // Get account details
      const accountResponse = await rpc.getAccount(walletAddress)
      const account = new Account(walletAddress, accountResponse.sequenceNumber())

      // Build transaction
      const networkPassphrase = network === 'testnet' ? Networks.TESTNET : Networks.PUBLIC
      
      // Create contract invocation operation using Operation.invokeContractFunction directly
      // This ensures proper XDR encoding
      // Use contractId (C...) format instead of address
      const contractMethod = Operation.invokeContractFunction({
        contract: contract.contractId(),
        function: functionName,
        args: args,
      })
      
      const transaction = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase,
      })
        .addOperation(contractMethod)
        .setTimeout(30)
        .build()

      // Simulate transaction
      const simulation = await rpc.simulateTransaction(transaction)
      if (SorobanRpc.Api.isSimulationError(simulation)) {
        throw new Error('Transaction simulation failed: ' + JSON.stringify(simulation))
      }

      // Prepare transaction (merge simulation results)
      const preparedTransaction = await rpc.prepareTransaction(transaction)
      
      // Sign with Freighter
      const signResult = await signTransaction(
        preparedTransaction.toXDR(),
        { networkPassphrase: networkPassphrase }
      )
      
      if (signResult.error) {
        throw new Error('Transaction signing failed: ' + (signResult.error.message || 'Unknown error'))
      }

      // Submit transaction
      const signedTransaction = TransactionBuilder.fromXDR(signResult.signedTxXdr, networkPassphrase)
      const response = await rpc.sendTransaction(signedTransaction)
      
      // Wait for transaction to complete
      let getTransactionResponse = await rpc.getTransaction(response.hash)
      
      // Poll until transaction is complete
      while (getTransactionResponse.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        getTransactionResponse = await rpc.getTransaction(response.hash)
      }
      
      if (getTransactionResponse.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
        // Return the successful transaction response
        // The result can be accessed from getTransactionResponse if needed
        return getTransactionResponse
      } else {
        throw new Error('Transaction failed: ' + JSON.stringify(getTransactionResponse))
      }
    } catch (error: any) {
      throw new Error('Failed to invoke contract: ' + (error.message || 'Unknown error'))
    }
  }

  const value: StellarContextType = {
    contractId,
    setContractId: (id: string) => {
      setContractId(id)
      localStorage.setItem('contractId', id)
    },
    network,
    setNetwork,
    contract,
    rpc,
    walletAddress,
    setWalletAddress: (address: string | null) => {
      setWalletAddress(address)
      if (address) {
        localStorage.setItem('walletAddress', address)
      } else {
        localStorage.removeItem('walletAddress')
      }
    },
    connectWallet,
    invokeContract,
    isFreighterInstalled,
  }

  return (
    <StellarContext.Provider value={value}>{children}</StellarContext.Provider>
  )
}

export function useStellar() {
  const context = useContext(StellarContext)
  if (context === undefined) {
    throw new Error('useStellar must be used within a StellarProvider')
  }
  return context
}

