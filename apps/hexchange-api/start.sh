#!/bin/bash
cd "$(dirname "$0")"

# Generate JWT secret if not set
if [ -z "$JWT_SECRET" ]; then
  export JWT_SECRET=$(openssl rand -hex 32)
  echo "Generated JWT_SECRET: ${JWT_SECRET:0:8}..."
fi

export PORT=${PORT:-3006}

echo "Starting Hexchange API on port $PORT..."
exec npx tsx src/index.ts
