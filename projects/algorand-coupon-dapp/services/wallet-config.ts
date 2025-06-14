import { SupportedWallet, WalletId, WalletManager } from '@txnlab/use-wallet-react'
import { getAlgodConfigFromViteEnvironment, getKmdConfigFromViteEnvironment,  } from '@/utils/network/getAlgoClientConfigs'

export function getSupportedWallets() {
  let supportedWallets: SupportedWallet[]
  
  if (process.env.VITE_ALGOD_NETWORK === 'localnet') {
    const kmdConfig = getKmdConfigFromViteEnvironment()
    supportedWallets = [
      {
        id: WalletId.KMD,
        options: {
          baseServer: kmdConfig.server,
          token: String(kmdConfig.token),
          port: String(kmdConfig.port),
        },
      },
    ]
  } else {
    supportedWallets = [
      { id: WalletId.DEFLY },
      { id: WalletId.PERA },
      { id: WalletId.EXODUS },
      // Add WalletConnect v2 if needed
    ]
  }

  return supportedWallets
}

export function getWalletManager() {
  const algodConfig = getAlgodConfigFromViteEnvironment()
  const supportedWallets = getSupportedWallets()

  return new WalletManager({
    wallets: supportedWallets,
    defaultNetwork: algodConfig.network,
    networks: {
      [algodConfig.network]: {
        algod: {
          baseServer: algodConfig.server,
          port: algodConfig.port,
          token: String(algodConfig.token),
        },
      },
    },
    options: {
      resetNetwork: true,
    },
  })
}