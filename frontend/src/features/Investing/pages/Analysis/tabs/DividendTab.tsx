import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { TrendingUpIcon } from "lucide-react";
import DividendScheduleChart from "../components/DividendScheduleChart";
import { useQuery } from "@tanstack/react-query";
import { holdingsApi, holdingsApiKeys } from "@/api/holdingsApi";
import { calculateTotalAnnualDividend, calculateAverageYield, calculateMonthlyAverage, findNextDividendPayment, sortHoldingsByProperty } from "@/features/Investing/utils";
import DividendPieChart from "../components/DividendPieChart";

export default function DividendTab() {
  const { data: holdings, isLoading, isError } = useQuery({
    queryFn: holdingsApi.getHoldings,
    queryKey: holdingsApiKeys.all
  });

  // Calculate dividend statistics
  const annualIncome = holdings ? calculateTotalAnnualDividend(holdings) : 0;
  const averageYield = holdings ? calculateAverageYield(holdings) : 0;
  const monthlyAverage = holdings ? calculateMonthlyAverage(holdings) : 0;
  const nextDividend = holdings ? findNextDividendPayment(holdings) : null;

  // Sort holdings for the tables
  const topContributionHoldings = holdings ? sortHoldingsByProperty(holdings, 'annual_dividend_amount').slice(0, 5) : [];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-max gap-4">
        <div className="col-span-3">
          <DividendScheduleChart />
        </div>

        <div className="col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUpIcon className="mr-2 h-5 w-5" />
                Dividend Analysis
              </CardTitle>
              <CardDescription>Income projection</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <>
                  Loading...
                </>
              ) : isError ?
                (<>
                  Error State...
                </>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Annual Income</span>
                      <span className="font-medium">
                        ${annualIncome.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Portfolio Yield</span>
                      <span className="font-medium">
                        {averageYield.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly Avg</span>
                      <span className="font-medium">
                        ${monthlyAverage.toFixed(2)}
                      </span>
                    </div>
                    <Separator className="my-2" />
                    <div className="text-xs text-muted-foreground">
                      Next dividend: {nextDividend ? `${nextDividend.symbol} on ${nextDividend.displayDate}` : 'None scheduled'}
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
        </div>
        <div className="col-span-1">
          <Card className="h-full">
            <CardHeader className="flex flex-row justify-between">
              <CardTitle>Top Dividend Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticker</TableHead>
                    <TableHead>Shares</TableHead>
                    <TableHead>Annual Div</TableHead>
                    <TableHead>Yield</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {
                    isLoading ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">Loading...</TableCell>
                      </TableRow>
                    ) : isError ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">Error loading data</TableCell>
                      </TableRow>
                    ) : topContributionHoldings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">No dividend holdings</TableCell>
                      </TableRow>
                    ) : (
                      topContributionHoldings.map((holding) => (
                        <TableRow key={holding.ticker_id}>
                          <TableCell>{holding.symbol}</TableCell>
                          <TableCell>{holding.current_shares}</TableCell>
                          <TableCell>${holding.annual_dividend_amount?.toFixed(2)}</TableCell>
                          <TableCell>{holding.dividend_yield_percent?.toFixed(2)}%</TableCell>
                        </TableRow>
                      ))
                    )
                  }
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div className="col-span-1">
          <DividendPieChart />
        </div>
      </div>
    </>
  );
}
