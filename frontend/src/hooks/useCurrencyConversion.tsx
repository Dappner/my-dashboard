import { useUserPreferences } from "@/contexts/UserContext";
import { useLatestForexRate } from "./useLatestForexRate";

export function useCurrencyConversion() {
	const { displayCurrency } = useUserPreferences();

	const convertAmount = (amount: number, fromCurrency: string) => {
		if (!amount || fromCurrency === displayCurrency) return amount;

		const pairId = `${fromCurrency}/${displayCurrency}`;
		const { rate } = useLatestForexRate(pairId);

		if (rate) {
			return amount * rate.rate;
		}

		// Fallback to direct conversion if needed
		return amount;
	};

	const formatCurrency = (amount: number, fromCurrency: string) => {
		const convertedAmount = convertAmount(amount, fromCurrency);
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: displayCurrency,
		}).format(convertedAmount);
	};

	return {
		convertAmount,
		formatCurrency,
		displayCurrency,
	};
}
