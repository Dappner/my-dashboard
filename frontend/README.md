# React + TypeScript + Vite

## TODOS

### Small Things

- Get mobile right for the Transactions Page
- Figure out why bottom-0 not working for the fixed buttons on the bottom of page of the AddTransactionSheet
- Figure out rough pages for Spending
- Improve / Swap out sidebar component. If I'm in investing, that tab should be open etc...
- Create better Date Range Picker for Transactions. (most granular is months )
- Add Sheet for filters for Transactions?
- Add + button to receipts in Spending
- Fix the main Investing Home chart (relative spending)

## Larger Features

- Enable better spending tracking (so I quickly log spend e.g. 2 beers at night out)
- Hookup API to chess to scrape whether I played Chess that Day
- Subscription Management?
- Figure out what Stock Research Looks Like
- better portfolio analytics
  - E.g. average holding time of current shares. Average dividends received per share during holding period
    Unrealized P/L, Unrealized P/L per share net of dividends (% and ABS)

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
