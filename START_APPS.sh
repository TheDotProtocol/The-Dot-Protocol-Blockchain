#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# The Dot Protocol — Full Stack Startup Script
# ═══════════════════════════════════════════════════════════════
# Run this from the project root:
#   chmod +x START_APPS.sh && ./START_APPS.sh
# ═══════════════════════════════════════════════════════════════

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

# Generate JWT secret
export JWT_SECRET=$(openssl rand -hex 32)
echo "🔑 JWT Secret generated"

echo ""
echo "═══════════════════════════════════════════════"
echo "  THE DOT PROTOCOL — Starting All Services"
echo "═══════════════════════════════════════════════"
echo ""

# ─── 1. Hexchange API ──────────────────────────────────────────
echo "📡 Starting Hexchange API (port 3006)..."
cd "$ROOT/apps/hexchange-api"
PORT=3006 npx tsx src/index.ts &
API_PID=$!
sleep 3
echo "   ✅ API: http://localhost:3006"
echo ""

# ─── 2. Hexchange DEX (Main App) ──────────────────────────────
echo "🔄 Starting Hexchange DEX (port 3005)..."
cd "$ROOT/apps/hexchange"
npx next dev -p 3005 &
DEX_PID=$!
sleep 3
echo "   ✅ DEX: http://localhost:3005"
echo ""

# ─── 3. Presale App ────────────────────────────────────────────
echo "💰 Starting Presale (port 3001)..."
cd "$ROOT/apps/presale"
npx next dev -p 3001 &
PRESALE_PID=$!
sleep 3
echo "   ✅ Presale: http://localhost:3001"
echo ""

# ─── 4. Explorer ───────────────────────────────────────────────
echo "🔍 Starting Explorer (port 3002)..."
cd "$ROOT/apps/explorer"
npx next dev -p 3002 &
EXPLORER_PID=$!
sleep 3
echo "   ✅ Explorer: http://localhost:3002"
echo ""

# ─── 5. Wallet ─────────────────────────────────────────────────
echo "🦊 Starting Wallet (port 3003)..."
cd "$ROOT/apps/wallet"
npx next dev -p 3003 &
WALLET_PID=$!
sleep 3
echo "   ✅ Wallet: http://localhost:3003"
echo ""

echo "═══════════════════════════════════════════════"
echo "  ALL SERVICES RUNNING"
echo "═══════════════════════════════════════════════"
echo ""
echo "  🔄 Hexchange DEX:     http://localhost:3005"
echo "  💰 Presale:           http://localhost:3001"
echo "  🔍 Explorer:          http://localhost:3002"
echo "  🦊 Wallet:            http://localhost:3003"
echo "  📡 API:               http://localhost:3006"
echo "  🔌 WebSocket:         ws://localhost:3006"
echo ""
echo "  Chains:"
echo "  ⛓️  Testnet (Chennai): localhost:8545 (Chain ID 1545)"
echo "  ⛓️  Mainnet:           localhost:9545 (Chain ID 1546)"
echo ""
echo "═══════════════════════════════════════════════"
echo "  Press Ctrl+C to stop all services"
echo "═══════════════════════════════════════════════"

# Wait for any process to exit
wait
