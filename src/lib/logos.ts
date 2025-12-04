// Logo URLs for protocols and tokens
// Using CoinGecko CDN for tokens

// Underlying token logos
const UNDERLYING_LOGOS = {
  stETH: 'https://assets.coingecko.com/coins/images/13442/small/steth_logo.png',
  weETH: 'https://coin-images.coingecko.com/coins/images/33049/small/ether.fi_eETH.png',
  ETH: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  USDC: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',
  USDe: 'https://assets.coingecko.com/coins/images/33613/small/USDE.png',
}

// Protocol logos
export const PROTOCOL_LOGOS: Record<string, string> = {
  'Lido': 'https://assets.coingecko.com/coins/images/13573/small/Lido_DAO.png',
  'Ether.fi': 'https://coin-images.coingecko.com/coins/images/35958/small/etherfi.jpeg',
  'Pendle': 'https://assets.coingecko.com/coins/images/15069/small/Pendle_Logo_Normal-03.png',
  'Aave V3': 'https://assets.coingecko.com/coins/images/12645/small/AAVE.png',
  'Morpho': 'https://coin-images.coingecko.com/coins/images/29837/small/Morpho-token-icon.png',
  'Ethena': 'https://assets.coingecko.com/coins/images/33613/small/USDE.png',
  'Maple': 'https://assets.coingecko.com/coins/images/14097/small/photo_2021-05-03_14.20.41.jpeg',
}

// Token logos - maps product name to underlying token logo
export const TOKEN_LOGOS: Record<string, string> = {
  // ETH products - use underlying token
  'stETH': UNDERLYING_LOGOS.stETH,
  'weETH': UNDERLYING_LOGOS.weETH,
  'PT-wstETH': UNDERLYING_LOGOS.stETH, // wstETH is wrapped stETH, use same logo
  'PT-weETH': UNDERLYING_LOGOS.weETH,

  // Stablecoin products - use underlying token
  'USDC': UNDERLYING_LOGOS.USDC,
  'steakUSDC': UNDERLYING_LOGOS.USDC,
  'GTUSDC': UNDERLYING_LOGOS.USDC,
  'BBQUSDC': UNDERLYING_LOGOS.USDC,
  'Syrup USDC': UNDERLYING_LOGOS.USDC,
  'PT-syrupUSDC': UNDERLYING_LOGOS.USDC,

  // USDe products - use USDe logo
  'sUSDe': UNDERLYING_LOGOS.USDe,
  'USDe': UNDERLYING_LOGOS.USDe,
  'PT-sUSDe': UNDERLYING_LOGOS.USDe,
}

// Get logo for a protocol
export function getProtocolLogo(protocol: string): string | undefined {
  return PROTOCOL_LOGOS[protocol]
}

// Get logo for a token
export function getTokenLogo(tokenName: string): string | undefined {
  return TOKEN_LOGOS[tokenName]
}

// Get logo for borrow asset
export function getBorrowAssetLogo(asset: 'USDC' | 'USDe'): string {
  return TOKEN_LOGOS[asset] || ''
}
