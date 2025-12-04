import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  EthAllocation,
  StablecoinAllocation,
  LeveragedStablecoinAllocation,
  LeverageConfig,
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

  // ETH Price & Scenario
  ethPrice: number
  priceChangeScenario: number

  // Allocations
  ethAllocations: EthAllocation[]
  stablecoinAllocations: StablecoinAllocation[]
  leveragedStablecoinAllocations: LeveragedStablecoinAllocation[]

  // Computed values
  ethAmount: () => number
  stablecoinAmount: () => number
  totalBorrowedAmount: () => number

  // Actions - Portfolio Setup
  setInvestmentAmount: (amount: number) => void
  setEthRatio: (ratio: number) => void

  // Actions - ETH Price
  setEthPrice: (price: number) => void
  setPriceChangeScenario: (percent: number) => void

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
}

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set, get) => ({
      // Initial state - Portfolio Setup
      investmentAmount: 1000000,
      ethRatio: 40,

      // Initial state - ETH Price
      ethPrice: 3500,
      priceChangeScenario: 20,

      // Initial state - Allocations
      ethAllocations: initialEthAllocations,
      stablecoinAllocations: initialStablecoinAllocations,
      leveragedStablecoinAllocations: [],

      // Computed values
      ethAmount: () => {
        const { investmentAmount, ethRatio } = get()
        return investmentAmount * (ethRatio / 100)
      },

      stablecoinAmount: () => {
        const { investmentAmount, ethRatio } = get()
        return investmentAmount * ((100 - ethRatio) / 100)
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

      // Actions - Portfolio Setup
      setInvestmentAmount: (amount) => set({ investmentAmount: amount }),
      setEthRatio: (ratio) => set({ ethRatio: ratio }),

      // Actions - ETH Price
      setEthPrice: (price) => set({ ethPrice: price }),
      setPriceChangeScenario: (percent) => set({ priceChangeScenario: percent }),

      // Actions - ETH Allocations
      setEthAllocations: (allocations) => set({ ethAllocations: allocations }),

      toggleEthAllocation: (productId) =>
        set((state) => ({
          ethAllocations: state.ethAllocations.map((a) =>
            a.productId === productId ? { ...a, selected: !a.selected, weight: !a.selected ? 0 : a.weight } : a
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
            a.productId === productId ? { ...a, selected: !a.selected, weight: !a.selected ? 0 : a.weight } : a
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
    }),
    {
      name: 'portfolio-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        // Only persist data, not computed functions
        investmentAmount: state.investmentAmount,
        ethRatio: state.ethRatio,
        ethPrice: state.ethPrice,
        priceChangeScenario: state.priceChangeScenario,
        ethAllocations: state.ethAllocations,
        stablecoinAllocations: state.stablecoinAllocations,
        leveragedStablecoinAllocations: state.leveragedStablecoinAllocations,
      }),
    }
  )
)
