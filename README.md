# Stellar Event Ticketing System

A decentralized event ticketing system built on Stellar Soroban smart contracts. This project demonstrates NFT-like ticket ownership, event creation, ticket purchasing, and transfer capabilities on the Stellar blockchain.

## 🎫 Features

### Smart Contract Features
- ✅ Event creation (create_event)
- ✅ Event listing (get_all_events)
- ✅ Ticket purchasing (purchase_ticket)
- ✅ Ticket transfer (transfer_ticket)
- ✅ Ticket ownership verification (verify_ticket)
- ✅ User ticket viewing (get_user_tickets)
- ✅ Event statistics (get_event_stats)

### Frontend Features
- 🎨 Modern, responsive UI (React + TypeScript + Tailwind CSS)
- 📱 Mobile-friendly design
- 🎯 Event creation interface
- 🎟️ Ticket purchasing and viewing
- 🔄 Ticket transfer functionality
- 📊 Event statistics and visualization
- 🔐 Freighter wallet integration

## 📁 Project Structure

```
stellar/
├── src/                    # Smart Contract (Rust)
│   ├── lib.rs             # Main contract code
│   └── test.rs            # Test files
├── frontend/               # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── context/       # Stellar context provider
│   │   └── App.tsx        # Main application
│   └── package.json
├── Cargo.toml             # Rust project configuration
├── build.ps1              # Build script (PowerShell)
├── deploy.ps1              # Deploy script (PowerShell)
└── README.md
```

## 🚀 Setup

### Prerequisites

1. **Rust** (for Stellar smart contracts)
   - Install from [rustup.rs](https://rustup.rs/)
   - On Windows, ensure MSVC toolchain is installed

2. **Soroban CLI** (v21.0.0+)
   ```bash
   cargo install --locked --version 21.0.0 soroban-cli
   ```

3. **Node.js** (v18+) and **npm/yarn** (for Frontend)

4. **Stellar Testnet Account**
   - Create at [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test)

### 1. Build Smart Contract

```bash
# Build the contract
soroban contract build
```

This creates `target/wasm32v1-none/release/stellar_contract.wasm`.

### 2. Run Tests

```bash
cargo test
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
```

## 🌐 Deploy to Testnet

### 1. Generate Testnet Account

```bash
# Generate a new keypair
soroban keys generate <key-name> --fund

# Or fund manually at:
# https://laboratory.stellar.org/#account-creator?network=test
```

### 2. Deploy Contract

```bash
# Deploy to testnet
soroban contract deploy \
  --wasm target/wasm32v1-none/release/stellar_contract.wasm \
  --source <key-name> \
  --network testnet
```

After deployment, you'll receive a Contract ID. Use this ID in the frontend.

### 3. Initialize Contract

```bash
# Initialize the contract
soroban contract invoke \
  --id <contract-id> \
  --source <key-name> \
  --network testnet \
  -- initialize
```

## 💻 Run Frontend

```bash
cd frontend
npm run dev
```

The application will open at `http://localhost:3000`.

### Frontend Configuration

1. Open the application in your browser
2. Enter the Contract ID in Settings
3. Connect your Freighter wallet
4. Start creating events!

## 📚 Contract Functions

### `initialize()`
Initializes the contract. Must be called once after deployment.

### `create_event(organizer, name, description, date, total_tickets, price) -> u32`
Creates a new event and returns the event ID.

**Parameters:**
- `organizer`: Event organizer address
- `name`: Event name (Symbol, max 9 chars)
- `description`: Event description (Symbol, max 9 chars)
- `date`: Event date (Unix timestamp)
- `total_tickets`: Total number of tickets
- `price`: Ticket price in stroops (1 XLM = 10,000,000 stroops)

### `get_event(event_id) -> Event`
Returns event details for the specified event ID.

### `get_all_events() -> Vec<Event>`
Returns all events as a list.

### `purchase_ticket(buyer, event_id) -> u32`
Purchases a ticket for an event and returns the ticket ID.

### `get_ticket(ticket_id) -> Ticket`
Returns ticket details for the specified ticket ID.

### `get_user_tickets(user) -> Vec<u32>`
Returns all ticket IDs owned by a user.

### `transfer_ticket(from, to, ticket_id)`
Transfers a ticket to another user.

### `verify_ticket(ticket_id, owner) -> bool`
Verifies if a ticket belongs to the specified user.

### `get_event_stats(event_id) -> (u32, u32)`
Returns event statistics (sold tickets, total tickets).

## 📝 Example Usage

### Create Event

```bash
soroban contract invoke \
  --id <contract-id> \
  --source <key-name> \
  --network testnet \
  -- create_event \
  --organizer <organizer-address> \
  --name "Concert" \
  --description "MusicEvt" \
  --date 1735689600 \
  --total_tickets 100 \
  --price 10000000
```

### Purchase Ticket

```bash
soroban contract invoke \
  --id <contract-id> \
  --source <key-name> \
  --network testnet \
  -- purchase_ticket \
  --buyer <buyer-address> \
  --event_id 0
```

### Transfer Ticket

```bash
soroban contract invoke \
  --id <contract-id> \
  --source <key-name> \
  --network testnet \
  -- transfer_ticket \
  --from <from-address> \
  --to <to-address> \
  --ticket_id 0
```

## 🎨 Frontend Components

1. **EventList**: Lists all events and provides ticket purchasing
2. **CreateEvent**: Form for creating new events
3. **MyTickets**: Shows user's tickets and enables transfers
4. **Settings**: Contract configuration and wallet connection

### Design Features

- Modern gradient backgrounds
- Responsive grid layout
- Smooth animations and transitions
- Stellar-themed color palette (purple and cyan)
- Dark mode optimized

## 🔒 Security Notes

- Tickets are NFT-like, each ticket is unique
- Only ticket owner can transfer (require_auth check)
- Cannot purchase tickets for past events
- Cannot purchase tickets when event is sold out

## 🚧 Future Improvements

- [ ] Real XLM payment for ticket purchases
- [ ] QR code ticket verification
- [ ] Event search and filtering
- [ ] Ticket cancellation and refund mechanism
- [ ] Organizer dashboard
- [ ] Ticket history and analytics
- [ ] Multi-wallet support (WalletConnect, etc.)

## 📖 Useful Links

- [Stellar Developer Docs](https://developers.stellar.org/docs/build)
- [Soroban Example Contracts](https://developers.stellar.org/docs/build/smart-contracts/example-contracts)
- [Hello World Tutorial](https://developers.stellar.org/docs/build/smart-contracts/getting-started/hello-world)
- [Deploy to Testnet](https://developers.stellar.org/docs/build/smart-contracts/getting-started/deploy-to-testnet)

## 📄 License

This project is for educational purposes.
