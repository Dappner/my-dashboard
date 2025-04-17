import { supabase } from "@/lib/supabase";
import { getUTCDate, parseDate } from "@/lib/utils";
import type { Database } from "@/types/supabase";

type ReceiptsWithItemsRow =
  Database["grocery"]["Views"]["receipts_with_items"]["Row"];
export type Receipt = Database["grocery"]["Tables"]["receipts"]["Row"];
export type UpdateReceipt = Database["grocery"]["Tables"]["receipts"]["Update"];
export type ReceiptItem = Database["grocery"]["Tables"]["receipt_items"]["Row"];
export type UpdateReceiptItem =
  Database["grocery"]["Tables"]["receipt_items"]["Update"];

export type SpendingCategory =
  Database["grocery"]["Tables"]["categories"]["Row"];

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
  monthlyData: (date: string) =>
    [...receiptsApiKeys.all, "monthlyData", date] as const,
  detail: (receiptId: string) => [...receiptsApiKeys.all, receiptId] as const,
};

export const receiptsApi = {
  async getReceiptsWithItems(selectedDate: Date): Promise<ReceiptWithItems[]> {
    const year = selectedDate.getUTCFullYear();
    const month = selectedDate.getUTCMonth();
    const monthStart = getUTCDate(year, month, 1);
    const nextMonthStart = getUTCDate(year, month + 1, 1);
    const { data, error } = await supabase
      .schema("grocery")
      .from("receipts_with_items")
      .select("*", { count: "exact" })
      .gte("purchase_date", monthStart)
      .lt("purchase_date", nextMonthStart)
      .order("purchase_date", { ascending: false });

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
          purchase_date: parseDate(row.purchase_date || ""),
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

    return Array.from(receiptMap.values());
  },

  async getReceiptById(receiptId: string): Promise<ReceiptWithItems> {
    const { data, error } = await supabase
      .schema("grocery")
      .from("receipts_with_items")
      .select("*")
      .eq("receipt_id", receiptId);

    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error("Receipt not found");
    }

    // Process the data
    const receiptData = data[0];
    let signedImageUrl: string | null = null;

    //TODO: I think creating a signed URL is causing the issue here (EGRESS)
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
      purchase_date: parseDate(receiptData.purchase_date || ""),
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
    updatedData: UpdateReceipt,
  ): Promise<{ success: boolean; error?: string }> {
    const { id, ...data } = updatedData;
    if (!id) throw Error;

    // Update receipt base data
    const { error: updateError } = await supabase
      .schema("grocery")
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
      .schema("grocery")
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
      .schema("grocery")
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
      .schema("grocery")
      .from("receipts")
      .delete()
      .eq("id", receiptId);

    if (deleteError) throw deleteError;
    return { success: true };
  },
};
