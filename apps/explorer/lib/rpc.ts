import { CHENNAI } from '@/config/chain';
import { hexToNumber } from '@/lib/format';

const RPC_URL = CHENNAI.rpcUrl;

export type RpcBlock = {
  number: string;
  hash: string;
  parentHash: string;
  timestamp: string;
  miner: string;
  gasUsed: string;
  gasLimit: string;
  transactions: string[] | RpcTransaction[];
  size: string;
};

export type RpcTransaction = {
  hash: string;
  blockNumber: string;
  blockHash: string;
  from: string;
  to: string | null;
  value: string;
  gas: string;
  gasPrice: string;
  input: string;
  nonce: string;
  transactionIndex: string;
};

export type RpcReceipt = {
  transactionHash: string;
  blockNumber: string;
  from: string;
  to: string | null;
  gasUsed: string;
  status: string;
  contractAddress: string | null;
  logs: Array<{
    address: string;
    topics: string[];
    data: string;
  }>;
};

async function rpcCall<T>(method: string, params: unknown[]): Promise<T> {
  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
    next: { revalidate: 3 },
  });

  const json = await res.json();
  if (json.error) {
    throw new Error(json.error.message ?? 'RPC error');
  }
  return json.result as T;
}

export async function getChainId(): Promise<number> {
  const hex = await rpcCall<string>('eth_chainId', []);
  return hexToNumber(hex);
}

export async function getBlockNumber(): Promise<number> {
  const hex = await rpcCall<string>('eth_blockNumber', []);
  return hexToNumber(hex);
}

export async function getPeerCount(): Promise<number> {
  const hex = await rpcCall<string>('net_peerCount', []);
  return hexToNumber(hex);
}

export async function getBlockByNumber(
  blockNumber: number,
  fullTxs = false
): Promise<RpcBlock | null> {
  const hex = `0x${blockNumber.toString(16)}`;
  return rpcCall<RpcBlock | null>('eth_getBlockByNumber', [hex, fullTxs]);
}

export async function getBlockByHash(
  hash: string,
  fullTxs = false
): Promise<RpcBlock | null> {
  return rpcCall<RpcBlock | null>('eth_getBlockByHash', [hash, fullTxs]);
}

export async function getLatestBlocks(count = 15): Promise<RpcBlock[]> {
  const latest = await getBlockNumber();
  const blocks: RpcBlock[] = [];

  for (let i = 0; i < count && latest - i >= 0; i++) {
    const block = await getBlockByNumber(latest - i, false);
    if (block) blocks.push(block);
  }

  return blocks;
}

export async function getTransaction(hash: string): Promise<RpcTransaction | null> {
  return rpcCall<RpcTransaction | null>('eth_getTransactionByHash', [hash]);
}

export async function getTransactionReceipt(hash: string): Promise<RpcReceipt | null> {
  return rpcCall<RpcReceipt | null>('eth_getTransactionReceipt', [hash]);
}

export async function getBalance(address: string): Promise<string> {
  return rpcCall<string>('eth_getBalance', [address, 'latest']);
}

export async function getCode(address: string): Promise<string> {
  return rpcCall<string>('eth_getCode', [address, 'latest']);
}

export async function getTransactionCount(address: string): Promise<number> {
  const hex = await rpcCall<string>('eth_getTransactionCount', [address, 'latest']);
  return hexToNumber(hex);
}

async function ethCall(to: string, data: string): Promise<string> {
  return rpcCall<string>('eth_call', [{ to, data }, 'latest']);
}

function encodeAddressCall(selector: string, address: string): string {
  const padded = address.slice(2).toLowerCase().padStart(64, '0');
  return selector + padded;
}

export async function getDpc20Balance(address: string): Promise<string> {
  const data = encodeAddressCall('0x70a08231', address);
  return ethCall(CHENNAI.dpc20.address, data);
}

export async function getDpc20Symbol(): Promise<string> {
  const result = await ethCall(CHENNAI.dpc20.address, '0x95d89b41');
  return decodeString(result);
}

export async function getDpc20Standard(): Promise<string> {
  try {
    const result = await ethCall(CHENNAI.dpc20.address, '0xbcaedade');
    return decodeString(result);
  } catch {
    return 'DPC20';
  }
}

function decodeString(hex: string): string {
  if (!hex || hex === '0x') return '';
  const raw = hex.slice(2);
  const len = parseInt(raw.slice(64, 128), 16);
  const strHex = raw.slice(128, 128 + len * 2);
  let str = '';
  for (let i = 0; i < strHex.length; i += 2) {
    str += String.fromCharCode(parseInt(strHex.slice(i, i + 2), 16));
  }
  return str;
}

export async function getChainStatus() {
  try {
    const [chainId, blockNumber, peerCount] = await Promise.all([
      getChainId(),
      getBlockNumber(),
      getPeerCount(),
    ]);
    return { online: true, chainId, blockNumber, peerCount };
  } catch {
    return { online: false, chainId: CHENNAI.chainId, blockNumber: 0, peerCount: 0 };
  }
}
