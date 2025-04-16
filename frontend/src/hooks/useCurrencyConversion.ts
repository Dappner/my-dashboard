import { useUser } from "@/contexts/UserContext";
import { useMemo } from "react";
import { useLatestForexRates } from "./useLatestForexRates";

type RateMap = Record<string, Record<string, number>>;

export function useCurrencyConversion() {
	const { displayCurrency } = useUser();
	const { rates, isLoading: ratesLoading } = useLatestForexRates();

	// Create currency conversion map
	const conversionMap = useMemo(() => {
		if (!rates || rates.length === 0) return {};

		const rateMap: RateMap = {};

		// First, add all direct USD rates from the data
		for (const rate of rates) {
			if (!rateMap[rate.base_currency]) {
				rateMap[rate.base_currency] = {};
			}

			// Add direct rate
			rateMap[rate.base_currency][rate.target_currency] = rate.rate;

			// Also add inverse rate
			if (!rateMap[rate.target_currency]) {
				rateMap[rate.target_currency] = {};
			}
			rateMap[rate.target_currency][rate.base_currency] = 1 / rate.rate;
		}

		// Add USD to USD rate (1.0)
		if (!rateMap.USD) {
			rateMap.USD = {};
		}
		rateMap.USD.USD = 1.0;

		// Now compute cross-rates (e.g., EUR to JPY using USD as pivot)
		for (const baseCurrency in rateMap) {
			if (baseCurrency === "USD") continue; // Already have all USD rates

			for (const targetCurrency in rateMap.USD) {
				if (targetCurrency === baseCurrency || targetCurrency === "USD")
					continue;

				// Calculate cross-rate: baseCurrency -> USD -> targetCurrency
				const baseToUSD = rateMap[baseCurrency].USD;
				const usdToTarget = rateMap.USD[targetCurrency];

				rateMap[baseCurrency][targetCurrency] = baseToUSD * usdToTarget;
			}
		}

		return rateMap;
	}, [rates]);

	// Convert amount from one currency to another
	const convertAmount = (amount: number, fromCurrency: string) => {
		if (!amount) return 0;
		if (fromCurrency === displayCurrency) return amount;

		// If rates haven't loaded yet, just return the original amount
		if (ratesLoading || Object.keys(conversionMap).length === 0) {
			return amount;
		}

		// Get conversion rate
		if (conversionMap[fromCurrency]?.[displayCurrency]) {
			return amount * conversionMap[fromCurrency][displayCurrency];
		}

		// If no direct conversion available, try via USD
		if (
			conversionMap[fromCurrency]?.USD &&
			conversionMap.USD?.[displayCurrency]
		) {
			const fromToUSD = conversionMap[fromCurrency].USD;
			const usdToDisplay = conversionMap.USD[displayCurrency];
			return amount * fromToUSD * usdToDisplay;
		}

		console.warn(
			`No conversion rate available from ${fromCurrency} to ${displayCurrency}`,
		);
		return amount;
	};

	const formatCurrency = (amount: number, fromCurrency: string) => {
		const convertedAmount = convertAmount(amount, fromCurrency);
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: displayCurrency,
		}).format(convertedAmount);
	};

	// Get a currency symbol from a currency code
	const getCurrencySymbol = (currencyCode: string) => {
		const symbols: Record<string, string> = {
			USD: "$",
			EUR: "€",
			GBP: "£",
			JPY: "¥",
			CAD: "C$",
			AUD: "A$",
			CNY: "¥",
		};
		return symbols[currencyCode] || currencyCode;
	};

	return {
		convertAmount,
		formatCurrency,
		displayCurrency,
		conversionMap,
		getCurrencySymbol,
		isLoading: ratesLoading,
		isReady: !ratesLoading && Object.keys(conversionMap).length > 0,
	};
}
