import TimeframeControls from "@/components/controls/TimeFrameControls";
import SectionHeader from "@/components/customs/SectionHeader";
import { Button } from "@/components/ui/button";
import { Timeframe } from "@/types/portfolioDailyMetricTypes";
import { Plus } from "lucide-react";
import { useState } from "react";
import ChartTypeControls from "./components/ChartTypeControls";
import PortfolioChart from "./components/PortfolioChart";
import PortfolioInsightsWidget from "./components/PortfolioInsightsWidget";
import PortfolioKpis from "./components/PortfolioKpis";
import TickerEvents from "./components/TickerEvents";
import TransactionTable from "./components/TransactionTable";
import { useCalendarEvents } from "./hooks/useCalendarEvents";
import { useTransactions } from "./hooks/useTransactions";
import {
  TransactionSheet,
  useTransactionSheet,
} from "./sheets/TransactionSheet";
import HoldingsWidget from "./components/HoldingsWidget";

export default function InvestingPage() {
  const {
    isTransactionSheetOpen,
    openAddTransaction,
    closeSheet,
  } = useTransactionSheet();
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const {
    events,
    isLoading: eventsLoading,
    isError: eventsError,
    error: eventsErrorMsg,
  } = useCalendarEvents(3);

  const [timeframe, setTimeframe] = useState<Timeframe>("1M");
  const [chartType, setChartType] = useState<"absolute" | "percentual">(
    "absolute",
  );

  const recentTransactions = transactions?.slice(0, 5);
  return (
    <div className="mx-auto space-y-6 p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Investment Dashboard
        </h1>
        <Button
          onClick={openAddTransaction}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </header>

      {/* KPIs Row */}
      <PortfolioKpis timeframe={timeframe} />

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <main className="lg:col-span-2 space-y-6">
          <section>
            <div className="flex flex-row items-center justify-between mb-2 h-8">
              <h2 className="text-lg font-semibold text-gray-900">
                Portfolio Performance
              </h2>
              <TimeframeControls
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
              />
              <ChartTypeControls
                chartType={chartType}
                onChartTypeChange={setChartType}
              />
            </div>

            <PortfolioChart timeframe={timeframe} type={chartType} />
          </section>

          <section>
            <SectionHeader
              title="Recent Transactions"
              linkTo="/investing/transactions"
              linkText="View All"
            />
            <TransactionTable
              transactions={recentTransactions!}
              isLoading={transactionsLoading}
              actions={false}
            />
          </section>
        </main>

        {/* Right Sidebar - Takes 1/3 of the space */}
        <aside className="space-y-6">
          <section>
            <SectionHeader
              title="Holdings"
              linkTo="/investing/holdings"
              linkText="View All"
            />
            <HoldingsWidget />
          </section>
          <section>
            <SectionHeader title="Insights" />
            <PortfolioInsightsWidget timeframe={timeframe} />
          </section>

          <section>
            <TickerEvents
              events={events}
              isLoading={eventsLoading}
              isError={eventsError}
              error={eventsErrorMsg}
            />
          </section>
        </aside>

        <TransactionSheet
          isOpen={isTransactionSheetOpen}
          onClose={closeSheet}
        />
      </div>
    </div>
  );
}
