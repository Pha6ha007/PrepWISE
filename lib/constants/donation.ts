// Donation addresses and configuration for Support page

export const DONATION_ADDRESSES = {
  bitcoin: {
    address: 'YOUR_BTC_ADDRESS_HERE', // TODO: Replace with real Bitcoin address
    label: 'Bitcoin (BTC)',
    network: 'Bitcoin Network',
    icon: '₿',
  },
  usdt: {
    address: 'YOUR_USDT_TRC20_ADDRESS_HERE', // TODO: Replace with real USDT TRC-20 address
    label: 'USDT',
    network: 'TRC-20 (Tron)',
    icon: '💲',
  },
  ethereum: {
    address: 'YOUR_ETH_ADDRESS_HERE', // TODO: Replace with real Ethereum address
    label: 'Ethereum (ETH)',
    network: 'ERC-20',
    icon: 'Ξ',
  },
} as const

export const DONATION_AMOUNTS = [5, 10, 25] as const

export type CryptoType = keyof typeof DONATION_ADDRESSES
