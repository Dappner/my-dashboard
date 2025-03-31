import type { Holding } from "@/types/holdingsTypes";
import { monthsShort } from "./constants";
export interface AssetClass {
	asset_class: string;
	weight: number;
	date: string;
}

export interface SectorWeighting {
	sector_name: string;
	weight: number;
	date: string;
}

export function calculateTotalAnnualDividend(holdings: Holding[]): number {
	if (!holdings || holdings.length === 0) return 0;

	return holdings.reduce(
		(total, holding) => total + (holding.annual_dividend_amount ?? 0),
		0,
	);
}

export function calculateAverageYield(holdings: Holding[]): number {
	if (!holdings || holdings.length === 0) return 0;

	let totalValue = 0;
	let weightedYieldSum = 0;

	for (const holding of holdings) {
		const positionValue =
			(holding.average_cost_basis ?? 0) * (holding.shares ?? 0);
		totalValue += positionValue;
		weightedYieldSum +=
			(holding.cost_basis_dividend_yield_percent ?? 0) * positionValue;
	}

	return totalValue > 0 ? weightedYieldSum / totalValue : 0;
}

export function calculateMonthlyAverage(holdings: Holding[]): number {
	const annualTotal = calculateTotalAnnualDividend(holdings);
	return annualTotal / 12;
}

interface NextDividendInfo {
	symbol: string;
	month: string;
	date: Date;
	displayDate: string;
}

export function findNextDividendPayment(
	holdings: Holding[],
): NextDividendInfo | null {
	if (!holdings || holdings.length === 0) return null;

	const currentDate = new Date();
	const currentMonth = currentDate.getMonth();
	const currentYear = currentDate.getFullYear();

	let nextDividendInfo: NextDividendInfo | null = null;
	let closestMonthDiff = 13;

	for (const holding of holdings) {
		const dividendMonths = holding.dividend_months ?? [];
		if (dividendMonths.length === 0) continue;

		for (const monthNum of dividendMonths) {
			const month = monthNum > 11 ? 0 : monthNum;
			let monthsFromNow = month - currentMonth;
			if (monthsFromNow <= 0) monthsFromNow += 12;

			if (monthsFromNow < closestMonthDiff) {
				closestMonthDiff = monthsFromNow;
				const nextDate = new Date(
					month < currentMonth ? currentYear + 1 : currentYear,
					month,
					15,
				);

				nextDividendInfo = {
					symbol: holding.symbol ?? "Unknown",
					month: monthsShort[month],
					date: nextDate,
					displayDate: `${
						monthsShort[month]
					} ${nextDate.getDate()}, ${nextDate.getFullYear()}`,
				};
			}
		}
	}

	return nextDividendInfo;
}

export function sortHoldingsByProperty<T extends keyof Holding>(
	holdings: Holding[] | undefined,
	property: T,
	desc = true,
): Holding[] {
	if (!holdings) return [];

	return [...holdings].sort((a, b) => {
		const valueA = (a[property] as number | undefined) ?? 0;
		const valueB = (b[property] as number | undefined) ?? 0;
		return desc ? valueB - valueA : valueA - valueB;
	});
}
interface DividendChartData {
	name: string;
	month: number;
	total: number;
	[key: string]: number | string; // Allow dynamic symbol keys
}

export const prepareDividendChartData = (
	holdings: Holding[] = [],
): DividendChartData[] => {
	if (holdings.length === 0) return [];

	const monthlyData: DividendChartData[] = monthsShort.map((month, index) => ({
		name: month,
		month: index,
		total: 0,
	}));

	for (const holding of holdings) {
		const { symbol, dividend_amount, dividend_months, shares } = holding;

		if (symbol && dividend_amount && dividend_months && shares) {
			const monthlyDividend = dividend_amount * shares;

			for (const monthIndex of dividend_months) {
				if (monthIndex >= 0 && monthIndex < monthsShort.length) {
					const monthData = monthlyData[monthIndex];
					monthData[symbol] =
						((monthData[symbol] as number) ?? 0) + monthlyDividend;
					monthData.total += monthlyDividend;
				}
			}
		}
	}

	return monthlyData;
};
