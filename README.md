# Political Stock Tracker

A comprehensive web application built with Next.js to track stock trades made by U.S. politicians based on public disclosures required by the STOCK Act of 2012.

## ✨ Features

- **🎯 Dashboard Overview**: Real-time statistics and visualizations of political stock trading activity
- **📊 Trade Tracking**: Comprehensive table view of all trades with advanced filtering and sorting  
- **👥 Politician Profiles**: Individual politician pages with trading statistics and activity
- **📈 Data Visualization**: Interactive charts showing trading patterns, party distributions, and trends
- **🔍 Advanced Filtering**: Filter by politician, party, chamber, stock ticker, transaction type, and date ranges
- **🤖 Web Scraping**: Automated data collection from House and Senate disclosure websites
- **🌙 Dark/Light Mode**: Beautiful theme system with smooth transitions and modern design
- **📱 Responsive Design**: Modern, mobile-friendly UI built with Tailwind CSS

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM (easily configurable to PostgreSQL)
- **Styling**: Tailwind CSS with custom theme system
- **Charts**: Victory.js for interactive data visualization
- **Data Fetching**: TanStack Query (React Query)
- **Web Scraping**: Puppeteer, Cheerio, Axios
- **Icons**: Lucide React
- **Theme**: next-themes with class-based dark mode

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js 18+ installed
- Git for version control

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jalshrestha/TradingAgents.git
   cd TradingAgents
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push database schema
   npx prisma db push
   ```

## 🎮 Usage

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Open your browser**
   Navigate to `http://localhost:3000`

3. **Explore the application**
   - **Dashboard**: View overview statistics and charts
   - **Trades**: Browse and filter all trading activity
   - **Politicians**: View individual politician profiles and statistics
   - **Analytics**: Comprehensive trading analytics and insights

## 📊 Data Sources

This application integrates real congressional trading data from:

- **House Stock Watcher API**: Real-time congressional trading data
- **SEC EDGAR Database**: Official disclosure documents
- **Government Trading Disclosures**: STOCK Act compliance filings

## 🛠️ API Endpoints

- `GET /api/dashboard` - Dashboard statistics and charts data
- `GET /api/trades` - Paginated trades with filtering
- `GET /api/politicians` - Politicians list with optional statistics
- `GET /api/analytics` - Comprehensive trading analytics
- `POST /api/scrape` - Run the web scraper
- `GET /api/cron` - Automated data collection endpoint

## 🗄️ Database Schema

The application uses the following main entities:

- **Politicians**: Name, party, chamber, state, district, image URLs
- **Trades**: Ticker, transaction type, dates, amounts, filing URLs
- **Scraping Logs**: Track scraping runs and results with detailed metrics

## 💻 Development

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
npx prisma generate

# View database in Prisma Studio
npx prisma studio

# Reset database
npx prisma db push --force-reset
```

### Running the Scraper

The application includes automated scrapers that collect real congressional trading data. The scraper runs automatically and can also be triggered manually.

## 🚀 Deployment

### Environment Variables for Production

```env
DATABASE_URL="file:./dev.db"
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

## ⚖️ Legal Considerations

This application is for educational and transparency purposes. When scraping government websites:

- Respect robots.txt files
- Use reasonable request rates
- Cache data appropriately
- Comply with terms of service
- Attribute data sources properly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## ⚠️ Disclaimer

This application is for educational and research purposes. The data displayed may not be complete or up-to-date. Always verify information with official sources before making any decisions based on this data.

## 🆘 Support

For questions or issues, please open a GitHub issue or contact the maintainers.

---

**Built with ❤️ for government transparency and accountability**
