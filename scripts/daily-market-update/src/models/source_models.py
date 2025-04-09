"""
Data models representing YFinance API responses.
These models parse and validate data directly from YFinance.
"""

from typing import Dict, List, Optional, Union
from datetime import datetime, date
from enum import Enum
from pydantic import BaseModel, Field, ConfigDict, field_validator

# Common configuration for all models
model_config = ConfigDict(
    extra="ignore",  # Allow extra fields in YFinance responses
    arbitrary_types_allowed=True,  # Allow pandas types
)


class YFQuoteType(str, Enum):
    """Quote types from YFinance"""

    EQUITY = "EQUITY"
    ETF = "ETF"
    MUTUALFUND = "MUTUALFUND"
    INDEX = "INDEX"
    CURRENCY = "CURRENCY"
    CRYPTOCURRENCY = "CRYPTOCURRENCY"


class YFPriceRow(BaseModel):
    """Single row of YFinance price history"""

    model_config = model_config

    open: Optional[float] = Field(None, alias="Open")
    high: Optional[float] = Field(None, alias="High")
    low: Optional[float] = Field(None, alias="Low")
    close: Optional[float] = Field(None, alias="Close")
    volume: Optional[int] = Field(None, alias="Volume")
    dividends: Optional[float] = Field(0.0, alias="Dividends")
    stock_splits: Optional[float] = Field(0.0, alias="Stock Splits")


class YFPriceHistory(BaseModel):
    """YFinance price history data"""

    model_config = model_config

    # This is a dict where keys are datetime objects and values are price rows
    data: Dict[datetime, YFPriceRow]

    @classmethod
    def from_dataframe(cls, df):
        """Convert pandas DataFrame to YFPriceHistory"""
        data = {}
        for index, row in df.iterrows():
            # Handle both Timestamp and datetime index types
            date_key = (
                index.to_pydatetime() if hasattr(index, "to_pydatetime") else index
            )
            data[date_key] = YFPriceRow(
                Open=row.get("Open"),
                High=row.get("High"),
                Low=row.get("Low"),
                Close=row.get("Close"),
                Volume=row.get("Volume"),
                Dividends=row.get("Dividends", 0.0),
                **{"Stock Splits": row.get("Stock Splits", 0.0)},
            )
        return cls(data=data)


class YFCalendarEvent(BaseModel):
    """Calendar event from YFinance"""

    model_config = model_config

    # YFinance returns dates as various formats
    # WEIRD -> TODO: Fix
    date: Optional[Union[datetime, date, str]] = None

    @field_validator("date", mode="before")
    @classmethod
    def validate_date(cls, v):
        """Convert various date formats to date object"""
        if v is None:
            return None
        if isinstance(v, (datetime, date)):
            return v
        if isinstance(v, str):
            try:
                return datetime.strptime(v, "%Y-%m-%d").date()
            except ValueError:
                pass
        return v  # Return as is if can't convert


class YFEarningsData(BaseModel):
    """Earnings data from YFinance"""

    model_config = model_config

    earnings_dates: List[datetime] = Field([], alias="Earnings Date")
    earnings_average: Optional[float] = Field(None, alias="Earnings Average")
    earnings_low: Optional[float] = Field(None, alias="Earnings Low")
    earnings_high: Optional[float] = Field(None, alias="Earnings High")
    revenue_average: Optional[float] = Field(None, alias="Revenue Average")
    revenue_low: Optional[float] = Field(None, alias="Revenue Low")
    revenue_high: Optional[float] = Field(None, alias="Revenue High")


class YFDividendData(BaseModel):
    """Dividend data from YFinance"""

    model_config = model_config

    dividend_date: Optional[Union[datetime, date]] = Field(None, alias="Dividend Date")
    ex_dividend_date: Optional[Union[datetime, date]] = Field(
        None, alias="Ex-Dividend Date"
    )


class YFCalendar(BaseModel):
    """Calendar data from YFinance"""

    model_config = model_config

    # Merge earnings and dividend fields
    earnings_dates: Optional[List[datetime]] = Field(None, alias="Earnings Date")
    earnings_average: Optional[float] = Field(None, alias="Earnings Average")
    earnings_low: Optional[float] = Field(None, alias="Earnings Low")
    earnings_high: Optional[float] = Field(None, alias="Earnings High")
    revenue_average: Optional[float] = Field(None, alias="Revenue Average")
    revenue_low: Optional[float] = Field(None, alias="Revenue Low")
    revenue_high: Optional[float] = Field(None, alias="Revenue High")
    dividend_date: Optional[Union[datetime, date]] = Field(None, alias="Dividend Date")
    ex_dividend_date: Optional[Union[datetime, date]] = Field(
        None, alias="Ex-Dividend Date"
    )


class YFTopHolding(BaseModel):
    """Fund top holding from YFinance"""

    model_config = model_config

    name: str = Field(..., alias="Name")
    holding_percent: float = Field(..., alias="Holding Percent")
    symbol: str = Field("", alias="Symbol")


class YFHoldings(BaseModel):
    """Fund holdings data from YFinance"""

    model_config = model_config

    holdings: Dict[str, YFTopHolding] = {}

    @classmethod
    def from_dataframe(cls, df):
        """Convert pandas DataFrame to YFHoldings"""
        holdings = {}
        if df is None or df.empty:
            return cls(holdings=holdings)

        for index, row in df.iterrows():
            symbol = index
            holdings[symbol] = YFTopHolding(
                Symbol=symbol,
                Name=row.get("Name", "Unknown"),
                **{
                    "Holding Percent": row.get("% Assets", 0.0) / 100.0
                },  # Convert from percentage
            )
        return cls(holdings=holdings)


class YFSectorWeightings(BaseModel):
    """Fund sector weightings from YFinance"""

    model_config = model_config

    sectors: Dict[str, float] = {}

    @classmethod
    def from_dict(cls, data: Dict[str, float]):
        """Convert dictionary to YFSectorWeightings"""
        if not data:
            return cls(sectors={})

        # Normalize sector names and ensure values are floats
        sectors = {k.replace("_", "-"): float(v) for k, v in data.items()}
        return cls(sectors=sectors)


class YFAssetAllocation(BaseModel):
    """Fund asset allocation from YFinance"""

    model_config = model_config

    assets: Dict[str, float] = {}

    @classmethod
    def from_dict(cls, data: Dict[str, float]):
        """Convert dictionary to YFAssetAllocation"""
        if not data:
            return cls(assets={})

        # Ensure values are floats
        assets = {k: float(v) for k, v in data.items()}
        return cls(assets=assets)


class YFFundData(BaseModel):
    """Fund-specific data from YFinance"""

    model_config = model_config

    top_holdings: Optional[YFHoldings] = None
    sector_weightings: Optional[YFSectorWeightings] = None
    asset_allocation: Optional[YFAssetAllocation] = None


class YFTickerInfo(BaseModel):
    """Ticker information from YFinance"""

    model_config = model_config

    # Basic information
    symbol: str
    short_name: Optional[str] = Field(None, alias="shortName")
    long_name: Optional[str] = Field(None, alias="longName")
    quote_type: Optional[YFQuoteType] = Field(None, alias="quoteType")
    exchange: Optional[str] = None
    currency: Optional[str] = None

    # Business information
    sector: Optional[str] = None
    industry: Optional[str] = None
    full_time_employees: Optional[int] = Field(None, alias="fullTimeEmployees")
    long_business_summary: Optional[str] = Field(None, alias="longBusinessSummary")

    # Market data
    regular_market_price: Optional[float] = Field(None, alias="regularMarketPrice")
    regular_market_open: Optional[float] = Field(None, alias="regularMarketOpen")
    regular_market_day_high: Optional[float] = Field(None, alias="regularMarketDayHigh")
    regular_market_day_low: Optional[float] = Field(None, alias="regularMarketDayLow")
    regular_market_volume: Optional[int] = Field(None, alias="regularMarketVolume")
    market_cap: Optional[int] = Field(None, alias="marketCap")
    regular_market_change_percent: Optional[float] = Field(
        None, alias="regularMarketChangePercent"
    )

    # Technical indicators
    fifty_two_week_low: Optional[float] = Field(None, alias="fiftyTwoWeekLow")
    fifty_two_week_high: Optional[float] = Field(None, alias="fiftyTwoWeekHigh")
    fifty_day_average: Optional[float] = Field(None, alias="fiftyDayAverage")
    two_hundred_day_average: Optional[float] = Field(None, alias="twoHundredDayAverage")

    # Fundamentals - Stocks
    trailing_pe: Optional[float] = Field(None, alias="trailingPE")
    forward_pe: Optional[float] = Field(None, alias="forwardPE")
    dividend_yield: Optional[float] = Field(None, alias="dividendYield")
    dividend_rate: Optional[float] = Field(None, alias="dividendRate")
    beta: Optional[float] = None

    # Fundamentals - Funds
    nav_price: Optional[float] = Field(None, alias="navPrice")
    yield_value: Optional[float] = Field(None, alias="yield")
    ytd_return: Optional[float] = Field(None, alias="ytdReturn")
    total_assets: Optional[int] = Field(None, alias="totalAssets")
    fund_family: Optional[str] = Field(None, alias="fundFamily")
    fund_inception_date: Optional[float] = Field(
        None, alias="fundInceptionDate"
    )  # Unix timestamp
    legal_type: Optional[str] = Field(None, alias="legalType")
    three_year_average_return: Optional[float] = Field(
        None, alias="threeYearAverageReturn"
    )
    five_year_average_return: Optional[float] = Field(
        None, alias="fiveYearAverageReturn"
    )
    net_expense_ratio: Optional[float] = Field(None, alias="netExpenseRatio")

    # Other fields
    last_dividend_value: Optional[float] = Field(None, alias="lastDividendValue")
    last_dividend_date: Optional[float] = Field(
        None, alias="lastDividendDate"
    )  # Unix timestamp
    shares_outstanding: Optional[int] = Field(None, alias="sharesOutstanding")

    def get_fund_inception_date(self) -> Optional[date]:
        """Convert Unix timestamp to date object"""
        if self.fund_inception_date is not None:
            try:
                return datetime.fromtimestamp(self.fund_inception_date).date()
            except (ValueError, TypeError, OverflowError):
                pass
        return None


class YFTickerData(BaseModel):
    """Complete ticker data from YFinance"""

    model_config = model_config

    # Basic identification
    ticker_symbol: str
    exchange: Optional[str] = None

    # Component data
    info: YFTickerInfo
    price_history: Optional[YFPriceHistory] = None
    calendar: Optional[YFCalendar] = None
    fund_data: Optional[YFFundData] = None

    @classmethod
    def from_yfinance(cls, ticker, symbol: str, exchange: Optional[str] = None):
        """Create YFTickerData from yfinance.Ticker object"""
        # Extract info
        info = getattr(ticker, "info", {})
        if not info:
            info = {}

        # Add symbol if not present
        if "symbol" not in info:
            info["symbol"] = symbol

        # Parse ticker info
        ticker_info = YFTickerInfo(**info)

        # Create the model
        result = cls(ticker_symbol=symbol, exchange=exchange, info=ticker_info)

        # Add price history if available
        if hasattr(ticker, "history"):
            try:
                history_df = ticker.history
                if not history_df.empty:
                    result.price_history = YFPriceHistory.from_dataframe(history_df)
            except (AttributeError, Exception) as e:
                pass  # Ignore if history not available

        # Add calendar if available
        if hasattr(ticker, "calendar"):
            try:
                calendar_data = ticker.calendar
                if calendar_data:
                    result.calendar = YFCalendar(**calendar_data)
            except (AttributeError, Exception) as e:
                pass  # Ignore if calendar not available

        # Add fund data if this is a fund
        if ticker_info.quote_type in [YFQuoteType.ETF, YFQuoteType.MUTUALFUND]:
            try:
                if hasattr(ticker, "funds_data"):
                    fund_data = YFFundData()

                    # Top holdings
                    if hasattr(ticker.funds_data, "top_holdings"):
                        fund_data.top_holdings = YFHoldings.from_dataframe(
                            ticker.funds_data.top_holdings
                        )

                    # Sector weightings
                    if hasattr(ticker.funds_data, "sector_weightings"):
                        fund_data.sector_weightings = YFSectorWeightings.from_dict(
                            ticker.funds_data.sector_weightings
                        )

                    # Asset allocation
                    if hasattr(ticker.funds_data, "asset_allocation"):
                        fund_data.asset_allocation = YFAssetAllocation.from_dict(
                            ticker.funds_data.asset_allocation
                        )

                    result.fund_data = fund_data
            except (AttributeError, Exception) as e:
                pass  # Ignore if fund data not available

        return result
