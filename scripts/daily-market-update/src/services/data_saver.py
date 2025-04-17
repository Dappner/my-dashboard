"""
Data saver module for storing data in the database.
"""

from datetime import date
from typing import List, Set, Optional

from src.core.logging_config import setup_logging
from src.models.db_models import (
    DBHistoricalPrice,
    DBTickerInfo,
    DBFinanceDaily,
    DBCalendarEvent,
    DBFundHolding,
    DBSectorWeighting,
    DBAssetClass,
)

logger = setup_logging(name="data_saver")


class DataSaver:
    """
    Saves financial data to the database.
    """

    def __init__(self, supabase_client):
        """
        Initialize the data saver.

        Args:
            supabase_client: Supabase client for database operations
        """
        self.supabase = supabase_client

    def get_last_update_date(self, ticker_id: str, table_name: str) -> Optional[date]:
        """
        Get the date of the last update for a ticker in a table.

        Args:
            ticker_id: Ticker ID to query
            table_name: Table name to query

        Returns:
            Date of last update or None if no previous updates
        """
        try:
            response = (
                self.supabase.table(table_name)
                .select("date")
                .eq("ticker_id", ticker_id)
                .order("date", desc=True)
                .limit(1)
                .execute()
            )

            if response.data and len(response.data) > 0:
                date_str = response.data[0].get("date")
                if date_str:
                    from datetime import datetime

                    return datetime.strptime(date_str, "%Y-%m-%d").date()

            return None

        except Exception as e:
            logger.error(
                f"Failed to get last update date for {ticker_id} in {table_name}: {e}"
            )
            return None

    def should_update(
        self, last_update_date: Optional[date], threshold_days: int = 1
    ) -> bool:
        """
        Determine if an update should be performed based on last update date.

        Args:
            last_update_date: Date of last update
            threshold_days: Minimum days between updates

        Returns:
            True if update should be performed, False otherwise
        """
        if not last_update_date:
            return True

        today = date.today()
        return (today - last_update_date).days >= threshold_days

    def save_historical_prices(
        self, symbol: str, prices: List[DBHistoricalPrice]
    ) -> int:
        """
        Save historical price data to the database.

        Args:
            ticker_id: Ticker ID
            symbol: Ticker symbol (for logging)
            prices: List of price models to save

        Returns:
            Number of records saved
        """
        if not prices:
            logger.debug(f"No price data for {symbol}")
            return 0

        try:
            # Convert models to dictionaries for Supabase
            price_dicts = [p.model_dump(exclude_none=True) for p in prices]

            # Upsert to database
            response = (
                self.supabase.table("historical_prices")
                .upsert(price_dicts, on_conflict="ticker_id,date")
                .execute()
            )
            print(response)

            saved_count = len(price_dicts)
            logger.info(f"Saved {saved_count} price records for {symbol}")
            return saved_count

        except Exception as e:
            logger.error(f"Failed to save price data for {symbol}: {e}", exc_info=True)
            return 0

    def update_ticker_info(self, ticker_info: DBTickerInfo) -> bool:
        """
        Update ticker information in the database.

        Args:
            ticker_info: Ticker info model

        Returns:
            True if successful, False otherwise
        """

        try:
            # Convert model to dictionary for Supabase
            ticker_dict = ticker_info.model_dump(exclude_none=True)

            # Update in database
            self.supabase.table("tickers").update(ticker_dict).eq(
                "id", ticker_info.id
            ).execute()

            return True

        except Exception as e:
            logger.error(f"Failed to update ticker info for {ticker_info.symbol}: {e}")
            return False

    def save_finance_daily(self, finance_data: DBFinanceDaily) -> bool:
        """
        Save daily finance data to the database.

        Args:
            finance_data: Finance daily model

        Returns:
            True if successful, False otherwise
        """
        if not finance_data:
            return False

        try:
            # Convert model to dictionary for Supabase
            finance_dict = finance_data.model_dump(exclude_none=True, by_alias=True)

            # Upsert to database
            self.supabase.table("yh_finance_daily").upsert(
                [finance_dict],
                on_conflict=["ticker_id"],
            ).execute()

            return True

        except Exception as e:
            logger.error(
                f"Failed to save finance data for {finance_data.ticker_id}: {e}"
            )
            return False

    def save_calendar_events(
        self, ticker_id: str, symbol: str, events: List[DBCalendarEvent]
    ) -> bool:
        """
        Save calendar events to the database.

        Args:
            ticker_id: Ticker ID
            symbol: Ticker symbol (for logging)
            events: List of calendar event models

        Returns:
            True if successful, False otherwise
        """
        if not events:
            logger.debug(f"No calendar events for {symbol}")
            return False

        try:
            # Ensure all events have a non-null date - this is crucial for the unique constraint
            valid_events = []
            for event in events:
                # If date is missing, use today's date or skip this event
                if not event.date:
                    # For earnings events, use the first earnings date if available
                    if (
                        event.event_type == "earnings"
                        and event.earnings_dates
                        and len(event.earnings_dates) > 0
                    ):
                        event.date = event.earnings_dates[0]
                    else:
                        # Skip events with no date - they'll cause constraint violations
                        logger.warning(
                            f"Skipping {event.event_type} event for {symbol} with no date"
                        )
                        continue
                valid_events.append(event)

            # Convert models to dictionaries for Supabase
            event_dicts = [e.model_dump(exclude_none=True) for e in valid_events]

            # Only proceed if we have valid events
            if not event_dicts:
                logger.warning(f"No valid events for {symbol} after date validation")
                return False

            # Use on_conflict="ticker_id,date,event_type" to properly handle the unique constraint
            self.supabase.table("calendar_events").upsert(
                event_dicts, on_conflict="ticker_id,date,event_type"
            ).execute()

            logger.info(f"Saved {len(valid_events)} calendar events for {symbol}")
            return True

        except Exception as e:
            logger.error(f"Failed to save calendar events for {symbol}: {e}")
            return False

    def save_fund_data(
        self,
        ticker_id: str,
        symbol: str,
        holdings: List[DBFundHolding],
        sectors: List[DBSectorWeighting],
        assets: List[DBAssetClass],
    ) -> Set[str]:
        """
        Save fund-specific data to the database.

        Args:
            ticker_id: Ticker ID
            symbol: Ticker symbol (for logging)
            holdings: List of fund holding models
            sectors: List of sector weighting models
            assets: List of asset allocation models

        Returns:
            Set of updated table names
        """
        updates = set()

        # Save holdings
        if holdings:
            try:
                holding_dicts = [h.model_dump(exclude_none=True) for h in holdings]
                self.supabase.table("fund_top_holdings").upsert(
                    holding_dicts, on_conflict="ticker_id,holding_symbol"
                ).execute()
                updates.add("fund_top_holdings")
                logger.info(f"Saved {len(holdings)} fund holdings for {symbol}")
            except Exception as e:
                logger.error(f"Failed to save fund holdings for {symbol}: {e}")

        # Save sectors
        if sectors:
            try:
                sector_dicts = [s.model_dump(exclude_none=True) for s in sectors]
                self.supabase.table("fund_sector_weightings").upsert(
                    sector_dicts, on_conflict="ticker_id,sector_name"
                ).execute()
                updates.add("fund_sector_weightings")
                logger.info(f"Saved {len(sectors)} sector weightings for {symbol}")
            except Exception as e:
                logger.error(f"Failed to save sector weightings for {symbol}: {e}")

        # Save assets
        if assets:
            try:
                asset_dicts = [a.model_dump(exclude_none=True) for a in assets]
                self.supabase.table("fund_asset_classes").upsert(
                    asset_dicts, on_conflict="ticker_id,asset_class"
                ).execute()
                updates.add("fund_asset_classes")
                logger.info(f"Saved {len(assets)} asset classes for {symbol}")
            except Exception as e:
                logger.error(f"Failed to save asset classes for {symbol}: {e}")

        return updates

