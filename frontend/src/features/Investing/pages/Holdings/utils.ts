import { chartColors } from "@/constants";
import type { Holding } from "@/types/holdingsTypes";
import type { PieData } from "./components/DividendPieChart";

export interface DividendMonthData {
	name: string;
	total: number;
	[key: string]: number | string;
}

/**
 * Prepares data for the dividend schedule chart
 * @param holdings - Array of holdings
 * @returns Array of dividend data by month
 */
export function prepareDividendChartData(
	holdings: Holding[] | undefined,
): DividendMonthData[] {
	if (!holdings || holdings.length === 0) {
		return generateEmptyMonthsData();
	}

	const monthsData = generateEmptyMonthsData();

	holdings.forEach((holding) => {
		if (holding.symbol && holding.dividend_months) {
			Object.entries(holding.dividend_months).forEach(([month, amount]) => {
				const monthIndex = getMonthIndex(month);
				if (monthIndex !== -1 && typeof amount === "number") {
					// Initialize the stock symbol entry if not present
					if (!(holding.symbol! in monthsData[monthIndex])) {
						monthsData[monthIndex][holding.symbol!] = 0;
					}

					// Add the dividend amount
					monthsData[monthIndex][holding.symbol!] =
						(monthsData[monthIndex][holding.symbol!] as number) + amount;

					// Update the total
					monthsData[monthIndex].total += amount;
				}
			});
		}
	});

	return monthsData;
}

/**
 * Generates empty data structure for all months
 */
function generateEmptyMonthsData(): DividendMonthData[] {
	const months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	return months.map((month) => ({
		name: month,
		total: 0,
	}));
}

/**
 * Gets the index of a month (0-11) from its name
 */
function getMonthIndex(month: string): number {
	const months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	const normalizedMonth =
		month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
	return months.indexOf(normalizedMonth);
}

/**
 * Generates colors for stock symbols
 */
export function getStockColors(
	holdings: Holding[] | undefined,
): Record<string, string> {
	const result: Record<string, string> = {};

	if (holdings) {
		holdings.forEach((holding: Holding, index: number) => {
			if (holding.symbol) {
				result[holding.symbol] = chartColors[index % chartColors.length];
			}
		});
	}

	return result;
}

export const prepareDividendPieData = (
	holdings: Holding[] | undefined,
): PieData[] => {
	if (!holdings || holdings.length === 0) return [];

	// Filter holdings to only include those with dividends
	const dividendHoldings = holdings.filter(
		(h) => (h.annual_dividend_amount || 0) > 0,
	);

	// Group by ticker and calculate total annual dividend contribution
	const data = dividendHoldings.map((holding) => ({
		name: holding.symbol || "Unknown",
		value: holding.annual_dividend_amount || 0,
	}));

	// Sort by value (highest first)
	data.sort((a, b) => b.value - a.value);

	// Take top 5, combine the rest as "Other"
	let result: PieData[] = [];

	if (data.length <= 5) {
		result = data.map((item, index) => ({
			...item,
			color: chartColors[index % chartColors.length],
		}));
	} else {
		const top5 = data.slice(0, 5);
		const others = data.slice(5).reduce((acc, item) => acc + item.value, 0);

		result = [
			...top5.map((item, index) => ({
				...item,
				color: chartColors[index],
			})),
			{
				name: "Others",
				value: others,
				color: chartColors[5],
			},
		];
	}

	return result;
};
