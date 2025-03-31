import { PageContainer } from "@/components/layout/components/PageContainer";
import { Button } from "@/components/ui/button";
import { useTransactionSheet } from "@/contexts/SheetContext";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import TransactionTable from "../../components/TransactionTable";
import { useTransactions } from "../../hooks/useTransactions";
import PaginationControls from "./components/PaginationControls";
import TransactionsFilters, {
	type TransactionsFilters as TFilters,
} from "./components/TransactionsFilters";
import TransactionKPIs from "./components/TransactionsKpis";
import { filterTransactions } from "./components/utils";

export default function TransactionsPage() {
	const itemsPerPage = 10;
	const { openAddTransaction } = useTransactionSheet();
	const { transactions, isLoading, isError, refetch, deleteTransaction } =
		useTransactions();

	const [filters, setFilters] = useState<TFilters>({
		transaction_type: "all",
		ticker: "all",
	});
	const [currentPage, setCurrentPage] = useState(1);

	const filteredTransactions = useMemo(() => {
		return filterTransactions(filters, transactions);
	}, [transactions, filters]);

	const paginatedTrades = useMemo(() => {
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		return filteredTransactions?.slice(startIndex, endIndex);
	}, [filteredTransactions, currentPage]);

	const totalPages = Math.ceil(
		(filteredTransactions?.length || 0) / itemsPerPage,
	);

	const onDeleteTransaction = async (id: string) => {
		if (confirm("Are you sure you want to delete this trade?")) {
			try {
				deleteTransaction(id);
				refetch(); // Refresh transactions after deletion
			} catch (error) {
				console.error("Failed to delete trade:", error);
			}
		}
	};

	const kpis = useMemo(() => {
		const netCashflow = filteredTransactions?.reduce((sum, trade) => {
			const amount = Number.parseFloat(
				trade.total_cost_basis?.toFixed(2) || "0",
			);
			return trade.transaction_type === "buy" ||
				trade.transaction_type === "withdraw"
				? sum - amount
				: sum + amount;
		}, 0);

		const totalTrades =
			filteredTransactions?.filter((transaction) =>
				["buy", "sell"].includes(transaction.transaction_type || ""),
			).length || 0;

		const netCash = filteredTransactions?.reduce((sum, trade) => {
			const amount = Number.parseFloat(
				trade.total_cost_basis?.toFixed(2) || "0",
			);
			if (trade.transaction_type === "deposit") {
				return sum + amount;
			}
			if (trade.transaction_type === "withdraw") {
				return sum - amount;
			}
			return sum;
		}, 0);

		return { netCashflow, totalTrades, netCash };
	}, [filteredTransactions]);

	return (
		<PageContainer className="pt-0">
			<TransactionKPIs
				netCashflow={kpis?.netCashflow || 0}
				totalTrades={kpis?.totalTrades}
				netCash={kpis?.netCash || 0}
			/>
			<div className={cn("w-full space-y-4")}>
				<div className="px-2">
					<TransactionsFilters
						filters={filters}
						setTransactionsFilters={setFilters}
						onAddTransaction={openAddTransaction}
					/>
				</div>

				{isLoading ? (
					<div className="text-center py-4 text-muted-foreground">
						<div className="animate-pulse">Loading trades...</div>
					</div>
				) : isError ? (
					<div className="text-center py-4 space-y-2">
						<p className="text-destructive">Error loading trades</p>
						<Button variant="outline" onClick={() => refetch()}>
							Retry
						</Button>
					</div>
				) : filteredTransactions?.length === 0 ? (
					<div className="text-center py-4 text-muted-foreground">
						No trades found matching the filters
					</div>
				) : (
					<>
						<TransactionTable
							transactions={paginatedTrades || []}
							isLoading={isLoading}
							actions
							onDeleteTransaction={onDeleteTransaction}
						/>
						<PaginationControls
							currentPage={currentPage}
							totalPages={totalPages}
							itemsPerPage={itemsPerPage}
							totalItems={filteredTransactions?.length || 0}
							onPageChange={setCurrentPage}
							disabled={isLoading}
						/>
					</>
				)}
			</div>
		</PageContainer>
	);
}
