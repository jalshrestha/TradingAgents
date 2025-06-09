# Political Stock Tracker

A comprehensive web application built with Next.js to track stock trades made by U.S. politicians based on public disclosures required by the STOCK Act of 2012.

## Features

- **Dashboard Overview**: Real-time statistics and visualizations of political stock trading activity
- **Trade Tracking**: Comprehensive table view of all trades with advanced filtering and sorting
- **Politician Profiles**: Individual politician pages with trading statistics and activity
- **Data Visualization**: Interactive charts showing trading patterns, party distributions, and trends
- **Advanced Filtering**: Filter by politician, party, chamber, stock ticker, transaction type, and date ranges
- **Web Scraping**: Automated data collection from House and Senate disclosure websites
- **Responsive Design**: Modern, mobile-friendly UI built with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Data Fetching**: TanStack Query (React Query)
- **Web Scraping**: Puppeteer, Cheerio, Axios
- **Icons**: Lucide React

## Prerequisites

Before running this application, make sure you have:

- Node.js 18+ installed
- PostgreSQL database running
- Git for version control

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd politician-stock-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and configure your database URL:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/politician_trades"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push database schema
   npm run db:push
   ```

5. **Seed sample data (optional)**
   ```bash
   npm run dev
   ```
   Then click "Seed Sample Data" in the header, or make a PUT request to `/api/scrape`

## Usage

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Open your browser**
   Navigate to `http://localhost:3000`

3. **Seed sample data**
   Click the "Seed Sample Data" button in the header to populate the database with sample politician and trade data.

4. **Explore the application**
   - **Dashboard**: View overview statistics and charts
   - **Trades**: Browse and filter all trading activity
   - **Politicians**: View individual politician profiles and statistics

## Data Sources

This application is designed to scrape data from:

- **House of Representatives**: [disclosures.clerk.house.gov](https://disclosures.clerk.house.gov)
- **Senate**: [efdsearch.senate.gov](https://efdsearch.senate.gov)
- **SEC EDGAR Database**: For additional disclosure documents

**Note**: The current implementation includes sample scrapers. For production use, you'll need to implement proper PDF parsing and handle the specific data formats from each source.

## API Endpoints

- `GET /api/dashboard` - Dashboard statistics and charts data
- `GET /api/trades` - Paginated trades with filtering
- `GET /api/politicians` - Politicians list with optional statistics
- `POST /api/scrape` - Run the web scraper
- `PUT /api/scrape` - Seed sample data

## Database Schema

The application uses the following main entities:

- **Politicians**: Name, party, chamber, state, district
- **Trades**: Ticker, transaction type, dates, amounts, filing URLs
- **Stock Info**: Company details and market data
- **Scraping Logs**: Track scraping runs and results

## Development

### Running in Development Mode

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm run start
```

### Database Operations

```bash
# Generate Prisma client after schema changes
npm run db:generate

# Create and apply migrations
npm run db:migrate

# Push schema without migrations (development)
npm run db:push
```

### Running the Scraper

```bash
# Run manual scraping
npm run scrape
```

## Deployment

### Environment Variables for Production

```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-domain.com"
```

### Deployment Platforms

This application can be deployed on:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- **Heroku**
- **AWS/GCP/Azure**

## Legal Considerations

This application is for educational and transparency purposes. When scraping government websites:

- Respect robots.txt files
- Use reasonable request rates
- Cache data appropriately
- Comply with terms of service
- Attribute data sources properly

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Disclaimer

This application is for educational and research purposes. The data displayed may not be complete or up-to-date. Always verify information with official sources before making any decisions based on this data.

## Support

For questions or issues, please open a GitHub issue or contact the maintainers.

---

**Built with ❤️ for government transparency and accountability** 