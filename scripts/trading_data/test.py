import yfinance as yf
from supabase import create_client
from datetime import datetime, date, timedelta
import os
import logging
import pandas as pd

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)


def format_yahoo_ticker(symbol, exchange):
    """Format ticker symbol with exchange for Yahoo Finance."""
    if not exchange:
        return symbol

    # Expanded exchange map for Yahoo Finance suffixes
    exchange_map = {
        "NASDAQ": "",
        "NYSE": "",
        "AMEX": ".AM",
        "TSX": ".TO",
        "LSE": ".L",
        "FRA": ".F",
        "TSE": ".T",  # Tokyo Stock Exchange
        "HKEX": ".HK",  # Hong Kong Stock Exchange
        "SSE": ".SS",  # Shanghai Stock Exchange
    }

    suffix = exchange_map.get(exchange.upper(), "")
    if suffix:
        return f"{symbol}{suffix}"

    logger.warning(f"Exchange {exchange} not mapped for {symbol}; using symbol as is")
    return symbol


def get_stock_data(symbol, exchange, start_date, end_date):
    """Fetches stock data from yfinance with exchange information."""
    try:
        yahoo_ticker = format_yahoo_ticker(symbol, exchange)
        logger.info(
            f"Querying Yahoo Finance for {symbol} on {exchange} as {yahoo_ticker}"
        )
        ticker = yf.Ticker(yahoo_ticker)
        # Fetch data with auto_adjust=True for adjusted prices
        data = ticker.history(start=start_date, end=end_date, auto_adjust=True)

        info = {}
        try:
            info = ticker.info
        except Exception as e:
            logger.warning(f"Could not get info for {yahoo_ticker}: {e}")

        return data, info
    except Exception as e:
        logger.error(f"Error fetching data for {symbol} on {exchange}: {e}")
        return None, {}


def lambda_handler(event, context):
    """AWS Lambda handler function."""
    try:
        today = date.today()
        end_date = today + timedelta(days=1)  # Include today's data if available

        data, info = get_stock_data("AAPL", "", today, end_date)
        print(data)
        print(info)

    except Exception as e:
        logger.error(f"Lambda execution failed: {e}")
        return {"statusCode": 500, "body": f"Error: {str(e)}"}


if __name__ == "__main__":
    result = lambda_handler(None, None)
    print(result)
