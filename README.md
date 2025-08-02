# Where to Eat - AI-Powered Restaurant Finder

A modern web application that helps users find the best restaurants based on their location and cuisine preferences, powered by Claude AI and Google Places API.

## 🎯 Features

- 🍽️ **Intelligent Restaurant Search**: Powered by Claude AI for personalized recommendations
- 🗺️ **Google Maps Integration**: Real restaurant data with locations, ratings, and reviews
- 📱 **Responsive Design**: Works well on desktop and mobile
- 🎯 **Smart Filtering**: Filter by cuisine, price range, distance, and dietary restrictions
- 🤖 **AI-Powered Recommendations**: Claude analyzes restaurant reviews and provides insights
- ⭐ **Real-time Information**: Current ratings, hours, and availability
- 🎨 **Modern UI**: Clean, intuitive interface with custom CSSAI-Powered Restaurant Finder

A modern web application that helps users find the best restaurants based on their location and cuisine preferences, powered by Claude AI and Google Places API.

## 🎯 Features

- 🍽️ **Smart Restaurant Search**: Find restaurants by location and cuisine type
- 🤖 **AI-Powered Recommendations**: Claude AI analyzes and ranks restaurants
- 🗺️ **Google Maps Integration**: Get directions and location details
- ⭐ **Real-time Information**: Current ratings, hours, and availability
## Features

- 🍽️ **Intelligent Restaurant Search**: Powered by Claude AI for personalized recommendations
- �️ **Google Maps Integration**: Real restaurant data with locations, ratings, and reviews
- �📱 **Responsive Design**: Works well on desktop and mobile
- 🎯 **Smart Filtering**: Filter by cuisine, price range, distance, and dietary restrictions
- 🎨 **Modern UI**: Clean, intuitive interface with custom CSS

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or later)
- **Claude AI API Key** from [Anthropic Console](https://console.anthropic.com/)
- **Google Places API Key** from [Google Cloud Console](https://console.cloud.google.com/)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   copy .env.example .env.local
   ```

3. **Configure your API keys** in `.env.local`:
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
3. **Click "Find Great Restaurants"** to get AI-powered recommendations
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

### Adding New Cuisine Types
Edit the `cuisineOptions` array in `src/app/components/SearchForm.tsx`:

```typescript
const cuisineOptions = [
  'Any', 'Italian', 'Chinese', 'Japanese', 'Thai', 'Indian', 
  'Mexican', 'French', 'American', 'Mediterranean',
  // Add new cuisines here
  'Your New Cuisine',
];
```

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
