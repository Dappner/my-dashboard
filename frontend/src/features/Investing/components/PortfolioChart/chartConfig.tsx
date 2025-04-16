import type { ChartConfig } from "@/components/ui/chart";

/**
 * Configuration for portfolio chart lines
 */
export const chartConfig = {
	totalPortfolio: { label: "Total Value", color: "#3b82f6" }, // Blue
	portfolio: { label: "Portfolio %", color: "#10b981" }, // Green
	indexFund: { label: "Benchmark %", color: "#f97316" }, // Orange
} satisfies ChartConfig;

export type ChartDataKey = keyof typeof chartConfig;

/**
 * Formats the Y-axis values based on chart type
 */
export function formatYAxis(
	value: number,
	type: "absolute" | "percentual",
): string {
	return type === "absolute"
		? value.toLocaleString(undefined, { maximumFractionDigits: 0 })
		: `${value.toFixed(0)}%`;
}

/**
 * Formats the legend labels and adds colored indicators
 */
export function formatLegendLabel(
	value: string,
	type: "absolute" | "percentual",
): React.ReactNode {
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
			<span style={{ color: "var(--foreground)" }}> {config.label} </span>
		</span>
	);
}
