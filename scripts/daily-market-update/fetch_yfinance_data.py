# fetch_yfinance_data.py
import yfinance as yf
import pickle
from datetime import date
from dateutil.relativedelta import relativedelta

# Set date range (last 30 days up to today, March 18, 2025)
end_date = date(2025, 3, 18)
start_date = end_date - relativedelta(days=30)

def fetch_and_save_ticker(symbol, filename):
    yf_ticker = yf.Ticker(symbol)
    real_data = yf_ticker.history(start=start_date, end=end_date, auto_adjust=True)
    real_info = yf_ticker.info
    real_calendar = yf_ticker.calendar

    # Fetch funds_data for ETFs/Mutual Funds
    funds_data = {}
    if real_info.get("quoteType") in ["ETF", "MUTUALFUND"]:
        fund_data = yf_ticker.funds_data
        funds_data = {
            "description": fund_data.description,
            "fund_overview": fund_data.fund_overview,
            "fund_operations": fund_data.fund_operations,
            "asset_classes": fund_data.asset_classes,
            "top_holdings": fund_data.top_holdings,
            "equity_holdings": fund_data.equity_holdings,
            "bond_holdings": fund_data.bond_holdings,
            "bond_ratings": fund_data.bond_ratings,
            "sector_weightings": fund_data.sector_weightings
        }

    # Save to a file
    with open(f"tests/{filename}", "wb") as f:
        pickle.dump({
            "history": real_data,
            "info": real_info,
            "calendar": real_calendar,
            "funds_data": funds_data if funds_data else None
        }, f)

    print(f"Saved {symbol} data: {start_date} to {end_date}")
    print(f"History shape: {real_data.shape}")
    print(f"Info keys: {list(real_info.keys())}")
    print(f"Calendar: {real_calendar}")
    if funds_data:
        print(f"Funds data keys: {list(funds_data.keys())}")
        for key, value in funds_data.items():
            print(f"{key}: {type(value)} - {value}")

# Fetch data for AAPL (EQUITY) and SPY (ETF)
fetch_and_save_ticker("AAPL", "aapl_yfinance_data.pkl")
fetch_and_save_ticker("SPY", "spy_yfinance_data.pkl")