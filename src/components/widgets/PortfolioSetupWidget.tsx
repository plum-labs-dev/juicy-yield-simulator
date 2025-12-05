'use client';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { AllocationSlider } from '@/components/ui/Slider';
import { usePortfolioStore } from '@/store/portfolioStore';

export function PortfolioSetupWidget() {
    const {
        investmentAmount,
        ethRatio,
        ethPrice,
        setInvestmentAmount,
        setEthRatio,
        ethAmount,
        stablecoinAmount,
        hedgeConfig,
    } = usePortfolioStore();

    return (
        <Card title="Portfolio Setup ^__^" className="h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total Investment */}
                <div>
                    <Input
                        label="Total Investment"
                        value={investmentAmount}
                        onChange={setInvestmentAmount}
                        prefix="$"
                        min={0}
                        placeholder="1,000,000"
                    />
                </div>

                {/* Allocation Ratio */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Allocation Ratio</label>
                    <AllocationSlider
                        value={ethRatio}
                        onChange={setEthRatio}
                        leftLabel="ETH"
                        rightLabel="Stablecoin"
                        leftAmount={ethAmount()}
                        rightAmount={stablecoinAmount()}
                        ethPrice={ethPrice}
                        hedgePercent={hedgeConfig.enabled ? hedgeConfig.allocationPercent : 0}
                        hedgeLabel="Hedge"
                    />
                </div>
            </div>
        </Card>
    );
}
