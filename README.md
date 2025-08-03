# 🍽️ Where to Eat - AI-Powered Restaurant Finder

A modern web application that helps users find the best restaurants based on their location and cuisine preferences, powered by Claude AI and Google Places API.

## 🎯 Features

- 🍽️ **Intelligent Restaurant Search**: Powered by Claude AI for personalized recommendations
- 🗺️ **Google Maps Integration**: Real restaurant data with locations, ratings, and reviews
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- 🎯 **Smart Filtering**: Advanced search with cuisine, dietary restrictions, and preferences
- 🤖 **AI-Powered Insights**: Claude analyzes restaurant reviews and provides detailed insights
- ⭐ **Real-time Information**: Current ratings, hours, contact info, and availability
- 🎨 **Modern UI**: Clean, intuitive interface with Bootstrap 5 styling

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or later)
- **Claude AI API Key** from [Anthropic Console](https://console.anthropic.com/)
- **Google Places API Key** from [Google Cloud Console](https://console.cloud.google.com/)

### Local Development Setup

1. **Clone and install**:
   ```bash
   git clone https://github.com/kimtee92/where-to-eat.git
   cd where-to-eat
   npm install
   ```

2. **Configure environment variables**:
   Create `.env.local` file:
   ```env
   CLAUDE_API_KEY=your_claude_api_key_here
   GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
   NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** to [http://localhost:3000](http://localhost:3000)

## 🔄 CI/CD & Deployment (Heroku)

This project includes a complete CI/CD pipeline for automated deployment to Heroku.

### ✅ What's Included
- **GitHub Actions workflow** with automated testing and deployment
- **Heroku deployment** with automatic environment variable configuration
- **Build optimization** with error handling and database safety
- **Health checks** and deployment verification

### 🚀 Deployment Setup

#### 1. Setup GitHub Secrets
Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

```
HEROKU_API_KEY          # Get with: heroku auth:token
HEROKU_APP_NAME         # Your chosen Heroku app name
HEROKU_EMAIL            # Your Heroku account email
CLAUDE_API_KEY          # Your Claude AI API key
GOOGLE_PLACES_API_KEY   # Your Google Places API key
```

#### 2. Create Heroku App
```bash
heroku login
heroku create your-app-name
```

#### 3. Deploy
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

**That's it!** The GitHub Actions workflow will:
- ✅ Run tests and build checks
- ✅ Deploy to Heroku automatically
- ✅ Set all environment variables
- ✅ Verify deployment with health checks

### 🔧 CI/CD Features
- **Automated testing** on every pull request
- **Environment variable management** via Heroku config vars
- **Build-time database safety** (works without database during build)
- **Deployment verification** with automatic health checks
- **Zero-downtime deployment** to Heroku

## 🎮 How to Use

### Example Searches
1. **Location**: "Melbourne CBD" | **Preferences**: "Japanese, date night"
2. **Location**: "Sydney" | **Preferences**: "Thai food, vegetarian options" 
3. **Location**: "New York" | **Preferences**: "Italian, family dinner"
4. **Location**: "London" | **Preferences**: "Indian, quick bite"

### What You'll Get
- 🤖 **AI Analysis** from Claude with restaurant insights
- 📍 **Real Locations** from Google Places API
- ⭐ **Live Ratings & Reviews** with opening hours
- 📞 **Contact Information** and website links
- 🗺️ **Google Maps Integration** with directions
- 💡 **Smart Recommendations** based on your preferences

## 🔑 API Keys Setup

### Claude AI API Key
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your environment variables

### Google Places API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - Places API
   - Places API (New)
   - Geocoding API
4. Create credentials (API Key)
5. Copy the key to your environment variables

## 🛠️ Development Commands

```bash
npm run dev          # Start development server (with Turbopack)
npm run dev-standard # Standard Next.js development (without Turbopack)
npm run dev-https    # HTTPS development for mobile testing
npm run dev-mobile   # Accessible from local network (0.0.0.0)
npm run build        # Build for production
npm start           # Start production server
npm run lint        # Run ESLint for code quality
```

## 📁 Project Structure

```
src/app/
├── api/
│   ├── restaurants/
│   │   ├── search/route.ts     # Main search API (Claude + Google)
│   │   └── demo/route.ts       # Demo data for testing
│   ├── health/                 # API health checks
│   └── suggestions/route.ts    # Search suggestions & history
├── components/
│   ├── SearchForm.tsx          # Main search interface
│   ├── RestaurantCard.tsx      # Restaurant display cards
│   └── ApiStatus.tsx           # API status indicators
├── types/
│   └── google-maps.d.ts        # TypeScript definitions
├── globals.css                 # Custom styling
├── layout.tsx                  # App layout & metadata
└── page.tsx                    # Home page component

.github/workflows/
└── heroku-deploy.yml           # CI/CD pipeline configuration
```

## 🎨 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes
- **AI**: Claude AI API (Anthropic)
- **Maps**: Google Places API, Google Maps API
- **Styling**: Custom CSS with Bootstrap 5
- **Icons**: Bootstrap Icons
- **Deployment**: Heroku with GitHub Actions
- **Database**: MongoDB (optional - for search history)

## 🔧 Customization

### Search Preferences
The app uses natural language processing where users can describe exactly what they want:
- **Cuisine types**: "Italian", "Thai", "fusion", "authentic Mexican"
- **Dietary needs**: "vegetarian", "vegan", "gluten-free", "halal"
- **Occasions**: "date night", "family dinner", "business lunch", "quick bite"
- **Price range**: "budget-friendly", "fine dining", "mid-range"
- **Atmosphere**: "casual", "romantic", "family-friendly", "trendy"

### Styling
Modify `src/app/globals.css` for custom styling. The app uses Bootstrap 5 with custom utility classes.

### AI Prompts
Customize Claude AI prompts in `src/app/api/restaurants/search/route.ts` to change recommendation logic.

## 🚨 Troubleshooting

### Common Issues

1. **API Key Errors**: Ensure API keys are correctly set in environment variables
2. **No Results**: Check location validity and try different search terms
3. **Build Errors**: Run `npm install` and ensure all dependencies are installed
4. **Location Permission**: Allow browser location access for better results
5. **Mobile Testing**: Use `npm run dev-mobile` for cross-device testing

### Production Issues

1. **Deployment Fails**: Check GitHub Actions logs and verify all secrets are set
2. **App Won't Start**: Verify Heroku config vars are properly set
3. **Database Errors**: The app works without database - MongoDB is optional for search history

## 📱 Mobile Development

```bash
npm run dev-mobile   # Access from any device on your network
npm run dev-https    # HTTPS for location services testing
```

Access your app from mobile devices using your computer's IP address.

## 🧹 Production Ready

This project is production-ready with:
- ✅ **Zero build errors** - Clean, optimized codebase
- ✅ **Mobile responsive** - Works on all device sizes
- ✅ **Error handling** - Comprehensive error management
- ✅ **Performance optimized** - Fast loading and efficient API calls
- ✅ **SEO friendly** - Proper metadata and structure
- ✅ **Accessibility** - WCAG compliant design
- ✅ **CI/CD pipeline** - Automated testing and deployment

## 📄 License

MIT License - see LICENSE file for details.

---

**🎉 Ready to find amazing restaurants with AI-powered recommendations!** 

For issues or questions, please create a GitHub issue or contact the maintainers.

Built with ❤️ using Next.js, Claude AI, and Google Places API.
   ```
   CLAUDE_API_KEY=your_claude_api_key_here
   GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** to [http://localhost:3000](http://localhost:3000)

## 🎮 How to Use

1. **Enter a location** (e.g., "Melbourne CBD", "Sydney", "New York")
2. **Specify your preferences** (cuisine, dietary restrictions, occasion)
3. **Click "Find Places to Eat"** to get AI-powered recommendations
4. **Browse results** with ratings, hours, contact info, and AI insights
5. **Click "Directions"** to open Google Maps
6. **Use phone/website buttons** to contact restaurants directly

## 🔑 Getting API Keys

### Claude AI API Key
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env.local` file

### Google Places API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Places API
   - Places API (New)
   - Geocoding API
4. Create credentials (API Key)
5. Copy the key to your `.env.local` file

## 🛠️ Development Commands

```bash
# Start development server (with Turbopack)
npm run dev

# Start development server without Turbopack
npm run dev-standard

# Start development server with HTTPS for mobile testing
npm run dev-https

# Start development server accessible from local network
npm run dev-mobile

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 📁 Project Structure

```
src/app/
├── api/restaurants/
│   ├── search/route.ts     # Live API (Claude + Google)
│   ├── demo/route.ts       # Demo data
│   └── health/             # API health checks
├── components/
│   ├── SearchForm.tsx      # Search interface
│   └── RestaurantCard.tsx  # Restaurant display
├── globals.css             # Custom CSS styling
├── layout.tsx              # App layout
└── page.tsx                # Main page component
```

## 🎨 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes
- **AI**: Claude AI API (Anthropic)
- **Maps**: Google Places API, Google Maps API
- **Styling**: Custom CSS with Bootstrap 5
- **Icons**: Bootstrap Icons

## 🔧 Customization

### Search Preferences
The app uses a freetext approach where users can describe exactly what they want:
- **Cuisine types**: "Italian", "Thai", "fusion", "authentic Mexican", etc.
- **Dietary needs**: "vegetarian", "vegan", "gluten-free", "halal", etc.
- **Occasions**: "date night", "family dinner", "business lunch", "quick bite"
- **Price range**: "budget-friendly", "fine dining", "mid-range"
- **Atmosphere**: "casual", "romantic", "family-friendly", "trendy"

### Styling
The app uses custom CSS in `src/app/globals.css` with Bootstrap 5. Modify styles directly or extend the existing utility classes.

### AI Prompts
Customize the Claude AI prompts in `src/app/api/restaurants/search/route.ts` to change recommendation logic.

## 🚨 Troubleshooting

### Common Issues

1. **API Key Errors**: Ensure your API keys are correctly set in `.env.local`
2. **No Results**: Check if the location is valid and try different search terms
3. **Build Errors**: Run `npm install` to ensure all dependencies are installed
4. **Location Permission**: Allow location access for better results
5. **Mobile Testing**: Use `npm run dev-mobile` to test on mobile devices

### Debug Mode
The app includes comprehensive error handling and logging for development. Check the browser console for detailed error messages.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎉 Deployment

Ready for deployment to:
- **Vercel** (recommended for Next.js apps)
- **Netlify**
- **AWS**
- **Any Node.js hosting platform**

## 🧹 Recent Updates

This project has been recently cleaned and optimized:
- ✅ Removed duplicate components and unused files
- ✅ Cleaned up debug console logs for production
- ✅ Streamlined codebase with single source of truth
- ✅ Updated documentation to reflect current state
- ✅ Optimized for better performance and maintainability

---

**Enjoy finding amazing restaurants with AI-powered recommendations!** 🍽️✨
