import { useState } from "react";
import { Plus, ArrowUpRight, Calendar, ChevronRight } from "lucide-react";
import PortfolioChart from "./components/PortfolioChart";
import HoldingsTable from "./components/HoldingsTable";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import PortfolioKpis from "./components/PortfolioKpis";
import { Button } from "@/components/ui/button";
import { TransactionForm } from "./forms/TransactionForm";
import { Link } from "react-router";
import { useTransactionSheet } from "./hooks/useTransactionSheet";
import TransactionTable from "./components/TransactionTable";
import { useTransactions } from "./hooks/useTransactions";
import { Card, CardContent } from "@/components/ui/card";
import { Timeframe } from "@/types/portfolioDailyMetricTypes";
import PortfolioInsightsWidget from "./components/PortfolioInsightsWidget";

const timeframes: Timeframe[] = ["1W", "1M", "3M", "YTD", "1Y", "ALL"];

export default function InvestingPage() {
  const { isTransactionSheetOpen, selectedTransaction, openAddTransaction, closeSheet } = useTransactionSheet();
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const recentTransactions = transactions?.slice(0, 5);
  const [timeframe, setTimeframe] = useState<Timeframe>("1M");
  const [chartType, setChartType] = useState<"absolute" | "percentual">("absolute");

  return (
    <div className="mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Investment Dashboard</h1>
        <Button
          onClick={openAddTransaction}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* KPIs Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <PortfolioKpis timeframe={timeframe} />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section>
            <div className="flex flex-row items-center justify-between mb-2 h-8">
              <h2 className="text-lg font-semibold text-gray-900">Portfolio Performance</h2>
              <div className="flex space-x-2">
                {timeframes.map((period) => (
                  <Button
                    key={period}
                    variant={timeframe === period ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeframe(period)}
                  >
                    {period}
                  </Button>
                ))}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={chartType === "absolute" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType("absolute")}
                >
                  Absolute
                </Button>
                <Button
                  variant={chartType === "percentual" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType("percentual")}
                >
                  Percent
                </Button>
              </div>
            </div>

            <PortfolioChart timeframe={timeframe} type={chartType} />
          </section>

          <section>
            <div className="flex flex-row items-center justify-between mb-2 h-8">
              <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
              <Link
                to="/investing/transactions"
                className="text-sm text-blue-600 flex items-center hover:underline"
              >
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            {!transactionsLoading && !!transactions && (
              <TransactionTable transactions={recentTransactions!} actions={false} />
            )}
          </section>

        </div>

        {/* Right Sidebar - Takes 1/3 of the space */}
        <div className="space-y-6">
          <div>
            <div className="flex flex-row items-center justify-between mb-2 h-8">
              <h2 className="text-lg font-semibold text-gray-900">Holdings</h2>
              <Link
                to=""
                className="text-sm text-blue-600 flex items-center hover:underline"
              >
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <HoldingsTable />
          </div>
          <div>
            <div className="flex flex-row items-center justify-between mb-2 h-8">
              <h2 className="text-lg font-semibold text-gray-900">Insights</h2>
            </div>
            <PortfolioInsightsWidget />
          </div>
          <div>
            <div className="flex flex-row items-center justify-between mb-2 h-8">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
            </div>
            <Card>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 p-2 rounded">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Dividend Payment</p>
                      <p className="text-sm text-gray-500">Mar 15 • $32.50</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-purple-100 p-2 rounded">
                      <ArrowUpRight className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Earnings Report</p>
                      <p className="text-sm text-gray-500">Mar 22 • AAPL</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Sheet open={isTransactionSheetOpen} onOpenChange={closeSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {selectedTransaction ? "Edit Transaction" : "Add New Transaction"}
            </SheetTitle>
          </SheetHeader>
          <div className="py-4">
            {selectedTransaction ? (
              <TransactionForm
                tradeId={selectedTransaction.id!}
                onClose={closeSheet}
                defaultValues={{
                  ticker_id: selectedTransaction.ticker_id!,
                  transaction_type: selectedTransaction.transaction_type!,
                  shares: selectedTransaction.shares!,
                  price_per_share: selectedTransaction.price_per_share!,
                  transaction_fee: selectedTransaction.transaction_fee!,
                  transaction_date: new Date(selectedTransaction.transaction_date + "T00:00:00"),
                  note_text: selectedTransaction.note_text || "",
                  is_dividend_reinvestment: selectedTransaction.is_dividend_reinvestment!,
                }}
              />
            ) : (
              <TransactionForm onClose={closeSheet} />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
