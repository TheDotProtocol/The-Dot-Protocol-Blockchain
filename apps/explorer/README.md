# Dot Protocol Scan (Explorer)

Custom block explorer for Dot Protocol Chennai testnet.

**Dev:** `npm run dev:explorer` from repo root → http://localhost:3002

## Features (v1)

- Latest blocks table with auto-refresh (3s revalidate)
- Block detail (height, hash, gas, transactions)
- Transaction detail (status, logs, DPC20 events)
- Address lookup (native TDOT + DPC20 token balance)
- Search by block number, address, or tx hash

## Requirements

Chennai testnet must be running:

```bash
npm run chain:chennai:up
```

## Environment

```bash
CHENNAI_RPC=http://127.0.0.1:8545
NEXT_PUBLIC_WEBSITE_URL=http://localhost:3000
```
