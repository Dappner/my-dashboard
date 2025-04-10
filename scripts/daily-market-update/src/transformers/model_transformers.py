"""
Model transformers to convert between YFinance source models and Supabase database models.

These functions handle the transformation logic between different data representations,
allowing clean separation between external APIs and internal database structure.
"""

from datetime import datetime, date
from typing import Dict, List, Optional, Any, Tuple

from src.models.source_models import (
    YFTickerData, YFTickerInfo, YFPriceHistory, YFCalendar,
    YFFundData, YFHoldings, YFSectorWeightings, YFAssetAllocation
)
from src.models.db_models import (
    DBHistoricalPrice, DBTickerInfo, DBFinanceDaily, DBCalendarEvent,
    DBFundHolding, DBSectorWeighting, DBAssetClass, DBEventType
)


def transform_historical_prices(
        yf_data: YFPriceHistory,
        ticker_id: str
) -> List[DBHistoricalPrice]:
    """
    Transform YFinance price history to database historical prices.

    Args:
        yf_data: YFinance price history
        ticker_id: Database ticker ID

    Returns:
        List of database historical price models
    """
    if not yf_data or not yf_data.data:
        return []

    result = []

    for date_obj, price_row in yf_data.data.items():
        # Convert date to string format
        date_str = date_obj.strftime("%Y-%m-%d")

        # Create database model
        db_price = DBHistoricalPrice(
            ticker_id=ticker_id,
            date=date_str,
            open_price=price_row.open,
            high_price=price_row.high,
            low_price=price_row.low,
            close_price=price_row.close,
            volume=price_row.volume,
            dividends=price_row.dividends,
            stock_splits=price_row.stock_splits
        )

        result.append(db_price)

    return result


def transform_ticker_info(
        yf_info: YFTickerInfo,
        ticker_id: str
) -> DBFinanceDaily:
    """
    Transform YFinance ticker info to database daily finance data.

    Args:
        yf_info: YFinance ticker info
        ticker_id: Database ticker ID

    Returns:
        Database finance daily model
    """
    # Get fund inception date
    fund_inception_date = None
    if yf_info.fund_inception_date:
        try:
            inception_date = datetime.fromtimestamp(yf_info.fund_inception_date).date()
            fund_inception_date = inception_date.strftime("%Y-%m-%d")
        except (ValueError, TypeError, OverflowError):
            pass

    # Convert to database model
    return DBFinanceDaily(
        ticker_id=ticker_id,
        date=date.today().strftime("%Y-%m-%d"),

        # Market data
        regular_market_price=yf_info.regular_market_price,
        regular_market_change_percent=yf_info.regular_market_change_percent,
        regular_market_volume=yf_info.regular_market_volume,
        market_cap=yf_info.market_cap,
        shares_outstanding=yf_info.shares_outstanding,

        # Technical indicators
        fifty_two_week_low=yf_info.fifty_two_week_low,
        fifty_two_week_high=yf_info.fifty_two_week_high,
        fifty_day_average=yf_info.fifty_day_average,
        two_hundred_day_average=yf_info.two_hundred_day_average,

        # Stock-specific fields
        dividend_yield=yf_info.dividend_yield,
        trailing_pe=yf_info.trailing_pe,

        # Fund-specific fields
        total_assets=yf_info.total_assets,
        nav_price=yf_info.nav_price,
        yield_=yf_info.yield_value,  # Changed from yield_
        ytd_return=yf_info.ytd_return,
        three_year_average_return=yf_info.three_year_average_return,
        five_year_average_return=yf_info.five_year_average_return,
        fund_family=yf_info.fund_family,
        fund_inception_date=fund_inception_date,
        legal_type=yf_info.legal_type,
        net_expense_ratio=yf_info.net_expense_ratio,

        # Beta values
        beta=yf_info.beta,
        beta3year=yf_info.beta  # Using the same value as regular beta
    )


def transform_calendar_events(
        yf_calendar: YFCalendar,
        ticker_id: str
) -> List[DBCalendarEvent]:
    """
    Transform YFinance calendar to database calendar events.

    Args:
        yf_calendar: YFinance calendar
        ticker_id: Database ticker ID

    Returns:
        List of database calendar event models
    """
    if not yf_calendar:
        return []

    result = []

    # Process dividend date
    if yf_calendar.dividend_date:
        if isinstance(yf_calendar.dividend_date, (datetime, date)):
            date_str = yf_calendar.dividend_date.strftime("%Y-%m-%d")
            db_dividend = DBCalendarEvent(
                ticker_id=ticker_id,
                date=date_str,
                event_type=DBEventType.DIVIDEND
            )
            result.append(db_dividend)

    # Process ex-dividend date
    if yf_calendar.ex_dividend_date:
        if isinstance(yf_calendar.ex_dividend_date, (datetime, date)):
            date_str = yf_calendar.ex_dividend_date.strftime("%Y-%m-%d")
            db_ex_dividend = DBCalendarEvent(
                ticker_id=ticker_id,
                date=date_str,
                event_type=DBEventType.EX_DIVIDEND
            )
            result.append(db_ex_dividend)

    # Process earnings dates
    if yf_calendar.earnings_dates:
        earnings_dates = yf_calendar.earnings_dates
        if earnings_dates and isinstance(earnings_dates, list) and len(earnings_dates) > 0:
            # Convert all dates to string format
            earnings_dates_str = [
                d.strftime("%Y-%m-%d") for d in earnings_dates
                if isinstance(d, (datetime, date))
            ]

            if earnings_dates_str:
                # Use the first date as the primary date
                primary_date = earnings_dates_str[0]

                # Create earnings event
                db_earnings = DBCalendarEvent(
                    ticker_id=ticker_id,
                    date=primary_date,
                    event_type=DBEventType.EARNINGS,
                    earnings_dates=earnings_dates_str,
                    earnings_high=yf_calendar.earnings_high,
                    earnings_low=yf_calendar.earnings_low,
                    earnings_average=yf_calendar.earnings_average,
                    revenue_high=yf_calendar.revenue_high,
                    revenue_low=yf_calendar.revenue_low,
                    revenue_average=yf_calendar.revenue_average
                )

                result.append(db_earnings)

    return result


def transform_fund_holdings(
        yf_holdings: YFHoldings,
        ticker_id: str
) -> List[DBFundHolding]:
    """
    Transform YFinance fund holdings to database fund holdings.

    Args:
        yf_holdings: YFinance fund holdings
        ticker_id: Database ticker ID

    Returns:
        List of database fund holding models
    """
    if not yf_holdings or not yf_holdings.holdings:
        return []

    result = []
    current_date = date.today().strftime("%Y-%m-%d")

    for symbol, holding in yf_holdings.holdings.items():
        db_holding = DBFundHolding(
            ticker_id=ticker_id,
            holding_symbol=symbol,
            holding_name=holding.name,
            weight=holding.holding_percent * 100,  # Convert to percentage
            date=current_date
        )

        result.append(db_holding)

    return result


def transform_sector_weightings(
        yf_sectors: YFSectorWeightings,
        ticker_id: str
) -> List[DBSectorWeighting]:
    """
    Transform YFinance sector weightings to database sector weightings.

    Args:
        yf_sectors: YFinance sector weightings
        ticker_id: Database ticker ID

    Returns:
        List of database sector weighting models
    """
    if not yf_sectors or not yf_sectors.sectors:
        return []

    result = []
    current_date = date.today().strftime("%Y-%m-%d")

    for sector_name, weight in yf_sectors.sectors.items():
        db_sector = DBSectorWeighting(
            ticker_id=ticker_id,
            sector_name=sector_name,
            weight=weight * 100,  # Convert to percentage
            date=current_date
        )

        result.append(db_sector)

    return result


def transform_asset_allocation(
        yf_assets: YFAssetAllocation,
        ticker_id: str
) -> List[DBAssetClass]:
    """
    Transform YFinance asset allocation to database asset classes.

    Args:
        yf_assets: YFinance asset allocation
        ticker_id: Database ticker ID

    Returns:
        List of database asset class models
    """
    if not yf_assets or not yf_assets.assets:
        return []

    result = []
    current_date = date.today().strftime("%Y-%m-%d")

    for asset_class, weight in yf_assets.assets.items():
        db_asset = DBAssetClass(
            ticker_id=ticker_id,
            asset_class=asset_class,
            weight=weight * 100,  # Convert to percentage
            date=current_date
        )

        result.append(db_asset)

    return result


def transform_finance_daily(
        yf_info: YFTickerInfo,
        ticker_id: str
) -> DBFinanceDaily:
    """
    Transform YFinance ticker info to database daily finance data.

    Args:
        yf_info: YFinance ticker info
        ticker_id: Database ticker ID

    Returns:
        Database finance daily model
    """
    # Get fund inception date
    fund_inception_date = None
    if yf_info.fundInceptionDate:
        try:
            inception_date = datetime.fromtimestamp(yf_info.fundInceptionDate).date()
            fund_inception_date = inception_date.strftime("%Y-%m-%d")
        except (ValueError, TypeError, OverflowError):
            pass

    # Convert to database model
    return DBFinanceDaily(
        ticker_id=ticker_id,
        date=date.today().strftime("%Y-%m-%d"),

        # Market data
        regular_market_price=yf_info.regularMarketPrice,
        regular_market_change_percent=yf_info.regularMarketChangePercent,
        regular_market_volume=yf_info.regularMarketVolume,
        market_cap=yf_info.marketCap,
        shares_outstanding=yf_info.sharesOutstanding,

        # Technical indicators
        fifty_two_week_low=yf_info.fiftyTwoWeekLow,
        fifty_two_week_high=yf_info.fiftyTwoWeekHigh,
        fifty_day_average=yf_info.fiftyDayAverage,
        two_hundred_day_average=yf_info.twoHundredDayAverage,

        # Stock-specific fields
        dividend_yield=yf_info.dividendYield,
        trailing_pe=yf_info.trailingPE,

        # Fund-specific fields
        total_assets=yf_info.totalAssets,
        nav_price=yf_info.navPrice,
        yield_=yf_info.yield_,
        ytd_return=yf_info.ytdReturn,
        three_year_average_return=yf_info.threeYearAverageReturn,
        five_year_average_return=yf_info.fiveYearAverageReturn,
        fund_family=yf_info.fundFamily,
        fund_inception_date=fund_inception_date,
        legal_type=yf_info.legalType,
        net_expense_ratio=yf_info.netExpenseRatio,

        # Beta values
        beta=yf_info.beta,
        beta3year=yf_info.beta  # Using the same value as regular beta
    )


def transform_calendar_events(
        yf_calendar: YFCalendar,
        ticker_id: str
) -> List[DBCalendarEvent]:
    """
    Transform YFinance calendar to database calendar events.

    Args:
        yf_calendar: YFinance calendar
        ticker_id: Database ticker ID

    Returns:
        List of database calendar event models
    """
    if not yf_calendar:
        return []

    result = []

    # Process dividend date
    if yf_calendar.dividend_date:
        if isinstance(yf_calendar.dividend_date, (datetime, date)):
            date_str = yf_calendar.dividend_date.strftime("%Y-%m-%d")
            db_dividend = DBCalendarEvent(
                ticker_id=ticker_id,
                date=date_str,
                event_type=DBEventType.DIVIDEND
            )
            result.append(db_dividend)

    # Process ex-dividend date
    if yf_calendar.ex_dividend_date:
        if isinstance(yf_calendar.ex_dividend_date, (datetime, date)):
            date_str = yf_calendar.ex_dividend_date.strftime("%Y-%m-%d")
            db_ex_dividend = DBCalendarEvent(
                ticker_id=ticker_id,
                date=date_str,
                event_type=DBEventType.EX_DIVIDEND
            )
            result.append(db_ex_dividend)

    # Process earnings dates
    if yf_calendar.earnings_dates:
        earnings_dates = yf_calendar.earnings_dates
        if earnings_dates and isinstance(earnings_dates, list) and len(earnings_dates) > 0:
            # Convert all dates to string format
            earnings_dates_str = [
                d.strftime("%Y-%m-%d") for d in earnings_dates
                if isinstance(d, (datetime, date))
            ]

            if earnings_dates_str:
                # Use the first date as the primary date
                primary_date = earnings_dates_str[0]

                # Create earnings event
                db_earnings = DBCalendarEvent(
                    ticker_id=ticker_id,
                    date=primary_date,
                    event_type=DBEventType.EARNINGS,
                    earnings_dates=earnings_dates_str,
                    earnings_high=yf_calendar.earnings_high,
                    earnings_low=yf_calendar.earnings_low,
                    earnings_average=yf_calendar.earnings_average,
                    revenue_high=yf_calendar.revenue_high,
                    revenue_low=yf_calendar.revenue_low,
                    revenue_average=yf_calendar.revenue_average
                )

                result.append(db_earnings)

    return result
