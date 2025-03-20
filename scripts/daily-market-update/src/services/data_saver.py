from datetime import datetime, date
from typing import Optional, Dict
import pandas as pd
from src.models.data_models import PriceData, TickerInfo, FinanceData, CalendarEvent
from pydantic import ValidationError
from src.core.logging_config import setup_logging
from src.core.util import get_value

logger = setup_logging(name="data_saver")


def should_update(last_update_date: Optional[date], threshold_days: int = 1) -> bool:
    if not last_update_date:
        return True
    return (date.today() - last_update_date).days >= threshold_days


class DataSaver:
    def __init__(self, supabase_client):
        self.supabase = supabase_client

    def get_last_update_date(self, ticker_id: str, table_name: str) -> Optional[date]:
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

    def save_price_data(self, ticker_id: str, symbol: str, data: pd.DataFrame) -> int:
        if data is None or data.empty:
            logger.debug(f"No price data for {symbol}")
            return 0

        try:
            price_data_list = [
                PriceData(
                    ticker_id=ticker_id,
                    date=index,
                    open_price=float(row["Open"]) if not pd.isna(row["Open"]) else None,
                    high_price=float(row["High"]) if not pd.isna(row["High"]) else None,
                    low_price=float(row["Low"]) if not pd.isna(row["Low"]) else None,
                    close_price=float(row["Close"])
                    if not pd.isna(row["Close"])
                    else None,
                    dividends=float(row["Dividends"])
                    if not pd.isna(row["Dividends"])
                    else None,
                    stock_splits=float(row["Stock Splits"])
                    if not pd.isna(row["Stock Splits"])
                    else None,
                    volume=int(row["Volume"]) if not pd.isna(row["Volume"]) else None,
                ).dict(exclude_none=True)
                for index, row in data.iterrows()
            ]

            try:
                response = (
                    self.supabase.table("historical_prices")
                    .upsert(price_data_list, on_conflict="ticker_id,date")
                    .execute()
                )
            except Exception as e:
                logger.error(
                    f"Error saving to supabse for {symbol}", extra={"error": str(e)}
                )

            logger.info(f"Saved {len(price_data_list)} price records for {symbol}")
            return len(price_data_list)
        except ValidationError as e:
            logger.error(f"Validation error for {symbol}", extra={"error": str(e)})
            return 0
        except Exception as e:
            logger.exception(f"Failed to save price data for {symbol}")
            return 0

    def update_ticker_info(
        self, ticker_id: str, symbol: str, info: Dict, backfill: bool = False
    ) -> bool:
        if not info:
            return False

        ticker_info = TickerInfo(
            long_business_summary=info.get("longBusinessSummary"),
            category=info.get("category"),
            region=info.get("region"),
            quote_type=info.get("quoteType", "EQUITY"),
            backfill=False,
            industry=info.get("industryKey") if backfill else None,
            sector=info.get("sectorKey") if backfill else None,
            dividend_amount=info.get("lastDividendValue") if backfill else None,
        ).dict(exclude_none=True)

        if not ticker_info:
            return False
        try:
            self.supabase.table("tickers").update(ticker_info).eq(
                "id", ticker_id
            ).execute()
            return True
        except Exception as e:
            logger.error(f"Failed to update tickers table for {symbol}: {e}")
            return False

    def save_finance_data(self, ticker_id, symbol, info):
        """Saves finance data to yh_finance_daily in a batched request."""
        if not info:
            logger.debug(f"No finance data available for {symbol}")
            return False

        quote_type = info.get("quoteType", "EQUITY")
        field_configs = {
            "regular_market_price": {"types": ["EQUITY", "ETF"], "cast": float},
            "regular_market_change_percent": {
                "types": ["EQUITY", "ETF"],
                "cast": float,
            },
            "market_cap": {"types": ["EQUITY", "ETF"], "cast": int},
            "dividend_yield": {"types": None, "cast": float},  # No type restriction
            "fifty_two_week_low": {"types": ["EQUITY", "ETF"], "cast": float},
            "fifty_two_week_high": {"types": ["EQUITY", "ETF"], "cast": float},
            "fifty_day_average": {"types": ["EQUITY", "ETF"], "cast": float},
            "two_hundred_day_average": {"types": ["EQUITY", "ETF"], "cast": float},
            "trailing_pe": {"types": ["EQUITY"], "cast": float},
            "total_assets": {"types": ["MUTUALFUND", "ETF"], "cast": int},
            "nav_price": {"types": ["MUTUALFUND", "ETF"], "cast": float},
            "yield_": {"types": ["MUTUALFUND", "ETF"], "cast": float},
            "ytd_return": {"types": None, "cast": float},
            "beta3year": {
                "types": None,
                "cast": float,
                "key": "beta",
            },  # Maps to "beta" in info
            "fund_family": {"types": ["MUTUALFUND", "ETF"], "cast": str},
            "fund_inception_date": {
                "types": ["MUTUALFUND", "ETF"],
                "cast": lambda x: datetime.fromtimestamp(x).strftime("%Y-%m-%d")
                if x
                else None,
            },
            "legal_type": {"types": ["MUTUALFUND", "ETF"], "cast": str},
            "three_year_average_return": {
                "types": ["MUTUALFUND", "ETF"],
                "cast": float,
            },
            "five_year_average_return": {"types": ["MUTUALFUND", "ETF"], "cast": float},
            "net_expense_ratio": {"types": ["MUTUALFUND", "ETF"], "cast": float},
            "shares_outstanding": {"types": ["EQUITY", "ETF"], "cast": int},
            "trailing_three_month_returns": {
                "types": ["MUTUALFUND", "ETF"],
                "cast": float,
            },
            "trailing_three_month_nav_returns": {
                "types": ["MUTUALFUND", "ETF"],
                "cast": float,
            },
        }

        finance_kwargs = {"ticker_id": ticker_id}
        for field, config in field_configs.items():
            if config["types"] is None or quote_type in config["types"]:
                key = config.get(
                    "key", field
                )  # Use "key" if specified, else field name
                finance_kwargs[field] = get_value(info, key, cast_type=config["cast"])

        finance_data = FinanceData(**finance_kwargs).dict(exclude_none=True)

        if len(finance_data) <= 3:  # Only ticker_id, date, and updated_at
            logger.debug(f"Insufficient finance data for {symbol}")
            return False

        try:
            self.supabase.table("yh_finance_daily").upsert(
                [finance_data],
                on_conflict=["ticker_id"],
            ).execute()
            return True
        except Exception as e:
            logger.error(f"Failed to update yh_finance_daily for {symbol}: {e}")
            return False

    def save_calendar_events(self, ticker_id, symbol, ticker):
        """Saves calendar events from yfinance to the calendar_events table."""
        if not hasattr(ticker, "calendar"):
            logger.debug(f"No calendar attribute available for {symbol}")
            return False

        try:
            calendar = ticker.calendar
        except Exception as e:
            logger.warning(f"Failed to fetch calendar data for {symbol}: {e}")
            calendar = None

        if calendar is None or (isinstance(calendar, dict) and not calendar):
            logger.debug(f"No calendar data available or empty for {symbol}")
            return False

        events_data = []

        # Handle Dividend Date
        if "Dividend Date" in calendar and calendar["Dividend Date"]:
            events_data.append(
                CalendarEvent(
                    ticker_id=str(ticker_id),
                    date=calendar["Dividend Date"].strftime("%Y-%m-%d"),
                    event_type="dividend",
                ).dict(exclude_none=True)
            )

        if "Ex-Dividend Date" in calendar and calendar["Ex-Dividend Date"]:
            events_data.append(
                CalendarEvent(
                    ticker_id=str(ticker_id),
                    date=calendar["Ex-Dividend Date"].strftime("%Y-%m-%d"),
                    event_type="ex_dividend",
                ).dict(exclude_none=True)
            )

        if "Earnings Date" in calendar and calendar["Earnings Date"]:
            earnings_dates = calendar["Earnings Date"]
            if isinstance(earnings_dates, list) and earnings_dates:
                earnings_dates_str = [
                    d.strftime("%Y-%m-%d") for d in earnings_dates if d
                ]
                if earnings_dates_str:
                    earnings_event = CalendarEvent(
                        ticker_id=str(ticker_id),
                        date=earnings_dates_str[0],
                        event_type="earnings",
                        earnings_dates=earnings_dates_str,
                        earnings_high=get_value(calendar, "Earnings High", float),
                        earnings_low=get_value(calendar, "Earnings Low", float),
                        earnings_average=get_value(calendar, "Earnings Average", float),
                        revenue_high=get_value(calendar, "Revenue High", int),
                        revenue_low=get_value(calendar, "Revenue Low", int),
                        revenue_average=get_value(calendar, "Revenue Average", int),
                    ).dict(exclude_none=True)
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

    def save_fund_top_holdings(
        self, ticker_id, symbol, ticker, data_key="top_holdings"
    ):
        """Saves fund top holdings data from yfinance."""
        logger.debug(
            f"Attempting to save {data_key} for {symbol}",
            extra={"table": "fund_top_holdings"},
        )

        if not hasattr(ticker, "funds_data"):
            logger.error(f"No funds_data attribute available for {symbol}")
            return False

        data = getattr(ticker.funds_data, data_key, None)
        if data is None or not isinstance(data, pd.DataFrame):
            logger.error(f"No valid {data_key} DataFrame available for {symbol}")
            return False

        logger.debug(f"Raw {data_key} data for {symbol}", extra={"data": str(data)})
        upsert_data = []

        try:
            for index, row in data.iterrows():
                upsert_data.append(
                    {
                        "ticker_id": ticker_id,
                        "holding_symbol": index,
                        "holding_name": row["Name"],
                        "weight": float(row["Holding Percent"]) * 100,
                        "date": date.today().strftime("%Y-%m-%d"),
                        "updated_at": datetime.now().isoformat(),
                    }
                )
        except KeyError as e:
            logger.error(
                f"Error processing top holdings DataFrame for {symbol}: Missing key {e}"
            )
            return False

        return self._upsert_data(
            upsert_data,
            "fund_top_holdings",
            symbol,
            data_key,
            on_conflict="ticker_id,holding_symbol",
        )

    def save_fund_sector_weightings(
        self, ticker_id, symbol, ticker, data_key="sector_weightings"
    ):
        """Saves fund sector weightings data from yfinance."""
        logger.debug(
            f"Attempting to save {data_key} for {symbol}",
            extra={"table": "fund_sector_weightings"},
        )

        if not hasattr(ticker, "funds_data"):
            logger.error(f"No funds_data attribute available for {symbol}")
            return False

        data = getattr(ticker.funds_data, data_key, None)
        if data is None or not isinstance(data, dict):
            logger.error(f"No valid {data_key} dictionary available for {symbol}")
            return False

        logger.debug(f"Raw {data_key} data for {symbol}", extra={"data": str(data)})
        upsert_data = []

        try:
            for sector_name, weight in data.items():
                upsert_data.append(
                    {
                        "ticker_id": ticker_id,
                        "sector_name": sector_name.replace("_", "-"),
                        "weight": float(weight) * 100,
                        "date": date.today().strftime("%Y-%m-%d"),
                        "updated_at": datetime.now().isoformat(),
                    }
                )
        except Exception as e:
            logger.error(f"Error processing sector weightings for {symbol}: {e}")
            return False

        return self._upsert_data(
            upsert_data,
            "fund_sector_weightings",
            symbol,
            data_key,
            on_conflict="ticker_id,sector_name",
        )

    def save_fund_asset_classes(
        self, ticker_id, symbol, ticker, data_key="asset_allocation"
    ):
        """Saves fund asset classes data from yfinance."""
        logger.debug(
            f"Attempting to save {data_key} for {symbol}",
            extra={"table": "fund_asset_classes"},
        )

        if not hasattr(ticker, "funds_data"):
            logger.error(f"No funds_data attribute available for {symbol}")
            return False

        data = getattr(ticker.funds_data, data_key, None)
        if data is None or not isinstance(data, dict):
            logger.error(f"No valid {data_key} dictionary available for {symbol}")
            return False

        logger.debug(f"Raw {data_key} data for {symbol}", extra={"data": str(data)})
        upsert_data = []

        try:
            for asset_class, weight in data.items():
                upsert_data.append(
                    {
                        "ticker_id": ticker_id,
                        "asset_class": asset_class,
                        "weight": float(weight) * 100,
                        "date": date.today().strftime("%Y-%m-%d"),
                        "updated_at": datetime.now().isoformat(),
                    }
                )
        except Exception as e:
            logger.error(f"Error processing asset classes for {symbol}: {e}")
            return False

        return self._upsert_data(
            upsert_data,
            "fund_asset_classes",
            symbol,
            data_key,
            on_conflict="ticker_id,asset_class",
        )

    def _upsert_data(self, upsert_data, table_name, symbol, data_key, on_conflict):
        """Helper method to handle the database upsert operation."""
        if not upsert_data:
            logger.info(
                f"No valid {data_key} data to save for {symbol} after processing"
            )
            return False

        logger.debug(
            f"Preparing to upsert {len(upsert_data)} records",
            extra={"table": table_name, "data_sample": upsert_data[:1]},
        )

        try:
            self.supabase.table(table_name).upsert(
                upsert_data, on_conflict=on_conflict
            ).execute()
            logger.info(
                f"Successfully saved {len(upsert_data)} {data_key} records for {symbol}"
            )
            return True
        except Exception as e:
            logger.exception(f"Database upsert failed for {symbol} {data_key}")
            return False
