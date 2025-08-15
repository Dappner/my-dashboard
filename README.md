# Personal Life Tracking Dashboard

A comprehensive full-stack dashboard application designed to quantitatively track and analyze multiple aspects of personal life including financial habits, reading progress, chess performance, and more.

<img width="840" height="466.5" alt="image" src="https://github.com/user-attachments/assets/0d1823f5-ec85-494f-89da-c8cc72706b85" />
<img width="807" height="452" alt="image" src="https://github.com/user-attachments/assets/65826e3e-6a70-4d2c-9bf2-4b9c7db81756" />


## Project Purpose

This project serves as a centralized platform for data-driven self-improvement and life tracking. The dashboard provides detailed insights and analytics across various life domains:

- **Financial Management**: Track spending patterns, analyze receipts, categorize expenses, and monitor investment portfolios
- **Chess Performance**: Monitor rating progression, analyze game statistics, and track improvement over time
- **Reading Habits**: Log books, track reading goals, analyze reading patterns and preferences
- **Investment Tracking**: Portfolio management, performance analysis, sector allocation, and market insights
- **Habit Formation**: Track daily habits, visualize streaks, and monitor consistency

The goal is to provide actionable insights through data visualization and trend analysis to support informed decision-making and continuous personal improvement.

## Tech Stack

### Frontend
- **React 19** - Modern UI framework with latest features
- **TypeScript** - Type-safe development
- **TanStack Router** - Type-safe routing solution
- **TanStack Query** - Server state management
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Recharts & Chart.js** - Data visualization
- **Framer Motion** - Smooth animations
- **Vite** - Fast build tool and dev server

### Backend & Database
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Supabase Edge Functions** - Serverless functions using Deno
- **AWS Lambda** - Serverless computing for data processing
- **Serverless Framework** - Infrastructure as code

### Mobile
- **React Native/Expo** - Cross-platform mobile application

### Data Processing
- **Python** - Data fetching and analysis scripts
- **Yahoo Finance API** - Market data integration
- **OCR Processing** - Receipt image analysis

### DevOps & Tooling
- **pnpm** - Fast package manager with workspace support
- **Biome** - Fast linter and formatter
- **Lefthook** - Git hooks management
- **GitHub Actions** - CI/CD pipeline

## Project Structure

This is a monorepo containing multiple applications and packages:

```
my-dashboard/
├── frontend/          # Main React web application
├── mobile/           # React Native mobile app
├── shared/           # Shared utilities and API clients
├── scripts/          # Data processing and automation scripts
├── supabase-edge/    # Supabase Edge Functions
└── new-frontend/     # (Development/experimental frontend)
```

## Key Features

### 📊 Investment Tracking
- Real-time portfolio valuation and performance metrics
- Sector and industry allocation analysis
- Historical performance tracking and risk assessment
- Transaction management and dividend tracking

### 💰 Spending Analysis
- Receipt OCR processing and categorization
- Monthly spending breakdowns and trends
- Budget tracking and expense categorization
- Financial goal monitoring

### ♟️ Chess Analytics
- Game analysis and rating progression tracking
- Performance metrics across different time controls
- Opening repertoire analysis
- Calendar heatmap of chess activity

### 📚 Reading Tracker
- Book logging and reading goal tracking
- Reading pattern analysis and statistics
- Author and genre preference insights
- Reading streak monitoring

### 📱 Mobile Access
- Cross-platform mobile app for on-the-go tracking
- Real-time synchronization with web dashboard
- Optimized mobile UI/UX

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Python 3.9+ (for data processing scripts)
- Supabase account and project setup

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd my-dashboard
```

2. Install all dependencies
```bash
pnpm install:all
```

3. Set up environment variables
```bash
cp frontend/.env.example frontend/.env.local
# Add your Supabase keys and other configuration
```

4. Start the development server
```bash
pnpm dev
```

## Development

### Workspace Commands
- `pnpm dev` - Start frontend and shared package in watch mode
- `pnpm build:shared` - Build the shared package
- `pnpm install:all` - Install all dependencies and build shared package

### Code Quality
- **Linting**: ESLint + Biome for consistent code style
- **Formatting**: Biome for fast formatting
- **Git Hooks**: Lefthook for pre-commit quality checks
- **Type Safety**: Full TypeScript coverage across all packages

## Architecture

The application follows a modern full-stack architecture:

- **Frontend**: SPA with client-side routing and optimistic updates
- **API Layer**: RESTful APIs through Supabase with real-time subscriptions
- **Data Processing**: Serverless functions for heavy computations
- **Mobile**: Shared business logic with native mobile UI
- **Monitoring**: Comprehensive logging and error tracking

## Contributing

This is a personal project for CoOp Program demonstration, but the architecture and patterns can serve as a reference for similar dashboard applications.

## License

Private project - All rights reserved.
