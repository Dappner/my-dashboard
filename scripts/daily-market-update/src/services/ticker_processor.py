from datetime import date, timedelta
from src.services.data_fetcher import DataFetcher
from src.services.data_saver import DataSaver
from src.core.logging_config import setup_logging


logger = setup_logging(name="ticker_processor")


class TickerProcessor:
    def __init__(self, supabase_client):
        self.data_fetcher = DataFetcher()
        self.data_saver = DataSaver(supabase_client)
        self.supabase = supabase_client

    def _process_dividend_suggestions(
        self, ticker_id: str, symbol: str, processed_dates: list[str]
    ):
        """
        Checks for dividends paid on processed dates and creates dividend *payment* suggestions
        based on holdings ON the payment date. Does NOT rely on ex-dividend dates.
        """
        if not processed_dates:
            logger.debug(
                f"[{symbol}] No dates processed, skipping dividend payment suggestions."
            )
            return 0

        suggestion_count = 0
        min_date = min(processed_dates)
        max_date = max(processed_dates)
        logger.info(
            f"[{symbol}] Checking for dividend payments between {min_date} and {max_date} to generate suggestions."
        )

        try:
            # 1. Fetch dividend payments for the processed dates for this ticker
            dividend_response = (
                self.supabase.table("historical_prices")
                .select("date, dividends")  # Only need date and dividend amount
                .eq("ticker_id", ticker_id)
                .gte("date", min_date)
                .lte("date", max_date)
                .gt("dividends", 0)  # Only get rows where a dividend was paid
                .order("date", asc=True)  # Process chronologically
                .execute()
            )

            if not dividend_response.data:
                logger.info(
                    f"[{symbol}] No dividend payments found in historical_prices for the processed dates."
                )
                return 0

            logger.info(
                f"[{symbol}] Found {len(dividend_response.data)} potential dividend payment(s) in the processed date range."
            )

            suggestions_to_insert = []

            for payment in dividend_response.data:
                payment_date_str = payment["date"]
                dividend_per_share = payment["dividends"]

                if not dividend_per_share or dividend_per_share <= 0:
                    logger.warning(
                        f"[{symbol}] Invalid dividend amount ({dividend_per_share}) found for payment date {payment_date_str}. Skipping."
                    )
                    continue

                logger.debug(
                    f"[{symbol}] Processing dividend payment suggestion for date {payment_date_str} (Amount/Share: {dividend_per_share})"
                )

                # 2. Find users holding the stock ON the payment date
                # Assumes 'daily_positions' accurately reflects holdings for that day.
                holding_check_date_str = payment_date_str

                holdings_response = (
                    self.supabase.table("daily_positions")  # Use the view
                    .select("user_id, shares")
                    .eq("ticker_id", ticker_id)
                    .eq(
                        "date_day", holding_check_date_str
                    )  # Check holdings ON payment date
                    .gt("shares", 0)  # Must have a positive share count
                    .execute()
                )

                if not holdings_response.data:
                    logger.info(
                        f"[{symbol}] No users found holding stock on payment date {holding_check_date_str}."
                    )
                    continue  # Skip to the next payment date if no one held it

                logger.info(
                    f"[{symbol}] Found {len(holdings_response.data)} user(s) holding stock on payment date {holding_check_date_str}."
                )

                # 3. Calculate and prepare dividend suggestions for each user
                for holding in holdings_response.data:
                    user_id = holding["user_id"]
                    shares_held = holding["shares"]

                    if not shares_held or shares_held <= 0:
                        continue

                    # Calculate total dividend amount, round to reasonable precision (e.g., 4 decimal places)
                    total_dividend_received = round(shares_held * dividend_per_share, 4)

                    if total_dividend_received <= 0:
                        logger.debug(
                            f"[{symbol}] Calculated total dividend is zero or negative for user {user_id} on {payment_date_str}. Skipping."
                        )
                        continue

                    # 4. Prepare suggestion record for a 'dividend' type transaction
                    suggestion = {
                        "user_id": user_id,
                        "ticker_id": ticker_id,
                        "transaction_type": "dividend",  # Use the enum value 'dividend'
                        "transaction_date": payment_date_str,
                        "shares": total_dividend_received,  # Store total dividend *amount* here
                        "price_per_share": None,  # Price is not relevant for a dividend event suggestion
                        "is_dividend_reinvestment": False,  # Explicitly false
                    }
                    suggestions_to_insert.append(suggestion)
                    logger.debug(
                        f"[{symbol}] Prepared dividend suggestion for user {user_id} on {payment_date_str}: Amount {total_dividend_received}"
                    )

            # 5. Save all suggestions for this ticker using upsert
            if suggestions_to_insert:
                try:
                    # Define the conflict target columns for uniqueness
                    conflict_columns = [
                        "user_id",
                        "ticker_id",
                        "transaction_date",
                        "transaction_type",
                    ]

                    # Upsert into suggested_trades. If a suggestion for this user/ticker/date/type already exists, it will be ignored or updated based on policy (default ignores).
                    upsert_response = (
                        self.supabase.table("suggested_trades")
                        .upsert(
                            suggestions_to_insert,
                            on_conflict=",".join(
                                conflict_columns
                            ),  # Pass as comma-separated string for broader client compatibility
                        )
                        .execute()
                    )

                    # Basic check if the client library includes error details in the response object
                    # Note: Modern supabase-py versions usually raise exceptions on HTTP errors.
                    if hasattr(upsert_response, "error") and upsert_response.error:
                        logger.error(
                            f"[{symbol}] Supabase upsert returned an error: {upsert_response.error}"
                        )
                        # Depending on severity, you might want to raise an exception or just log
                        # raise Exception(f"Supabase upsert error: {upsert_response.error}")
                    elif hasattr(upsert_response, "data"):
                        # Check the actual data returned - successful upsert might return the inserted/updated rows
                        actual_upserted_count = len(upsert_response.data)
                        suggestion_count = actual_upserted_count  # Count what was actually processed by DB
                        logger.info(
                            f"[{symbol}] Successfully upserted/processed {suggestion_count} dividend payment suggestions."
                        )
                    else:
                        # Fallback if response structure is different or unclear
                        suggestion_count = len(
                            suggestions_to_insert
                        )  # Assume all were attempted if no error
                        logger.info(
                            f"[{symbol}] Attempted to upsert {suggestion_count} dividend payment suggestions (confirm details in DB)."
                        )

                # Catch potential exceptions during the DB operation
                except Exception as e:  # Consider catching specific DB exceptions if available e.g., from psycopg2 or postgrest
                    logger.error(
                        f"[{symbol}] Failed to upsert suggested dividend payments: {e}",
                        exc_info=True,  # Provides traceback
                    )
                    # Log details of the data causing the error if possible
                    # Be cautious about logging sensitive data if user_id is sensitive
                    logger.error(
                        f"[{symbol}] Data attempted (first record): {suggestions_to_insert[0] if suggestions_to_insert else 'None'}"
                    )
                    # Set suggestion_count to 0 or handle as appropriate since the operation failed
                    suggestion_count = 0

        except Exception as e:
            logger.error(
                f"[{symbol}] General error processing dividend payment suggestions: {e}",
                exc_info=True,
            )
            suggestion_count = 0  # Ensure count is 0 on general error

        return suggestion_count

    def process_ticker(self, ticker):
        symbol = ticker["symbol"]
        ticker_id = ticker["id"]
        exchange = ticker.get("exchange", "")
        backfill = ticker.get("backfill", False)
        logger.info(f"Processing ticker: {symbol} (Backfill: {backfill})")

        updates = set()
        processed_price_dates = []
        today = date.today()
        end_date = today + timedelta(days=1)

        last_price_update = self.data_saver.get_last_update_date(
            ticker_id, "historical_prices"
        )
        last_finance_update = self.data_saver.get_last_update_date(
            ticker_id, "yh_finance_daily"
        )
        last_calendar_update = self.data_saver.get_last_update_date(
            ticker_id, "calendar_events"
        )

        start_date = self.data_fetcher.determine_start_date(last_price_update, backfill)
        logger.info(
            f"[{symbol}] Determining fetch range. Start: {start_date}, End: {today}. Last updates - Price: {last_price_update}, Finance: {last_finance_update}, Calendar: {last_calendar_update}"
        )

        should_fetch_yh = (
            backfill
            or start_date <= today  # Need historical prices
            or self.data_saver.should_update(last_finance_update)
            or self.data_saver.should_update(
                last_calendar_update, threshold_days=7
            )  # Calendar less frequent
        )

        if should_fetch_yh:
            data, info, yf_ticker = self.data_fetcher.fetch_stock_data(
                symbol, exchange, start_date, end_date
            )

            # Saves Price Data
            if data is not None and not data.empty:
                if self.data_saver.save_price_data(ticker_id, symbol, data):
                    updates.add("historical_prices")

            # Update Ticker Info, Finance Data and Fund Data
            if (
                backfill or self.data_saver.should_update(last_finance_update)
            ) and info:
                if self.data_saver.update_ticker_info(
                    ticker_id, symbol, info, backfill
                ):
                    updates.add("tickers")
                if self.data_saver.save_finance_data(ticker_id, symbol, info):
                    updates.add("yh_finance_daily")
                quote_type = info.get("quoteType", "EQUITY")
                if quote_type in ["MUTUALFUND", "ETF"] and yf_ticker:
                    updates.update(self.process_fund_data(ticker_id, symbol, yf_ticker))

            if (
                backfill or self.data_saver.should_update(last_calendar_update)
            ) and yf_ticker:
                if self.data_saver.save_calendar_events(ticker_id, symbol, yf_ticker):
                    updates.add("calendar_events")

        # --- Process Dividend Payment Suggestions ---
        # Run if historical prices were successfully updated in this run
        if "historical_prices" in updates and processed_price_dates:
            logger.info(
                f"[{symbol}] Triggering dividend payment suggestion processing."
            )
            suggestions_created = self._process_dividend_suggestions(
                ticker_id, symbol, processed_price_dates
            )
            if suggestions_created > 0:
                updates.add(
                    "suggested_trades"
                )  # Track that suggestions were potentially made/updated
                logger.info(
                    f"[{symbol}] Created/updated {suggestions_created} dividend payment suggestions."
                )
            else:
                logger.info(
                    f"[{symbol}] No new dividend payment suggestions were created/updated."
                )
        elif processed_price_dates:
            # This case means price data was fetched but saving failed or resulted in no changes recognized by save_price_data
            logger.info(
                f"[{symbol}] Historical prices were processed but no updates recorded; skipping dividend suggestions."
            )
        else:
            # This case means either no fetch was needed, or fetch failed to return price data
            logger.info(
                f"[{symbol}] No new historical price data processed; skipping dividend suggestions."
            )
        # --- END Dividend Processing ---
        return updates

    def process_fund_data(self, ticker_id, symbol, yf_ticker):
        updates = set()
        if self.data_saver.save_fund_top_holdings(ticker_id, symbol, yf_ticker):
            updates.add("fund_top_holdings")
            logger.info(f"Updated fund_top_holdings for {symbol}")

        # Save fund sector weightings
        if self.data_saver.save_fund_sector_weightings(ticker_id, symbol, yf_ticker):
            updates.add("fund_sector_weightings")
            logger.info(f"Updated fund_sector_weightings for {symbol}")

        # Save fund asset classes
        if self.data_saver.save_fund_asset_classes(ticker_id, symbol, yf_ticker):
            updates.add("fund_asset_classes")
            logger.info(f"Updated fund_asset_classes for {symbol}")
        return updates
