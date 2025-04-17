"""
Transformers for converting between source and database models.
"""

from typing import List, Dict, Set, Optional
from datetime import date

from src.models.source_models import YFTickerInfo, YFPriceHistory
from src.models.source_models import YFCalendar, YFFundData
from src.models.db_models import DBHistoricalPrice, DBFinanceDaily, DBTickerInfo
from src.models.db_models import (
    DBCalendarEvent,
    DBFundHolding,
    DBSectorWeighting,
    DBAssetClass,
)

from src.core.logging_config import setup_logging

logger = setup_logging(name="model_transformers")


class ModelTransformer:
    """
    Transforms data between source models and database models.
    """

    @staticmethod
    def transform_historical_prices(
        source: YFPriceHistory, ticker_id: str
    ) -> List[DBHistoricalPrice]:
        """
        Transform price history to database model.

        Args:
            source: Source price history data
            ticker_id: Database ticker ID

        Returns:
            List of database historical price models
        """
        if not source or not source.data:
            return []

        result = []

        for date_obj, price_data in source.data.items():
            date_str = date_obj.strftime("%Y-%m-%d")

            db_price = DBHistoricalPrice(
                ticker_id=ticker_id,
                date=date_str,
                open_price=price_data.open,
                high_price=price_data.high,
                low_price=price_data.low,
                close_price=price_data.close,
                volume=price_data.volume,
                dividends=price_data.dividends,
                stock_splits=price_data.stock_splits,
            )

            result.append(db_price)

        return result

    @staticmethod
    def transform_ticker_info(
        source: YFTickerInfo, ticker_id: str, backfill: bool = False
    ) -> DBTickerInfo:
        """
        Transform ticker info to database model.

        Args:
            source: Source ticker info
            ticker_id: Database ticker ID
            backfill: Whether this is a backfill operation

        Returns:
            Database ticker info model
        """
        return DBTickerInfo(
            id=ticker_id,
            name=source.long_name,
            quote_type=source.quote_type or "EQUITY",
            region=source.region,
            category=source.category,
            sector_id=None,
            industry_id=None,
            long_business_summary=source.long_business_summary,
            dividend_amount=source.last_dividend_value,
            backfill=backfill,
        )

    @staticmethod
    def transform_finance_daily(source: YFTickerInfo, ticker_id: str) -> DBFinanceDaily:
        """
        Transform ticker info to finance daily data.

        Args:
            source: Source ticker info
            ticker_id: Database ticker ID

        Returns:
            Database finance daily model
        """
        # Get fund inception date
        fund_inception_date = source.get_fund_inception_date()
        fund_inception_str = None
        if fund_inception_date:
            fund_inception_str = fund_inception_date.strftime("%Y-%m-%d")

        return DBFinanceDaily(
            ticker_id=ticker_id,
            date=date.today().strftime("%Y-%m-%d"),
            # Market data
            regular_market_price=source.regular_market_price,
            regular_market_change_percent=source.regular_market_change_percent,
            regular_market_volume=source.regular_market_volume,
            market_cap=source.market_cap,
            shares_outstanding=source.shares_outstanding,
            # Technical indicators
            fifty_two_week_low=source.fifty_two_week_low,
            fifty_two_week_high=source.fifty_two_week_high,
            fifty_day_average=source.fifty_day_average,
            two_hundred_day_average=source.two_hundred_day_average,
            # Fundamentals
            dividend_yield=source.dividend_yield,
            trailing_pe=source.trailing_pe,
            # Fund specific
            total_assets=source.total_assets,
            nav_price=source.nav_price,
            **{
                "yield": source.yield_value
            },  # Use a dictionary to assign the reserved keyword
            ytd_return=source.ytd_return,
            fund_family=source.fund_family,
            fund_inception_date=fund_inception_str,
            legal_type=source.legal_type,
            three_year_average_return=source.three_year_average_return,
            five_year_average_return=source.five_year_average_return,
            net_expense_ratio=source.net_expense_ratio,
            # Beta
            beta=source.beta,
            beta3year=source.beta,
        )

    @staticmethod
    def transform_calendar_events(
        source: YFCalendar, ticker_id: str
    ) -> List[DBCalendarEvent]:
        """
        Transform calendar data to database models.

        Args:
            source: Source calendar data
            ticker_id: Database ticker ID

        Returns:
            List of database calendar event models
        """
        if not source:
            return []

        result = []

        # Process dividend date
        if source.dividend_date:
            date_str = source.dividend_date.strftime("%Y-%m-%d")
            event = DBCalendarEvent(
                ticker_id=ticker_id, date=date_str, event_type="dividend"
            )
            result.append(event)

        # Process ex-dividend date
        if source.ex_dividend_date:
            date_str = source.ex_dividend_date.strftime("%Y-%m-%d")
            event = DBCalendarEvent(
                ticker_id=ticker_id, date=date_str, event_type="ex_dividend"
            )
            result.append(event)

        # Process earnings dates
        if source.earnings_dates and len(source.earnings_dates) > 0:
            earnings_dates_str = [d.strftime("%Y-%m-%d") for d in source.earnings_dates]

            event = DBCalendarEvent(
                ticker_id=ticker_id,
                date=earnings_dates_str[0],  # Primary date
                event_type="earnings",
                earnings_dates=earnings_dates_str,
                earnings_high=source.earnings_high,
                earnings_low=source.earnings_low,
                earnings_average=source.earnings_average,
                revenue_high=source.revenue_high,
                revenue_low=source.revenue_low,
                revenue_average=source.revenue_average,
            )
            result.append(event)

        return result

    @staticmethod
    def transform_fund_holdings(
        source: Optional[YFFundData], ticker_id: str
    ) -> Dict[str, List]:
        """
        Transform fund data to database models.

        Args:
            source: Source fund data
            ticker_id: Database ticker ID

        Returns:
            Dictionary with lists of database models for each fund data type
        """
        result = {"holdings": [], "sectors": [], "assets": []}

        if not source:
            return result

        today_str = date.today().strftime("%Y-%m-%d")

        # Process top holdings
        if source.top_holdings and source.top_holdings.holdings:
            for symbol, holding in source.top_holdings.holdings.items():
                db_holding = DBFundHolding(
                    ticker_id=ticker_id,
                    holding_symbol=symbol,
                    holding_name=holding.name,
                    weight=holding.holding_percent * 100,  # Convert to percentage
                    date=today_str,
                )
                result["holdings"].append(db_holding)

        # Process sector weightings
        if source.sector_weightings and source.sector_weightings.sectors:
            for sector, weight in source.sector_weightings.sectors.items():
                db_sector = DBSectorWeighting(
                    ticker_id=ticker_id,
                    sector_name=sector,
                    weight=weight * 100,  # Convert to percentage
                    date=today_str,
                )
                result["sectors"].append(db_sector)

        # Process asset allocation
        if source.asset_allocation and source.asset_allocation.assets:
            for asset_class, weight in source.asset_allocation.assets.items():
                db_asset = DBAssetClass(
                    ticker_id=ticker_id,
                    asset_class=asset_class,
                    weight=weight * 100,  # Convert to percentage
                    date=today_str,
                )
                result["assets"].append(db_asset)

        return result

