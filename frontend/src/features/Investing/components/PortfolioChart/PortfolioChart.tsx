import ErrorState from "@/components/layout/components/ErrorState";
import LoadingState from "@/components/layout/components/LoadingState";
import { Card } from "@/components/ui/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import useUser from "@/hooks/useUser";
import { formatDate, parseDate } from "@/lib/utils";
import type { Timeframe } from "@my-dashboard/shared";
import { format, isValid, subDays } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";
import { usePortfolioDailyMetrics } from "../../hooks/usePortfolioDailyMetrics";
import { useTickerHistoricalPrices } from "../../pages/Research/hooks/useTickerHistoricalPrices";
import { chartConfig } from "./chartConfig";
import { CustomPortfolioTooltip } from "./components/CustomPortfolioTooltip";
import {
	Y_AXIS_WIDTH,
	Y_DOMAIN_MIN_PERCENT_PADDING,
	Y_DOMAIN_PADDING_PERCENT,
} from "./constants";

interface ChartDataPoint {
	date: Date;
	portfolio?: number;
	indexFund?: number;
	totalPortfolio?: number;
}

type ChartDataKey = keyof typeof chartConfig;

interface PortfolioChartProps {
	timeframe: Timeframe;
	type: "absolute" | "percentual"; // Determines calculation method
}

export default function PortfolioChart({
	timeframe,
	type,
}: PortfolioChartProps) {
	const { user } = useUser();
	const tickerId = user?.tracking_ticker_id;

	const { dailyMetrics, isLoading: metricsLoading } =
		usePortfolioDailyMetrics(timeframe);

	const shouldFetchHistorical = type === "percentual" && !!tickerId;
	const { historicalPrices, historicalPricesLoading } =
		useTickerHistoricalPrices(tickerId ?? "", timeframe, shouldFetchHistorical);

	const [visibleLines, setVisibleLines] = useState<
		Record<ChartDataKey, boolean>
	>(() => ({
		totalPortfolio: type === "absolute",
		portfolio: type === "percentual",
		indexFund: type === "percentual",
	}));

	useEffect(() => {
		setVisibleLines({
			totalPortfolio: type === "absolute",
			portfolio: type === "percentual",
			indexFund: type === "percentual",
		});
	}, [type]);

	const chartData = useMemo((): ChartDataPoint[] => {
		if (metricsLoading || (shouldFetchHistorical && historicalPricesLoading)) {
			return [];
		}
		if (!dailyMetrics || dailyMetrics.length === 0) {
			return [];
		}

		if (type === "absolute") {
			return dailyMetrics
				.map((val): ChartDataPoint | null => {
					console.assert(
						val.current_date != null,
						"I thought these are always defined",
					);
					const currentDate = parseDate(val.current_date || "");
					const totalValue = Number(val.total_portfolio_value ?? Number.NaN);
					if (Number.isFinite(totalValue)) {
						return {
							date: currentDate,
							totalPortfolio: totalValue,
						};
					}
					return null;
				})
				.filter((p): p is ChartDataPoint => !!p);
		}

		if (type === "percentual") {
			if (!tickerId) return [];

			const benchmarkPriceMap = new Map<string, number>();
			if (historicalPrices) {
				for (const hp of historicalPrices) {
					console.assert(hp.date == null, "Thought these couldn't be null");
					const dateKey = formatDate(hp.date);
					if (
						dateKey &&
						typeof hp.close_price === "number" &&
						Number.isFinite(hp.close_price)
					) {
						benchmarkPriceMap.set(dateKey, hp.close_price);
					}
				}
			}
			if (benchmarkPriceMap.size === 0 && shouldFetchHistorical) {
				console.warn("Benchmark data map is empty.");
				// Potentially return empty array or handle differently
				return []; // Or show error? For now, proceed, indexFund will be undefined.
			}

			let cumulativePortfolioIndex = 100.0;
			let cumulativeBenchmarkIndex = 100.0;

			const results: ChartDataPoint[] = [];

			for (let i = 0; i < dailyMetrics.length; i++) {
				const metric = dailyMetrics[i];
				console.assert(metric.current_date != null, "I though valid date");
				const currentDate = parseDate(metric.current_date || "");
				if (!currentDate) continue;

				const dateKey = formatDate(currentDate);
				const currentBenchmarkPrice = dateKey
					? benchmarkPriceMap.get(dateKey)
					: undefined;

				const dailyPortfolioReturnPct = Number(
					metric.daily_investment_twrr_percent ?? 0,
				);
				if (i > 0 && Number.isFinite(dailyPortfolioReturnPct)) {
					// Apply the daily return to the previous day's cumulative value
					cumulativePortfolioIndex *= 1 + dailyPortfolioReturnPct / 100.0;
				} else if (i === 0) {
					// On the very first day, the cumulative index *starts* at 100. The % change is 0.
					// (No calculation needed here, just setting the baseline)
				} else {
					// If return is invalid on subsequent days, keep index the same (treat as 0% change)
					console.warn(
						`Invalid portfolio return % for ${dateKey}: ${metric.daily_investment_twrr_percent}`,
					);
				}

				// --- Benchmark Calculation ---
				let dailyBenchmarkReturnPct = 0;
				if (
					typeof currentBenchmarkPrice === "number" &&
					Number.isFinite(currentBenchmarkPrice)
				) {
					// Find the price for the *previous trading day* present in the map for calculation
					// This requires looking back potentially more than one calendar day if there were non-trading days
					let lookbackDate = subDays(currentDate, 1);
					let prevPrice: number | undefined = undefined;
					let attempts = 0;
					const maxAttempts = 7; // Look back up to a week for a previous price

					while (attempts < maxAttempts && prevPrice === undefined) {
						const prevDateKey = formatDate(lookbackDate);
						if (prevDateKey) {
							prevPrice = benchmarkPriceMap.get(prevDateKey);
						}
						if (prevPrice === undefined) {
							lookbackDate = subDays(lookbackDate, 1);
							attempts++;
						}
					}

					if (
						typeof prevPrice === "number" &&
						Number.isFinite(prevPrice) &&
						prevPrice !== 0
					) {
						dailyBenchmarkReturnPct =
							(currentBenchmarkPrice / prevPrice - 1) * 100;
						if (i > 0 && Number.isFinite(dailyBenchmarkReturnPct)) {
							cumulativeBenchmarkIndex *= 1 + dailyBenchmarkReturnPct / 100.0;
						}
					} else if (i > 0) {
						// If no valid previous price found or current price missing, treat as 0% change
						console.warn(
							`Could not calculate benchmark return for ${dateKey}. Current: ${currentBenchmarkPrice}, Prev Found: ${prevPrice}`,
						);
					}
				} else if (i > 0) {
					// If no benchmark price for *today*, keep index the same
					console.warn(
						`Missing or invalid benchmark price for ${dateKey}: ${currentBenchmarkPrice}`,
					);
				}

				// --- Store the result for the chart ---
				// Calculate % change relative to the starting index (100)
				const portfolioPercentChange = cumulativePortfolioIndex - 100.0;
				const benchmarkPercentChange = cumulativeBenchmarkIndex - 100.0;

				results.push({
					date: currentDate,
					portfolio: Number.isFinite(portfolioPercentChange)
						? portfolioPercentChange
						: undefined,
					indexFund: Number.isFinite(benchmarkPercentChange)
						? benchmarkPercentChange
						: undefined,
				});
			} // End loop through sortedMetrics

			// Explicitly set the first point to 0% if results exist
			if (results.length > 0) {
				results[0].portfolio = 0;
				// Only set benchmark to 0 if we expect it to be there
				if (shouldFetchHistorical && results[0].indexFund !== undefined) {
					results[0].indexFund = 0;
				} else {
					// If benchmark data wasn't available or calculation failed, ensure it's undefined
					results[0].indexFund = undefined;
				}
			}

			return results.filter(
				(
					point, // Ensure at least one value is valid
				) =>
					(typeof point.portfolio === "number" &&
						Number.isFinite(point.portfolio)) ||
					(typeof point.indexFund === "number" &&
						Number.isFinite(point.indexFund)),
			);
		} // End if (type === "percentual")

		return []; // Should not be reached if type is 'absolute' or 'percentual'
	}, [
		dailyMetrics,
		historicalPrices, // Use the raw prices list here for map creation
		type,
		tickerId,
		shouldFetchHistorical,
		metricsLoading,
		historicalPricesLoading, // Depend on loading states
	]);
	// ============================================================
	//             END OF MODIFIED CALCULATION
	// ============================================================

	// --- Y-Axis Domain Calculation (Should work okay, might need minor tweaks) ---
	const yDomain = useMemo((): [number | string, number | string] => {
		// ... (Keep existing logic, it adapts to portfolio/indexFund keys)
		// Ensure it handles cases where one line might be undefined better.
		if (!chartData || chartData.length === 0) return ["auto", "auto"];

		const getVisibleValues = (dataKey: ChartDataKey): number[] =>
			(visibleLines[dataKey] ?? true) // Assume visible if not explicitly tracked (for tooltip hover)
				? chartData
						.map((d) => d[dataKey])
						.filter(
							(v): v is number => typeof v === "number" && Number.isFinite(v),
						)
				: [];

		let relevantValues: number[] = [];

		if (type === "percentual") {
			relevantValues = [
				...getVisibleValues("portfolio"),
				...getVisibleValues("indexFund"),
			];
			relevantValues.push(0); // Ensure 0 line is considered

			// Filter out non-finite values that might have slipped through
			relevantValues = relevantValues.filter(Number.isFinite);

			if (relevantValues.length <= 1) return [-10, 10]; // Default range

			const minY = Math.min(...relevantValues);
			const maxY = Math.max(...relevantValues);

			// Handle case where min and max are the same (e.g., all zeros)
			if (minY === maxY) {
				return [
					minY - Y_DOMAIN_MIN_PERCENT_PADDING,
					maxY + Y_DOMAIN_MIN_PERCENT_PADDING,
				];
			}

			const padding = Math.max(
				(maxY - minY) * Y_DOMAIN_PADDING_PERCENT,
				Y_DOMAIN_MIN_PERCENT_PADDING,
			);

			// Check for NaN/Infinity before returning
			const finalMin = minY - padding;
			const finalMax = maxY + padding;

			if (!Number.isFinite(finalMin) || !Number.isFinite(finalMax)) {
				console.error(
					"Calculated invalid yDomain for percentual:",
					[finalMin, finalMax],
					{ minY, maxY, padding, relevantValues },
				);
				return [-10, 10]; // Fallback domain
			}

			return [finalMin, finalMax];
		}

		// Absolute view
		relevantValues = getVisibleValues("totalPortfolio");
		const minValueInData =
			relevantValues.length > 0 ? Math.min(...relevantValues) : 0;
		relevantValues.push(0);

		relevantValues = relevantValues.filter(Number.isFinite);

		if (relevantValues.length <= 1) return [0, 100];

		const minY = Math.min(...relevantValues);
		const maxY = Math.max(...relevantValues);
		const padding = (maxY - minY) * Y_DOMAIN_PADDING_PERCENT || 10;

		const finalMinY = minValueInData >= 0 ? 0 : minY - padding;
		const finalMaxY = maxY + padding;

		if (!Number.isFinite(finalMinY) || !Number.isFinite(finalMaxY)) {
			console.error(
				"Calculated invalid yDomain for absolute:",
				[finalMinY, finalMaxY],
				{ minY, maxY, padding, relevantValues },
			);
			return [0, 100]; // Fallback domain
		}

		return [finalMinY, finalMaxY];
	}, [chartData, type, visibleLines]);

	const formatYAxis = (value: number): string =>
		type === "absolute"
			? value.toLocaleString(undefined, { maximumFractionDigits: 0 })
			: `${value.toFixed(0)}%`;

	const formatLegendLabel = (value: string): React.ReactNode => {
		if (!(value in chartConfig)) return value;
		const key = value as ChartDataKey;
		const config = chartConfig[key];

		const shouldBeVisible =
			(type === "absolute" && key === "totalPortfolio") ||
			(type === "percentual" && (key === "portfolio" || key === "indexFund"));

		if (!shouldBeVisible) return null;

		return (
			<span
				className="select-none"
				style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
			>
				<span
					style={{
						width: "10px",
						height: "10px",
						backgroundColor: config.color,
						display: "inline-block",
						marginRight: "4px",
						borderRadius: "2px",
					}}
				/>
				<span style={{ color: "var(--foreground)" }}>{config.label}</span>
			</span>
		);
	};

	const isLoading =
		metricsLoading || (shouldFetchHistorical && historicalPricesLoading);

	if (isLoading) return <LoadingState />;

	if (type === "percentual" && !tickerId) {
		return (
			<ErrorState message="Select a benchmark ticker in Profile settings for % comparison." />
		);
	}

	if (
		type === "percentual" &&
		shouldFetchHistorical &&
		(!historicalPrices || historicalPrices.length === 0)
	) {
		if (historicalPricesLoading) return <LoadingState />;
		return (
			<ErrorState message="Benchmark data unavailable for the selected period." />
		);
	}

	if (!chartData || chartData.length < 2) {
		if (isLoading) return <LoadingState />;
		return (
			<ErrorState message="Not enough data available to draw chart for this period." />
		);
	}
	if (!chartData || chartData.length < 1) {
		// Allow chart with just one point (at 0%)
		// Special case: If only 1 data point exists after processing, show it at 0%
		if (type === "percentual" && chartData.length === 1 && chartData[0].date) {
			// Adjust domain slightly for visibility if only one point
			const singlePointDomain: [number, number] = [-5, 5];
			return (
				<div className="h-96 min-h-[384px] w-full bg-background rounded-lg shadow-sm p-1 sm:p-2 border">
					<ResponsiveContainer width="100%" height="100%">
						<ChartContainer config={chartConfig} className="h-full w-full">
							<LineChart
								data={chartData}
								margin={{ top: 30, right: 15, left: 5, bottom: 5 }}
							>
								{/* Simplified axes/grid for single point */}
								<CartesianGrid
									vertical={false}
									strokeDasharray="3 3"
									stroke="hsl(var(--border, 214.3 31.8% 91.4%) / 0.7)"
								/>
								<XAxis
									dataKey="date"
									tickLine={false}
									axisLine={false}
									tickMargin={8}
									tickFormatter={(val) =>
										isValid(val) ? format(val, "MMM d") : ""
									}
									stroke="hsl(var(--muted-foreground, 215.4 16.3% 46.9%))"
									fontSize={12}
								/>
								<YAxis
									tickLine={false}
									axisLine={false}
									tickMargin={8}
									tickFormatter={formatYAxis}
									stroke="hsl(var(--muted-foreground, 215.4 16.3% 46.9%))"
									fontSize={12}
									width={Y_AXIS_WIDTH}
									domain={singlePointDomain}
								/>
								<ChartTooltip content={<ChartTooltipContent /* ... */ />} />
								<Legend
									verticalAlign="top"
									align="left"
									height={40}
									formatter={formatLegendLabel}
									wrapperStyle={{
										paddingLeft: `${Y_AXIS_WIDTH + 10}px`,
										paddingTop: "4px",
									}}
								/>
								{/* Render lines even for one point, they won't draw but legend/tooltip work */}
								<Line
									name="portfolio"
									dataKey="portfolio"
									stroke={chartConfig.portfolio.color}
									dot={true}
								/>
								<Line
									name="indexFund"
									dataKey="indexFund"
									stroke={chartConfig.indexFund.color}
									dot={true}
								/>
							</LineChart>
						</ChartContainer>
					</ResponsiveContainer>
				</div>
			);
		}
		return (
			<ErrorState message="Not enough data available to draw chart for this period." />
		);
	}

	return (
		<Card className="h-96 min-h-[384px] w-full p-1 sm:p-2 border">
			<ResponsiveContainer width="100%" height="100%">
				<ChartContainer config={chartConfig} className="h-full w-full">
					<LineChart
						data={chartData}
						margin={{ top: 30, right: 15, left: 5, bottom: 5 }} // Increased top margin for legend
					>
						<CartesianGrid
							vertical={false}
							strokeDasharray="3 3"
							stroke="hsl(var(--border, 214.3 31.8% 91.4%) / 0.7)"
						/>
						<XAxis
							dataKey="date"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickFormatter={(val) =>
								isValid(val) ? format(val, "MMM d") : ""
							}
							// Use CSS variables if defined, otherwise fallback
							stroke="hsl(var(--muted-foreground, 215.4 16.3% 46.9%))"
							fontSize={12}
							interval="preserveStartEnd"
							padding={{ left: 10, right: 10 }}
						/>
						<YAxis
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickFormatter={formatYAxis}
							// Use CSS variables if defined, otherwise fallback
							stroke="hsl(var(--muted-foreground, 215.4 16.3% 46.9%))"
							fontSize={12}
							width={Y_AXIS_WIDTH}
							domain={yDomain} // Use calculated domain
							allowDataOverflow={false}
							tickCount={5}
							type="number" // Explicitly set type
						/>
						<ChartTooltip
							cursor={{
								stroke: "hsl(var(--foreground, 222.2 84% 4.9%))",
								strokeWidth: 1,
								strokeDasharray: "3 3",
							}}
							content={
								<CustomPortfolioTooltip
									chartType={type}
									chartConfig={chartConfig}
								/>
							}
							isAnimationActive={false}
						/>
						<Legend
							verticalAlign="top" // Recharts default layout properties
							align="left"
							height={40} // Allocate space for legend
							formatter={formatLegendLabel} // Use the formatter function
							wrapperStyle={{
								paddingLeft: `${Y_AXIS_WIDTH + 10}px`, // Position legend correctly
								paddingTop: "4px",
							}}
						/>
						{type === "percentual" && (
							<Line
								key="line-portfolio-pct"
								name="portfolio" // Critical: Matches key in chartConfig
								dataKey="portfolio"
								type="monotone"
								unit="%"
								stroke={chartConfig.portfolio.color}
								strokeWidth={2}
								dot={false}
								connectNulls
								isAnimationActive={false}
							/>
						)}
						{/* Benchmark % Change Line (Only renders if type is percentual) */}
						{type === "percentual" && (
							<Line
								key="line-indexFund-pct"
								name="indexFund" // Critical: Matches key in chartConfig
								dataKey="indexFund"
								type="monotone"
								unit="%"
								stroke={chartConfig.indexFund.color}
								strokeWidth={2}
								dot={false}
								connectNulls
								isAnimationActive={false}
							/>
						)}
						{type === "absolute" && (
							<Line
								key="line-totalPortfolio"
								name="totalPortfolio" // Name must match key in chartConfig
								dataKey="totalPortfolio"
								type="monotone"
								unit="$"
								stroke={chartConfig.totalPortfolio.color} // Use hardcoded color
								strokeWidth={2}
								dot={false}
								connectNulls
								isAnimationActive={false}
							/>
						)}
					</LineChart>
				</ChartContainer>
			</ResponsiveContainer>
		</Card>
	);
}
