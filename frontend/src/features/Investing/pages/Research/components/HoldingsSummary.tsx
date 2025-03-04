import LoadingSpinner from "@/components/layout/components/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { Holding } from "@/types/holdingsTypes";

interface HoldingsSummaryProps {
  holding?: Holding | null;
  isLoading: boolean;
}
export default function HoldingsSummary({ holding, isLoading }: HoldingsSummaryProps) {


  return (
    <div>
      <div className="flex items-center justify-between mb-2 h-8">
        <h2 className="text-lg font-semibold text-gray-900">Holdings Summary</h2>
      </div>
      <Card>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Shares Owned</span>
                <span className="font-medium">{holding?.shares}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Cost Basis</span>
                <span className="font-medium">${holding?.average_cost_basis?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Div Yield</span>
                <span className="font-medium">{holding?.cost_basis_dividend_yield_percent?.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Market Value</span>
                <span className="font-medium">${holding?.current_market_value?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">P/L</span>
                <span className="font-medium">${holding?.unrealized_gain_loss?.toFixed(2)}</span>
              </div>
            </div>
          )}
        </CardContent >
      </Card >
    </div>
  )
}
