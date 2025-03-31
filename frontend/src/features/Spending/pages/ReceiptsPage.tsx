import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/AuthContext";
import { ReceiptIcon, UploadIcon } from "lucide-react";
import { toast } from "sonner";
import { ReceiptCard } from "../components/ReceiptCard";
import { useReceiptUpload } from "../hooks/useReceiptUpload";
import { useReceipts } from "../hooks/useReceipts";

export default function ReceiptsPage() {
	const { user } = useAuthContext();
	const { uploadReceipt, isUploading } = useReceiptUpload();

	const { data: receipts, isLoading, error, refetch } = useReceipts(user?.id);

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Define the promise for the upload
		const uploadPromise = () =>
			new Promise((resolve, reject) => {
				uploadReceipt(file)
					.then((result) => {
						if (result?.success) {
							refetch(); // Refresh receipts list on success
							resolve({ fileName: file.name });
						} else {
							reject(new Error("Upload failed"));
						}
					})
					.catch((err) => reject(err));
			});

		// Use toast.promise to handle the upload states
		toast.promise(uploadPromise, {
			loading: "Uploading receipt...",
			//TODO: Type data correctly
			success: (data: unknown) =>
				`${data.fileName} has been analyzed and uploaded successfully!`,
			error: (err) => `Error uploading receipt: ${err.message}`,
		});
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64 text-gray-500">
				<span className="animate-pulse">Loading receipts...</span>
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-red-500 text-center p-4">Error loading receipts</div>
		);
	}

	const filteredReceipts = receipts!;

	return (
		<div className="container mx-auto p-6 space-y-8">
			{/* Header Section */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
						Receipts
					</h1>
				</div>
				<div className="flex flex-col items-center justify-center">
					<input
						type="file"
						accept="image/*,.pdf"
						className="hidden"
						id="receipt-upload"
						onChange={handleFileUpload}
						disabled={isUploading}
					/>
					<Button
						asChild
						disabled={isUploading}
						className="bg-blue-600 hover:bg-blue-700 text-white"
					>
						<label htmlFor="receipt-upload" className="flex items-center">
							<UploadIcon className="mr-2 h-4 w-4" />
							{isUploading ? "Uploading..." : "Upload Receipt"}
						</label>
					</Button>
				</div>
			</div>

			<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
				{filteredReceipts.map((receipt) => (
					<ReceiptCard key={receipt.receipt_id} receipt={receipt} />
				))}
			</div>

			{/* Empty State */}
			{filteredReceipts.length === 0 && (
				<div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50 rounded-lg border border-gray-200">
					<ReceiptIcon className="h-16 w-16 text-gray-400 mb-4" />
					<h3 className="font-semibold text-xl text-gray-800">
						No receipts found
					</h3>
					<p className="text-gray-600 mt-2">
						Upload your first receipt to get started
					</p>
				</div>
			)}
		</div>
	);
}
