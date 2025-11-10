# Stellar Event Ticketing - Frontend

Modern React + TypeScript frontend for the Stellar Event Ticketing System.

## Features

- 🎨 Beautiful, modern UI with Tailwind CSS
- 📱 Fully responsive design
- ⚡ Fast development with Vite
- 🔒 Type-safe with TypeScript
- 🎯 Event creation and management
- 🎟️ Ticket purchase and viewing
- 🔄 Ticket transfer functionality

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Configuration

Before using the app, you need to:

1. Deploy the smart contract to Stellar testnet
2. Get the contract ID from deployment
3. Enter the contract ID in the app (Settings will be added)
4. Connect your Stellar wallet (wallet integration coming soon)

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **@stellar/stellar-sdk** - Stellar blockchain integration
- **Lucide React** - Icons

## Project Structure

```
frontend/
├── src/
│   ├── components/      # React components
│   │   ├── EventList.tsx
│   │   ├── CreateEvent.tsx
│   │   └── MyTickets.tsx
│   ├── context/         # React context
│   │   └── StellarContext.tsx
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── index.html
└── package.json
```

## Notes

- Currently, the frontend provides a UI framework. Full wallet integration and transaction signing will be added in future updates.
- Contract interaction requires proper XDR encoding/decoding which will be implemented with wallet integration.

