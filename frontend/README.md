# My Dashboard

[![Code quality](https://github.com/Dappner/my-dashboard/actions/workflows/code-quality.yml/badge.svg)](https://github.com/Dappner/my-dashboard/actions/workflows/code-quality.yml)
[![Netlify Status](https://api.netlify.com/api/v1/badges/2542d931-6a38-4e4f-8b38-780505245f2a/deploy-status)](https://app.netlify.com/sites/astorian/deploys)

## TODOS

### Small Things

**Investing**

- Get mobile right for the Transactions Page
- Figure out why bottom-0 not working for the fixed buttons on the bottom of page of the AddTransactionSheet
- Create better Date Range Picker for Transactions. (most granular is months )
- Add Sheet for filters for Transactions?
- Fix the main Investing Home chart (relative spending)
- Add Holding Tab To Ticker Page (KPIs tbd)
- Make Holding panel less prevalent on mobile? / Go away?
- Modal to open transaction (see reasoning, etc)
- Better Holdings Page (Best performer, Bar Chart with Return per stock? (somehow also weighted with portfolio weight?))
- Better Date Range filter for Transactions
- If current holding, maybe show how cost basis line evolved in Ticker View (e.g. bought some cost basis shifts down...)

**Receipts**:

- Add + button to receipts in Spending

Generally:

1. Why do links not allow cursor-pointer?
2. Fix Dates everywhere. It's a fucking mess...

## Larger Features

**Investing**

- Figure out what Stock Research Looks Like
- better portfolio analytics
  - E.g. average holding time of current shares. Average dividends received per share during holding period
    Unrealized P/L, Unrealized P/L per share net of dividends (% and ABS)
- Lambda function that fetches data for ticker once it is added to the tickers table / the backfill is set to true.
  - Maybe a button to "run lambda for that ticker"

**Spending**

- Enable better spending tracking (so I quickly log spend e.g. 2 beers at night out)
- Subscription Management? (easier to add spending )
- Better Spending Overiew Page (sucks right now)
- Edit Transaction....

**General**

- Hookup Github to scrape whether I wrote code etc (lines changed? Repos?)
- Hookup API to chess to scrape whether I played Chess that Day
- Better sidebar
  - Other issue is state of sidebar caching (moves on open if it's closed)
  - If I'm on Investing and I open sidebar all investing pages should be open. It should maybe take up full screen on mobile (as an overlay?)
  - This will need a custom integration....

# FORMULAS USED

1. Formula Used for daily_investment_twrr_percent
   The formula implemented in the SQL view to calculate the daily Time-Weighted Rate of Return (TWRR) focused on invested assets is:

Daily Investment TWRR (%) = [ (EMV + D) / (BMV + NCI) - 1 ] \* 100
Use code with caution.
Where:

EMV (Ending Market Value): The market value of the securities (excluding cash) at the end of the day.

In the SQL: ld.portfolio_value

D (Dividends Received): The total cash amount of dividends received during the day.

In the SQL: ld.daily_dividend_cash

BMV (Beginning Market Value): The market value of the securities (excluding cash) at the end of the previous day.

In the SQL: ld.previous_day_portfolio_value

NCI (Net Cash Invested): The net amount of cash that flowed into the securities pool due to trading activities (buys minus sells) during the day.

Calculated as: SUM(ABS(cash_flow) WHERE type='buy') - SUM(cash_flow WHERE type='sell')

In the SQL (simplified): ld.net_cash_invested_today (derived from -SUM(cash_flow WHERE type IN ('buy', 'sell')) in the CTE).

Important Notes from the SQL Implementation:

First Day: If previous_day_portfolio_value is NULL (meaning it's the first day for that user in the dataset), the TWRR is set to 0.

Denominator Check: If the denominator (BMV + NCI) is less than or equal to 0, the TWRR is set to 0 to prevent division errors.
