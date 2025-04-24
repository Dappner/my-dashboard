import { supabase } from "@/lib/supabase";
import { type CustomRange, getTimeframeRange, parseDate } from "@/lib/utils";
import type { Timeframe } from "@my-dashboard/shared";
import type {
	CategoryReceiptRow,
	Receipt,
	ReceiptWithItems,
	UpdateReceipt,
	UpdateReceiptItem,
} from "./types";

export const receiptsApiKeys = {
	all: ["receipts"] as const,
	timeframe: (cacheKey: string) =>
		[...receiptsApiKeys.all, "timeframe", cacheKey] as const,
	detail: (receiptId: string) => [...receiptsApiKeys.all, receiptId] as const,
	byCategory: (category: string, cacheKey: string) =>
		[...receiptsApiKeys.all, "category", category, cacheKey] as const,
	recent: (cacheKey: string) => [...receiptsApiKeys.all, "recent", cacheKey],
};

interface PaginationOptions {
	limit?: number;
	offset?: number;
}

export const receiptsApi = {
	async getReceiptsWithItems(
		selectedDate: Date,
		timeframe: Timeframe = "m",
		options: PaginationOptions = {},
	): Promise<ReceiptWithItems[]> {
		const { limit = 10, offset = 0 } = options;
		const { start, end } = getTimeframeRange(selectedDate, timeframe);

		const { data, error } = await supabase
			.schema("spending")
			.from("receipts")
			.select(`
      id,
      store_name,
      purchase_date,
      total_amount,
      total_discount,
      currency_code,
      receipt_image_path,
      receipt_items (
        id,
        item_name,
        readable_name,
        quantity,
        discount_amount,
        is_discounted,
        original_unit_price,
        unit_price,
        total_price,
        category_id,
        categories!inner ( name ) 
      )
    `)
			.gte("purchase_date", start)
			.lte("purchase_date", end)
			.order("purchase_date", { ascending: false })
			.range(offset, offset + limit - 1);

		if (error) throw error;

		return (data ?? []).map((r) => ({
			id: r.id,
			store_name: r.store_name,
			purchase_date: parseDate(r.purchase_date),
			total_amount: r.total_amount,
			total_discount: r.total_discount,
			currency_code: r.currency_code,
			receipt_image_path: r.receipt_image_path,
			imageUrl: null,
			receipt_items: r.receipt_items.map((item) => ({
				id: item.id,
				item_name: item.item_name,
				readable_name: item.readable_name || "NA",
				quantity: item.quantity || 0,
				discount_amount: item.discount_amount || 0,
				is_discounted: item.is_discounted || false,
				original_unit_price: item.original_unit_price || 0,
				unit_price: item.unit_price,
				total_price: item.total_price,
				category_id: item.category_id,
				category_name: item.categories?.name ?? null,
			})),
		}));
	},

	async fetchReceiptDetail(receiptId: string): Promise<ReceiptWithItems> {
		const { data, error } = await supabase
			.schema("spending")
			.from("receipts")
			.select(`
      id,
      store_name,
      purchase_date,
      total_amount,
      total_discount,
      currency_code,
      receipt_image_path,
      receipt_items (
        id,
        item_name,
        readable_name,
        quantity,
        discount_amount,
        is_discounted,
        original_unit_price,
        unit_price,
        total_price,
        category_id,
        categories!inner ( name ) 
    )
    `)
			.eq("id", receiptId);

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

		return {
			...receiptData,
			imageUrl: signedImageUrl,
			purchase_date: parseDate(receiptData.purchase_date),
			receipt_items: receiptData.receipt_items.map((item) => ({
				id: item.id,
				item_name: item.item_name,
				readable_name: item.readable_name || "NA",
				quantity: item.quantity || 0,
				discount_amount: item.discount_amount || 0,
				is_discounted: item.is_discounted || false,
				original_unit_price: item.original_unit_price || 0,
				unit_price: item.unit_price,
				total_price: item.total_price,
				category_id: item.category_id,
				category_name: item.categories?.name ?? null,
			})),
		};
	},

	async fetchCategoryReceipts(
		categoryId: string,
		date?: Date,
		timeframe?: Timeframe,
		dateRange?: CustomRange,
	): Promise<CategoryReceiptRow[]> {
		const { start, end } = getTimeframeRange(date, timeframe || "m", dateRange);

		const { data, error } = await supabase
			.schema("spending")
			.from("receipts")
			.select(`
        id,
        store_name,
        purchase_date,
        currency_code,
        total_amount,
        receipt_items!inner(
          id,
          receipt_id,
          readable_name,
          total_price,
          quantity,
          unit_price
        )
      `)
			.eq("receipt_items.category_id", categoryId)
			.gte("purchase_date", start)
			.lte("purchase_date", end)
			.order("purchase_date", { ascending: false });

		if (error) {
			throw new Error(`Could not load category receipts: ${error.message}`);
		}

		return (data ?? []).map((r) => ({
			id: r.id,
			store_name: r.store_name,
			purchase_date: parseDate(r.purchase_date),
			total_amount: r.total_amount,
			currency_code: r.currency_code,
			receipt_items: r.receipt_items.map((item) => ({
				id: item.id,
				readable_name: item.readable_name || "NA",
				quantity: item.quantity || 0,
				unit_price: item.unit_price,
				total_price: item.total_price,
			})),
		}));
	},

	async updateReceipt(
		updatedData: UpdateReceipt,
	): Promise<{ success: boolean; error?: string }> {
		const { id, ...data } = updatedData;
		if (!id) throw Error;

		// Update receipt base data
		const { error: updateError } = await supabase
			.schema("spending")
			.from("receipts")
			.update({
				store_name: data.store_name,
				total_amount: data.total_amount,
				total_discount: data.total_discount,
				currency_code: data.currency_code,
				purchase_date: data.purchase_date,
			})
			.eq("id", id);

		if (updateError) throw updateError;

		return { success: true };
	},

	async updateReceiptItem(updateReceipt: UpdateReceiptItem) {
		const { id, ...receiptItemData } = updateReceipt;
		if (!id) return;
		const { data, error } = await supabase
			.schema("spending")
			.from("receipt_items")
			.update({ ...receiptItemData, updated_at: new Date().toISOString() })
			.eq("id", id)
			.select("*");
		if (error) throw error;

		return data;
	},

	async updateReceiptItemCategory(
		itemId: string,
		categoryId: string | null,
	): Promise<{ success: boolean; error?: string }> {
		const { error } = await supabase
			.schema("spending")
			.from("receipt_items")
			.update({
				category_id: categoryId,
			})
			.eq("id", itemId);

		if (error) throw error;
		return { success: true };
	},

	async deleteReceipt(
		receiptId: string,
	): Promise<{ success: boolean; error?: string }> {
		const { error: deleteError } = await supabase
			.schema("spending")
			.from("receipts")
			.delete()
			.eq("id", receiptId);

		if (deleteError) throw deleteError;
		return { success: true };
	},

	async getReceiptImageUrl(imagePath: string): Promise<string | null> {
		if (!imagePath) return null;

		const { data, error } = await supabase.storage
			.from("receipts")
			.createSignedUrl(imagePath, 3600);

		if (error) {
			console.error(`Failed to create signed URL: ${error.message}`);
			return null;
		}

		return data.signedUrl;
	},

	async fetchRecentReceipts(
		date: Date,
		timeframe: Timeframe = "m",
		customRange?: CustomRange,
	): Promise<Receipt[]> {
		const { start, end } = getTimeframeRange(date, timeframe, customRange);

		const { data, error } = await supabase
			.schema("spending")
			.from("receipts")
			.select("id, purchase_date, total_amount, store_name, currency_code")
			.gte("purchase_date", start)
			.lte("purchase_date", end)
			.order("purchase_date", { ascending: false })
			.limit(5);

		if (error) throw new Error(`Error fetching receipts: ${error.message}`);
		return data as Receipt[];
	},
};
