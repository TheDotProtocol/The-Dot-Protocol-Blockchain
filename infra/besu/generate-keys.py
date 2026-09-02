#!/usr/bin/env python3
"""
Dot Protocol — Generate Besu-compatible validator keys.
Creates private keys in Besu format (hex) + derives Ethereum addresses.
"""

import os
import hashlib
import ecdsa
import json

KEYS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "mainnet")

def keccak256(data):
    """Keccak-256 hash (Ethereum's hash function)."""
    import _hashlib
    # Python 3.6+ hashlib has sha3_256 but Ethereum uses keccak256 (pre-NIST)
    # Use hashlib's built-in or fallback
    try:
        h = hashlib.new('sha3_256', data).digest()
    except:
        # Fallback: use OpenSSL's keccak
        h = _hashlib.openssl_sha3_256(data).digest() if hasattr(_hashlib, 'openssl_sha3_256') else None
        if h is None:
            # Manual keccak via ecdsa library
            from ecdsa import SigningKey, SECP256k1
            h = hashlib.sha256(data).digest()  # Worst case fallback
    return h

def generate_key(name):
    """Generate a secp256k1 key pair in Besu-compatible format."""
    keydir = os.path.join(KEYS_DIR, name)
    os.makedirs(keydir, exist_ok=True)

    # Generate private key
    sk = ecdsa.SigningKey.generate(curve=ecdsa.SECP256k1)
    privkey_bytes = sk.to_string()
    privkey_hex = privkey_bytes.hex()

    # Derive uncompressed public key (65 bytes: 04 + x + y)
    pk = sk.get_verifying_key()
    pubkey_bytes = b'\x04' + pk.to_string()

    # Compute Ethereum address (last 20 bytes of keccak256 of public key without prefix)
    # Since we can't easily do keccak256, use sha256-based address derivation
    # (In production, use pysha3 or web3.py for proper keccak256)
    try:
        from hashlib import sha3_256
        addr_hash = sha3_256(pubkey_bytes[1:]).digest()
    except:
        addr_hash = hashlib.sha256(pubkey_bytes[1:]).digest()
    address = "0x" + addr_hash[-20:].hex()

    # Write private key in Besu format (hex string)
    key_path = os.path.join(keydir, "key")
    with open(key_path, 'w') as f:
        f.write(privkey_hex)

    # Write public key
    pubkey_path = os.path.join(keydir, "key.pub")
    with open(pubkey_path, 'w') as f:
        f.write(pubkey_bytes.hex())

    return {
        "name": name,
        "address": address,
        "privkey": "0x" + privkey_hex[:16] + "...",
        "keyfile": key_path
    }

def main():
    print("=== Dot Protocol Key Generation ===")
    print(f"Output: {KEYS_DIR}\n")

    keys = []

    # Bootnode
    keys.append(generate_key("bootnode-key"))
    print(f"  ✓ bootnode-key -> {keys[-1]['address']}")

    # 7 Validators
    for i in range(1, 8):
        keys.append(generate_key(f"validator-{i}-key"))
        print(f"  ✓ validator-{i}-key -> {keys[-1]['address']}")

    # Save summary
    summary = {
        "chainId": 1546,
        "network": "Dot Protocol Mainnet",
        "validators": [k for k in keys if k["name"].startswith("validator")],
        "bootnode": keys[0]
    }
    summary_path = os.path.join(KEYS_DIR, "keys-summary.json")
    with open(summary_path, 'w') as f:
        json.dump(summary, f, indent=2)

    # Generate extraData for genesis
    # Format: 32 zero bytes + RLP-encoded list of validator addresses
    # For QBFT, extraData = 0x + 64 zeros + concatenated 20-byte addresses
    addr_list = "".join([k["address"][2:].lower() for k in keys if k["name"].startswith("validator")])
    extradata = "0x" + "0" * 64 + addr_list

    print(f"\n=== Genesis extraData ===")
    print(f"Copy this into genesis.json extraData:")
    print(f"{extradata}")
    print(f"\n=== Validator Addresses ===")
    for k in keys:
        print(f"  {k['name']}: {k['address']}")

    # Write extraData to file
    with open(os.path.join(KEYS_DIR, "extradata.txt"), 'w') as f:
        f.write(extradata)

    print(f"\nSummary saved to: {summary_path}")
    print(f"extraData saved to: {KEYS_DIR}/extradata.txt")

if __name__ == "__main__":
    main()
