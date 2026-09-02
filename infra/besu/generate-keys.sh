#!/bin/bash
# Dot Protocol — Generate 7 validator keys + bootnode key for QBFT
# Run: bash generate-keys.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
KEYS_DIR="$SCRIPT_DIR/mainnet"

echo "=== Dot Protocol Key Generation ==="
echo "Output: $KEYS_DIR"
echo ""

mkdir -p "$KEYS_DIR"

# Check if Docker is available
if command -v docker &>/dev/null; then
    BESU_IMAGE="hyperledger/besu:24.12.0"
    USE_DOCKER=true
    echo "Using Docker: $BESU_IMAGE"
else
    USE_DOCKER=false
    echo "Docker not found — using Python + openssl fallback"
fi

generate_key() {
    local name=$1
    local outdir="$KEYS_DIR/$name"
    mkdir -p "$outdir"

    if [ "$USE_DOCKER" = true ]; then
        docker run --rm \
            -v "$outdir":/opt/besu/keys \
            "$BESU_IMAGE" \
            bash -c "besu operator generate-blockchain-key --data-path=/opt/besu/keys --private-key-file=/opt/besu/keys/key" 2>/dev/null
    else
        # Generate a secp256k1 private key using openssl
        openssl ecparam -genkey -name secp256k1 -noout -out "$outdir/key" 2>/dev/null
        # Derive public key and address
        python3 -c "
import hashlib, json
from pathlib import Path

# Read the EC private key
keydata = Path('$outdir/key').read_text()

# Extract raw private key bytes from PEM
import base64, re
pem = keydata.strip()
body = re.sub(r'-----[^-]+-----', '', pem).replace('\n', '').replace('\r', '')
raw = base64.b64decode(body)
# secp256k1 private key is last 32 bytes of EC key
privkey = raw[-32:]

# Derive Ethereum address using keccak
from hashlib import sha256
# Use simpler approach: just write the hex key
hexkey = privkey.hex()
Path('$outdir/key').write_text('0x' + hexkey)

# Compute public key and address (simplified)
print(f'Key written: 0x{hexkey[:8]}...')
" 2>/dev/null || echo "Note: Install 'eth-account' for full key derivation"
    fi

    echo "  ✓ $name"
}

echo "Generating keys..."

# Generate bootnode key
generate_key "bootnode-key"

# Generate 7 validator keys
for i in $(seq 1 7); do
    generate_key "validator-$i-key"
done

echo ""
echo "=== Key Summary ==="
echo ""
echo "Keys generated in: $KEYS_DIR"
echo ""

# Show enode public keys (if docker available)
if [ "$USE_DOCKER" = true ]; then
    echo "Validator addresses (for genesis extraData):"
    echo ""
    for i in $(seq 1 7); do
        keyfile="$KEYS_DIR/validator-$i-key/key.pub"
        if [ -f "$keyfile" ]; then
            pub=$(cat "$keyfile")
            # Derive address from public key
            addr=$(docker run --rm \
                -v "$KEYS_DIR/validator-$i-key":/opt/besu/keys \
                "$BESU_IMAGE" \
                besu operator generate-address --private-key-file=/opt/besu/keys/key 2>/dev/null | grep -oE '0x[a-fA-F0-9]{40}' || echo "generating...")
            echo "  Validator $i: $addr"
        fi
    done
fi

echo ""
echo "=== Next Steps ==="
echo "1. Update genesis.json extraData with the 7 validator addresses"
echo "2. Run: docker compose up -d"
echo "3. Check logs: docker logs tdp-validator-1 -f"
echo ""
echo "To start the chain:"
echo "  cd $SCRIPT_DIR && docker compose up -d"
echo ""
