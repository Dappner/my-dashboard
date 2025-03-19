import yfinance as yf
from datetime import date, timedelta
from src.core.logging_config import setup_logging


logger = setup_logging(name="ticker_processor")
class DataFetcher:
    def __init__(self):
        self.exchange_map = {
            "NASDAQ": "",
            "NYSE": "",
            "AMEX": ".AM",
            "TSX": ".TO",
            "LSE": ".L",
            "FRA": ".F",
            "TSE": ".T",
            "HKEX": ".HK",
            "SSE": ".SS",
        }

    def format_yahoo_ticker(self, symbol, exchange):
        if not exchange:
            return symbol
        suffix = self.exchange_map.get(exchange.upper(), "")
        if not suffix and exchange.upper() not in self.exchange_map:
            logger.warning(
                f"Unknown exchange {exchange} for {symbol}; using symbol as is"
            )
        return f"{symbol}{suffix}"

    def fetch_stock_data(self, symbol, exchange, start_date, end_date):
        yahoo_ticker = self.format_yahoo_ticker(symbol, exchange)
        logger.debug(
            f"Fetching data for {symbol} ({yahoo_ticker}) from {start_date} to {end_date}"
        )
        try:
            ticker = yf.Ticker(yahoo_ticker)
            data = ticker.history(start=start_date, end=end_date, auto_adjust=True)
            info = ticker.info if hasattr(ticker, "info") else {}
            return data, info, ticker
        except Exception as e:
            logger.error(f"Failed to fetch data for {symbol} ({yahoo_ticker}): {e}")
            return None, {}, None

    def determine_start_date(self, last_update_date, backfill=False):
        today = date.today()
        if backfill:
            return date(2020, 1, 1)  # Start from 2020 for backfill
        return (
            last_update_date + timedelta(days=1)
            if last_update_date
            else today - timedelta(days=30)
        )
