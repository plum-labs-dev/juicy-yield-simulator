import { create } from 'zustand'
import type {
  EthAllocation,
  StablecoinAllocation,
  LeveragedStablecoinAllocation,
  LeverageConfig,
} from '@/types'

interface PortfolioStore {
  // Portfolio Setup
  investmentAmount: number
  investmentPeriod: number
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
  setInvestmentPeriod: (years: number) => void
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
  updateStablecoinAllocationWeight: (productId: string, weight: number) => void
  setLeveragedStablecoinAllocations: (allocations: LeveragedStablecoinAllocation[]) => void
}

export const usePortfolioStore = create<PortfolioStore>((set, get) => ({
  // Initial state - Portfolio Setup
  investmentAmount: 1000000,
  investmentPeriod: 1,
  ethRatio: 40,

  // Initial state - ETH Price
  ethPrice: 3500,
  priceChangeScenario: 20,

  // Initial state - Allocations
  ethAllocations: [],
  stablecoinAllocations: [],
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
  setInvestmentPeriod: (years) => set({ investmentPeriod: years }),
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

  updateStablecoinAllocationWeight: (productId, weight) =>
    set((state) => ({
      stablecoinAllocations: state.stablecoinAllocations.map((a) =>
        a.productId === productId ? { ...a, weight } : a
      ),
    })),

  setLeveragedStablecoinAllocations: (allocations) =>
    set({ leveragedStablecoinAllocations: allocations }),
}))
