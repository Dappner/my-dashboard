import { cn } from "@/lib/utils";

interface TransactionKPIsProps {
	netCashflow: number;
	totalTrades: number;
	netCash: number;
}

export default function TransactionKPIs({
	netCashflow,
	totalTrades,
	netCash,
}: TransactionKPIsProps) {
	return (
		<div className="grid grid-cols-3 sm:gap-2 w-full">
			<div className="bg-white/80 backdrop-blur-sm sm:rounded-lg px-3 py-2 sm:border border-gray-200 shadow-sm">
				<div className="text-xs text-gray-600 mb-1">Net Cashflow</div>
				<div
					className={cn(
						"text-lg font-semibold",
						netCashflow >= 0 ? "text-green-700" : "text-red-600",
					)}
				>
					${Math.abs(netCashflow).toFixed(2)}
				</div>
			</div>
			<div className="bg-white/80 backdrop-blur-sm sm:rounded-lg px-3 py-2 sm:border border-gray-200 shadow-sm">
				<div className="text-xs text-gray-600 mb-1">Total Trades</div>
				<div className="text-lg font-semibold text-gray-800">{totalTrades}</div>
			</div>
			<div className="bg-white/80 backdrop-blur-sm sm:rounded-lg px-3 py-2 sm:border border-gray-200 shadow-sm">
				<div className="text-xs text-gray-600 mb-1">Net Deposits</div>
				<div
					className={cn(
						"text-lg font-semibold",
						netCash >= 0 ? "text-green-700" : "text-red-600",
					)}
				>
					${Math.abs(netCash).toFixed(2)}
				</div>
			</div>
		</div>
	);
}
