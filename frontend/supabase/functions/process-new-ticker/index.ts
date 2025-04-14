import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const AWS_LAMBDA_URL = "https://0knhf3i9qc.execute-api.us-east-1.amazonaws.com/dev/process-ticker";

interface TickerData {
  id: string;
  symbol: string;
  exchange?: string;
  backfill: boolean;
  quote_type: string;
  [key: string]: unknown;
}

interface RequestBody {
  ticker: TickerData;
}

serve(async (req: Request) => {
  try {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    };
    // CORS headers
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // Only allow POST
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        headers: { "Content-Type": "application/json" },
        status: 405,
      });
    }

    const requestData: RequestBody = await req.json();
    const ticker = requestData.ticker;

    if (!ticker || !ticker.symbol) {
      return new Response(JSON.stringify({ error: "Invalid ticker data" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { data: eventRecord, error: eventError } = await supabaseClient
      .from('ticker_events')
      .insert({
        ticker_id: ticker.id,
        event_type: 'initialize',
        status: 'pending',
        details: { requested_at: new Date().toISOString() }
      })
      .select()
      .single();

    if (eventError) {
      console.error("Error creating event record:", eventError);
      return new Response(JSON.stringify({ error: "Failed to create event record" }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }

    const lambdaEvent = {
      type: "initialize",
      tickers: [ticker.symbol],
      config: {
        backfill: true,
        prices: true,
        info: true,
        calendar: true,
        fund_data: ticker.quote_type === "ETF" || ticker.quote_type === "MUTUALFUND",
      }
    };

    console.log(`Initiating backfill for ticker: ${ticker.symbol}, event ID: ${eventRecord.id}`);


    const headers = {
      "Content-Type": "application/json",
      "x-api-key": Deno.env.get("AWS_API_KEY") ?? ""
    };
    // Call Lambda function
    const lambdaResponse = await fetch(AWS_LAMBDA_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(lambdaEvent),
    });

    const lambdaResult = await lambdaResponse.json();

    return new Response(JSON.stringify({
      success: true,
      message: `Backfill initiated for ${ticker.symbol}`,
      lambdaResult
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      status: 200,
    });
  } catch (error) {
    console.error("Error processing ticker:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      status: 500,
    });
  }
});
