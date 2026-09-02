# The Dot Protocol Blockchain

Open-source blockchain infrastructure for the Dot Protocol ecosystem.

## Overview

Dot Protocol is a Layer 1 blockchain built on Hyperledger Besu with QBFT consensus, supporting the DPC20 token standard and the Hexchange decentralized exchange.

## Networks

| Network | Chain ID | Currency | Status |
|---------|----------|----------|--------|
| Chennai Testnet | 1545 | TDOT | Development |
| Mainnet | 1546 | 3DOT | Pre-launch |

## Repository Structure

```
├── apps/
│   └── hexchange-api/       # DEX backend — order matching engine, REST + WebSocket API
├── packages/
│   ├── config/               # Shared chain configuration (addresses, RPC, tokenomics)
│   ├── contracts/            # Smart contract ABIs, addresses, and deploy scripts
│   └── wallet-lib/           # Wallet connection library (MetaMask, WalletConnect)
└── infra/
    └── besu/                 # Besu node configuration (genesis, network files)
```

## Smart Contracts

| Contract | Description |
|----------|-------------|
| DPC20 | Native token standard (1T supply cap, pause, rebase) |
| HexchangeFactory | AMM pair factory |
| HexchangeRouter | Token swap router (Uniswap V2-style) |
| HexchangeEscrow | P2P escrow with dispute resolution |
| HexchangePresale | Token presale with vesting |
| Oracle | Price oracle |
| Stabilization | Collateral and price stabilization |
| Governance | On-chain governance |
| Bridge | Cross-chain lock/mint bridge |

## Getting Started

```bash
# Install dependencies
npm install

# Run the Hexchange API
npm run dev:api
```

## Hexchange API

The backend order-matching engine runs on port 3006:

- `GET /api/orderbook/:pair` — Order book snapshot
- `GET /api/trades/:pair` — Recent trades
- `POST /api/orders` — Submit a limit order
- `DELETE /api/orders/:id` — Cancel an order
- `GET /api/health` — Health check

WebSocket at `ws://localhost:3006` for live order book updates.

## License

MIT
