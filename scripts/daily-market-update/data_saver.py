import logging
from datetime import datetime, date
import pandas as pd

logger = logging.getLogger(__name__)


class DataSaver:
    def __init__(self, supabase_client):
        self.supabase = supabase_client

    def get_last_update_date(self, ticker_id, table_name):
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
                logger.debug(
                    f"Last update date response for {ticker_id} in {table_name}: {response.data}"
                )
                date_str = response.data[0]["date"]
                if date_str is not None:
                    return datetime.strptime(date_str, "%Y-%m-%d").date()
                else:
                    logger.warning(
                        f"No valid date found for ticker {ticker_id} in {table_name}, date is None"
                    )
                    return None
            logger.debug(f"No entries found for ticker {ticker_id} in {table_name}")
            return None
        except Exception as e:
            logger.error(
                f"Failed to get last update date for ticker {ticker_id} in {table_name}: {e}"
            )
            return None

    def should_update(self, last_update_date, threshold_days=1):
        if not last_update_date:
            return True
        return (date.today() - last_update_date).days >= threshold_days

    def save_price_data(self, ticker_id, symbol, data):
        if data is None or data.empty:
            logger.debug(f"No price data for {symbol}")
            return 0
        price_data_list = [
            {
                "ticker_id": ticker_id,
                "date": index.strftime("%Y-%m-%d"),
                "open_price": float(row["Open"]) if not pd.isna(row["Open"]) else None,
                "high_price": float(row["High"]) if not pd.isna(row["High"]) else None,
                "low_price": float(row["Low"]) if not pd.isna(row["Low"]) else None,
                "close_price": float(row["Close"])
                if not pd.isna(row["Close"])
                else None,
                "dividends": float(row["Dividends"])
                if not pd.isna(row["Dividends"])
                else None,
                "stock_splits": float(row["Stock Splits"])
                if not pd.isna(row["Stock Splits"])
                else None,
                "volume": int(row["Volume"]) if not pd.isna(row["Volume"]) else None,
                "updated_at": datetime.now().isoformat(),
            }
            for index, row in data.iterrows()
        ]
        if not price_data_list:
            return 0
        try:
            self.supabase.table("historical_prices").upsert(
                price_data_list, on_conflict="ticker_id,date"
            ).execute()
            logger.info(
                f"Updated historical_prices for {symbol} with {len(price_data_list)} records"
            )
            return len(price_data_list)
        except Exception as e:
            logger.error(f"Failed to save price data for {symbol}: {e}")
            return 0

    def update_ticker_info(self, ticker_id, symbol, info):
        # Same logic as your `update_ticker_info` function
        if not info:
            return False
        update_data = {
            "long_business_summary": info.get("longBusinessSummary"),
            "category": info.get("category"),
            "region": info.get("region"),
            "quote_type": info.get("quoteType", "EQUITY"),
            "updated_at": datetime.now().isoformat(),
            "backfill": False,  # Set backfill to false after processing
        }
        update_data = {k: v for k, v in update_data.items() if v is not None}
        if not update_data:
            return False
        try:
            self.supabase.table("tickers").update(update_data).eq(
                "id", ticker_id
            ).execute()
            logger.info(f"Updated tickers table for {symbol}")
            return True
        except Exception as e:
            logger.error(f"Failed to update tickers table for {symbol}: {e}")
            return False

    def save_finance_data(self, ticker_id, symbol, info):
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
            self.supabase.table("yh_finance_daily").upsert(
                [finance_data],
                on_conflict=["ticker_id"],  # Overwrite based on ticker_id alone
            ).execute()
            logger.info(f"Updated yh_finance_daily table for {symbol}")
            return True
        except Exception as e:
            logger.error(f"Failed to update yh_finance_daily for {symbol}: {e}")
            return False

    def save_calendar_events(self, ticker_id, symbol, ticker):
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
                earnings_dates_str = [
                    d.strftime("%Y-%m-%d") for d in earnings_dates if d
                ]
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
                    if (
                        "Earnings Low" in calendar
                        and calendar["Earnings Low"] is not None
                    ):
                        try:
                            earnings_event["earnings_low"] = float(
                                calendar["Earnings Low"]
                            )
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
                    if (
                        "Revenue High" in calendar
                        and calendar["Revenue High"] is not None
                    ):
                        try:
                            earnings_event["revenue_high"] = int(
                                calendar["Revenue High"]
                            )
                        except (ValueError, TypeError) as e:
                            logger.warning(
                                f"Invalid Revenue High for {symbol}: {calendar['Revenue High']} - {e}"
                            )
                    if (
                        "Revenue Low" in calendar
                        and calendar["Revenue Low"] is not None
                    ):
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
            self.supabase.table("calendar_events").upsert(
                events_data, on_conflict="ticker_id,date,event_type"
            ).execute()
            logger.info(
                f"Updated calendar_events table for {symbol} with {len(events_data)} events"
            )
            return True
        except Exception as e:
            logger.error(f"Failed to save calendar events for {symbol}: {e}")
            return False

    def save_fund_data(self, ticker_id, symbol, ticker, table_name, data_key):
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
