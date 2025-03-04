import LoadingSpinner from "@/components/layout/components/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { YahooFinanceDaily } from "@/types/yahooFinanceDaily"
import { format } from "date-fns";

interface YhFinanceStatsProps {
  yahooFinanceDaily?: YahooFinanceDaily | null;
  isLoading: boolean;
}

export default function YhFinanceStats({ yahooFinanceDaily, isLoading }: YhFinanceStatsProps) {
  return (
    <>
      <div className="flex flex-row items-center justify-between mb-2 h-8">
        <h2 className="text-lg font-semibold text-gray-900">YH Finance Stats</h2>
        <h2 className="text-base font-semibold text-gray-500">
          {yahooFinanceDaily?.date ? format(new Date(yahooFinanceDaily.date), "MM/dd/yyyy") : 'N/A'}
        </h2>
      </div>
      <Card>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">52-Week Low</span>
                <span className="font-medium">${yahooFinanceDaily?.fifty_two_week_low?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">52-Week High</span>
                <span className="font-medium">${yahooFinanceDaily?.fifty_two_week_high?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Div Yield</span>
                <span className="font-medium">{yahooFinanceDaily?.dividend_yield?.toFixed(2) || 'N/A'}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">50-Day Avg</span>
                <span className="font-medium">${yahooFinanceDaily?.fifty_day_average?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">200-Day Avg</span>
                <span className="font-medium">${yahooFinanceDaily?.two_hundred_day_average?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">NAV Price</span>
                <span className="font-medium">${yahooFinanceDaily?.nav_price?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Trailing P/E</span>
                <span className="font-medium">{yahooFinanceDaily?.trailing_pe?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total Assets</span>
                <span className="font-medium">${yahooFinanceDaily?.total_assets?.toLocaleString() || 'N/A'}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
