export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  chess: {
    Tables: {
      games: {
        Row: {
          created_at: string | null
          duration: number | null
          eco_url: string | null
          end_time: string
          game_url: string
          game_uuid: string
          id: string
          is_rated: boolean
          is_win: boolean
          move_count: number | null
          opponent_accuracy: number | null
          opponent_rating: number
          opponent_username: string
          pgn: string
          platform: string
          result_by: Database["chess"]["Enums"]["result_type"] | null
          start_time: string
          time_class: Database["chess"]["Enums"]["time_class"]
          time_control: string
          user_accuracy: number | null
          user_color: Database["chess"]["Enums"]["color_type"]
          user_id: string
          user_rating: number
        }
        Insert: {
          created_at?: string | null
          duration?: number | null
          eco_url?: string | null
          end_time: string
          game_url: string
          game_uuid: string
          id?: string
          is_rated: boolean
          is_win: boolean
          move_count?: number | null
          opponent_accuracy?: number | null
          opponent_rating: number
          opponent_username: string
          pgn: string
          platform?: string
          result_by?: Database["chess"]["Enums"]["result_type"] | null
          start_time: string
          time_class: Database["chess"]["Enums"]["time_class"]
          time_control: string
          user_accuracy?: number | null
          user_color: Database["chess"]["Enums"]["color_type"]
          user_id: string
          user_rating: number
        }
        Update: {
          created_at?: string | null
          duration?: number | null
          eco_url?: string | null
          end_time?: string
          game_url?: string
          game_uuid?: string
          id?: string
          is_rated?: boolean
          is_win?: boolean
          move_count?: number | null
          opponent_accuracy?: number | null
          opponent_rating?: number
          opponent_username?: string
          pgn?: string
          platform?: string
          result_by?: Database["chess"]["Enums"]["result_type"] | null
          start_time?: string
          time_class?: Database["chess"]["Enums"]["time_class"]
          time_control?: string
          user_accuracy?: number | null
          user_color?: Database["chess"]["Enums"]["color_type"]
          user_id?: string
          user_rating?: number
        }
        Relationships: []
      }
      sync_status: {
        Row: {
          created_at: string | null
          id: number
          last_games_sync_month: string | null
          last_sync_at: string | null
          platform: string
          sync_status: string
          updated_at: string | null
          user_id: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          last_games_sync_month?: string | null
          last_sync_at?: string | null
          platform?: string
          sync_status?: string
          updated_at?: string | null
          user_id?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          id?: number
          last_games_sync_month?: string | null
          last_sync_at?: string | null
          platform?: string
          sync_status?: string
          updated_at?: string | null
          user_id?: string | null
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      monthly_activity: {
        Row: {
          day: string | null
          games_played: number | null
          user_id: string | null
        }
        Relationships: []
      }
      monthly_summary: {
        Row: {
          avg_accuracy: number | null
          month: string | null
          total_games: number | null
          total_time_spent_seconds: number | null
          user_id: string | null
          win_rate_pct: number | null
          wins: number | null
        }
        Relationships: []
      }
      rating_progression: {
        Row: {
          blitz_rating: number | null
          bullet_rating: number | null
          daily_rating: number | null
          day: string | null
          rapid_rating: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      color_type: "black" | "white"
      result_type:
        | "abandoned"
        | "checkmated"
        | "insufficient"
        | "repetition"
        | "resigned"
        | "stalemate"
        | "timeout"
        | "timevsinsufficient"
      time_class: "blitz" | "bullet" | "daily" | "rapid"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  grocery: {
    Tables: {
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      item_translations: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          original_name: string
          readable_name: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          original_name: string
          readable_name: string
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          original_name?: string
          readable_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_translations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      receipt_items: {
        Row: {
          category_id: string | null
          created_at: string | null
          discount_amount: number | null
          id: string
          is_discounted: boolean | null
          item_name: string
          original_unit_price: number | null
          quantity: number | null
          readable_name: string | null
          receipt_id: string | null
          total_price: number | null
          unit_price: number
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          is_discounted?: boolean | null
          item_name: string
          original_unit_price?: number | null
          quantity?: number | null
          readable_name?: string | null
          receipt_id?: string | null
          total_price?: number | null
          unit_price: number
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          is_discounted?: boolean | null
          item_name?: string
          original_unit_price?: number | null
          quantity?: number | null
          readable_name?: string | null
          receipt_id?: string | null
          total_price?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "receipt_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipt_items_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipt_items_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "receipts_with_items"
            referencedColumns: ["receipt_id"]
          },
        ]
      }
      receipts: {
        Row: {
          created_at: string | null
          currency_code: Database["grocery"]["Enums"]["currency_type"]
          currency_evidence: string | null
          error_message: string | null
          id: string
          last_processed_at: string | null
          processing_attempts: number
          purchase_date: string
          receipt_image_path: string | null
          store_name: string | null
          tax_amount: number | null
          total_amount: number
          total_discount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          currency_code?: Database["grocery"]["Enums"]["currency_type"]
          currency_evidence?: string | null
          error_message?: string | null
          id?: string
          last_processed_at?: string | null
          processing_attempts?: number
          purchase_date: string
          receipt_image_path?: string | null
          store_name?: string | null
          tax_amount?: number | null
          total_amount: number
          total_discount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          currency_code?: Database["grocery"]["Enums"]["currency_type"]
          currency_evidence?: string | null
          error_message?: string | null
          id?: string
          last_processed_at?: string | null
          processing_attempts?: number
          purchase_date?: string
          receipt_image_path?: string | null
          store_name?: string | null
          tax_amount?: number | null
          total_amount?: number
          total_discount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      daily_spending: {
        Row: {
          currency_code: Database["grocery"]["Enums"]["currency_type"] | null
          currency_receipt_count: number | null
          currency_total_amount: number | null
          currency_total_discount: number | null
          date: string | null
          receipt_count: number | null
          stores: string[] | null
          total_amount: number | null
          total_discount: number | null
        }
        Relationships: []
      }
      receipts_with_items: {
        Row: {
          category_id: string | null
          category_name: string | null
          currency_code: Database["grocery"]["Enums"]["currency_type"] | null
          currency_evidence: string | null
          discount_amount: number | null
          is_discounted: boolean | null
          item_created_at: string | null
          item_id: string | null
          item_name: string | null
          original_unit_price: number | null
          purchase_date: string | null
          quantity: number | null
          readable_name: string | null
          receipt_created_at: string | null
          receipt_id: string | null
          receipt_image_path: string | null
          receipt_updated_at: string | null
          store_name: string | null
          tax_amount: number | null
          total_amount: number | null
          total_discount: number | null
          total_price: number | null
          unit_price: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receipt_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      currency_type: "EUR" | "USD" | "CAD" | "GBP" | "JPY" | "AUD" | "CNY"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      calendar_events: {
        Row: {
          created_at: string | null
          date: string | null
          earnings_average: number | null
          earnings_dates: string[] | null
          earnings_high: number | null
          earnings_low: number | null
          event_type: string
          id: string
          revenue_average: number | null
          revenue_high: number | null
          revenue_low: number | null
          ticker_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          earnings_average?: number | null
          earnings_dates?: string[] | null
          earnings_high?: number | null
          earnings_low?: number | null
          event_type: string
          id?: string
          revenue_average?: number | null
          revenue_high?: number | null
          revenue_low?: number | null
          ticker_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          earnings_average?: number | null
          earnings_dates?: string[] | null
          earnings_high?: number | null
          earnings_low?: number | null
          event_type?: string
          id?: string
          revenue_average?: number | null
          revenue_high?: number | null
          revenue_low?: number | null
          ticker_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "current_holdings"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "calendar_events_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "daily_positions"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "calendar_events_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "market_indices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "ticker_daily_view"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "calendar_events_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "tickers"
            referencedColumns: ["id"]
          },
        ]
      }
      forex_rates: {
        Row: {
          base_currency: Database["grocery"]["Enums"]["currency_type"]
          created_at: string | null
          date: string
          id: string
          rate: number
          source: string | null
          target_currency: Database["grocery"]["Enums"]["currency_type"]
        }
        Insert: {
          base_currency: Database["grocery"]["Enums"]["currency_type"]
          created_at?: string | null
          date: string
          id?: string
          rate: number
          source?: string | null
          target_currency: Database["grocery"]["Enums"]["currency_type"]
        }
        Update: {
          base_currency?: Database["grocery"]["Enums"]["currency_type"]
          created_at?: string | null
          date?: string
          id?: string
          rate?: number
          source?: string | null
          target_currency?: Database["grocery"]["Enums"]["currency_type"]
        }
        Relationships: []
      }
      fund_asset_classes: {
        Row: {
          asset_class: string
          created_at: string | null
          date: string
          id: string
          ticker_id: string
          updated_at: string | null
          weight: number
        }
        Insert: {
          asset_class: string
          created_at?: string | null
          date: string
          id?: string
          ticker_id: string
          updated_at?: string | null
          weight: number
        }
        Update: {
          asset_class?: string
          created_at?: string | null
          date?: string
          id?: string
          ticker_id?: string
          updated_at?: string | null
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "fund_asset_classes_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "current_holdings"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "fund_asset_classes_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "daily_positions"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "fund_asset_classes_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "market_indices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fund_asset_classes_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "ticker_daily_view"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "fund_asset_classes_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "tickers"
            referencedColumns: ["id"]
          },
        ]
      }
      fund_sector_weightings: {
        Row: {
          created_at: string | null
          date: string
          id: string
          sector_name: string
          ticker_id: string
          updated_at: string | null
          weight: number
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          sector_name: string
          ticker_id: string
          updated_at?: string | null
          weight: number
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          sector_name?: string
          ticker_id?: string
          updated_at?: string | null
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "fund_sector_weightings_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "current_holdings"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "fund_sector_weightings_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "daily_positions"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "fund_sector_weightings_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "market_indices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fund_sector_weightings_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "ticker_daily_view"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "fund_sector_weightings_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "tickers"
            referencedColumns: ["id"]
          },
        ]
      }
      fund_top_holdings: {
        Row: {
          created_at: string | null
          date: string
          holding_name: string
          holding_symbol: string
          id: string
          ticker_id: string
          updated_at: string | null
          weight: number
        }
        Insert: {
          created_at?: string | null
          date: string
          holding_name: string
          holding_symbol: string
          id?: string
          ticker_id: string
          updated_at?: string | null
          weight: number
        }
        Update: {
          created_at?: string | null
          date?: string
          holding_name?: string
          holding_symbol?: string
          id?: string
          ticker_id?: string
          updated_at?: string | null
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "fund_top_holdings_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "current_holdings"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "fund_top_holdings_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "daily_positions"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "fund_top_holdings_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "market_indices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fund_top_holdings_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "ticker_daily_view"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "fund_top_holdings_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "tickers"
            referencedColumns: ["id"]
          },
        ]
      }
      historical_prices: {
        Row: {
          close_price: number | null
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
          close_price?: number | null
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
          close_price?: number | null
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
            referencedRelation: "daily_positions"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "historical_prices_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "market_indices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historical_prices_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "ticker_daily_view"
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
            referencedRelation: "daily_positions"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "holdings_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "market_indices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holdings_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "ticker_daily_view"
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
      industries: {
        Row: {
          companies_count: number | null
          created_at: string | null
          description: string | null
          employee_count: number | null
          id: string
          key: string
          market_cap: number | null
          market_weight: number | null
          name: string
          sector_id: string
          updated_at: string | null
        }
        Insert: {
          companies_count?: number | null
          created_at?: string | null
          description?: string | null
          employee_count?: number | null
          id?: string
          key: string
          market_cap?: number | null
          market_weight?: number | null
          name: string
          sector_id: string
          updated_at?: string | null
        }
        Update: {
          companies_count?: number | null
          created_at?: string | null
          description?: string | null
          employee_count?: number | null
          id?: string
          key?: string
          market_cap?: number | null
          market_weight?: number | null
          name?: string
          sector_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "industries_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "market_indices"
            referencedColumns: ["linked_sector_id"]
          },
          {
            foreignKeyName: "industries_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      sectors: {
        Row: {
          companies_count: number | null
          created_at: string | null
          description: string | null
          employee_count: number | null
          id: string
          key: string
          market_cap: number | null
          market_weight: number | null
          name: string
          updated_at: string | null
        }
        Insert: {
          companies_count?: number | null
          created_at?: string | null
          description?: string | null
          employee_count?: number | null
          id?: string
          key: string
          market_cap?: number | null
          market_weight?: number | null
          name: string
          updated_at?: string | null
        }
        Update: {
          companies_count?: number | null
          created_at?: string | null
          description?: string | null
          employee_count?: number | null
          id?: string
          key?: string
          market_cap?: number | null
          market_weight?: number | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
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
            referencedRelation: "daily_positions"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "stock_notes_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "market_indices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_notes_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "ticker_daily_view"
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
            referencedRelation: "daily_positions"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "suggested_trades_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "market_indices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggested_trades_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "ticker_daily_view"
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
      ticker_events: {
        Row: {
          completed_at: string | null
          created_at: string | null
          details: Json | null
          error_message: string | null
          event_type: string
          id: string
          status: string
          ticker_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          details?: Json | null
          error_message?: string | null
          event_type: string
          id?: string
          status?: string
          ticker_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          details?: Json | null
          error_message?: string | null
          event_type?: string
          id?: string
          status?: string
          ticker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticker_events_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "current_holdings"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "ticker_events_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "daily_positions"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "ticker_events_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "market_indices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticker_events_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "ticker_daily_view"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "ticker_events_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "tickers"
            referencedColumns: ["id"]
          },
        ]
      }
      tickers: {
        Row: {
          backfill: boolean
          category: string | null
          cik: string | null
          created_at: string | null
          currency: string | null
          dividend_amount: number | null
          dividend_months: number[] | null
          exchange: string | null
          id: string
          industry_id: string | null
          long_business_summary: string | null
          market_last_updated_at: string | null
          name: string | null
          quote_type: string
          region: string | null
          sector_id: string | null
          symbol: string
          tradeable: boolean | null
          updated_at: string | null
        }
        Insert: {
          backfill?: boolean
          category?: string | null
          cik?: string | null
          created_at?: string | null
          currency?: string | null
          dividend_amount?: number | null
          dividend_months?: number[] | null
          exchange?: string | null
          id?: string
          industry_id?: string | null
          long_business_summary?: string | null
          market_last_updated_at?: string | null
          name?: string | null
          quote_type?: string
          region?: string | null
          sector_id?: string | null
          symbol: string
          tradeable?: boolean | null
          updated_at?: string | null
        }
        Update: {
          backfill?: boolean
          category?: string | null
          cik?: string | null
          created_at?: string | null
          currency?: string | null
          dividend_amount?: number | null
          dividend_months?: number[] | null
          exchange?: string | null
          id?: string
          industry_id?: string | null
          long_business_summary?: string | null
          market_last_updated_at?: string | null
          name?: string | null
          quote_type?: string
          region?: string | null
          sector_id?: string | null
          symbol?: string
          tradeable?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickers_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickers_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "market_indices"
            referencedColumns: ["linked_industry_id"]
          },
          {
            foreignKeyName: "tickers_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "market_indices"
            referencedColumns: ["linked_sector_id"]
          },
          {
            foreignKeyName: "tickers_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          created_at: string | null
          currency: Database["grocery"]["Enums"]["currency_type"]
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
          currency?: Database["grocery"]["Enums"]["currency_type"]
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
          currency?: Database["grocery"]["Enums"]["currency_type"]
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
            referencedRelation: "daily_positions"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "trades_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "market_indices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "ticker_daily_view"
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
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          preferred_currency: Database["grocery"]["Enums"]["currency_type"]
          tracking_ticker_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          preferred_currency?: Database["grocery"]["Enums"]["currency_type"]
          tracking_ticker_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          preferred_currency?: Database["grocery"]["Enums"]["currency_type"]
          tracking_ticker_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_tracking_ticker_id_fkey"
            columns: ["tracking_ticker_id"]
            isOneToOne: false
            referencedRelation: "current_holdings"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "users_tracking_ticker_id_fkey"
            columns: ["tracking_ticker_id"]
            isOneToOne: false
            referencedRelation: "daily_positions"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "users_tracking_ticker_id_fkey"
            columns: ["tracking_ticker_id"]
            isOneToOne: false
            referencedRelation: "market_indices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_tracking_ticker_id_fkey"
            columns: ["tracking_ticker_id"]
            isOneToOne: false
            referencedRelation: "ticker_daily_view"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "users_tracking_ticker_id_fkey"
            columns: ["tracking_ticker_id"]
            isOneToOne: false
            referencedRelation: "tickers"
            referencedColumns: ["id"]
          },
        ]
      }
      yh_finance_daily: {
        Row: {
          average_analyst_rating: number | null
          beta: number | null
          beta3year: number | null
          created_at: string | null
          date: string
          dividend_yield: number | null
          eps_forward: number | null
          eps_trailing_ttm: number | null
          fifty_day_average: number | null
          fifty_two_week_high: number | null
          fifty_two_week_low: number | null
          five_year_average_return: number | null
          fund_family: string | null
          fund_inception_date: string | null
          id: string
          legal_type: string | null
          market_cap: number | null
          nav_price: number | null
          net_expense_ratio: number | null
          price_eps_current_year: number | null
          profit_margins: number | null
          regular_market_change_percent: number | null
          regular_market_price: number | null
          regular_market_volume: number | null
          shares_outstanding: number | null
          three_year_average_return: number | null
          ticker_id: string
          total_assets: number | null
          trailing_pe: number | null
          trailing_three_month_nav_returns: number | null
          trailing_three_month_returns: number | null
          two_hundred_day_average: number | null
          updated_at: string | null
          yield: number | null
          ytd_return: number | null
        }
        Insert: {
          average_analyst_rating?: number | null
          beta?: number | null
          beta3year?: number | null
          created_at?: string | null
          date: string
          dividend_yield?: number | null
          eps_forward?: number | null
          eps_trailing_ttm?: number | null
          fifty_day_average?: number | null
          fifty_two_week_high?: number | null
          fifty_two_week_low?: number | null
          five_year_average_return?: number | null
          fund_family?: string | null
          fund_inception_date?: string | null
          id?: string
          legal_type?: string | null
          market_cap?: number | null
          nav_price?: number | null
          net_expense_ratio?: number | null
          price_eps_current_year?: number | null
          profit_margins?: number | null
          regular_market_change_percent?: number | null
          regular_market_price?: number | null
          regular_market_volume?: number | null
          shares_outstanding?: number | null
          three_year_average_return?: number | null
          ticker_id: string
          total_assets?: number | null
          trailing_pe?: number | null
          trailing_three_month_nav_returns?: number | null
          trailing_three_month_returns?: number | null
          two_hundred_day_average?: number | null
          updated_at?: string | null
          yield?: number | null
          ytd_return?: number | null
        }
        Update: {
          average_analyst_rating?: number | null
          beta?: number | null
          beta3year?: number | null
          created_at?: string | null
          date?: string
          dividend_yield?: number | null
          eps_forward?: number | null
          eps_trailing_ttm?: number | null
          fifty_day_average?: number | null
          fifty_two_week_high?: number | null
          fifty_two_week_low?: number | null
          five_year_average_return?: number | null
          fund_family?: string | null
          fund_inception_date?: string | null
          id?: string
          legal_type?: string | null
          market_cap?: number | null
          nav_price?: number | null
          net_expense_ratio?: number | null
          price_eps_current_year?: number | null
          profit_margins?: number | null
          regular_market_change_percent?: number | null
          regular_market_price?: number | null
          regular_market_volume?: number | null
          shares_outstanding?: number | null
          three_year_average_return?: number | null
          ticker_id?: string
          total_assets?: number | null
          trailing_pe?: number | null
          trailing_three_month_nav_returns?: number | null
          trailing_three_month_returns?: number | null
          two_hundred_day_average?: number | null
          updated_at?: string | null
          yield?: number | null
          ytd_return?: number | null
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
            referencedRelation: "daily_positions"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "yh_finance_daily_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: true
            referencedRelation: "market_indices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "yh_finance_daily_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: true
            referencedRelation: "ticker_daily_view"
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
      calendar_events_with_tickers: {
        Row: {
          created_at: string | null
          date: string | null
          earnings_average: number | null
          earnings_dates: string[] | null
          earnings_high: number | null
          earnings_low: number | null
          event_type: string | null
          id: string | null
          revenue_average: number | null
          revenue_high: number | null
          revenue_low: number | null
          ticker_exchange: string | null
          ticker_id: string | null
          ticker_symbol: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "current_holdings"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "calendar_events_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "daily_positions"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "calendar_events_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "market_indices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "ticker_daily_view"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "calendar_events_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "tickers"
            referencedColumns: ["id"]
          },
        ]
      }
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
          quote_type: string | null
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
      daily_cash_flows: {
        Row: {
          cash_flow: number | null
          transaction_date: string | null
          transaction_type:
            | Database["public"]["Enums"]["transaction_type_enum"]
            | null
          user_id: string | null
        }
        Insert: {
          cash_flow?: never
          transaction_date?: string | null
          transaction_type?:
            | Database["public"]["Enums"]["transaction_type_enum"]
            | null
          user_id?: string | null
        }
        Update: {
          cash_flow?: never
          transaction_date?: string | null
          transaction_type?:
            | Database["public"]["Enums"]["transaction_type_enum"]
            | null
          user_id?: string | null
        }
        Relationships: [
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
      daily_cost_basis: {
        Row: {
          cost_basis: number | null
          date_day: string | null
          user_id: string | null
        }
        Relationships: [
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
      daily_portfolio_values: {
        Row: {
          date_day: string | null
          portfolio_value: number | null
          user_id: string | null
        }
        Relationships: [
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
      daily_positions: {
        Row: {
          date_day: string | null
          shares: number | null
          symbol: string | null
          ticker_id: string | null
          user_id: string | null
        }
        Relationships: [
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
      market_indices: {
        Row: {
          currency: string | null
          exchange: string | null
          id: string | null
          index_type: string | null
          industry_id: string | null
          industry_key: string | null
          industry_name: string | null
          linked_industry_id: string | null
          linked_sector_id: string | null
          name: string | null
          quote_type: string | null
          sector_id: string | null
          sector_key: string | null
          sector_name: string | null
          symbol: string | null
          tradeable: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "tickers_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickers_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "market_indices"
            referencedColumns: ["linked_industry_id"]
          },
          {
            foreignKeyName: "tickers_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "market_indices"
            referencedColumns: ["linked_sector_id"]
          },
          {
            foreignKeyName: "tickers_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_daily_metrics: {
        Row: {
          cash_balance: number | null
          cost_basis: number | null
          current_date: string | null
          daily_investment_twrr_percent: number | null
          portfolio_value: number | null
          previous_day_portfolio_value: number | null
          total_portfolio_value: number | null
          user_id: string | null
        }
        Relationships: []
      }
      portfolio_holdings_allocation: {
        Row: {
          asset_classes: Json | null
          average_cost_basis: number | null
          current_market_value: number | null
          current_price: number | null
          name: string | null
          quote_type: string | null
          sector_weightings: Json | null
          stock_sector: string | null
          symbol: string | null
          ticker_id: string | null
          total_cost_basis: number | null
          total_shares: number | null
          user_id: string | null
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
            referencedRelation: "daily_positions"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "holdings_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "market_indices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holdings_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "ticker_daily_view"
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
            referencedRelation: "daily_positions"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "trades_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "market_indices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "ticker_daily_view"
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
      running_cash_balances: {
        Row: {
          cash_balance: number | null
          date_day: string | null
          user_id: string | null
        }
        Relationships: [
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
      ticker_daily_view: {
        Row: {
          beta: number | null
          category: string | null
          created_at: string | null
          date: string | null
          dividend_amount: number | null
          dividend_months: number[] | null
          dividend_yield: number | null
          eps_forward: number | null
          eps_trailing_ttm: number | null
          exchange: string | null
          fifty_day_average: number | null
          fifty_two_week_high: number | null
          fifty_two_week_low: number | null
          industry: string | null
          market_cap: number | null
          name: string | null
          profit_margins: number | null
          quote_type: string | null
          region: string | null
          regular_market_change_percent: number | null
          regular_market_price: number | null
          regular_market_volume: number | null
          sector: string | null
          symbol: string | null
          ticker_id: string | null
          trailing_pe: number | null
          two_hundred_day_average: number | null
          updated_at: string | null
          ytd_return: number | null
        }
        Relationships: []
      }
      ticker_historical_prices: {
        Row: {
          close_price: number | null
          created_at: string | null
          date: string | null
          dividends: number | null
          high_price: number | null
          id: string | null
          low_price: number | null
          open_price: number | null
          stock_splits: number | null
          symbol: string | null
          ticker_id: string | null
          ticker_name: string | null
          updated_at: string | null
          volume: number | null
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
            referencedRelation: "daily_positions"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "historical_prices_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "market_indices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historical_prices_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "ticker_daily_view"
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
            referencedRelation: "daily_positions"
            referencedColumns: ["ticker_id"]
          },
          {
            foreignKeyName: "trades_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "market_indices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_ticker_id_fkey"
            columns: ["ticker_id"]
            isOneToOne: false
            referencedRelation: "ticker_daily_view"
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
      trading_dates: {
        Row: {
          date_day: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      bytea_to_text: {
        Args: { data: string }
        Returns: string
      }
      get_unique_currency_pairs: {
        Args: Record<PropertyKey, never>
        Returns: {
          base_currency: string
          target_currency: string
        }[]
      }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_delete: {
        Args:
          | { uri: string }
          | { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_get: {
        Args: { uri: string } | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_post: {
        Args:
          | { uri: string; content: string; content_type: string }
          | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_put: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      text_to_bytea: {
        Args: { data: string }
        Returns: string
      }
      urlencode: {
        Args: { data: Json } | { string: string } | { string: string }
        Returns: string
      }
    }
    Enums: {
      currency_type: "USD" | "EUR" | "GBP" | "JPY" | "CAD" | "AUD" | "CNY"
      transaction_type_enum:
        | "buy"
        | "sell"
        | "dividend"
        | "deposit"
        | "withdraw"
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  chess: {
    Enums: {
      color_type: ["black", "white"],
      result_type: [
        "abandoned",
        "checkmated",
        "insufficient",
        "repetition",
        "resigned",
        "stalemate",
        "timeout",
        "timevsinsufficient",
      ],
      time_class: ["blitz", "bullet", "daily", "rapid"],
    },
  },
  grocery: {
    Enums: {
      currency_type: ["EUR", "USD", "CAD", "GBP", "JPY", "AUD", "CNY"],
    },
  },
  public: {
    Enums: {
      currency_type: ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CNY"],
      transaction_type_enum: ["buy", "sell", "dividend", "deposit", "withdraw"],
    },
  },
} as const
