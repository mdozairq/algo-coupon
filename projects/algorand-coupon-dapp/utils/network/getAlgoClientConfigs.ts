import { AlgoViteClientConfig, AlgoViteKMDConfig } from '../../interfaces/network'


export function getAlgodConfigFromViteEnvironment(): AlgoViteClientConfig {
  return {
    server: process.env.NEXT_PUBLIC_ALGOD_SERVER || 'https://testnet-api.algonode.cloud',
    port: Number(process.env.NEXT_PUBLIC_ALGOD_PORT) || 443,
    token: process.env.NEXT_PUBLIC_ALGOD_TOKEN || '',
    network: process.env.NEXT_PUBLIC_ALGOD_NETWORK || 'testnet',
  }
}

export function getIndexerConfigFromViteEnvironment(): AlgoViteClientConfig {
  if (!process.env.VITE_INDEXER_SERVER) {
    throw new Error('Attempt to get default algod configuration without specifying VITE_INDEXER_SERVER in the environment variables')
  }

  return {
    server: process.env.VITE_INDEXER_SERVER,
    port: process.env.VITE_INDEXER_PORT || 443,
    token: process.env.VITE_INDEXER_TOKEN,
    network: process.env.VITE_ALGOD_NETWORK || 'testnet',
  }
}

export function getKmdConfigFromViteEnvironment(): AlgoViteClientConfig {
  return {
    server: process.env.NEXT_PUBLIC_KMD_SERVER || 'http://localhost',
    port: Number(process.env.NEXT_PUBLIC_KMD_PORT) || 4002,
    token: process.env.NEXT_PUBLIC_KMD_TOKEN || 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    network: 'localnet',
  }
}
