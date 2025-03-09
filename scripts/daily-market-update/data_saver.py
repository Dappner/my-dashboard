import logging
from datetime import datetime, date
from typing import Optional, Dict

import pandas as pd
from models import PriceData, TickerInfo, FinanceData, CalendarEvent

logger = logging.getLogger(__name__)


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

    def should_update(
        self, last_update_date: Optional[date], threshold_days: int = 1
    ) -> bool:
        if not last_update_date:
            return True
        return (date.today() - last_update_date).days >= threshold_days

    def save_price_data(self, ticker_id: str, symbol: str, data: pd.DataFrame) -> int:
        if data is None or data.empty:
            logger.debug(f"No price data for {symbol}")
            return 0

        price_data_list = [
            PriceData(
                ticker_id=ticker_id,
                date=index,
                open_price=float(row["Open"]) if not pd.isna(row["Open"]) else None,
                high_price=float(row["High"]) if not pd.isna(row["High"]) else None,
                low_price=float(row["Low"]) if not pd.isna(row["Low"]) else None,
                close_price=float(row["Close"]) if not pd.isna(row["Close"]) else None,
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

        if not price_data_list:
            return 0
        try:
            self.supabase.table("historical_prices").upsert(
                price_data_list, on_conflict="ticker_id,date"
            ).execute()
            return len(price_data_list)
        except Exception as e:
            logger.error(f"Failed to save price data for {symbol}: {e}")
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
        today = date.today().strftime("%Y-%m-%d")
        quote_type = info.get("quoteType", "EQUITY")
        finance_data = FinanceData(
            ticker_id=ticker_id,
            regular_market_price=info.get("regularMarketPrice")
            if quote_type in ["EQUITY", "ETF"]
            else None,
            regular_market_change_percent=info.get("regularMarketChangePercent")
            if quote_type in ["EQUITY", "ETF"]
            else None,
            market_cap=info.get("marketCap")
            if quote_type in ["EQUITY", "ETF"]
            else None,
            dividend_yield=info.get("dividendYield"),
            fifty_two_week_low=info.get("fiftyTwoWeekLow")
            if quote_type in ["EQUITY", "ETF"]
            else None,
            fifty_two_week_high=info.get("fiftyTwoWeekHigh")
            if quote_type in ["EQUITY", "ETF"]
            else None,
            fifty_day_average=info.get("fiftyDayAverage")
            if quote_type in ["EQUITY", "ETF"]
            else None,
            two_hundred_day_average=info.get("twoHundredDayAverage")
            if quote_type in ["EQUITY", "ETF"]
            else None,
            trailing_pe=info.get("trailingPE") if quote_type == "EQUITY" else None,
            total_assets=info.get("totalAssets")
            if quote_type in ["MUTUALFUND", "ETF"]
            else None,
            nav_price=info.get("navPrice")
            if quote_type in ["MUTUALFUND", "ETF"]
            else None,
            yield_=info.get("yield") if quote_type in ["MUTUALFUND", "ETF"] else None,
            ytd_return=info.get("ytdReturn"),
            beta3year=info.get("beta"),
            fund_family=info.get("fundFamily")
            if quote_type in ["MUTUALFUND", "ETF"]
            else None,
            fund_inception_date=datetime.fromtimestamp(
                info.get("fundInceptionDate")
            ).strftime("%Y-%m-%d")
            if info.get("fundInceptionDate")
            else None,
            legal_type=info.get("legalType")
            if quote_type in ["MUTUALFUND", "ETF"]
            else None,
            three_year_average_return=info.get("threeYearAverageReturn")
            if quote_type in ["MUTUALFUND", "ETF"]
            else None,
            five_year_average_return=info.get("fiveYearAverageReturn")
            if quote_type in ["MUTUALFUND", "ETF"]
            else None,
            net_expense_ratio=info.get("netExpenseRatio")
            if quote_type in ["MUTUALFUND", "ETF"]
            else None,
            shares_outstanding=info.get("sharesOutstanding")
            if quote_type in ["EQUITY", "ETF"]
            else None,
            trailing_three_month_returns=info.get("trailingThreeMonthReturns")
            if quote_type in ["MUTUALFUND", "ETF"]
            else None,
            trailing_three_month_nav_returns=info.get("trailingThreeMonthNavReturns")
            if quote_type in ["MUTUALFUND", "ETF"]
            else None,
        ).dict(exclude_none=True)

        finance_data = {k: v for k, v in finance_data.items() if v is not None}
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
                        date=earnings_dates_str[0],  # Use first date as primary
                        event_type="earnings",
                        earnings_dates=earnings_dates_str,
                        earnings_high=float(calendar["Earnings High"])
                        if "Earnings High" in calendar
                        and calendar["Earnings High"] is not None
                        else None,
                        earnings_low=float(calendar["Earnings Low"])
                        if "Earnings Low" in calendar
                        and calendar["Earnings Low"] is not None
                        else None,
                        earnings_average=float(calendar["Earnings Average"])
                        if "Earnings Average" in calendar
                        and calendar["Earnings Average"] is not None
                        else None,
                        revenue_high=int(calendar["Revenue High"])
                        if "Revenue High" in calendar
                        and calendar["Revenue High"] is not None
                        else None,
                        revenue_low=int(calendar["Revenue Low"])
                        if "Revenue Low" in calendar
                        and calendar["Revenue Low"] is not None
                        else None,
                        revenue_average=int(calendar["Revenue Average"])
                        if "Revenue Average" in calendar
                        and calendar["Revenue Average"] is not None
                        else None,
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
