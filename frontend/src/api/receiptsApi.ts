import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

type ReceiptsWithItemsRow =
	Database["grocery"]["Views"]["receipts_with_items"]["Row"];
export type Receipt = Database["grocery"]["Tables"]["receipts"]["Row"];
export type ReceiptItem = Database["grocery"]["Tables"]["receipt_items"]["Row"];
export type UpdateReceiptItem =
	Database["grocery"]["Tables"]["receipt_items"]["Update"];
export type ReceiptWithItems = {
	receipt_id: string;
	store_name: string | null; // Allow null as per view
	purchase_date: Date;
	total_amount: number;
	total_discount: number;
	currency_code: Database["grocery"]["Enums"]["currency_type"];
	receipt_image_path: string | null;
	imageUrl: string | null; // Signed URL
	items: {
		item_id: string;
		item_name: string;
		readable_name: string;
		quantity: number;
		discount_amount: number;
		is_discounted: boolean;
		original_unit_price: number;
		unit_price: number;
		total_price: number | null;
		category_name: string | null;
		category_id: string | null;
	}[];
	tax_amount?: number;
};

export const receiptsApiKeys = {
	all: ["receipts"] as const,
	user: (userId: string) => [...receiptsApiKeys.all, userId] as const,
	detail: (userId: string, receiptId: string) =>
		[...receiptsApiKeys.user(userId), receiptId] as const,
};

export const receiptsApi = {
	async getReceiptsWithItems(
		userId: string,
		page = 1,
	): Promise<{ receipts: ReceiptWithItems[]; nextPage?: number }> {
		const pageSize = 10; // adjust page size as needed
		const start = (page - 1) * pageSize;
		const end = page * pageSize - 1;
		const { data, error, count } = await supabase
			.schema("grocery")
			.from("receipts_with_items")
			.select("*", { count: "exact" })
			.eq("user_id", userId)
			.order("purchase_date", { ascending: false })
			.range(start, end);

		if (error) throw error;

		// Group rows by receipt_id
		const receiptMap = new Map<string, ReceiptWithItems>();
		for (const row of data as ReceiptsWithItemsRow[]) {
			const receiptId = row.receipt_id;
			if (!receiptId) continue;

			if (!receiptMap.has(receiptId)) {
				let signedImageUrl: string | null = null;
				if (row.receipt_image_path) {
					const { data: signedUrlData, error: signedUrlError } =
						await supabase.storage
							.from("receipts")
							.createSignedUrl(row.receipt_image_path, 3600); // URL valid for 1 hour

					if (signedUrlError) {
						console.error(
							`Failed to create signed URL for ${row.receipt_image_path}:`,
							signedUrlError,
						);
					} else {
						signedImageUrl = signedUrlData.signedUrl;
					}
				}

				receiptMap.set(receiptId, {
					receipt_id: receiptId,
					store_name: row.store_name ?? "",
					purchase_date: row.purchase_date
						? new Date(row.purchase_date)
						: new Date(),
					total_amount: row.total_amount ?? 0,
					total_discount: row.total_discount ?? 0,
					currency_code: row.currency_code ?? "USD",
					receipt_image_path: row.receipt_image_path ?? null,
					imageUrl: signedImageUrl,
					items: [],
				});
			}

			if (row.item_id) {
				const receipt = receiptMap.get(receiptId);
				if (receipt) {
					receipt.items.push({
						item_id: row.item_id,
						item_name: row.item_name ?? "Unknown Item",
						readable_name: row.readable_name ?? "Unknown Item",
						quantity: row.quantity ?? 1,
						unit_price: row.unit_price ?? 0,
						original_unit_price: row.original_unit_price ?? 0,
						discount_amount: row.discount_amount ?? 0,
						is_discounted: row.is_discounted ?? false,
						total_price: row.total_price ?? null,
						category_name: row.category_name ?? "",
						category_id: row.category_id ?? null,
					});
				}
			}
		}

		const receipts = Array.from(receiptMap.values());
		const nextPage = count !== null && end + 1 < count ? page + 1 : undefined;
		return { receipts, nextPage };
	},

	async getReceiptById(
		userId: string,
		receiptId: string,
	): Promise<ReceiptWithItems> {
		const { data, error } = await supabase
			.schema("grocery")
			.from("receipts_with_items")
			.select("*")
			.eq("receipt_id", receiptId)
			.eq("user_id", userId);

		if (error) throw error;
		if (!data || data.length === 0) {
			throw new Error("Receipt not found");
		}

		// Process the data
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

		// Create the receipt object
		const receipt: ReceiptWithItems = {
			receipt_id: receiptData.receipt_id || "",
			store_name: receiptData.store_name ?? "",
			purchase_date: receiptData.purchase_date
				? new Date(receiptData.purchase_date)
				: new Date(),
			total_amount: receiptData.total_amount ?? 0,
			tax_amount: receiptData.tax_amount ?? 0,
			total_discount: receiptData.total_discount ?? 0,
			currency_code: receiptData.currency_code ?? "USD",
			receipt_image_path: receiptData.receipt_image_path ?? null,
			imageUrl: signedImageUrl,
			items: [],
		};

		// Add all items from the data
		for (const row of data as ReceiptsWithItemsRow[]) {
			if (row.item_id) {
				receipt.items.push({
					item_id: row.item_id,
					item_name: row.item_name ?? "Unknown Item",
					readable_name: row.readable_name ?? "Unknown Item",
					quantity: row.quantity ?? 1,
					unit_price: row.unit_price ?? 0,
					original_unit_price: row.original_unit_price ?? 0,
					discount_amount: row.discount_amount ?? 0,
					is_discounted: row.is_discounted ?? false,
					total_price: row.total_price ?? null,
					category_name: row.category_name ?? "",
					category_id: row.category_id ?? null,
				});
			}
		}

		return receipt;
	},

	async updateReceipt(
		userId: string,
		receiptId: string,
		updatedData: Partial<ReceiptWithItems>,
	): Promise<{ success: boolean; error?: string }> {
		try {
			// Update receipt base data
			const { error: updateError } = await supabase
				.schema("grocery")
				.from("receipts")
				.update({
					store_name: updatedData.store_name,
					total_amount: updatedData.total_amount,
					total_discount: updatedData.total_discount,
					currency_code: updatedData.currency_code,
					purchase_date:
						updatedData.purchase_date instanceof Date
							? updatedData.purchase_date.toISOString()
							: undefined,
				})
				.eq("receipt_id", receiptId)
				.eq("user_id", userId);

			if (updateError) throw updateError;

			return { success: true };
		} catch (err) {
			console.error("Error updating receipt:", err);
			return {
				success: false,
				error: err instanceof Error ? err.message : "Unknown error",
			};
		}
	},

	async updateReceiptItem(updateReceipt: UpdateReceiptItem) {
		const { id, ...receiptItemData } = updateReceipt;
		if (!id) return;
		const { data, error } = await supabase
			.schema("grocery")
			.from("receipt_items")
			.update({ ...receiptItemData, updated_at: new Date().toISOString() })
			.eq("id", id)
			.select("*");
		if (error) throw error;

		return data;
	},
	async updateReceiptItemCategory(
		receiptId: string,
		itemId: string,
		categoryId: string | null,
	): Promise<{ success: boolean; error?: string }> {
		try {
			const { error } = await supabase
				.schema("grocery")
				.from("receipt_items")
				.update({
					category_id: categoryId,
				})
				.eq("id", itemId)
				.eq("receipt_id", receiptId);

			if (error) throw error;
			return { success: true };
		} catch (err) {
			console.error("Error updating item category:", err);
			return {
				success: false,
				error: err instanceof Error ? err.message : "Unknown error",
			};
		}
	},

	async deleteReceipt(
		userId: string,
		receiptId: string,
	): Promise<{ success: boolean; error?: string }> {
		try {
			// Delete receipt (cascade should handle items)
			const { error: deleteError } = await supabase
				.schema("grocery")
				.from("receipts")
				.delete()
				.eq("receipt_id", receiptId)
				.eq("user_id", userId);

			if (deleteError) throw deleteError;
			return { success: true };
		} catch (err) {
			console.error("Error deleting receipt:", err);
			return {
				success: false,
				error: err instanceof Error ? err.message : "Unknown error",
			};
		}
	},
};
