import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

export function useReceiptUpload() {
	const [isUploading, setIsUploading] = useState(false);
	const { user } = useAuthContext();

	const uploadReceipt = async (file: File) => {
		if (!user || !file) return;

		try {
			setIsUploading(true);

			// Insert a new receipt record into grocery.receipts
			const { data: receipt, error: receiptError } = await supabase
				.schema("grocery")
				.from("receipts")
				.insert({
					user_id: user.id,
					purchase_date: new Date().toISOString().split("T")[0], // ISO date only
					total_amount: 0, // Placeholder, update later if OCR provides it
				})
				.select()
				.single();

			if (receiptError) throw receiptError;

			// Upload the image to the receipts bucket
			const fileExt = file.name.split(".").pop();
			const filePath = `${user.id}/${receipt.id}.${fileExt}`;
			const { error: uploadError } = await supabase.storage
				.from("receipts")
				.upload(filePath, file, {
					contentType: file.type,
				});

			if (uploadError) throw uploadError;

			// Update the receipt with the storage path
			const { error: updateError } = await supabase
				.schema("grocery")
				.from("receipts")
				.update({ receipt_image_path: filePath })
				.eq("id", receipt.id);

			if (updateError) throw updateError;

			// Optionally, get a signed URL and call an edge function for OCR processing
			const { data: signedUrlData, error: signedUrlError } =
				await supabase.storage.from("receipts").createSignedUrl(filePath, 60);

			if (signedUrlError) throw signedUrlError;

			// Call an edge function (if you have one) to process the receipt
			const { error: processError } = await supabase.functions.invoke(
				"process-receipt",
				{
					body: {
						receipt_id: receipt.id,
						image_url: signedUrlData.signedUrl,
					},
				},
			);

			if (processError) throw processError;

			// Optionally navigate or return success
			return { success: true, receiptId: receipt.id };
		} catch (error) {
			console.error("Upload error:", error);
			return { success: false };
		} finally {
			setIsUploading(false);
		}
	};

	return { uploadReceipt, isUploading };
}
