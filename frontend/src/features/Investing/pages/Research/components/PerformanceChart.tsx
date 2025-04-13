import { Skeleton } from "@/components/ui/skeleton";
import type { HistoricalPrice } from "@my-dashboard/shared";
import {
	CategoryScale,
	Chart as ChartJS,
	Filler,
	Legend,
	LinearScale,
	LineElement,
	PointElement,
	Title,
	Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	Filler,
);

interface PerformanceChartProps {
	prices: HistoricalPrice[];
	comparisonPrices: HistoricalPrice[];
	isLoading: boolean;
	isError: boolean;
	primaryLabel: string;
	comparisonLabel: string;
	primaryColor?: string;
	comparisonColor?: string;
}

export function PerformanceChart({
	prices,
	comparisonPrices,
	isLoading,
	isError,
	primaryLabel,
	comparisonLabel,
	primaryColor = "#3b82f6",
	comparisonColor = "#10b981",
}: PerformanceChartProps) {
	const chartData = {
		labels: prices.map((price) =>
			new Date(price.date).toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
			}),
		),
		datasets: [
			{
				label: primaryLabel,
				data: prices.map((price, _) => {
					const baseline = prices[0]?.close_price || 1;
					return (((price.close_price || 0) - baseline) / baseline) * 100;
				}),
				borderColor: primaryColor,
				backgroundColor: `${primaryColor}33`, // 20% opacity
				tension: 0.4,
				fill: true,
			},
			{
				label: comparisonLabel,
				data: comparisonPrices.length
					? comparisonPrices.map((price, _) => {
							const baseline = comparisonPrices[0]?.close_price || 1;
							return (((price.close_price || 0) - baseline) / baseline) * 100;
						})
					: prices.map(() => 0), // Fallback
				borderColor: comparisonColor,
				backgroundColor: "transparent",
				tension: 0.4,
				borderDash: [5, 5],
			},
		],
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { position: "top" as const },
			tooltip: {
				mode: "index" as const,
				intersect: false,
				callbacks: {
					// biome-ignore lint/suspicious/noExplicitAny: Fine for this
					label: (context: any) =>
						`${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`,
				},
			},
		},
		// scales: {
		// 	y: {
		// 		ticks: {
		// 			callback: (value: number) => `${value}%`,
		// 		},
		// 	},
		// },
		interaction: {
			mode: "nearest" as const,
			axis: "x" as const,
			intersect: false,
		},
	};

	if (isLoading) {
		return <Skeleton className="h-64 w-full" />;
	}

	if (isError || prices.length === 0) {
		return (
			<div className="h-64 w-full flex items-center justify-center text-red-500">
				{isError ? "Error loading chart data" : "No historical data available"}
			</div>
		);
	}

	return (
		<div className="h-64">
			<Line data={chartData} options={chartOptions} />
		</div>
	);
}
