import { Card } from "@/components/ui/card";
import { ArrowDown, ArrowUp, TrendingUp, DollarSign } from "lucide-react";
import { usePortfolioDailyMetrics } from '../hooks/usePortfolioDailyMetrics';
import useUser from '@/hooks/useUser';
import KpiCard from "@/components/customs/KpiCard";

export default function PortfolioKpis() {
  const { dailyMetrics, isLoading } = usePortfolioDailyMetrics();
  const { user } = useUser();

  if (isLoading || !dailyMetrics || dailyMetrics.length === 0) {
    return Array(3).fill(0).map((_, i) => (
      <Card key={i} className="h-32 animate-pulse bg-gray-200" />
    ));
  }

  // Safely handle metrics
  const currentMetrics = dailyMetrics[dailyMetrics.length - 1] || {};
  const previousMetrics = dailyMetrics[0];

  // Calculate key metrics with robust error handling
  const investmentValue = currentMetrics.portfolio_value || 0;
  const portfolioCostBasis = currentMetrics.cost_basis || 0;
  const cashBalance = user?.cash_balance || 0;

  // Total portfolio value now includes both cash and investment value
  const portfolioValue = investmentValue + cashBalance;

  // Calculate month change
  const previousInvestmentValue = previousMetrics.portfolio_value || investmentValue;
  const previousPortfolioValue = previousInvestmentValue + cashBalance;

  const monthChange = portfolioValue - previousPortfolioValue;
  const monthChangePercent = previousPortfolioValue > 0
    ? (monthChange / previousPortfolioValue) * 100
    : 0;

  // Calculate total return
  const totalReturn = investmentValue - portfolioCostBasis;
  const totalReturnPercent = portfolioCostBasis > 0
    ? (totalReturn / portfolioCostBasis) * 100
    : 0;

  // Cash percentage
  const cashPercentage = portfolioValue > 0
    ? (cashBalance / portfolioValue) * 100
    : 0;

  return (
    <>
      <KpiCard
        title="Total Portfolio Value"
        value={`$${portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
        changePercent={monthChangePercent}
        icon={TrendingUp}
        positiveChange={monthChange >= 0}
        additionalInfo="This month"
      />
      <KpiCard
        title="Investment Return"
        value={`${totalReturn >= 0 ? '+' : '-'}$${Math.abs(totalReturn).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
        changePercent={totalReturnPercent}
        icon={totalReturn >= 0 ? ArrowUp : ArrowDown}
        positiveChange={totalReturn >= 0}
      />
      <KpiCard
        title="Cash Balance"
        value={`$${cashBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
        percent={cashPercentage}
        icon={DollarSign}
        percentOnly
      />
    </>
  );
}
