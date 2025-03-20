import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4.20.1";

function extractJSONFromString(str: string): any {
  try {
    // First, try direct parse
    return JSON.parse(str);
  } catch {
    try {
      // Remove markdown code blocks if present
      const jsonString = str.replace(/```json\n?|\n?```/g, "");
      return JSON.parse(jsonString.trim());
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
      Deno.env.get("VITE_SUPABASE_URL") ?? "",
      Deno.env.get("SERVICE_ROLE_KEY") ?? "",
    );

    // Get the authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const { data: { user }, error: userError } = await supabaseClient.auth
      .getUser(
        authHeader.replace("Bearer ", ""),
      );

    if (userError || !user) {
      throw new Error(`Auth error: ${userError?.message || "No user found"}`);
    }

    // Parse the request body
    const { receipt_id, image_url } = await req.json();

    if (!receipt_id || !image_url) {
      throw new Error("Missing required fields: receipt_id or image_url");
    }

    // Verify receipt ownership
    const { data: receipt, error: receiptError } = await supabaseClient
      .from("receipts")
      .select("id")
      .eq("id", receipt_id)
      .eq("user_id", user.id)
      .single();

    if (receiptError || !receipt) {
      throw new Error(
        `Receipt verification failed: ${receiptError?.message || "Receipt not found"
        }`,
      );
    }

    const { data: categories, error: categoriesError } = await supabaseClient
      .from("categories")
      .select("id, name, keywords");

    if (categoriesError) {
      throw new Error(`Failed to fetch categories: ${categoriesError.message}`);
    }

    const openai = new OpenAI({
      apiKey: Deno.env.get("OPENAI_API_KEY"),
    });

    // Perform OCR using gpt-4o
    const ocrResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                `Extract receipt data and categorize items using ONLY these existing categories:
              ${JSON.stringify(
                  categories.map((c) => ({
                    id: c.id,
                    name: c.name,
                    keywords: c.keywords,
                  })),
                )
                }

              Currency Detection Instructions:
              1. Look for explicit currency symbols (€, $, ¥, £, etc.) or codes (EUR, USD, CNY, GBP, etc.) on the receipt
              2. Analyze the store name and any address information for location context
              3. Look for standard receipt elements that might indicate currency (tax codes like VAT, GST, MwSt, etc.)
              4. Return the most likely currency code based on the evidence found

              Return the data as JSON with this exact structure:
              {
                store_name: string,
                date_time: string,
                total_amount: number,
                currency_code: string, // Standard 3-letter currency code (USD, EUR, CNY, etc.)
                currency_evidence: string, // Brief explanation of how the currency was determined
                ocr_text: string,
                items: Array<{
                  name: string,
                  price: number,
                  quantity: number,
                  category_id: string (must be one of the provided category IDs)
                }>
              }`,
            },
            {
              type: "image_url",
              image_url: { url: image_url.signedUrl },
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

    // Update receipt
    const { error: updateError } = await supabaseClient
      .from("receipts")
      .update({
        store_name: extractedData.store_name,
        date_time: extractedData.date_time,
        total_amount: extractedData.total_amount,
        ocr_text: extractedData.ocr_text,
        currency_evidence: extractedData.currency_evidence,
      })
      .eq("id", receipt_id);

    if (updateError) {
      throw new Error(`Failed to update receipt: ${updateError.message}`);
    }

    // Insert items (now with correct category_ids from GPT)
    const items = extractedData.items.map((item) => ({
      receipt_id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      category_id: item.category_id,
      brand: item.brand || null,
      notes: item.notes || null,
    }));

    const { error: itemsError } = await supabaseClient
      .from("items")
      .insert(items);

    if (itemsError) {
      throw new Error(`Failed to insert items: ${itemsError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        receipt_id,
        data: extractedData,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown error occurred",
        details: error.stack,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 400,
      },
    );
  }
});
