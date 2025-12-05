import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { useEffect, useState } from 'react'
import type {
  EthAllocation,
  StablecoinAllocation,
  LeveragedStablecoinAllocation,
  LeverageConfig,
  HedgeConfig,
} from '@/types'
import { ETH_PRODUCTS, STABLECOIN_PRODUCTS } from '@/lib/constants'

// Initialize allocations from product constants
const initialEthAllocations: EthAllocation[] = ETH_PRODUCTS.map((product) => ({
  productId: product.id,
  selected: false,
  weight: 0,
}))

const initialStablecoinAllocations: StablecoinAllocation[] = STABLECOIN_PRODUCTS.map((product) => ({
  productId: product.id,
  selected: false,
  weight: 0,
}))

interface PortfolioStore {
  // Portfolio Setup
  investmentAmount: number
  ethRatio: number
  investmentPeriod: number // years

  // ETH Price & Scenario
  ethPrice: number
  priceChangeScenario: number

  // ETH Short Hedge (Hyperliquid)
  hedgeConfig: HedgeConfig

  // Allocations
  ethAllocations: EthAllocation[]
  stablecoinAllocations: StablecoinAllocation[]
  leveragedStablecoinAllocations: LeveragedStablecoinAllocation[]

  // Computed values
  ethAmount: () => number
  stablecoinAmount: () => number
  totalBorrowedAmount: () => number
  hedgeCollateral: () => number // Collateral used for hedge position
  hedgePositionSize: () => number // Total short position size

  // Actions - Portfolio Setup
  setInvestmentAmount: (amount: number) => void
  setEthRatio: (ratio: number) => void
  setInvestmentPeriod: (years: number) => void

  // Actions - ETH Price
  setEthPrice: (price: number) => void
  setPriceChangeScenario: (percent: number) => void

  // Actions - Hedge
  setHedgeConfig: (config: HedgeConfig) => void
  toggleHedge: () => void
  setHedgeAllocation: (percent: number) => void
  setHedgeLeverage: (leverage: number) => void

  // Actions - ETH Allocations
  setEthAllocations: (allocations: EthAllocation[]) => void
  toggleEthAllocation: (productId: string) => void
  updateEthAllocationWeight: (productId: string, weight: number) => void
  setLeverageConfig: (productId: string, config: LeverageConfig | undefined) => void

  // Actions - Stablecoin Allocations
  setStablecoinAllocations: (allocations: StablecoinAllocation[]) => void
  toggleStablecoinAllocation: (productId: string) => void
  updateStablecoinAllocationWeight: (productId: string, weight: number) => void
  setLeveragedStablecoinAllocations: (allocations: LeveragedStablecoinAllocation[]) => void

  // Reset
  reset: () => void
}

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set, get) => ({
      // Initial state - Portfolio Setup
      investmentAmount: 1000000,
      ethRatio: 40,
      investmentPeriod: 1,

      // Initial state - ETH Price
      ethPrice: 3500,
      priceChangeScenario: 5,

      // Initial state - Hedge
      hedgeConfig: {
        enabled: false,
        allocationPercent: 0,
        leverage: 5,
      },

      // Initial state - Allocations
      ethAllocations: initialEthAllocations,
      stablecoinAllocations: initialStablecoinAllocations,
      leveragedStablecoinAllocations: [],

      // Computed values
      // ETH allocation is ethRatio% of total investment
      ethAmount: () => {
        const { investmentAmount, ethRatio } = get()
        return investmentAmount * (ethRatio / 100)
      },

      // Stablecoin allocation: (100 - ethRatio)% minus hedge portion
      // Hedge is taken from the stablecoin portion
      stablecoinAmount: () => {
        const { investmentAmount, ethRatio, hedgeConfig } = get()
        const stableTotal = investmentAmount * ((100 - ethRatio) / 100)
        const hedgeAmount = hedgeConfig.enabled
          ? stableTotal * (hedgeConfig.allocationPercent / 100)
          : 0
        return stableTotal - hedgeAmount
      },

      totalBorrowedAmount: () => {
        const { ethAllocations, ethAmount } = get()
        return ethAllocations.reduce((total, allocation) => {
          if (allocation.leverage?.enabled) {
            const positionValue = ethAmount() * (allocation.weight / 100)
            const collateralValue = positionValue * (allocation.leverage.collateralPercent / 100)
            const borrowedValue = collateralValue * (allocation.leverage.ltv / 100)
            return total + borrowedValue
          }
          return total
        }, 0)
      },

      hedgeCollateral: () => {
        const { investmentAmount, ethRatio, hedgeConfig } = get()
        if (!hedgeConfig.enabled) return 0
        // Hedge is taken from stablecoin portion
        const stableTotal = investmentAmount * ((100 - ethRatio) / 100)
        return stableTotal * (hedgeConfig.allocationPercent / 100)
      },

      hedgePositionSize: () => {
        const { hedgeCollateral, hedgeConfig } = get()
        if (!hedgeConfig.enabled) return 0
        return hedgeCollateral() * hedgeConfig.leverage
      },

      // Actions - Portfolio Setup
      setInvestmentAmount: (amount) => set({ investmentAmount: amount }),
      setEthRatio: (ratio) => set({ ethRatio: ratio }),
      setInvestmentPeriod: (years) => set({ investmentPeriod: years }),

      // Actions - ETH Price
      setEthPrice: (price) => set({ ethPrice: price }),
      setPriceChangeScenario: (percent) => set({ priceChangeScenario: percent }),

      // Actions - Hedge
      setHedgeConfig: (config) => set({ hedgeConfig: config }),
      toggleHedge: () =>
        set((state) => ({
          hedgeConfig: { ...state.hedgeConfig, enabled: !state.hedgeConfig.enabled },
        })),
      setHedgeAllocation: (percent) =>
        set((state) => ({
          hedgeConfig: { ...state.hedgeConfig, allocationPercent: percent },
        })),
      setHedgeLeverage: (leverage) =>
        set((state) => ({
          hedgeConfig: { ...state.hedgeConfig, leverage },
        })),

      // Actions - ETH Allocations
      setEthAllocations: (allocations) => set({ ethAllocations: allocations }),

      toggleEthAllocation: (productId) =>
        set((state) => ({
          ethAllocations: state.ethAllocations.map((a) =>
            a.productId === productId ? { ...a, selected: !a.selected, weight: a.selected ? 0 : a.weight } : a
          ),
        })),

      updateEthAllocationWeight: (productId, weight) =>
        set((state) => ({
          ethAllocations: state.ethAllocations.map((a) =>
            a.productId === productId ? { ...a, weight } : a
          ),
        })),

      setLeverageConfig: (productId, config) =>
        set((state) => ({
          ethAllocations: state.ethAllocations.map((a) =>
            a.productId === productId ? { ...a, leverage: config } : a
          ),
        })),

      // Actions - Stablecoin Allocations
      setStablecoinAllocations: (allocations) => set({ stablecoinAllocations: allocations }),

      toggleStablecoinAllocation: (productId) =>
        set((state) => ({
          stablecoinAllocations: state.stablecoinAllocations.map((a) =>
            a.productId === productId ? { ...a, selected: !a.selected, weight: a.selected ? 0 : a.weight } : a
          ),
        })),

      updateStablecoinAllocationWeight: (productId, weight) =>
        set((state) => ({
          stablecoinAllocations: state.stablecoinAllocations.map((a) =>
            a.productId === productId ? { ...a, weight } : a
          ),
        })),

      setLeveragedStablecoinAllocations: (allocations) =>
        set({ leveragedStablecoinAllocations: allocations }),

      // Reset to default values
      reset: () =>
        set({
          investmentAmount: 1000000,
          ethRatio: 40,
          investmentPeriod: 1,
          ethPrice: 3500,
          priceChangeScenario: 5,
          hedgeConfig: {
            enabled: false,
            allocationPercent: 0,
            leverage: 5,
          },
          ethAllocations: initialEthAllocations,
          stablecoinAllocations: initialStablecoinAllocations,
          leveragedStablecoinAllocations: [],
        }),
    }),
    {
      name: 'portfolio-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        // Only persist data, not computed functions
        investmentAmount: state.investmentAmount,
        ethRatio: state.ethRatio,
        investmentPeriod: state.investmentPeriod,
        ethPrice: state.ethPrice,
        priceChangeScenario: state.priceChangeScenario,
        hedgeConfig: state.hedgeConfig,
        ethAllocations: state.ethAllocations,
        stablecoinAllocations: state.stablecoinAllocations,
        leveragedStablecoinAllocations: state.leveragedStablecoinAllocations,
      }),
    }
  )
)

// Hook to check if the store has been hydrated from sessionStorage
export const useHydration = () => {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // Wait for Zustand persist to rehydrate
    const unsubFinishHydration = usePortfolioStore.persist.onFinishHydration(() => {
      setHydrated(true)
    })

    // Check if already hydrated
    if (usePortfolioStore.persist.hasHydrated()) {
      setHydrated(true)
    }

    return () => {
      unsubFinishHydration()
    }
  }, [])

  return hydrated
}
