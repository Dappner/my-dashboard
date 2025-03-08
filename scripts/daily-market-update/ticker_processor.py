import logging
from datetime import date, timedelta
from data_fetcher import DataFetcher
from data_saver import DataSaver

logger = logging.getLogger(__name__)


class TickerProcessor:
    def __init__(self, supabase_client):
        self.data_fetcher = DataFetcher()
        self.data_saver = DataSaver(supabase_client)

    def process_ticker(self, ticker):
        symbol = ticker["symbol"]
        ticker_id = ticker["id"]
        exchange = ticker.get("exchange", "")
        backfill = ticker.get("backfill", False)
        logger.info(f"Processing ticker: {symbol} (Backfill: {backfill})")

        updates = set()
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
            f"Processing {symbol}, lpu: {last_price_update}, lfu: {last_finance_update}, lcu: {last_calendar_update}"
        )
        if (
            backfill
            or start_date <= today
            or self.data_saver.should_update(last_finance_update)
            or self.data_saver.should_update(last_calendar_update)
        ):
            data, info, yf_ticker = self.data_fetcher.fetch_stock_data(
                symbol, exchange, start_date, end_date
            )
            if data is not None and not data.empty:
                if self.data_saver.save_price_data(ticker_id, symbol, data):
                    updates.add("historical_prices")
            if (
                backfill or self.data_saver.should_update(last_finance_update)
            ) and info:
                if self.data_saver.update_ticker_info(ticker_id, symbol, info):
                    updates.add("tickers")
                if self.data_saver.save_finance_data(ticker_id, symbol, info):
                    updates.add("yh_finance_daily")
                quote_type = info.get("quoteType", "EQUITY")
                if quote_type in ["MUTUALFUND", "ETF"] and yf_ticker:
                    for table, key in [
                        ("fund_sector_weightings", "sector_weightings"),
                        ("fund_top_holdings", "top_holdings"),
                        ("fund_asset_classes", "asset_classes"),
                    ]:
                        if self.data_saver.save_fund_data(
                            ticker_id, symbol, yf_ticker, table, key
                        ):
                            updates.add(table)
            if (
                backfill or self.data_saver.should_update(last_calendar_update)
            ) and yf_ticker:
                if self.data_saver.save_calendar_events(ticker_id, symbol, yf_ticker):
                    updates.add("calendar_events")
        return updates
