import type { PieChartDataItem } from "@/components/charts/CustomPieChart";
import { chartColors } from "@/constants";
import type {
	Holding,
	HoldingAllocation,
	Industry,
	Sector,
} from "@my-dashboard/shared";
import type { PieData } from "./components/DividendPieChart";

export interface DividendMonthData {
	name: string;
	total: number;
	[key: string]: number | string;
}

export function prepareDividendChartData(
	holdings: Holding[] | undefined,
): DividendMonthData[] {
	if (!holdings || holdings.length === 0) {
		return generateEmptyMonthsData();
	}

	const monthsData = generateEmptyMonthsData();

	for (const holding of holdings) {
		if (!holding.symbol || !holding.dividend_months) {
			continue; // Skip if symbol or dividend_months is missing
		}

		for (const [month, amount] of Object.entries(holding.dividend_months)) {
			const monthIndex = getMonthIndex(month);
			if (monthIndex === -1 || typeof amount !== "number" || amount == null) {
				continue; // Skip invalid month or amount
			}

			// Initialize the stock symbol entry if not present
			if (!(holding.symbol in monthsData[monthIndex])) {
				monthsData[monthIndex][holding.symbol] = 0;
			}

			// Add the dividend amount
			monthsData[monthIndex][holding.symbol] =
				(monthsData[monthIndex][holding.symbol] as number) + amount;

			// Update the total
			monthsData[monthIndex].total += amount;
		}
	}

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
export const prepareSectorData = (
	holdings: HoldingAllocation[],
	sectorKeyMap: Map<string, Sector>,
): PieChartDataItem[] => {
	const sectorMap = new Map<string, number>();

	for (const holding of holdings) {
		const marketValue = holding.current_market_value ?? 0;

		if (holding.quote_type === "EQUITY" && holding.stock_sector) {
			// Use sector key to get proper name
			const sectorKey = holding.stock_sector;
			const sectorName = sectorKeyMap.get(sectorKey)?.name || sectorKey;

			sectorMap.set(sectorName, (sectorMap.get(sectorName) ?? 0) + marketValue);
		} else if (holding.sector_weightings) {
			for (const sector of holding.sector_weightings) {
				const sectorValue = marketValue * (sector.weight / 100);
				// Try to map sector_name to proper name if available
				const sectorName =
					sectorKeyMap.get(sector.sector_name)?.name || sector.sector_name;

				sectorMap.set(
					sectorName,
					(sectorMap.get(sectorName) ?? 0) + sectorValue,
				);
			}
		} else {
			sectorMap.set("Unknown", (sectorMap.get("Unknown") ?? 0) + marketValue);
		}
	}

	return Array.from(sectorMap.entries())
		.map(([label, value]) => ({
			label: label || "N/A",
			value,
		}))
		.sort((a, b) => b.value - a.value);
};

export const prepareIndustryData = (
	holdings: Holding[],
	industryKeyMap: Map<string, Industry>,
): PieChartDataItem[] => {
	if (!holdings || holdings.length === 0) return [];

	const industryMap = new Map<string, number>();

	for (const holding of holdings) {
		const industryKey = holding.industry ?? holding.quote_type ?? "Unknown";
		const industryName = industryKeyMap.get(industryKey)?.name || industryKey;
		const value = (holding.shares ?? 0) * (holding.average_cost_basis ?? 0);

		industryMap.set(industryName, (industryMap.get(industryName) ?? 0) + value);
	}

	return Array.from(industryMap.entries())
		.map(([label, value]) => ({
			label: label,
			value: Number(value.toFixed(2)),
		}))
		.sort((a, b) => b.value - a.value);
};
export const prepareAllocationData = (
	holdings: Holding[],
	cash_balance: number,
): PieChartDataItem[] => {
	const equities = holdings.reduce(
		(sum, holding) => sum + (holding.current_market_value ?? 0),
		0,
	);

	return [
		{ label: "Equities", value: equities },
		{ label: "Cash", value: cash_balance },
	];
};

export const prepareHoldingData = (holdings: Holding[]): PieChartDataItem[] => {
	return holdings.map((holding) => ({
		label: holding.symbol ?? "Unknown",
		value: holding.current_market_value ?? 0,
	}));
};

interface GeographicExposure {
	region: string;
	value: number;
	percentage: string;
}

export function calculateGeographicExposure(
	holdings: Holding[] | null | undefined,
): GeographicExposure[] | null {
	if (!holdings || holdings.length === 0) return null;

	const regionExposure: Record<string, number> = {};

	for (const holding of holdings) {
		const marketValue = holding.current_market_value ?? 0;
		const region = holding.region
			? holding.region === "US"
				? "United States"
				: ["GB", "DE", "FR", "IT", "NL"].includes(holding.region)
					? "Europe"
					: ["JP", "CN", "KR", "TW", "IN"].includes(holding.region)
						? "Asia"
						: "Other"
			: "Unknown";

		regionExposure[region] = (regionExposure[region] ?? 0) + marketValue;
	}

	const totalMarketValue = Object.values(regionExposure).reduce(
		(a, b) => a + b,
		0,
	);

	return Object.entries(regionExposure)
		.map(([region, value]) => ({
			region,
			value,
			percentage: ((value / totalMarketValue) * 100).toFixed(2),
		}))
		.sort(
			(a, b) =>
				Number.parseFloat(b.percentage) - Number.parseFloat(a.percentage),
		);
}
