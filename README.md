# Competitor Tech Intelligence

A powerful tool for founders and marketers to analyze competitor websites. Get insights on tech stack, performance metrics, SEO optimization, and key features.

![Competitor Tech Intelligence](https://vvyjwpajw7f3e.ok.kimi.link)

## Features

- **Tech Stack Analysis**: Detect frameworks, libraries, analytics tools, payment systems, hosting providers
- **Performance Audit**: Core Web Vitals, Lighthouse scores, optimization opportunities
- **SEO Analysis**: Meta tags, headings structure, images, links, social tags
- **Feature Detection**: Identify conversion features, trust signals, communication tools
- **Comparative Insights**: Side-by-side comparison with actionable recommendations

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + Puppeteer + Lighthouse
- **Analysis**: Cheerio for HTML parsing, Lighthouse for performance audit

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd competitor-tech-intelligence
```

2. Install dependencies:
```bash
npm install
```

3. Build the frontend:
```bash
npm run build
```

4. Start the production server:
```bash
npm start
```

The app will be available at `http://localhost:3001`

### Development Mode

Run frontend and backend separately:

```bash
# Terminal 1 - Start backend
npm run server

# Terminal 2 - Start frontend
npm run dev
```

Or use the combined command:
```bash
npm run dev:full
```

## Deployment

### Option 1: Render.com (Recommended)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Deploy!

### Option 2: Railway.app

1. Create a new project on Railway
2. Connect your GitHub repository
3. Add a Node.js service
4. Deploy!

### Option 3: VPS/Dedicated Server

1. SSH into your server
2. Clone the repository
3. Install dependencies: `npm install`
4. Build: `npm run build`
5. Start with PM2: `pm2 start server/index.mjs --name "competitor-intel"`

## API Endpoints

- `POST /api/analyze/full` - Full comparison analysis
- `POST /api/analyze/tech` - Tech stack analysis only
- `POST /api/analyze/performance` - Performance audit only
- `POST /api/analyze/seo` - SEO analysis only
- `POST /api/analyze/features` - Feature detection only
- `GET /api/health` - Health check

## Environment Variables

```env
PORT=3001
NODE_ENV=production
```

## How It Works

1. **Tech Stack Detection**: Analyzes HTML, scripts, headers, and CSS classes to identify technologies
2. **Performance Audit**: Uses Lighthouse to measure Core Web Vitals and generate optimization suggestions
3. **SEO Analysis**: Parses meta tags, headings, images, and structured data
4. **Feature Detection**: Pattern matching for common SaaS features like live chat, testimonials, pricing tables

## Limitations

- Some websites may block automated requests (403 errors)
- Single-page applications may require additional handling
- Performance audits take 30-60 seconds per URL

## License

MIT

## Contributing

Pull requests are welcome! For major changes, please open an issue first.
