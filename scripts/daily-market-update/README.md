# Daily Market Update Lambda Function

The `daily-market-update` is a serverless AWS Lambda function designed to fetch financial market data for a list of tickers from Yahoo Finance and store it in a Supabase database. It runs daily at 5:30 PM Eastern Time (ET) after the NYSE market close and at midnight ET, ensuring up-to-date financial data for analysis and tracking.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Prerequisites](#prerequisites)
5. [Setup](#setup)
6. [Deployment](#deployment)
7. [Environment Variables](#environment-variables)
8. [Scheduling](#scheduling)
9. [File Structure](#file-structure)
10. [Usage](#usage)
11. [Troubleshooting](#troubleshooting)
12. [Contributing](#contributing)
13. [License](#license)

## Overview

This project automates the retrieval and storage of stock market data, including historical prices, daily finance metrics, ticker information, calendar events (e.g., earnings, dividends), and fund-specific data (e.g., sector weightings, top holdings). It leverages the Serverless Framework for deployment, Yahoo Finance (`yfinance`) for data retrieval, and Supabase as the database backend.

The Lambda function is triggered by scheduled events, processes tickers stored in the `tickers` table, and updates multiple related tables in Supabase based on the fetched data.

## Architecture

- **AWS Lambda**: Executes the core logic via `lambda_handler.py`.
- **Serverless Framework**: Manages deployment and configuration (`serverless.yml`).
- **Supabase**: Stores ticker data and fetched financial information.
- **Yahoo Finance**: Provides market data through the `yfinance` Python library.
- **AWS SSM**: Securely stores environment variables (Supabase URL and key).
- **Cron Schedules**: Triggers the function at 5:30 PM ET and midnight ET daily.

The codebase is modular, with separate classes for fetching tickers, retrieving data, and saving it to the database.

## Features

- Fetches historical price data, daily finance metrics, ticker info, calendar events, and fund-specific data.
- Supports backfill mode to retrieve data from January 1, 2020, for initial setup or missing history.
- Handles multiple exchanges (e.g., NYSE, NASDAQ, TSX) with appropriate ticker suffixes.
- Updates data incrementally based on the last update date, minimizing redundant fetches.
- Logs execution details for debugging and monitoring.
- Runs on a schedule tailored to Eastern Time, accounting for DST.

## Prerequisites

- **AWS Account**: With permissions to create Lambda functions, IAM roles, and SSM parameters.
- **Serverless Framework**: Installed globally (`npm install -g serverless`).
- **Node.js**: For managing Serverless plugins (version compatible with `serverless-python-requirements`).
- **Python 3.10**: Runtime environment for the Lambda function.
- **AWS CLI**: Configured with a profile (e.g., `my-dashboard`).
- **Supabase Account**: With a project set up and tables created (see schema in `data_saver.py`).

## Setup

1. **Clone the Repository**:

   ```bash
   git clone <repository-url>
   cd daily-market-update
   ```

2. **Install Dependencies**:

   - Install Node.js dependencies:

     ```bash
     npm install
     ```

   - Install Python dependencies:

     ```bash
     pip install -r requirements.txt
     ```

3. **Configure AWS CLI**:
   Ensure your AWS CLI is configured with the `my-dashboard` profile:

   ```bash
   aws configure --profile my-dashboard
   ```

4. **Set Up Supabase**:

   - Create a Supabase project and note the URL and API key.
   - Set up the required tables (`tickers`, `historical_prices`, `yh_finance_daily`, `calendar_events`, `fund_sector_weightings`, `fund_top_holdings`, `fund_asset_classes`) with appropriate schemas (infer from `data_saver.py`).

5. **Store Secrets in AWS SSM**:
   Replace placeholders with your Supabase credentials:

   ```bash
   aws ssm put-parameter --name "/daily-market-update/supabase-url" --value "https://your-supabase-url.supabase.co" --type SecureString --region us-east-1 --profile my-dashboard
   aws ssm put-parameter --name "/daily-market-update/supabase-key" --value "your-supabase-key" --type SecureString --region us-east-1 --profile my-dashboard
   ```

## Deployment

Deploy the function to AWS using the Serverless Framework:

```bash
serverless deploy --aws-profile my-dashboard
```

- This deploys to the `dev` stage in `us-east-1`.
- The deployment creates a Lambda function (`processTickerData`), CloudWatch Events rules, and an IAM role with SSM access.

To remove the deployment:

```bash
serverless remove --aws-profile my-dashboard
```

To test locally:

```bash
serverless invoke local -f processTickerData
```

## Environment Variables

The function uses the following environment variables, sourced from AWS SSM:

- `SUPABASE_URL`: URL of your Supabase instance (e.g., `https://your-supabase-url.supabase.co`).
- `SUPABASE_KEY`: Supabase API key for authentication.

These are automatically injected via the `serverless.yml` configuration:

```yaml
environment:
  SUPABASE_URL: ${ssm:/daily-market-update/supabase-url}
  SUPABASE_KEY: ${ssm:/daily-market-update/supabase-key}
```

## Scheduling

The function runs on two daily schedules, adjusted for Eastern Time (ET) with DST:

- **5:30 PM ET (Post-Market Close)**:
  - EDT (UTC-4): `cron(30 21 ? * MON-SAT *)` (9:30 PM UTC).
  - EST (UTC-5): `cron(30 22 ? * MON-SAT *)` (10:30 PM UTC).
  - Runs Monday to Saturday, after NYSE close at 4:00 PM ET.
- **12:00 AM ET (Midnight)**:
  - EDT (UTC-4): `cron(0 4 ? * MON-SUN *)` (4:00 AM UTC).
  - EST (UTC-5): `cron(0 5 ? * MON-SUN *)` (5:00 AM UTC).
  - Runs daily.

These schedules are defined in `serverless.yml` under the `processTickerData` function's `events`.

## File Structure

```
daily-market-update/
├── .gitignore              # Excludes build artifacts, env files, etc.
├── config.py               # Loads Supabase credentials from environment
├── data_fetcher.py         # Fetches market data from Yahoo Finance
├── data_saver.py           # Saves data to Supabase tables
├── handler.py              # Sample Lambda handler (unused)
├── lambda_handler.py       # Main Lambda entry point
├── package.json            # Node.js dependencies (Serverless plugins)
├── README.md               # Project documentation
├── requirements.txt        # Python dependencies
├── serverless.yml          # Serverless Framework configuration
├── supabase_client.py      # Supabase client wrapper
├── ticker_fetcher.py       # Fetches tickers from Supabase
└── ticker_processor.py     # Processes ticker data
```

## Usage

1. **Populate the `tickers` Table**:

   - Add ticker entries to the `tickers` table in Supabase with columns: `id` (UUID), `symbol` (string), `exchange` (string, optional), `backfill` (boolean).
   - Example:

     ```sql
     INSERT INTO tickers (id, symbol, exchange, backfill)
     VALUES ('550e8400-e29b-41d4-a716-446655440000', 'AAPL', 'NASDAQ', true);
     ```

2. **Function Execution**:

   - The Lambda runs automatically at 5:30 PM ET and midnight ET.
   - For each ticker, it:
     - Fetches data from Yahoo Finance.
     - Updates `historical_prices`, `yh_finance_daily`, `tickers`, `calendar_events`, and fund tables as needed.
     - Logs progress and errors.

3. **Monitoring**:
   - Check CloudWatch Logs for execution details (under log group `/aws/lambda/daily-market-update-dev-processTickerData`).
   - Verify data updates in Supabase tables.

## Troubleshooting

- **Deployment Fails**: Ensure AWS credentials are valid and SSM parameters are set.
- **No Data Updates**: Confirm `tickers` table has entries and Yahoo Finance is accessible.
- **DST Issues**: Schedules may overlap briefly during DST transitions; this is benign unless precision is critical.
- **Timeout Errors**: Increase `timeout` in `serverless.yml` (currently 300 seconds) if processing many tickers.
- **Logs**: Enable debug logging by setting `logger.setLevel(logging.DEBUG)` in `lambda_handler.py` temporarily.
