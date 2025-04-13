import type { ReceiptWithItems } from "@/api/receiptsApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { ArrowLeftIcon, CalendarIcon, TagIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCategoryIcon } from "../../components/ReceiptCard";

export default function ReceiptDetailPage() {
	const { receiptId } = useParams<{ receiptId: string }>();
	const { user } = useAuthContext();
	const navigate = useNavigate();
	const [receipt, setReceipt] = useState<ReceiptWithItems | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isImageOpen, setIsImageOpen] = useState(false);

	useEffect(() => {
		const fetchReceipt = async () => {
			if (!user?.id || !receiptId) {
				setError("Missing user ID or receipt ID");
				setIsLoading(false);
				return;
			}

			try {
				// Fetch the receipt from Supabase
				const { data, error: receiptError } = await supabase
					.schema("grocery")
					.from("receipts_with_items")
					.select("*")
					.eq("receipt_id", receiptId)
					.eq("user_id", user.id);

				if (receiptError) throw receiptError;
				if (!data || data.length === 0) {
					setError("Receipt not found");
					setIsLoading(false);
					return;
				}

				// Process the data similar to the receiptsApi
				const receiptData = data[0];
				let signedImageUrl: string | null = null;

				if (receiptData.receipt_image_path) {
					const { data: signedUrlData, error: signedUrlError } =
						await supabase.storage
							.from("receipts")
							.createSignedUrl(receiptData.receipt_image_path, 3600);

					if (!signedUrlError) {
						signedImageUrl = signedUrlData.signedUrl;
					}
				}

				// Create the receipt object with all items
				const receiptWithItems: ReceiptWithItems = {
					receipt_id: receiptData.receipt_id || "",
					store_name: receiptData.store_name || "",
					purchase_date: receiptData.purchase_date
						? new Date(receiptData.purchase_date)
						: new Date(),
					total_amount: receiptData.total_amount || 0,
					total_discount: receiptData.total_discount || 0,
					currency_code: receiptData.currency_code || "USD",
					receipt_image_path: receiptData.receipt_image_path || null,
					imageUrl: signedImageUrl,
					items: [],
				};

				// Add all items from the data
				for (const row of data) {
					if (row.item_id) {
						receiptWithItems.items.push({
							item_id: row.item_id,
							item_name: row.item_name || "Unknown Item",
							readable_name: row.readable_name || "Unknown Item",
							quantity: row.quantity || 1,
							unit_price: row.unit_price || 0,
							original_unit_price: row.original_unit_price || 0,
							discount_amount: row.discount_amount || 0,
							is_discounted: row.is_discounted || false,
							total_price: row.total_price || null,
							category_name: row.category_name || null,
						});
					}
				}

				setReceipt(receiptWithItems);
				setIsLoading(false);
			} catch (err) {
				console.error("Error fetching receipt:", err);
				setError("Failed to load receipt details");
				setIsLoading(false);
			}
		};

		fetchReceipt();
	}, [receiptId, user?.id]);

	const handleGoBack = () => {
		navigate(-1);
	};

	if (isLoading) {
		return <ReceiptDetailSkeleton />;
	}

	if (error || !receipt) {
		return (
			<div className="container mx-auto p-6">
				<div className="flex items-center mb-6">
					<Button
						variant="ghost"
						size="sm"
						onClick={handleGoBack}
						className="mr-2"
					>
						<ArrowLeftIcon className="h-4 w-4 mr-2" />
						Back
					</Button>
				</div>
				<div className="bg-red-50 text-red-800 p-4 rounded-lg">
					<p className="font-medium">Error</p>
					<p>{error || "Failed to load receipt"}</p>
					<Button variant="outline" className="mt-4" onClick={handleGoBack}>
						Return to Receipts
					</Button>
				</div>
			</div>
		);
	}

	const totalSavings =
		receipt.total_discount ||
		receipt.items.reduce((sum, item) => sum + (item.discount_amount || 0), 0);
	const formattedDate = format(new Date(receipt.purchase_date), "PPP");
	const categories = [
		...new Set(receipt.items.map((item) => item.category_name)),
	].filter(Boolean);

	return (
		<div className="container mx-auto p-4 md:p-6 space-y-6 max-w-3xl">
			{/* Header with back button */}
			<div className="flex items-center mb-4">
				<Button
					variant="ghost"
					size="sm"
					onClick={handleGoBack}
					className="mr-2"
				>
					<ArrowLeftIcon className="h-4 w-4 mr-2" />
					Back
				</Button>
				<h1 className="text-2xl font-bold">Receipt Details</h1>
			</div>

			{/* Store and Date Info */}
			<Card className="p-6">
				<div className="flex items-start md:items-center gap-4 flex-col md:flex-row">
					<Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
						<DialogTrigger asChild>
							<Avatar className="h-16 w-16 cursor-pointer">
								<AvatarImage
									src={receipt.imageUrl || ""}
									alt={receipt.store_name || undefined}
								/>
								<AvatarFallback className="bg-blue-500 text-white text-xl">
									{receipt.store_name?.substring(0, 2) || "??"}
								</AvatarFallback>
							</Avatar>
						</DialogTrigger>
						<DialogContent className="max-w-[90vw] sm:max-w-xl">
							<img
								src={receipt.imageUrl || ""}
								alt={`Receipt from ${receipt.store_name}`}
								className="w-full rounded-lg"
							/>
						</DialogContent>
					</Dialog>

					<div className="flex-1">
						<h2 className="text-2xl font-bold text-gray-800">
							{receipt.store_name || "Unknown Store"}
						</h2>
						<div className="text-gray-600 flex items-center gap-1 mt-1">
							<CalendarIcon className="h-4 w-4" />
							{formattedDate}
						</div>
					</div>

					<div className="text-right mt-4 md:mt-0">
						<div className="text-sm text-gray-600 mb-1">
							{receipt.items.length}{" "}
							{receipt.items.length === 1 ? "item" : "items"}
						</div>
						<div className="text-2xl font-bold">
							{receipt.currency_code}
							{receipt.total_amount.toFixed(2)}
						</div>
						{totalSavings > 0 && (
							<div className="text-green-600 text-sm flex items-center justify-end gap-1 mt-1">
								<TagIcon className="h-4 w-4" />
								Saved {receipt.currency_code}
								{totalSavings.toFixed(2)}
							</div>
						)}
					</div>
				</div>
			</Card>

			{/* Categories */}
			{categories.length > 0 && (
				<div className="flex flex-wrap gap-2 my-4">
					{categories.map(
						(category) =>
							category && (
								<div
									key={category}
									className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center gap-1"
								>
									{getCategoryIcon(category)}
									{category}
								</div>
							),
					)}
				</div>
			)}

			{/* Items */}
			<Card className="p-6">
				<h3 className="text-lg font-semibold mb-4">Items</h3>
				<div className="space-y-4">
					{receipt.items.map((item) => (
						<div
							key={item.item_id}
							className="pb-3 border-b border-gray-100 last:border-b-0 last:pb-0"
						>
							<div className="flex justify-between">
								<div className="flex-1">
									<p className="font-medium">{item.readable_name}</p>
									{item.quantity > 1 && (
										<p className="text-sm text-gray-500">
											Quantity: {item.quantity}
										</p>
									)}
								</div>
								<div className="text-right ml-4">
									<p className="font-medium">
										{receipt.currency_code}
										{item.unit_price.toFixed(2)}
									</p>
									{item.is_discounted && (
										<p className="text-sm text-green-600">
											Save {receipt.currency_code}
											{item.discount_amount.toFixed(2)}
										</p>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			</Card>

			{/* Summary */}
			<Card className="p-6">
				<h3 className="text-lg font-semibold mb-4">Summary</h3>
				<div className="space-y-2">
					<div className="flex justify-between text-gray-600">
						<span>Subtotal</span>
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

					<div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 mt-2">
						<span>Total</span>
						<span>
							{receipt.currency_code}
							{receipt.total_amount.toFixed(2)}
						</span>
					</div>
				</div>
			</Card>
		</div>
	);
}

const ReceiptDetailSkeleton = () => {
	return (
		<div className="container mx-auto p-4 md:p-6 space-y-6 max-w-3xl">
			<div className="flex items-center mb-4">
				<Skeleton className="h-8 w-20 mr-2" />
				<Skeleton className="h-8 w-40" />
			</div>

			<Card className="p-6">
				<div className="flex items-start md:items-center gap-4 flex-col md:flex-row">
					<Skeleton className="h-16 w-16 rounded-full" />
					<div className="flex-1">
						<Skeleton className="h-8 w-48 mb-2" />
						<Skeleton className="h-4 w-32" />
					</div>
					<div className="text-right mt-4 md:mt-0">
						<Skeleton className="h-4 w-24 mb-2 ml-auto" />
						<Skeleton className="h-8 w-32 ml-auto" />
					</div>
				</div>
			</Card>

			<Card className="p-6">
				<Skeleton className="h-6 w-24 mb-4" />
				<div className="space-y-4">
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className="pb-3 border-b border-gray-100 last:border-b-0 last:pb-0"
						>
							<div className="flex justify-between">
								<Skeleton className="h-5 w-48" />
								<Skeleton className="h-5 w-16" />
							</div>
						</div>
					))}
				</div>
			</Card>

			<Card className="p-6">
				<Skeleton className="h-6 w-24 mb-4" />
				<div className="space-y-3">
					<div className="flex justify-between">
						<Skeleton className="h-5 w-20" />
						<Skeleton className="h-5 w-20" />
					</div>
					<div className="flex justify-between">
						<Skeleton className="h-5 w-20" />
						<Skeleton className="h-5 w-20" />
					</div>
					<div className="pt-2 border-t border-gray-200 mt-2">
						<div className="flex justify-between">
							<Skeleton className="h-6 w-16" />
							<Skeleton className="h-6 w-24" />
						</div>
					</div>
				</div>
			</Card>
		</div>
	);
};
