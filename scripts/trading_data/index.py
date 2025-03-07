import yfinance as yf
from supabase import create_client
from datetime import datetime, date, timedelta
import logging
import pandas as pd
import traceback

# Configure logging with a more detailed format
logger = logging.getLogger()
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter("%(asctime)s - %(levelname)s - %(message)s"))
logger.addHandler(handler)

# Supabase configuration
SUPABASE_URL = "https://wwzyziohidsxmjfkoowh.supabase.co"
SUPABASE_KEY = "[REDACTED_JWT]"


def get_supabase_client():
    """Creates and returns a Supabase client."""
    try:
        return create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        logger.error(f"Failed to create Supabase client: {e}")
        raise


def get_tickers_from_supabase(supabase):
    """Fetches ticker symbols, exchanges, and IDs from Supabase."""
    try:
        response = supabase.table("tickers").select("id, symbol, exchange").execute()
        logger.debug(f"Fetched {len(response.data)} tickers from Supabase")
        return response.data
    except Exception as e:
        logger.error(f"Failed to fetch tickers from Supabase: {e}")
        return []


def get_last_update_date(supabase, ticker_id, table_name):
    """Gets the most recent date for a specific ticker in the specified table."""
    try:
        response = (
            supabase.table(table_name)
            .select("date")
            .eq("ticker_id", ticker_id)
            .order("date", desc=True)
            .limit(1)
            .execute()
        )
        if response.data and len(response.data) > 0:
            # TODO: This is where I'm throwing an error
            return datetime.strptime(response.data[0]["date"], "%Y-%m-%d").date()
        return None
    except Exception as e:
        logger.error(
            f"Failed to get last update date for ticker {ticker_id} in {table_name}: {e}"
        )
        return None


def format_yahoo_ticker(symbol, exchange):
    """Formats ticker symbol with exchange suffix for Yahoo Finance."""
    if not exchange:
        return symbol
    exchange_map = {
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
    suffix = exchange_map.get(exchange.upper(), "")
    if not suffix and exchange.upper() not in exchange_map:
        logger.warning(f"Unknown exchange {exchange} for {symbol}; using symbol as is")
    return f"{symbol}{suffix}"


def get_stock_data(symbol, exchange, start_date, end_date):
    """Fetches stock data from yfinance."""
    yahoo_ticker = format_yahoo_ticker(symbol, exchange)
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


def update_ticker_info(supabase, ticker_id, symbol, info):
    """Updates static ticker info in the tickers table."""
    if not info:
        return False
    update_data = {
        "long_business_summary": info.get("longBusinessSummary"),
        "category": info.get("category"),
        "region": info.get("region"),
        "quote_type": info.get("quoteType", "EQUITY"),
        "updated_at": datetime.now().isoformat(),
    }
    update_data = {k: v for k, v in update_data.items() if v is not None}
    if not update_data:
        return False
    try:
        supabase.table("tickers").update(update_data).eq("id", ticker_id).execute()
        logger.info(f"Updated tickers table for {symbol}")
        return True
    except Exception as e:
        logger.error(f"Failed to update tickers table for {symbol}: {e}")
        return False


def should_update(last_update_date, threshold_days=1):
    """Determines if an update is needed based on the last update date."""
    if not last_update_date:
        return True
    return (date.today() - last_update_date).days >= threshold_days


def save_finance_data(supabase, ticker_id, symbol, info):
    """Saves finance data to yh_finance_daily in a batched request."""
    if not info:
        logger.debug(f"No finance data available for {symbol}")
        return False
    today = date.today().strftime("%Y-%m-%d")
    quote_type = info.get("quoteType", "EQUITY")
    finance_data = {
        "ticker_id": ticker_id,
        "date": today,
        "regular_market_price": info.get("regularMarketPrice")
        if quote_type in ["EQUITY", "ETF"]
        else None,
        "regular_market_change_percent": info.get("regularMarketChangePercent")
        if quote_type in ["EQUITY", "ETF"]
        else None,
        "market_cap": info.get("marketCap")
        if quote_type in ["EQUITY", "ETF"]
        else None,
        "dividend_yield": info.get("dividendYield"),
        "fifty_two_week_low": info.get("fiftyTwoWeekLow")
        if quote_type in ["EQUITY", "ETF"]
        else None,
        "fifty_two_week_high": info.get("fiftyTwoWeekHigh")
        if quote_type in ["EQUITY", "ETF"]
        else None,
        "fifty_day_average": info.get("fiftyDayAverage")
        if quote_type in ["EQUITY", "ETF"]
        else None,
        "two_hundred_day_average": info.get("twoHundredDayAverage")
        if quote_type in ["EQUITY", "ETF"]
        else None,
        "trailing_pe": info.get("trailingPE") if quote_type == "EQUITY" else None,
        "total_assets": info.get("totalAssets")
        if quote_type in ["MUTUALFUND", "ETF"]
        else None,
        "nav_price": info.get("navPrice")
        if quote_type in ["MUTUALFUND", "ETF"]
        else None,
        "yield": info.get("yield") if quote_type in ["MUTUALFUND", "ETF"] else None,
        "ytd_return": info.get("ytdReturn"),
        "beta3year": info.get("beta"),
        "fund_family": info.get("fundFamily")
        if quote_type in ["MUTUALFUND", "ETF"]
        else None,
        "fund_inception_date": datetime.fromtimestamp(
            info.get("fundInceptionDate")
        ).strftime("%Y-%m-%d")
        if info.get("fundInceptionDate")
        else None,
        "legal_type": info.get("legalType")
        if quote_type in ["MUTUALFUND", "ETF"]
        else None,
        "three_year_average_return": info.get("threeYearAverageReturn")
        if quote_type in ["MUTUALFUND", "ETF"]
        else None,
        "five_year_average_return": info.get("fiveYearAverageReturn")
        if quote_type in ["MUTUALFUND", "ETF"]
        else None,
        "net_expense_ratio": info.get("netExpenseRatio")
        if quote_type in ["MUTUALFUND", "ETF"]
        else None,
        "shares_outstanding": info.get("sharesOutstanding")
        if quote_type in ["EQUITY", "ETF"]
        else None,
        "trailing_three_month_returns": info.get("trailingThreeMonthReturns")
        if quote_type in ["MUTUALFUND", "ETF"]
        else None,
        "trailing_three_month_nav_returns": info.get("trailingThreeMonthNavReturns")
        if quote_type in ["MUTUALFUND", "ETF"]
        else None,
        "updated_at": datetime.now().isoformat(),
    }

    finance_data = {k: v for k, v in finance_data.items() if v is not None}
    if len(finance_data) <= 3:  # Only ticker_id, date, and updated_at
        logger.debug(f"Insufficient finance data for {symbol}")
        return False

    try:
        supabase.table("yh_finance_daily").upsert(
            [finance_data], on_conflict="ticker_id,date"
        ).execute()
        logger.info(f"Updated yh_finance_daily table for {symbol}")
        return True
    except Exception as e:
        logger.error(f"Failed to update yh_finance_daily for {symbol}: {e}")
        return False


def save_calendar_events(supabase, ticker_id, symbol, ticker):
    """Saves calendar events from yfinance to the calendar_events table."""
    if not hasattr(ticker, "calendar") or ticker.calendar is None:
        logger.debug(f"No calendar data available for {symbol}")
        return False

    calendar = ticker.calendar
    if not calendar or (isinstance(calendar, dict) and not calendar):
        logger.debug(f"Empty calendar data for {symbol}")
        return False

    events_data = []

    # Handle Dividend Date
    if "Dividend Date" in calendar and calendar["Dividend Date"]:
        events_data.append(
            {
                "ticker_id": str(ticker_id),  # Ensure UUID is a string
                "date": calendar["Dividend Date"].strftime("%Y-%m-%d"),
                "event_type": "dividend",
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
            }
        )

    # Handle Ex-Dividend Date
    if "Ex-Dividend Date" in calendar and calendar["Ex-Dividend Date"]:
        events_data.append(
            {
                "ticker_id": str(ticker_id),  # Ensure UUID is a string
                "date": calendar["Ex-Dividend Date"].strftime("%Y-%m-%d"),
                "event_type": "ex_dividend",
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
            }
        )

    # Handle Earnings Date and Estimates
    if "Earnings Date" in calendar and calendar["Earnings Date"]:
        earnings_dates = calendar["Earnings Date"]
        if isinstance(earnings_dates, list) and earnings_dates:
            earnings_dates_str = [d.strftime("%Y-%m-%d") for d in earnings_dates if d]
            if earnings_dates_str:
                earnings_event = {
                    "ticker_id": str(ticker_id),  # Ensure UUID is a string
                    "event_type": "earnings",
                    "earnings_dates": earnings_dates_str,
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat(),
                }
                # Add optional earnings and revenue estimates only if they are valid
                if (
                    "Earnings High" in calendar
                    and calendar["Earnings High"] is not None
                ):
                    try:
                        earnings_event["earnings_high"] = float(
                            calendar["Earnings High"]
                        )
                    except (ValueError, TypeError) as e:
                        logger.warning(
                            f"Invalid Earnings High for {symbol}: {calendar['Earnings High']} - {e}"
                        )
                if "Earnings Low" in calendar and calendar["Earnings Low"] is not None:
                    try:
                        earnings_event["earnings_low"] = float(calendar["Earnings Low"])
                    except (ValueError, TypeError) as e:
                        logger.warning(
                            f"Invalid Earnings Low for {symbol}: {calendar['Earnings Low']} - {e}"
                        )
                if (
                    "Earnings Average" in calendar
                    and calendar["Earnings Average"] is not None
                ):
                    try:
                        earnings_event["earnings_average"] = float(
                            calendar["Earnings Average"]
                        )
                    except (ValueError, TypeError) as e:
                        logger.warning(
                            f"Invalid Earnings Average for {symbol}: {calendar['Earnings Average']} - {e}"
                        )
                if "Revenue High" in calendar and calendar["Revenue High"] is not None:
                    try:
                        earnings_event["revenue_high"] = int(calendar["Revenue High"])
                    except (ValueError, TypeError) as e:
                        logger.warning(
                            f"Invalid Revenue High for {symbol}: {calendar['Revenue High']} - {e}"
                        )
                if "Revenue Low" in calendar and calendar["Revenue Low"] is not None:
                    try:
                        earnings_event["revenue_low"] = int(calendar["Revenue Low"])
                    except (ValueError, TypeError) as e:
                        logger.warning(
                            f"Invalid Revenue Low for {symbol}: {calendar['Revenue Low']} - {e}"
                        )
                if (
                    "Revenue Average" in calendar
                    and calendar["Revenue Average"] is not None
                ):
                    try:
                        earnings_event["revenue_average"] = int(
                            calendar["Revenue Average"]
                        )
                    except (ValueError, TypeError) as e:
                        logger.warning(
                            f"Invalid Revenue Average for {symbol}: {calendar['Revenue Average']} - {e}"
                        )
                events_data.append(earnings_event)

    if not events_data:
        logger.debug(f"No valid calendar events to save for {symbol}")
        return False

    try:
        supabase.table("calendar_events").upsert(
            events_data, on_conflict="ticker_id,date,event_type"
        ).execute()
        logger.info(
            f"Updated calendar_events table for {symbol} with {len(events_data)} events"
        )
        return True
    except Exception as e:
        logger.error(f"Failed to save calendar events for {symbol}: {e}")
        return False


def save_fund_data(supabase, ticker_id, symbol, ticker, table_name, data_key):
    """Saves fund-specific data, handling list, dict, and DataFrame types."""
    if not hasattr(ticker, "funds_data") or ticker.funds_data is None:
        logger.debug(f"No funds_data available for {symbol}")
        return False

    data = getattr(ticker.funds_data, data_key, None)  # Changed default to None
    if data is None:
        logger.debug(f"No {data_key} data for {symbol}")
        return False

    upsert_data = []

    if isinstance(data, list):
        # Filter and validate list items
        for item in data:
            if not isinstance(item, dict):
                logger.warning(
                    f"Skipping invalid {data_key} item for {symbol}: {type(item)} - {item}"
                )
                continue
            try:
                # Generic list of dictionaries
                item["ticker_id"] = ticker_id
                item["date"] = date.today().strftime("%Y-%m-%d")
                item["updated_at"] = datetime.now().isoformat()
                if "weight" in item:
                    item["weight"] = item["weight"] * 100
                upsert_data.append(item)

            except KeyError as e:
                logger.warning(
                    f"Skipping {data_key} item for {symbol} missing required key: {e}"
                )
                continue

    elif isinstance(data, dict) and table_name == "fund_sector_weightings":
        # Handle dictionary type (sector weightings)
        for sector_name, weight in data.items():
            try:
                upsert_data.append(
                    {
                        "ticker_id": ticker_id,
                        "date": date.today().strftime("%Y-%m-%d"),
                        "sector_name": sector_name,
                        "weight": weight * 100,
                        "updated_at": datetime.now().isoformat(),
                    }
                )
            except Exception as e:
                logger.error(
                    f"Error processing {data_key} dictionary for {symbol}: {e}"
                )
                return False

    elif isinstance(data, dict) and table_name == "fund_asset_classes":
        # Handle dictionary type (asset classes)
        for asset_class, weight in data.items():
            try:
                upsert_data.append(
                    {
                        "ticker_id": ticker_id,
                        "date": date.today().strftime("%Y-%m-%d"),
                        "asset_class": asset_class,
                        "weight": weight * 100,
                        "updated_at": datetime.now().isoformat(),
                    }
                )
            except Exception as e:
                logger.error(
                    f"Error processing {data_key} dictionary for {symbol}: {e}"
                )
                return False

    elif isinstance(data, pd.DataFrame):
        # Handle Pandas DataFrame (top holdings)
        try:
            for index, row in data.iterrows():
                upsert_data.append(
                    {
                        "ticker_id": ticker_id,
                        "date": date.today().strftime("%Y-%m-%d"),
                        "holding_symbol": index,
                        "holding_name": row["Name"],
                        "weight": row["Holding Percent"] * 100,
                        "updated_at": datetime.now().isoformat(),
                    }
                )
        except KeyError as e:
            logger.error(f"Error processing {data_key} DataFrame for {symbol}: {e}")
            return False

    else:
        logger.error(
            f"{data_key} for {symbol} is not a list, dict, or DataFrame: {type(data)} - {data}"
        )
        return False

    if not upsert_data:
        logger.debug(f"No valid {data_key} data to save for {symbol}")
        return False

    try:
        # Dynamically set on_conflict based on table_name
        if table_name == "fund_sector_weightings":
            on_conflict_clause = "ticker_id,sector_name"
        elif table_name == "fund_top_holdings":
            on_conflict_clause = "ticker_id,holding_symbol"
        elif table_name == "fund_asset_classes":
            on_conflict_clause = "ticker_id,asset_class"
        else:
            on_conflict_clause = "ticker_id"

        supabase.table(table_name).upsert(
            upsert_data, on_conflict=on_conflict_clause
        ).execute()
        logger.info(
            f"Updated {table_name} table for {symbol} with {len(upsert_data)} records"
        )
        return True
    except Exception as e:
        logger.error(f"Failed to update {table_name} for {symbol}: {e}")
        return False


def save_price_data(supabase, ticker_id, symbol, data):
    """Saves price data to historical_prices in a single batched request."""
    if data is None or data.empty:
        logger.debug(f"No price data for {symbol}")
        return 0

    price_data_list = []
    for index, row in data.iterrows():
        price_data = {
            "ticker_id": ticker_id,
            "date": index.strftime("%Y-%m-%d"),
            "open_price": float(row["Open"]) if not pd.isna(row["Open"]) else None,
            "high_price": float(row["High"]) if not pd.isna(row["High"]) else None,
            "low_price": float(row["Low"]) if not pd.isna(row["Low"]) else None,
            "close_price": float(row["Close"]) if not pd.isna(row["Close"]) else None,
            "dividends": float(row["Dividends"])
            if not pd.isna(row["Dividends"])
            else None,
            "stock_splits": float(row["Stock Splits"])
            if not pd.isna(row["Stock Splits"])
            else None,
            "volume": int(row["Volume"]) if not pd.isna(row["Volume"]) else None,
            "updated_at": datetime.now().isoformat(),
        }
        price_data_list.append(price_data)

    if not price_data_list:
        logger.debug(f"No valid price data to save for {symbol}")
        return 0

    try:
        supabase.table("historical_prices").upsert(
            price_data_list, on_conflict="ticker_id,date"
        ).execute()
        logger.info(
            f"Updated historical_prices table for {symbol} with {len(price_data_list)} records"
        )
        return len(price_data_list)
    except Exception as e:
        logger.error(f"Failed to batch save price data for {symbol}: {e}")
        return 0


# Commented out functions related to trade suggestions
"""
def suggest_dividend_trades(supabase, ticker_id, symbol, data, users):
    if data is None or data.empty or "Dividends" not in data.columns:
        logger.debug(f"No dividend data for {symbol}")
        return 0
    count = 0
    today = date.today()
    for index, row in data.iterrows():
        if pd.isna(row["Dividends"]) or row["Dividends"] == 0:
            continue
        div_date = index.date()
        if div_date >= today:
            continue
        dividend_per_share = float(row["Dividends"])
        for user_id in users:
            shares_owned = get_user_holdings(supabase, user_id, ticker_id)
            if shares_owned <= 0:
                continue
            total_dividend = shares_owned * dividend_per_share
            trade = {
                "user_id": user_id, "ticker_id": ticker_id, "shares": shares_owned,
                "price_per_share": dividend_per_share, "transaction_date": div_date.strftime("%Y-%m-%d"),
                "transaction_type": "CASH", "is_dividend_reinvestment": False,
                "created_at": datetime.now().isoformat()
            }
            try:
                supabase.table("suggested_trades").insert(trade).execute()
                count += 1
            except Exception as e:
                logger.error(f"Failed to suggest dividend trade for {symbol}, user {user_id}: {e}")
            if user_id in get_users_with_reinvestment(supabase, ticker_id):
                reinvest_shares = total_dividend / float(row["Close"])
                reinvest_trade = {
                    "user_id": user_id, "ticker_id": ticker_id, "shares": reinvest_shares,
                    "price_per_share": float(row["Close"]), "transaction_date": div_date.strftime("%Y-%m-%d"),
                    "transaction_type": "BUY", "is_dividend_reinvestment": True,
                    "created_at": datetime.now().isoformat()
                }
                try:
                    supabase.table("suggested_trades").insert(reinvest_trade).execute()
                    count += 1
                except Exception as e:
                    logger.error(f"Failed to suggest reinvestment for {symbol}, user {user_id}: {e}")
    if count > 0:
        logger.info(f"Updated suggested_trades table for {symbol} with {count} records")
    return count

def get_user_holdings(supabase, user_id, ticker_id):
    try:
        response = supabase.table("holdings").select("total_shares").eq("user_id", user_id).eq("ticker_id", ticker_id).limit(1).execute()
        return response.data[0]["total_shares"] if response.data else 0
    except Exception as e:
        logger.error(f"Failed to fetch holdings for user {user_id}, ticker {ticker_id}: {e}")
        return 0

def get_users_with_reinvestment(supabase, ticker_id):
    try:
        response = supabase.table("transactions").select("user_id").eq("ticker_id", ticker_id).eq("is_dividend_reinvestment", True).execute()
        return list(set(row["user_id"] for row in response.data))
    except Exception as e:
        logger.error(f"Failed to fetch reinvestment users for ticker {ticker_id}: {e}")
        return []
"""


def lambda_handler(event, context):
    try:
        backfill = event.get("backfill", False) if event else False
        supabase = get_supabase_client()
        tickers = get_tickers_from_supabase(supabase)
        if not tickers:
            logger.warning("No tickers found in Supabase")
            return {"statusCode": 400, "body": "No tickers found"}

        if not isinstance(tickers, list):
            raise ValueError(f"Tickers is not a list: {type(tickers)}")
        for i, t in enumerate(tickers):
            if not isinstance(t, dict) or "id" not in t or "symbol" not in t:
                raise ValueError(f"Ticker at index {i} missing id or symbol: {t}")

        updates_by_ticker = {}
        today = date.today()
        end_date = today + timedelta(days=1)
        users_response = supabase.table("users").select("id").execute()
        all_users = [row["id"] for row in users_response.data]

        for ticker in tickers:
            symbol = ticker["symbol"]
            ticker_id = ticker["id"]
            logger.info(f"Processing ticker: {symbol} (ID: {ticker_id})")
            try:
                exchange = ticker.get("exchange", "")
                updates_by_ticker[symbol] = set()

                last_price_update = get_last_update_date(
                    supabase, ticker_id, "historical_prices"
                )
                last_finance_update = get_last_update_date(
                    supabase, ticker_id, "yh_finance_daily"
                )
                last_calendar_update = get_last_update_date(
                    supabase, ticker_id, "calendar_events"
                )
                start_date = (
                    (today - timedelta(days=365))
                    if backfill
                    else (
                        last_price_update + timedelta(days=1)
                        if last_price_update
                        else today - timedelta(days=30)
                    )
                )
                start_date = min(start_date, today)

                if (
                    backfill
                    or start_date <= today
                    or should_update(last_finance_update)
                    or should_update(last_calendar_update)
                ):
                    data, info, yf_ticker = get_stock_data(
                        symbol, exchange, start_date, end_date
                    )
                    logger.debug(
                        f"Data types for {symbol}: data={type(data)}, info={type(info)}, yf_ticker={type(yf_ticker)}"
                    )
                    if not isinstance(info, dict):
                        logger.error(f"Skipping {symbol}: info is not a dict: {info}")
                        continue

                    if data is not None and not data.empty:
                        if save_price_data(supabase, ticker_id, symbol, data):
                            updates_by_ticker[symbol].add("historical_prices")

                    if (backfill or should_update(last_finance_update)) and info:
                        if update_ticker_info(supabase, ticker_id, symbol, info):
                            updates_by_ticker[symbol].add("tickers")
                        if save_finance_data(supabase, ticker_id, symbol, info):
                            updates_by_ticker[symbol].add("yh_finance_daily")
                        quote_type = info.get("quoteType", "EQUITY")
                        if quote_type in ["MUTUALFUND", "ETF"] and yf_ticker:
                            logger.debug(f"Attempting fund data updates for {symbol}")
                            if save_fund_data(
                                supabase,
                                ticker_id,
                                symbol,
                                yf_ticker,
                                "fund_sector_weightings",
                                "sector_weightings",
                            ):
                                updates_by_ticker[symbol].add("fund_sector_weightings")
                            if save_fund_data(
                                supabase,
                                ticker_id,
                                symbol,
                                yf_ticker,
                                "fund_top_holdings",
                                "top_holdings",
                            ):
                                updates_by_ticker[symbol].add("fund_top_holdings")
                            if save_fund_data(
                                supabase,
                                ticker_id,
                                symbol,
                                yf_ticker,
                                "fund_asset_classes",
                                "asset_classes",
                            ):
                                updates_by_ticker[symbol].add("fund_asset_classes")

                    if (backfill or should_update(last_calendar_update)) and yf_ticker:
                        if save_calendar_events(supabase, ticker_id, symbol, yf_ticker):
                            updates_by_ticker[symbol].add("calendar_events")
                else:
                    logger.info(f"No updates needed for {symbol}")
            except Exception as e:
                logger.error(f"Error processing {symbol}: {type(e).__name__}: {str(e)}")
                logger.error("Stack trace:\n" + traceback.format_exc())
                continue  # Skip to next ticker

        logger.info("Summarizing updates...")
        for symbol, tables in updates_by_ticker.items():
            if tables:
                logger.info(f"Updated tables for {symbol}: {', '.join(sorted(tables))}")
            else:
                logger.debug(f"No tables updated for {symbol}")

        total_updates = sum(len(tables) for tables in updates_by_ticker.values())
        logger.info(
            f"Completed processing {len(tickers)} tickers with {total_updates} updates"
        )
        return {
            "statusCode": 200,
            "body": f"Processed {len(tickers)} tickers, updated {total_updates} table entries",
        }
    except Exception as e:
        logger.error(f"Global error: {type(e).__name__}: {str(e)}")
        logger.error("Stack trace:\n" + traceback.format_exc())
        return {"statusCode": 500, "body": f"Internal Server Error: {str(e)}"}


if __name__ == "__main__":
    test = {"backfill": True}
    result = lambda_handler(test, None)
    print(result)
