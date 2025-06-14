import { SupportedWallet, WalletId, WalletManager } from '@txnlab/use-wallet-react'

export function getSupportedWallets() {
  return [
    // { id: WalletId.DEFLY },
    { id: WalletId.PERA },
    // { id: WalletId.EXODUS },
  ]
}

export function getWalletManager() {
  const supportedWallets = getSupportedWallets()

  return new WalletManager({
    wallets: supportedWallets,
    defaultNetwork: 'testnet',
    networks: {
      testnet: {
        algod: {
          baseServer: 'https://testnet-api.algonode.cloud',
          port: 443,
          token: '',
        },
      },
    },
    options: {
      resetNetwork: true,
    },
  })
}