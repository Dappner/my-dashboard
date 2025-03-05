export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      historical_prices: {
        Row: {
          close_price: number
          created_at: string | null
          date: string
          dividends: number | null
          high_price: number | null
          id: string
          low_price: number | null
          open_price: number | null
          stock_splits: number | null
          ticker_id: string
          updated_at: string | null
          volume: number | null
        }
        Insert: {
          close_price: number
          created_at?: string | null
          date: string
          dividends?: number | null
          high_price?: number | null
          id?: string
          low_price?: number | null
          open_price?: number | null
          stock_splits?: number | null
          ticker_id: string
          updated_at?: string | null
          volume?: number | null
        }
        Update: {
          close_price?: number
          created_at?: string | null
          date?: string
          dividends?: number | null
          high_price?: number | null
          id?: string
          low_price?: number | null
          open_price?: number | null
          stock_splits?: number | null
          ticker_id?: string
          updated_at?: string | null
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "historical_prices_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "current_holdings"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "historical_prices_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "tickers"
            referencedColumns: ["id"]
          },
        ]
      }
      holdings: {
        Row: {
          average_cost_basis: number | null
          id: string
          ticker_id: string
          total_cost_basis: number
          total_dividends_received: number
          total_shares: number
          total_transaction_fees: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          average_cost_basis?: number | null
          id?: string
          ticker_id: string
          total_cost_basis?: number
          total_dividends_received?: number
          total_shares?: number
          total_transaction_fees?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          average_cost_basis?: number | null
          id?: string
          ticker_id?: string
          total_cost_basis?: number
          total_dividends_received?: number
          total_shares?: number
          total_transaction_fees?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "holdings_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "current_holdings"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "holdings_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "tickers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holdings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "current_holdings"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "holdings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "portfolio_performance"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "holdings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_notes: {
        Row: {
          created_at: string | null
          id: string
          note_date: string | null
          note_text: string
          ticker_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          note_date?: string | null
          note_text: string
          ticker_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          note_date?: string | null
          note_text?: string
          ticker_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_notes_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "current_holdings"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "stock_notes_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "tickers"
            referencedColumns: ["id"]
          },
        ]
      }
      suggested_trades: {
        Row: {
          created_at: string
          id: string
          is_dividend_reinvestment: boolean
          price_per_share: number
          shares: number
          source_trade_id: string | null
          ticker_id: string
          transaction_date: string
          transaction_type: Database["public"]["Enums"]["transaction_type_enum"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_dividend_reinvestment?: boolean
          price_per_share: number
          shares: number
          source_trade_id?: string | null
          ticker_id: string
          transaction_date: string
          transaction_type: Database["public"]["Enums"]["transaction_type_enum"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_dividend_reinvestment?: boolean
          price_per_share?: number
          shares?: number
          source_trade_id?: string | null
          ticker_id?: string
          transaction_date?: string
          transaction_type?: Database["public"]["Enums"]["transaction_type_enum"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suggested_trades_source_trade_id_fkey"
            columns: ["source_trade_id"]
            isOneToOne: false
            referencedRelation: "trades_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggested_trades_source_trade_id_fkey"
            columns: ["source_trade_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggested_trades_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "current_holdings"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "suggested_trades_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "tickers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggested_trades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "current_holdings"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "suggested_trades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "portfolio_performance"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "suggested_trades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tickers: {
        Row: {
          category: string | null
          cik: string | null
          created_at: string | null
          dividend_amount: number | null
          dividend_months: number[] | null
          exchange: string | null
          id: string
          industry: string | null
          long_business_summary: string | null
          name: string | null
          region: string | null
          sector: string | null
          symbol: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          cik?: string | null
          created_at?: string | null
          dividend_amount?: number | null
          dividend_months?: number[] | null
          exchange?: string | null
          id?: string
          industry?: string | null
          long_business_summary?: string | null
          name?: string | null
          region?: string | null
          sector?: string | null
          symbol: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          cik?: string | null
          created_at?: string | null
          dividend_amount?: number | null
          dividend_months?: number[] | null
          exchange?: string | null
          id?: string
          industry?: string | null
          long_business_summary?: string | null
          name?: string | null
          region?: string | null
          sector?: string | null
          symbol?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          created_at: string | null
          id: string
          is_dividend_reinvestment: boolean | null
          note_text: string | null
          price_per_share: number | null
          settlement_date: string | null
          shares: number | null
          ticker_id: string | null
          transaction_date: string
          transaction_fee: number | null
          transaction_type: Database["public"]["Enums"]["transaction_type_enum"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_dividend_reinvestment?: boolean | null
          note_text?: string | null
          price_per_share?: number | null
          settlement_date?: string | null
          shares?: number | null
          ticker_id?: string | null
          transaction_date: string
          transaction_fee?: number | null
          transaction_type: Database["public"]["Enums"]["transaction_type_enum"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_dividend_reinvestment?: boolean | null
          note_text?: string | null
          price_per_share?: number | null
          settlement_date?: string | null
          shares?: number | null
          ticker_id?: string | null
          transaction_date?: string
          transaction_fee?: number | null
          transaction_type?: Database["public"]["Enums"]["transaction_type_enum"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "current_holdings"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "trades_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "tickers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "current_holdings"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "trades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "portfolio_performance"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "trades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          cash_balance: number
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          cash_balance?: number
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          cash_balance?: number
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      yh_finance_daily: {
        Row: {
          average_analyst_rating: number | null
          beta: number | null
          created_at: string | null
          date: string
          dividend_yield: number | null
          eps_forward: number | null
          eps_trailing_ttm: number | null
          fifty_day_average: number | null
          fifty_two_week_high: number | null
          fifty_two_week_low: number | null
          id: string
          market_cap: number | null
          nav_price: number | null
          price_eps_current_year: number | null
          profit_margins: number | null
          regular_market_change_percent: number | null
          regular_market_price: number | null
          regular_market_volume: number | null
          ticker_id: string
          total_assets: number | null
          two_hundred_day_average: number | null
          updated_at: string | null
        }
        Insert: {
          average_analyst_rating?: number | null
          beta?: number | null
          created_at?: string | null
          date: string
          dividend_yield?: number | null
          eps_forward?: number | null
          eps_trailing_ttm?: number | null
          fifty_day_average?: number | null
          fifty_two_week_high?: number | null
          fifty_two_week_low?: number | null
          id?: string
          market_cap?: number | null
          nav_price?: number | null
          price_eps_current_year?: number | null
          profit_margins?: number | null
          regular_market_change_percent?: number | null
          regular_market_price?: number | null
          regular_market_volume?: number | null
          ticker_id: string
          total_assets?: number | null
          two_hundred_day_average?: number | null
          updated_at?: string | null
        }
        Update: {
          average_analyst_rating?: number | null
          beta?: number | null
          created_at?: string | null
          date?: string
          dividend_yield?: number | null
          eps_forward?: number | null
          eps_trailing_ttm?: number | null
          fifty_day_average?: number | null
          fifty_two_week_high?: number | null
          fifty_two_week_low?: number | null
          id?: string
          market_cap?: number | null
          nav_price?: number | null
          price_eps_current_year?: number | null
          profit_margins?: number | null
          regular_market_change_percent?: number | null
          regular_market_price?: number | null
          regular_market_volume?: number | null
          ticker_id?: string
          total_assets?: number | null
          two_hundred_day_average?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "yh_finance_daily_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: true
            referencedRelation: "current_holdings"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "yh_finance_daily_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: true
            referencedRelation: "tickers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      current_holdings: {
        Row: {
          annual_dividend_amount: number | null
          average_cost_basis: number | null
          cik: string | null
          cost_basis_dividend_yield_percent: number | null
          current_market_value: number | null
          current_price: number | null
          dividend_amount: number | null
          dividend_months: number[] | null
          exchange: string | null
          high_52_week: number | null
          industry: string | null
          latest_price_date: string | null
          low_52_week: number | null
          market_dividend_yield_percent: number | null
          name: string | null
          price_change_1d_percent: number | null
          region: string | null
          sector: string | null
          shares: number | null
          symbol: string | null
          ticker_id: string | null
          total_cost_basis: number | null
          total_dividends_received: number | null
          total_gain_loss: number | null
          total_gain_loss_percent: number | null
          unrealized_gain_loss: number | null
          unrealized_gain_loss_percent: number | null
          user_id: string | null
        }
        Relationships: []
      }
      portfolio_daily_metrics: {
        Row: {
          cash_balance: number | null
          cost_basis: number | null
          current_date: string | null
          daily_return_percent: number | null
          dividend: boolean | null
          portfolio_value: number | null
          previous_day_portfolio_value: number | null
          total_portfolio_value: number | null
          user_id: string | null
        }
        Relationships: []
      }
      portfolio_performance: {
        Row: {
          avg_cost_per_share: number | null
          close_price: number | null
          date: string | null
          gain: number | null
          industry: string | null
          loss: number | null
          market_value: number | null
          name: string | null
          price_change: number | null
          price_change_percent: number | null
          sector: string | null
          symbol: string | null
          ticker_id: string | null
          total_cost_basis: number | null
          total_shares: number | null
          unrealized_pl: number | null
          unrealized_pl_percent: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trades_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "current_holdings"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "trades_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "tickers"
            referencedColumns: ["id"]
          },
        ]
      }
      trades_view: {
        Row: {
          exchange: string | null
          formatted_transaction_fee: number | null
          gross_transaction_amount: number | null
          id: string | null
          industry: string | null
          is_dividend_reinvestment: boolean | null
          note_text: string | null
          price_per_share: number | null
          realized_gain_loss: number | null
          sector: string | null
          settlement_date: string | null
          shares: number | null
          symbol: string | null
          ticker_id: string | null
          ticker_name: string | null
          total_cost_basis: number | null
          transaction_category: string | null
          transaction_date: string | null
          transaction_fee: number | null
          transaction_type:
            | Database["public"]["Enums"]["transaction_type_enum"]
            | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trades_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "current_holdings"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "trades_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "tickers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "current_holdings"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "trades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "portfolio_performance"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "trades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      transaction_type_enum:
        | "buy"
        | "sell"
        | "dividend"
        | "deposit"
        | "withdraw"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
