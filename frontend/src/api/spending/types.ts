import type { Database } from "@/types/supabase";
import type { CurrencyType } from "@my-dashboard/shared";

// Receipts
export type Receipt = Database["spending"]["Tables"]["receipts"]["Row"];
export type UpdateReceipt =
	Database["spending"]["Tables"]["receipts"]["Update"];
export type ReceiptItem =
	Database["spending"]["Tables"]["receipt_items"]["Row"];
export type UpdateReceiptItem =
	Database["spending"]["Tables"]["receipt_items"]["Update"];

export type SpendingCategory =
	Database["spending"]["Tables"]["categories"]["Row"];

export type ReceiptWithItems = {
	id: string;
	store_name: string | null;
	purchase_date: Date;
	total_amount: number;
	total_discount: number;
	currency_code: CurrencyType;
	receipt_image_path: string | null;
	imageUrl: string | null; // Signed URL
	receipt_items: {
		id: string;
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

// Spending API:
//

export interface CurrencyBreakdown {
	currency: CurrencyType;
	amount: number;
}

export interface CategoryData {
	id: string;
	name: string;
	amounts: CurrencyBreakdown[];
}

export interface SpendingSummary {
	currencyBreakdown: CurrencyBreakdown[];
	receiptCount: number;
}

export interface TimeSeriesPoint {
	period: string;
	amounts: CurrencyBreakdown[];
}

export type CategoryReceiptRow = {
	id: string;
	store_name: string | null;
	purchase_date: Date;
	currency_code: CurrencyType;
	total_amount: number;
	receipt_items: Array<{
		id: string;
		readable_name: string;
		total_price: number | null;
		quantity: number | null;
		unit_price: number;
	}>;
};
