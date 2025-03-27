import TimeframeControls from "@/components/controls/TimeFrameControls";
import SectionHeader from "@/components/customs/SectionHeader";
import { Button } from "@/components/ui/button";
import { Timeframe } from "@/types/portfolioDailyMetricTypes";
import { Plus } from "lucide-react";
import { useState } from "react";
import ChartTypeControls from "./components/ChartTypeControls";
import HoldingsWidget from "./components/HoldingsWidget";
import PortfolioChart from "./components/PortfolioChart";
import PortfolioInsightsWidget from "./components/PortfolioInsightsWidget";
import TickerEvents from "./components/TickerEvents";
import TransactionTable from "./components/TransactionTable";
import { useCalendarEvents } from "./hooks/useCalendarEvents";
import { useTransactions } from "./hooks/useTransactions";
import {
  TransactionSheet,
  useTransactionSheet,
} from "./sheets/TransactionSheet";
import TotalValueDisplay from "./components/TotalValueDisplay";
import SidebarKpis from "./components/SidebarKpis";

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
    <div className="mx-auto space-y-2 sm:space-y-4 px-4 sm:px-0">
      <header className="flex items-center justify-between pb-2">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Investment Dashboard
        </h1>
        <Button
          onClick={openAddTransaction}
          className="flex items-center gap-1 sm:gap-2" // Less gap mobile
          size="sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* === Main Column (Chart, Mobile Holdings, Transactions) === */}
        <main className="lg:col-span-2 space-y-4">
          <section>
            {/* Desktop */}
            <div className="hidden md:flex md:justify-between md:mb-2 md:gap-4 md:items-end">
              <TotalValueDisplay timeframe={timeframe} />
              <div className="flex flex-row gap-4 ">
                <TimeframeControls
                  timeframe={timeframe}
                  onTimeframeChange={setTimeframe}
                />
                <ChartTypeControls
                  chartType={chartType}
                  onChartTypeChange={setChartType}
                />
              </div>
            </div>

            {/* Chart Type Controls ABOVE chart (Mobile: below md) */}
            <div className="flex items-center justify-between mb-2 gap-2 md:hidden">
              <TotalValueDisplay timeframe={timeframe} />
              <ChartTypeControls
                chartType={chartType}
                onChartTypeChange={setChartType}
              />
            </div>

            {/* Chart */}
            <PortfolioChart timeframe={timeframe} type={chartType} />

            {/* Timeframe Controls BELOW chart (Mobile: below md) */}
            <div className="flex justify-center mt-3 md:hidden">
              <TimeframeControls
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
              />
            </div>
          </section>

          {/* --- Holdings Section (MOBILE ONLY) --- */}
          <section className="block lg:hidden">
            <SectionHeader
              title="Holdings"
              linkTo="/investing/holdings"
              linkText="View Details"
            />

            <HoldingsWidget />
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
        {/* === End Main Column === */}

        {/* === Right Sidebar (Desktop Holdings, Insights, Events) === */}
        <aside className="space-y-6">
          <section className="hidden lg:block">
            <SidebarKpis timeframe={timeframe} />
          </section>
          {/* --- Holdings Section (DESKTOP ONLY) --- */}
          <section className="hidden lg:block">
            <SectionHeader
              title="Holdings"
              linkTo="/investing/holdings"
              linkText="View Details"
            />

            <HoldingsWidget />
          </section>

          <section>
            <SectionHeader title="Insights" />
            <PortfolioInsightsWidget timeframe={timeframe} />
          </section>

          <section>
            <SectionHeader title="Upcoming Events" />
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
