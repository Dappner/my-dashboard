from pydantic import BaseModel, Field, validator
from datetime import datetime, date
from typing import Optional, List, Dict
import pandas as pd


class PriceData(BaseModel):
    ticker_id: str
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")  # YYYY-MM-DD
    open_price: Optional[float] = None
    high_price: Optional[float] = None
    low_price: Optional[float] = None
    close_price: Optional[float] = None
    dividends: Optional[float] = None
    stock_splits: Optional[float] = None
    volume: Optional[int] = None
    updated_at: str = Field(default_factory=lambda: datetime.now().isoformat())

    @validator("date", pre=True)
    def parse_date(cls, v):
        if isinstance(v, pd.Timestamp):
            return v.strftime("%Y-%m-%d")
        return v


class TickerInfo(BaseModel):
    long_business_summary: Optional[str] = None
    category: Optional[str] = None
    region: Optional[str] = None
    quote_type: str = Field(default="EQUITY")
    updated_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    backfill: bool = False
    industry: Optional[str] = None
    sector: Optional[str] = None
    dividend_amount: Optional[float] = None


class FinanceData(BaseModel):
    ticker_id: str
    date: str = Field(default_factory=lambda: date.today().strftime("%Y-%m-%d"))
    regular_market_price: Optional[float] = None
    regular_market_change_percent: Optional[float] = None
    market_cap: Optional[float] = None
    dividend_yield: Optional[float] = None
    fifty_two_week_low: Optional[float] = None
    fifty_two_week_high: Optional[float] = None
    fifty_day_average: Optional[float] = None
    two_hundred_day_average: Optional[float] = None
    trailing_pe: Optional[float] = None
    total_assets: Optional[float] = None
    nav_price: Optional[float] = None
    yield_: Optional[float] = Field(None, alias="yield")  # Avoid Python keyword
    ytd_return: Optional[float] = None
    beta3year: Optional[float] = None
    fund_family: Optional[str] = None
    fund_inception_date: Optional[str] = None
    legal_type: Optional[str] = None
    three_year_average_return: Optional[float] = None
    five_year_average_return: Optional[float] = None
    net_expense_ratio: Optional[float] = None
    shares_outstanding: Optional[float] = None
    trailing_three_month_returns: Optional[float] = None
    trailing_three_month_nav_returns: Optional[float] = None
    updated_at: str = Field(default_factory=lambda: datetime.now().isoformat())


class CalendarEvent(BaseModel):
    ticker_id: str
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    event_type: str  # e.g., "dividend", "ex_dividend", "earnings"
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    earnings_dates: Optional[List[str]] = None  # For earnings events
    earnings_high: Optional[float] = None
    earnings_low: Optional[float] = None
    earnings_average: Optional[float] = None
    revenue_high: Optional[int] = None
    revenue_low: Optional[int] = None
    revenue_average: Optional[int] = None
