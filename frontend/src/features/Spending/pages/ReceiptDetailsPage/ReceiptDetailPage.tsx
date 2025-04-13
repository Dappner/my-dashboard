import LoadingSpinner from "@/components/layout/components/LoadingSpinner";
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
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthContext } from "@/contexts/AuthContext";
import { format } from "date-fns";
import {
	CalendarIcon,
	EditIcon,
	EyeIcon,
	PencilIcon,
	PieChartIcon,
	ShoppingBagIcon,
	TrashIcon,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "sonner";
import { CategoryDropdown } from "./components/CategoryDropdown";
import { useReceipt } from "./useReceipt";

export default function ReceiptDetailPage() {
	const { receiptId } = useParams<{ receiptId: string }>();
	const { user } = useAuthContext();
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
	} = useReceipt(receiptId, user?.id);

	const handleEditReceipt = () => {
		if (receiptId) navigate(`/receipts/${receiptId}/edit`);
	};

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
				navigate("/receipts");
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

		try {
			await updateReceipt({
				...receipt,
				purchase_date: date,
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

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[50vh]">
				<LoadingSpinner />
			</div>
		);
	}

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

	const totalSavings = receipt.items.reduce(
		(sum, item) => sum + (item.discount_amount || 0),
		0,
	);

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
		value: receipt.items
			.filter((item) => (item.category_name || "Uncategorized") === category)
			.reduce((sum, item) => sum + (item.total_price || item.unit_price), 0),
	}));

	const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

	return (
		<div className="p-4 flex flex-col h-[calc(100dvh-56px)]">
			{/* Header Section */}
			<header className="mb-3">
				<div className="flex items-center justify-between">
					<h1 className="text-lg font-semibold truncate max-w-[50%]">
						{receipt.store_name || "Receipt Details"}
					</h1>
					<div className="flex items-center gap-2">
						<Popover>
							<PopoverTrigger asChild>
								<Button variant="outline" size="sm" className="h-8 text-xs">
									<CalendarIcon className="h-3.5 w-3.5 mr-1" />
									{formattedDate}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="end">
								<Calendar
									mode="single"
									selected={receipt.purchase_date}
									onSelect={handleDateChange}
									initialFocus
								/>
							</PopoverContent>
						</Popover>
						<Button
							variant="outline"
							size="sm"
							onClick={handleEditReceipt}
							className="h-8 px-2"
						>
							<EditIcon className="h-3.5 w-3.5" />
						</Button>
						<Button
							variant="destructive"
							size="sm"
							onClick={() => setIsDeleteDialogOpen(true)}
							className="h-8 px-2"
						>
							<TrashIcon className="h-3.5 w-3.5" />
						</Button>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-0">
				{/* Left Column - Image */}
				<div className="flex flex-col gap-4 ">
					<Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
						<DialogTrigger asChild>
							<div className="relative aspect-video">
								{receipt.imageUrl ? (
									<img
										src={receipt.imageUrl}
										alt={`Receipt from ${receipt.store_name || "store"}`}
										className="w-full h-full object-contain rounded-lg"
									/>
								) : (
									<div className="w-full h-full bg-muted flex items-center justify-center">
										<ShoppingBagIcon className="h-12 w-12 text-muted-foreground/50" />
									</div>
								)}
								<div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all flex items-center justify-center">
									<EyeIcon className="h-6 w-6 text-white opacity-0 hover:opacity-100" />
								</div>
							</div>
						</DialogTrigger>
						<DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
							{receipt.imageUrl ? (
								<img
									src={receipt.imageUrl}
									alt={`Receipt from ${receipt.store_name || "store"}`}
									className="w-full h-full object-cover"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center bg-black/80">
									<ShoppingBagIcon className="h-24 w-24 text-white/30" />
								</div>
							)}
						</DialogContent>
					</Dialog>
				</div>

				{/* Right Column - Items List */}
				<div className="grid col-span-2 grid-cols-1 md:grid-cols-2 gap-4">
					<Card>
						<CardHeader className="py-2 px-4">
							<div className="flex justify-between items-center">
								<CardTitle className="text-sm">Receipt Summary</CardTitle>
								<span className="text-base font-bold">
									{receipt.currency_code}
									{receipt.total_amount.toFixed(2)}
								</span>
							</div>
						</CardHeader>
						<CardContent className="p-4 pt-0">
							<div className="space-y-1.5 text-sm">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Subtotal</span>
									<span>
										{receipt.currency_code}
										{(receipt.total_amount + totalSavings).toFixed(2)}
									</span>
								</div>
								{totalSavings > 0 && (
									<div className="flex justify-between text-green-600">
										<span>Discount</span>
										<span>
											-{receipt.currency_code}
											{totalSavings.toFixed(2)}
										</span>
									</div>
								)}
								{receipt.tax_amount && receipt.tax_amount > 0 && (
									<div className="flex justify-between">
										<span className="text-muted-foreground">Tax</span>
										<span>
											{receipt.currency_code}
											{receipt.tax_amount.toFixed(2)}
										</span>
									</div>
								)}
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
						<Card>
							<CardHeader className="py-2 px-4">
								<CardTitle className="text-sm flex items-center">
									<PieChartIcon className="h-3.5 w-3.5 mr-1" />
									Category Breakdown
								</CardTitle>
							</CardHeader>
							<CardContent className="p-2">
								<div className="h-36">
									<ResponsiveContainer width="100%" height="100%">
										<PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
											<Pie
												data={pieChartData}
												cx="50%"
												cy="50%"
												outerRadius={55}
												fill="#8884d8"
												dataKey="value"
												label={({ name, percent }) =>
													`${name}: ${(percent * 100).toFixed(0)}%`
												}
												labelLine={false}
											>
												{pieChartData.map((item, index) => (
													<Cell
														key={item.name}
														fill={COLORS[index % COLORS.length]}
													/>
												))}
											</Pie>
											<Tooltip
												formatter={(value: number) =>
													`${receipt.currency_code}${value.toFixed(2)}`
												}
											/>
										</PieChart>
									</ResponsiveContainer>
								</div>
							</CardContent>
						</Card>
					)}

					<Card className="h-full md:col-span-2">
						<CardHeader className="pb-3 px-4 border-b">
							<CardTitle className="text-sm">
								Items ({receipt.items.length})
							</CardTitle>
						</CardHeader>
						<ScrollArea className="flex-1 overflow-y-scroll">
							{receipt.items.length > 0 ? (
								<div className="divide-y">
									{receipt.items.map((item) => (
										<div
											key={item.item_id}
											className="py-2 px-4 hover:bg-muted/30 transition-colors"
										>
											<div className="flex items-start justify-between gap-3">
												<div className="flex-1">
													<p className="font-medium text-sm leading-tight">
														{item.readable_name || item.item_name}
													</p>
													<div className="flex flex-wrap gap-2 items-center mt-1">
														{item.quantity > 1 && (
															<span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
																{item.quantity} × {receipt.currency_code}
																{item.unit_price.toFixed(2)}
															</span>
														)}
														<CategoryDropdown
															currentCategoryId={item.category_id}
															itemId={item.item_id}
															onCategoryChange={handleCategoryChange}
														/>
													</div>
												</div>
												<div className="text-right min-w-20">
													<p className="font-medium text-sm">
														{receipt.currency_code}
														{(item.total_price || item.unit_price).toFixed(2)}
													</p>
													{item.discount_amount > 0 && (
														<p className="text-xs text-green-600 mt-0.5">
															Saved {receipt.currency_code}
															{item.discount_amount.toFixed(2)}
														</p>
													)}
												</div>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="p-6 text-center text-muted-foreground">
									<ShoppingBagIcon className="h-8 w-8 mx-auto mb-2 opacity-30" />
									<p>No items found</p>
								</div>
							)}
						</ScrollArea>
					</Card>
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
							This will permanently delete the receipt and its{" "}
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
		</div>
	);
}
