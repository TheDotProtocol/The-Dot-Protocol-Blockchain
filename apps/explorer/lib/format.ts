import { CHENNAI } from '@/config/chain';

export function hexToNumber(hex: string): number {
  return parseInt(hex, 16);
}

export function formatBlockNumber(n: number | string): string {
  const num = typeof n === 'string' ? parseInt(n, 10) : n;
  return num.toLocaleString();
}

export function formatHash(hash: string, chars = 8): string {
  if (!hash || hash.length < chars * 2 + 2) return hash;
  return `${hash.slice(0, chars + 2)}…${hash.slice(-chars)}`;
}

export function formatAddress(addr: string, chars = 6): string {
  return formatHash(addr, chars);
}

export function formatWei(hex: string, decimals = CHENNAI.currency.decimals): string {
  if (!hex || hex === '0x') return '0';
  const raw = BigInt(hex);
  const divisor = BigInt(10) ** BigInt(decimals);
  const whole = raw / divisor;
  const frac = raw % divisor;
  if (frac === BigInt(0)) return whole.toLocaleString();
  const fracStr = frac.toString().padStart(decimals, '0').replace(/0+$/, '');
  return `${whole.toLocaleString()}.${fracStr}`;
}

export function formatTimestamp(hex: string): string {
  const ts = hexToNumber(hex) * 1000;
  return new Date(ts).toLocaleString();
}

export function formatGas(hex: string): string {
  return hexToNumber(hex).toLocaleString();
}

export function isAddress(input: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(input);
}

export function isTxOrBlockHash(input: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(input);
}

export function isBlockNumber(input: string): boolean {
  return /^\d+$/.test(input);
}

export function classifySearch(input: string): 'address' | 'hash' | 'block' | null {
  const trimmed = input.trim();
  if (isAddress(trimmed)) return 'address';
  if (isBlockNumber(trimmed)) return 'block';
  if (isTxOrBlockHash(trimmed)) return 'hash';
  return null;
}
