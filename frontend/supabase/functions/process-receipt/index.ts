import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4.20.1";

function extractJSONFromString(str: string): any {
  try {
    return JSON.parse(str);
  } catch {
    try {
      const jsonString = str.replace(/```json\n?|\n?```/g, "").trim();
      return JSON.parse(jsonString);
    } catch (e) {
      throw new Error(`Failed to parse JSON from OpenAI response: ${str}`);
    }
  }
}

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { receipt_id, image_url } = await req.json();

    if (!receipt_id || !image_url) {
      throw new Error("Missing required fields: receipt_id or image_url");
    }

    // Verify receipt exists
    const { data: receipt, error: receiptError } = await supabaseClient
      .schema("grocery")
      .from("receipts")
      .select("id, user_id")
      .eq("id", receipt_id)
      .single();

    if (receiptError || !receipt) {
      throw new Error(
        `Receipt verification failed: ${receiptError?.message || "Receipt not found"
        }`,
      );
    }

    const { data: categories, error: categoriesError } = await supabaseClient
      .schema("grocery")
      .from("categories")
      .select("id, name");

    if (categoriesError) {
      throw new Error(`Failed to fetch categories: ${categoriesError.message}`);
    }

    const openai = new OpenAI({
      apiKey: Deno.env.get("OPENAI_API_KEY"),
    });

    const availableCurrencyCodes = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD"];
    const currentDate = new Date().toISOString().split("T")[0]; // e.g., "2025-03-19"

    // First OpenAI call: Extract receipt data with discount info and date context
    const ocrResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
                Extract receipt data and categorize items using ONLY these existing categories:
                ${JSON.stringify(
                categories.map((c) => ({ id: c.id, name: c.name })),
              )
                }

                Currency Detection Instructions:
                1. Look for explicit currency symbols (€, $, ¥, £, etc.) or codes (EUR, USD, JPY, GBP, etc.) on the receipt
                2. Analyze the store name and any address information for location context
                3. Look for standard receipt elements that might indicate currency (tax codes like VAT, GST, MwSt, etc.)
                4. Return the most likely currency code based on the evidence found
                5. Use only these currency codes if possible: ${availableCurrencyCodes.join(", ")
                }

                Date Detection Instructions:
                1. Extract the purchase date from the receipt
                2. The current date is ${currentDate}. Assume the receipt is recent (within the last 5 years) unless strong evidence suggests otherwise
                3. If the date format is ambiguous (e.g., "03/25/19" could be MM/DD/YY or DD/MM/YY), prioritize formats that result in a more recent date:
                   - For two-digit years, assume "20YY" (e.g., "19" -> "2019", but prefer "2025" over "2019" if plausible)
                   - If MM/DD vs DD/MM is unclear, choose the interpretation that keeps the date within the last 5 years from ${currentDate}
                4. Return the date in "YYYY-MM-DD" format (e.g., "2025-03-19")

                Discount Detection Instructions:
                1. Identify any discounts applied to items (e.g., sale prices, promotions, markdowns)
                2. For each item, determine the original unit price (before discount) and the discount amount if present
                3. If no discount is detected, set discount_amount to 0 and original_unit_price to null
                4. Use the receipt's total amount and item prices to validate discount calculations where possible

                Return the data as JSON with this exact structure:
                {
                  "store_name": string,
                  "purchase_date": string,
                  "total_amount": number,
                  "currency_code": string,
                  "currency_evidence": string,
                  "items": Array<{
                    "name": string,
                    "unit_price": number,
                    "quantity": number,
                    "category_id": string,
                    "discount_amount": number,
                    "original_unit_price": number | null
                  }>
                }
              `,
            },
            {
              type: "image_url",
              image_url: { url: image_url },
            },
          ],
        },
      ],
      max_tokens: 2000,
    });

    if (!ocrResponse.choices[0]?.message?.content) {
      throw new Error("No OCR results returned from OpenAI");
    }

    const extractedData = extractJSONFromString(
      ocrResponse.choices[0].message.content,
    );

    // Fetch existing item translations to include in context
    const { data: existingTranslations, error: translationsError } =
      await supabaseClient
        .schema("grocery")
        .from("item_translations")
        .select("original_name, readable_name, category_id");

    if (translationsError) {
      throw new Error(
        `Failed to fetch item translations: ${translationsError.message}`,
      );
    }

    const translationMap = new Map<
      string,
      { readable_name: string; category_id: string | null }
    >(
      existingTranslations.map((t) => [
        t.original_name,
        { readable_name: t.readable_name, category_id: t.category_id },
      ]),
    );
    const readableNameMap = new Map<
      string,
      { original_name: string; category_id: string | null }
    >(
      existingTranslations.map((t) => [
        t.readable_name,
        { original_name: t.original_name, category_id: t.category_id },
      ]),
    );

    // Second OpenAI call: Clean and translate item names to English
    const translationResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: `
            Process the following item names from a receipt to:
            1. Correct potential OCR errors or misspellings (e.g., "Gat0rade" -> "Gatorade").
            2. Translate each corrected name into an accurate, specific English name (e.g., "Gatorade Frost Glacier" instead of "GTRD FRST BOISS").
            Use the provided categories and existing translations for context, but do NOT prefix the readable name with the category.

            Categories available (for context only): ${JSON.stringify(
            categories.map((c) => ({ id: c.id, name: c.name })),
          )
            }

            Existing translations (use these for consistency where applicable):
            ${JSON.stringify(
              existingTranslations.map((t) => ({
                original_name: t.original_name,
                readable_name: t.readable_name,
              })),
            )
            }

            Items to process: ${JSON.stringify(
              extractedData.items.map((item: any) => ({
                name: item.name,
                category_id: item.category_id,
              })),
            )
            }

            Instructions:
            - If an item's corrected name matches an existing "original_name", use the corresponding "readable_name".
            - Ensure the readable name is always in English, specific to the item, and does not include the category name.
            - Use the category_id for context to improve accuracy, but do not include the category in the readable name.
            - Avoid creating multiple translations for the same product.

            Examples:
            - "GTRD FRST BOISS" with category_id for "Beverages" -> { "corrected_name": "Gatorade Frost Glacier", "readable_name": "Gatorade Frost Glacier" }
            - "Wrigley 5 Cobalt" with category_id for "Snacks" -> { "corrected_name": "Wrigley's 5 Cobalt Gum", "readable_name": "Wrigley's 5 Cobalt Gum" }
            - "NEIPA Du FAR WEST" with category_id for "Alcohol" -> { "corrected_name": "NEIPA Duvel Far West", "readable_name": "NEIPA Duvel Far West" }

            Return the data as JSON with this structure:
            {
              "translations": Array<{
                "original_name": string,
                "corrected_name": string,
                "readable_name": string
              }>
            }
          `,
        },
      ],
      max_tokens: 1000,
    });

    if (!translationResponse.choices[0]?.message?.content) {
      throw new Error("No translation results returned from OpenAI");
    }

    const translationData = extractJSONFromString(
      translationResponse.choices[0].message.content,
    );

    // Combine extracted data with translations
    const cleanedItems = extractedData.items.map((item: any) => {
      const translation = translationData.translations.find(
        (t: any) => t.original_name === item.name,
      ) || { corrected_name: item.name, readable_name: item.name };
      return {
        ...item,
        corrected_name: translation.corrected_name,
        readable_name: translation.readable_name,
      };
    });

    // Identify new translations, avoiding duplicates by readable_name
    const newTranslations = cleanedItems
      .filter(
        (item: any) =>
          !translationMap.has(item.corrected_name) &&
          !readableNameMap.has(item.readable_name),
      )
      .map((item: any) => ({
        original_name: item.corrected_name,
        readable_name: item.readable_name,
        category_id: item.category_id || null,
      }));

    if (newTranslations.length > 0) {
      const { error: insertTranslationsError } = await supabaseClient
        .schema("grocery")
        .from("item_translations")
        .insert(newTranslations);

      if (insertTranslationsError) {
        console.warn(
          `Failed to insert new translations: ${insertTranslationsError.message}`,
        );
      } else {
        newTranslations.forEach((t) => {
          translationMap.set(t.original_name, {
            readable_name: t.readable_name,
            category_id: t.category_id,
          });
          readableNameMap.set(t.readable_name, {
            original_name: t.original_name,
            category_id: t.category_id,
          });
        });
      }
    }

    // Parse and validate the date, ensuring it's recent
    let formattedDate;
    try {
      const dateParts = extractedData.purchase_date.split(/[-/]/); // Split by "-" or "/"
      if (dateParts.length === 3) {
        let year = dateParts[0].length === 4 ? dateParts[0] : dateParts[2]; // Handle YYYY-MM-DD or DD/MM/YYYY
        let month = dateParts[1];
        let day = dateParts[0].length === 4 ? dateParts[2] : dateParts[0];

        if (year.length === 2) {
          year = `20${year}`; // Assume 21st century
        }

        const parsedDate = new Date(
          `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`,
        );
        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

        // If date is older than 5 years or invalid, default to today
        if (isNaN(parsedDate.getTime()) || parsedDate < fiveYearsAgo) {
          console.warn(
            `Invalid or implausible date detected: ${extractedData.purchase_date}. Defaulting to today.`,
          );
          formattedDate = currentDate;
        } else {
          formattedDate = parsedDate.toISOString().split("T")[0];
        }
      } else {
        console.warn(
          `Unrecognized date format: ${extractedData.purchase_date}. Defaulting to today.`,
        );
        formattedDate = currentDate;
      }
    } catch (e) {
      console.error("Date parsing error:", e);
      formattedDate = currentDate; // Default to today on error
    }

    // Update receipt with currency information
    const { error: updateError } = await supabaseClient
      .schema("grocery")
      .from("receipts")
      .update({
        store_name: extractedData.store_name,
        purchase_date: formattedDate,
        total_amount: extractedData.total_amount,
        currency_code: extractedData.currency_code || "EUR",
        currency_evidence: extractedData.currency_evidence ||
          "No evidence provided",
        updated_at: new Date().toISOString(),
      })
      .eq("id", receipt_id);

    if (updateError) {
      throw new Error(`Failed to update receipt: ${updateError.message}`);
    }

    // Map items with cleaned data, including discount fields
    const items = cleanedItems.map((item: any) => {
      const translation = translationMap.get(item.corrected_name);
      return {
        receipt_id,
        item_name: item.name, // Original OCR name for reference
        readable_name: translation?.readable_name || item.readable_name,
        unit_price: item.unit_price,
        quantity: item.quantity || 1,
        category_id: translation?.category_id || item.category_id || null,
        discount_amount: item.discount_amount || 0,
        original_unit_price: item.original_unit_price || null,
      };
    });

    if (items.length > 0) {
      const { error: itemsError } = await supabaseClient
        .schema("grocery")
        .from("receipt_items")
        .insert(items);

      if (itemsError) {
        throw new Error(`Failed to insert items: ${itemsError.message}`);
      }
    }

    return new Response(
      JSON.stringify({ success: true, receipt_id, data: extractedData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error
          ? error.message
          : "Unknown error occurred",
        details: error instanceof Error ? error.stack : undefined,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
