import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

type ReceiptsWithItemsRow =
	Database["grocery"]["Views"]["receipts_with_items"]["Row"];
export type Receipt = Database["grocery"]["Tables"]["receipts"]["Row"];

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
	}[];
};

export const receiptsApiKeys = {
	all: ["receipts"] as const,
	user: (userId: string) => [...receiptsApiKeys.all, userId] as const,
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

		// Group rows by receipt_id.
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
					});
				}
			}
		}

		const receipts = Array.from(receiptMap.values());
		const nextPage = count !== null && end + 1 < count ? page + 1 : undefined;
		return { receipts, nextPage };
	},
};
