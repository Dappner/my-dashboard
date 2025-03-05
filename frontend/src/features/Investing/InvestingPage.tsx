import { useState } from "react";
import { Plus, ArrowUpRight, TrendingUp, Calendar, ChevronRight } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InvestingPage() {
  const { isTransactionSheetOpen, selectedTransaction, openAddTransaction, closeSheet } = useTransactionSheet();
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const recentTransactions = transactions?.slice(0, 5);
  const [timeframe, setTimeframe] = useState("1M");

  return (
    <div className=" mx-auto space-y-6 p-6">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <PortfolioKpis />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-row items-center justify-between mb-2 h-8">
            <h2 className="text-lg font-semibold text-gray-900">Portfolio Performance</h2>
            <div className="flex space-x-2">
              {["1W", "1M", "3M", "YTD", "1Y", "ALL"].map((period) => (
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
          </div>

          <PortfolioChart />

          <div>
            <div className="flex flex-row items-center justify-between mb-2 h-8">
              <h2 className="text-lg font-semibold text-gray-900">Recent Transcations</h2>
              <Link
                to="/investing/transactions"
                className="text-sm text-blue-600 flex items-center hover:underline"
              >
                View All <ChevronRight className="h-4 w-4" />
              </Link>

            </div>
            {!transactionsLoading && (
              <TransactionTable transactions={recentTransactions!} actions={false} />
            )}
          </div>
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

            <Card>
              <CardContent>
                <Tabs defaultValue="performance">
                  <TabsList className="w-full">
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="allocation">Allocation</TabsTrigger>
                    <TabsTrigger value="dividends">Dividends</TabsTrigger>
                  </TabsList>
                  <TabsContent value="performance" className="pt-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Best Performer</span>
                        <div className="flex items-center text-emerald-600">
                          <span className="font-semibold">+12.4%</span>
                          <TrendingUp className="h-4 w-4 ml-1" />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Worst Performer</span>
                        <span className="text-red-600 font-semibold">-5.2%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">YTD Return</span>
                        <span className="text-emerald-600 font-semibold">+8.7%</span>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="allocation" className="pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Stocks</span>
                        <span className="font-semibold">65%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: "65%" }}></div>
                      </div>

                      <div className="flex justify-between items-center mt-3">
                        <span className="text-sm font-medium">Bonds</span>
                        <span className="font-semibold">20%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: "20%" }}></div>
                      </div>

                      <div className="flex justify-between items-center mt-3">
                        <span className="text-sm font-medium">Cash</span>
                        <span className="font-semibold">15%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: "15%" }}></div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="dividends" className="pt-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">YTD Dividends</span>
                        <span className="font-semibold">$542.18</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Dividend Yield</span>
                        <span className="font-semibold">2.4%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Next Payment</span>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span className="font-semibold">Mar 15</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
            </CardHeader>
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
