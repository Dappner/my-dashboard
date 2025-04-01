import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

type ReceiptsWithItemsRow =
  Database["grocery"]["Views"]["receipts_with_items"]["Row"];

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
  async getReceiptsWithItems(userId: string): Promise<ReceiptWithItems[]> {
    const { data, error } = await supabase
      .schema("grocery")
      .from("receipts_with_items")
      .select()
      .eq("user_id", userId)
      .order("purchase_date", { ascending: false });

    if (error) throw error;

    console.log(data);

    // Group items by receipt
    const receiptMap = new Map<string, ReceiptWithItems>();
    for (const row of data as ReceiptsWithItemsRow[]) {
      const receiptId = row.receipt_id;
      if (!receiptId) continue;

      if (!receiptMap.has(receiptId || "")) {
        let signedImageUrl: string | null = null;
        if (row.receipt_image_path) {
          const { data: signedUrlData, error: signedUrlError } = await supabase
            .storage
            .from("receipts")
            .createSignedUrl(row.receipt_image_path, 3600); // 1-hour expiration

          signedImageUrl = signedUrlError ? null : signedUrlData.signedUrl;
          if (signedUrlError) {
            console.error(
              `Failed to create signed URL for ${row.receipt_image_path}:`,
              signedUrlError,
            );
          }
        }

        receiptMap.set(receiptId, {
          receipt_id: receiptId,
          store_name: row.store_name, // Nullable in DB
          purchase_date: row.purchase_date
            ? new Date(row.purchase_date)
            : new Date(), // Fallback to current date if null
          total_amount: row.total_amount ?? 0, // Fallback if null
          total_discount: row.total_discount ?? 0, // Fallback if null
          currency_code: row.currency_code ?? "USD", // Fallback to a default currency
          receipt_image_path: row.receipt_image_path,
          imageUrl: signedImageUrl,
          items: [],
        });
      }

      if (row.item_id) {
        const receipt = receiptMap.get(receiptId);
        if (receipt) {
          receipt.items.push({
            item_id: row.item_id,
            item_name: row.item_name ?? "Unknown Item", // Fallback if null
            readable_name: row.readable_name ?? "Unknown Item", // Fallback if null
            quantity: row.quantity ?? 1, // Default to 1 if null
            unit_price: row.unit_price ?? 0, // Fallback if null
            original_unit_price: row.original_unit_price ?? 0, // Fallback if null
            discount_amount: row.discount_amount ?? 0, // Fallback if null
            is_discounted: row.is_discounted ?? false, // Fallback if null
            total_price: row.total_price ?? null, // Nullable in DB
            category_name: row.category_name, // Nullable in DB
          });
        }
      }
    }

    return Array.from(receiptMap.values());
  },
};
