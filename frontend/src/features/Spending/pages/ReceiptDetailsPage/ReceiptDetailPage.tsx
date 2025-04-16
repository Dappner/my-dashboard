import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import LoadingState from "@/components/layout/components/LoadingState";
import { PageContainer } from "@/components/layout/components/PageContainer";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { spendingReceiptsRoute } from "@/routes/spending-routes";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { PencilIcon, PieChartIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CategoryPieChart } from "../../components/CategoryPieChart";
import ReceiptHeader from "./components/ReceiptHeader";
import ReceiptImage from "./components/ReceiptImage";
import ReceiptItemsList from "./components/ReceiptItemsList";
import { useReceipt } from "./useReceipt";

const route = getRouteApi("/spending/receipts/$receiptId");
export default function ReceiptDetailPage() {
	const { receiptId } = route.useParams();
	const navigate = useNavigate();
	const [isImageOpen, setIsImageOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const {
		receipt,
		isLoading,
		error,
		deleteReceipt,
		updateReceipt,
		updateItemCategory,
	} = useReceipt(receiptId);

	const handleCategoryChange = async (
		itemId: string,
		categoryId: string | null,
	) => {
		const result = await updateItemCategory(itemId, categoryId);
		if (result) {
			toast.success("Successfully changed the Category!");
		}
	};

	const handleDelete = async () => {
		try {
			const result = await deleteReceipt();
			if (result.success) {
				toast.success("Receipt deleted successfully");
				navigate({ to: spendingReceiptsRoute.to });
			} else {
				toast.error(`Failed to delete receipt: ${result.error}`);
			}
		} catch (err) {
			toast.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
		} finally {
			setIsDeleteDialogOpen(false);
		}
	};

	const handleDateChange = async (date: Date | undefined) => {
		if (!date || !receipt) return;

		const formattedPurchaseDate = format(date, "yyyy-MM-dd");
		try {
			await updateReceipt({
				...receipt,
				purchase_date: formattedPurchaseDate,
			});
			toast.success("Receipt date updated");
		} catch (err) {
			toast.error(
				`Failed to update date: ${
					err instanceof Error ? err.message : String(err)
				}`,
			);
		}
	};

	const handleAddEditTip = () => {
		toast.info("Add/Edit Tip functionality will be implemented soon");
	};

	if (isLoading) return <LoadingState />;

	console.log(error);
	if (error || !receipt) {
		return (
			<div className="container mx-auto p-4 max-w-4xl">
				<div className="p-8 text-center">
					<h2 className="text-xl font-semibold mb-2">
						{error ? "Error Loading Receipt" : "Receipt Not Found"}
					</h2>
					<p className="text-muted-foreground">
						{error
							? `Error: ${
									error instanceof Error ? error.message : String(error)
								}`
							: "The receipt you're looking for doesn't exist or has been deleted."}
					</p>
				</div>
			</div>
		);
	}

	const formattedDate = format(receipt.purchase_date, "PPP");

	const itemCategories = [
		...new Set(
			receipt.items
				.map((item) => item.category_name || "Uncategorized")
				.filter(Boolean),
		),
	];

	const pieChartData = itemCategories.map((category) => ({
		name: category,
		amount: receipt.items
			.filter((item) => (item.category_name || "Uncategorized") === category)
			.reduce((sum, item) => sum + (item.total_price || item.unit_price), 0),
	}));

	return (
		<PageContainer className="h-[calc(100dvh-56px)]">
			{/* Header Section */}
			<ReceiptHeader
				className="px-2 sm:px-0"
				receipt={receipt}
				formattedDate={formattedDate}
				onDateChange={handleDateChange}
				onDelete={() => setIsDeleteDialogOpen(true)}
			/>
			{/* Main Content */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-0">
				{/* Left Column - Image */}
				<ReceiptImage
					receipt={receipt}
					isImageOpen={isImageOpen}
					setIsImageOpen={setIsImageOpen}
				/>

				{/* Right Column - Items List */}
				<div className="grid col-span-2 grid-cols-1 md:grid-cols-2 gap-4">
					<Card>
						<CardHeader className="py-2 px-4">
							<div className="flex justify-between items-center">
								<CardTitle className="text-sm">Receipt Summary</CardTitle>
								<span className="text-base font-bold">
									<CurrencyDisplay
										amount={receipt.total_amount}
										fromCurrency={receipt.currency_code}
									/>
								</span>
							</div>
						</CardHeader>
						<CardContent className="p-4 pt-0">
							<div className="space-y-1.5 text-sm">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Subtotal</span>
									<CurrencyDisplay
										amount={receipt.total_amount + receipt.total_discount}
										fromCurrency={receipt.currency_code}
									/>
								</div>
								{receipt.total_discount > 0 && (
									<div className="flex justify-between text-green-600">
										<span>Discount</span>
										<CurrencyDisplay
											amount={receipt.total_discount}
											fromCurrency={receipt.currency_code}
										/>
									</div>
								)}
								{receipt.tax_amount
									? receipt.tax_amount > 0 && (
											<div className="flex justify-between">
												<span className="text-muted-foreground">Tax</span>
												<CurrencyDisplay
													amount={receipt.tax_amount}
													fromCurrency={receipt.currency_code}
												/>
											</div>
										)
									: null}
								<Button
									variant="outline"
									size="sm"
									onClick={handleAddEditTip}
									className="w-full h-7 text-xs mt-3"
								>
									<PencilIcon className="h-3 w-3 mr-1" />
									Add/Edit Tip
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Category Pie Chart */}
					{pieChartData.length > 0 && (
						<Card className="hover:shadow-md transition-shadow h-full">
							<CardHeader className="pb-2">
								<CardTitle className="text-lg flex items-center">
									<PieChartIcon className="h-4 w-4 mr-2" />
									Spending by Category
								</CardTitle>
							</CardHeader>
							<CardContent>
								<CategoryPieChart categories={pieChartData} />
							</CardContent>
						</Card>
					)}
					<ReceiptItemsList
						receipt={receipt}
						onCategoryChange={handleCategoryChange}
					/>
				</div>
			</div>
			{/* Delete Confirmation */}
			<AlertDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Receipt?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete the receipt and its
							{receipt.items.length} items.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive hover:bg-destructive/90"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</PageContainer>
	);
}
