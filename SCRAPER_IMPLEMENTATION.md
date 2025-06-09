# Real Data Scraper Implementation

## Overview

This implementation replaces the sample data generator with a comprehensive real data scraper that targets official U.S. government STOCK Act disclosure websites to extract actual political trading data.

## Architecture

### Components

1. **HouseScraper** (`lib/scrapers/house-scraper.ts`)
   - Targets: https://disclosures-clerk.house.gov/PublicDisclosure/FinancialDisclosure
   - Scrapes Periodic Transaction Reports (PTRs) in PDF format
   - Uses Puppeteer for dynamic page interaction
   - Downloads and parses PDFs using pdf-parse library

2. **SenateScraper** (`lib/scrapers/senate-scraper.ts`)
   - Targets: https://efdsearch.senate.gov/search/
   - Handles both PDF and HTML disclosure formats
   - Implements search form automation
   - Processes Electronic Financial Disclosure (EFD) reports

3. **StockTradesScraper** (`lib/scrapers/index.ts`)
   - Orchestrates both House and Senate scrapers
   - Manages error handling and logging
   - Provides fallback test data generation
   - Implements rate limiting and cleanup

4. **CronScheduler** (`lib/cron-scheduler.ts`)
   - Daily automated scraping at 6 AM EST
   - Weekly deep scraping on Sundays at 3 AM EST
   - Manual trigger capabilities
   - Task management and monitoring

## Features Implemented

### Data Extraction
- **PDF Processing**: Downloads and parses PTR documents using pdf-parse
- **HTML Parsing**: Extracts data from web-based disclosure tables
- **Pattern Matching**: Uses regex patterns to identify stock transactions
- **Data Normalization**: Standardizes transaction types, dates, and amounts
- **Duplicate Detection**: Prevents re-importing existing trades

### Web Scraping
- **Dynamic Navigation**: Uses Puppeteer for JavaScript-heavy sites
- **Form Automation**: Handles search forms and pagination
- **Rate Limiting**: 2-3 second delays between requests
- **Error Handling**: Comprehensive try-catch with detailed logging
- **Resource Cleanup**: Properly closes browsers and deletes temp files

### Data Processing
- **Politician Matching**: Links trades to politician records
- **Party Inference**: Basic political party determination
- **Amount Parsing**: Converts disclosure ranges to min/max values
- **Transaction Validation**: Ensures data completeness before saving

### Scheduling & Automation
- **Cron Jobs**: Daily and weekly automated scraping
- **Manual Triggers**: API endpoints for on-demand scraping
- **Status Monitoring**: Track scraping success/failure
- **Logging**: Comprehensive audit trail in database

## API Endpoints

### `/api/scrape` (POST)
Triggers scraping with options:
```json
{
  "maxPages": 3,     // Number of pages to scrape per site
  "testMode": false  // Use test data instead of real scraping
}
```

### `/api/cron` (GET/POST)
Manages scheduled tasks:
- GET: Returns status of all cron jobs
- POST: Trigger manual scraping or stop tasks

## Frontend Integration

### Header Updates
- **Data Source Links**: Direct links to official disclosure sites
- **Test Mode Toggle**: Switch between real and test scraping
- **Real-time Status**: Shows last scrape results
- **Error Display**: Transparent error reporting

### Footer Addition
- **Transparency Info**: Data source attribution
- **STOCK Act Context**: Educational information
- **Legal Disclaimers**: Appropriate warnings about data completeness

## Technical Implementation Details

### PDF Parsing Patterns
House PTR documents use patterns like:
```regex
/([A-Z][^|]+?)\s*\|\s*([A-Z]{1,5})\s*\|\s*(Buy|Sell|Sale|Purchase|Exchange)\s*\|\s*(\d{1,2}\/\d{1,2}\/\d{4})\s*\|\s*(\$[\d,]+\s*-\s*\$[\d,]+)/gi
```

Senate disclosures use different patterns:
```regex
/([A-Z]{1,5})\s+([^$\n]+?)\s+(Buy|Sell|Sale|Purchase|Exchange)\s+(\d{1,2}\/\d{1,2}\/\d{4})\s+(\$[\d,]+(?:\s*-\s*\$[\d,]+)?)/gi
```

### Data Validation
Each transaction must have:
- Valid stock ticker symbol
- Transaction type (Buy/Sell/Exchange)
- Transaction date
- Amount range

### Error Handling
- Network timeouts and connection failures
- PDF parsing errors
- Invalid data formats
- Duplicate detection
- Website structure changes

## Limitations & Considerations

### Website Protections
- **CAPTCHA**: Many government sites implement CAPTCHA
- **Rate Limiting**: Aggressive request throttling
- **IP Blocking**: Automated access prevention
- **Session Management**: Complex authentication flows

### Data Quality
- **PDF Inconsistencies**: Varying formats across different filings
- **Missing Information**: Incomplete or redacted disclosures
- **Timing Delays**: 45-day disclosure requirement creates data lag
- **Manual Verification**: Automated parsing may miss edge cases

### Legal & Ethical
- **Terms of Service**: Respect website usage policies
- **Server Load**: Minimize impact on government infrastructure
- **Data Accuracy**: No guarantee of completeness or correctness
- **Attribution**: Always credit official sources

## Testing & Validation

### Test Mode
The implementation includes a comprehensive test mode that:
- Generates realistic sample data
- Tests database integration
- Validates API endpoints
- Simulates scraping workflows

### Real Mode Fallbacks
When real scraping fails:
- Graceful error handling
- Detailed error logging
- Fallback to existing data
- User notification of issues

## Deployment Considerations

### Production Setup
1. **Environment Variables**: Configure for production sites
2. **Proxy Rotation**: Use proxy services for large-scale scraping
3. **Monitoring**: Set up alerts for scraping failures
4. **Backup Strategies**: Regular database backups
5. **Legal Compliance**: Ensure adherence to website terms

### Performance Optimization
- **Concurrent Processing**: Parallel PDF processing
- **Caching**: Store processed documents temporarily
- **Database Indexing**: Optimize query performance
- **Resource Management**: Monitor memory and CPU usage

## Future Enhancements

### Additional Data Sources
- SEC EDGAR database integration
- State-level disclosure tracking
- Historical data backfilling
- Third-party data validation

### Advanced Features
- **Machine Learning**: Improve parsing accuracy
- **Natural Language Processing**: Extract context from comments
- **Anomaly Detection**: Flag unusual trading patterns
- **Visualization**: Advanced charting and analysis

### API Improvements
- **Webhook Support**: Real-time notifications
- **Bulk Export**: Data download capabilities
- **GraphQL**: More flexible query interface
- **Rate Limiting**: Implement API quotas

## Conclusion

This implementation provides a solid foundation for real STOCK Act disclosure tracking while acknowledging the practical challenges of scraping government websites. The combination of robust error handling, test capabilities, and transparent limitations makes it suitable for production use with appropriate expectations and monitoring.

The architecture is designed to be maintainable and extensible, allowing for future improvements as website structures change and new data sources become available. 