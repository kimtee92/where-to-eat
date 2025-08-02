import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { Client } from '@googlemaps/google-maps-services-js';

// Initialize clients
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

const googleMapsClient = new Client({});

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

// Helper function to check if a restaurant is currently open (fallback for when Google doesn't provide open_now)
function isRestaurantOpen(openingHours?: string[]): boolean {
  if (!openingHours || openingHours.length === 0) {
    return false; // Assume closed if no hours provided (likely temporarily closed)
  }

  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  // Google's weekday_text format: ["Monday: 9:00 AM – 9:00 PM", "Tuesday: 9:00 AM – 9:00 PM", ...]
  // Days are in order: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  // Helper function to parse time string and check if current time falls within range
  function checkTimeRange(hoursString: string): boolean {
    if (hoursString.toLowerCase().includes('closed')) {
      return false;
    }

    // Extract time range - handle various formats including "5 pm–4 am" and "8:30 am–5 pm"
    const timeMatch = hoursString.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)\s*[–\-—]\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    
    if (!timeMatch) {
      return false; // Assume closed if can't parse hours (was returning true)
    }

    const [, openHour, openMin, openPeriod, closeHour, closeMin, closePeriod] = timeMatch;
    
    // Convert to minutes since midnight
    let openTimeInMinutes = parseInt(openHour) * 60 + parseInt(openMin || '0');
    let closeTimeInMinutes = parseInt(closeHour) * 60 + parseInt(closeMin || '0');
    
    // Handle AM/PM conversion
    if (openPeriod.toLowerCase() === 'pm' && parseInt(openHour) !== 12) {
      openTimeInMinutes += 12 * 60; // Add 12 hours for PM (except 12 PM)
    }
    if (openPeriod.toLowerCase() === 'am' && parseInt(openHour) === 12) {
      openTimeInMinutes = parseInt(openMin || '0'); // 12 AM = 00:xx
    }
    
    if (closePeriod.toLowerCase() === 'pm' && parseInt(closeHour) !== 12) {
      closeTimeInMinutes += 12 * 60; // Add 12 hours for PM (except 12 PM)
    }
    if (closePeriod.toLowerCase() === 'am' && parseInt(closeHour) === 12) {
      closeTimeInMinutes = parseInt(closeMin || '0'); // 12 AM = 00:xx
    }

    // Handle overnight hours (e.g., 5 PM - 4 AM)
    if (closeTimeInMinutes < openTimeInMinutes) {
      // Overnight: open if current time is after opening OR before closing
      return currentTimeInMinutes >= openTimeInMinutes || currentTimeInMinutes <= closeTimeInMinutes;
    }
    
    // Same day: open if current time is between opening and closing
    return currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes <= closeTimeInMinutes;
  }

  // Check if we might be in an overnight period from yesterday FIRST
  // For example, if it's Sunday 12 AM and Saturday was "11 am–3 am"
  const yesterdayDayIndex = currentDay === 0 ? 5 : (currentDay === 1 ? 6 : currentDay - 2);
  const yesterdayName = dayNames[yesterdayDayIndex];
  
  const yesterdayHours = openingHours.find(hours => 
    hours.toLowerCase().includes(yesterdayName)
  );

  if (yesterdayHours && !yesterdayHours.toLowerCase().includes('closed')) {
    // Extract time range from yesterday
    const timeMatch = yesterdayHours.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)\s*[–\-—]\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    
    if (timeMatch) {
      const [, , , , closeHour, closeMin, closePeriod] = timeMatch;
      
      let closeTimeInMinutes = parseInt(closeHour) * 60 + parseInt(closeMin || '0');
      
      if (closePeriod.toLowerCase() === 'pm' && parseInt(closeHour) !== 12) {
        closeTimeInMinutes += 12 * 60;
      }
      if (closePeriod.toLowerCase() === 'am' && parseInt(closeHour) === 12) {
        closeTimeInMinutes = parseInt(closeMin || '0');
      }

      // If yesterday's closing time is in early AM (indicating overnight), check if we're still in that period
      if (closePeriod.toLowerCase() === 'am' && closeTimeInMinutes <= 12 * 60) { // Closing before noon = overnight
        if (currentTimeInMinutes <= closeTimeInMinutes) {
          return true; // Still in yesterday's overnight period
        }
      }
    }
  }

  // Only check today's hours if we're NOT in yesterday's overnight period
  const googleDayIndex = currentDay === 0 ? 6 : currentDay - 1; // Convert JS day (0=Sunday) to Google format (0=Monday)
  const todayName = dayNames[googleDayIndex];
  
  const todayHours = openingHours.find(hours => 
    hours.toLowerCase().includes(todayName)
  );

  if (todayHours && checkTimeRange(todayHours)) {
    return true;
  }

  return false;
}

// Helper function to check if restaurant's opening time has already passed today
function hasOpeningTimePassed(openingHours?: string[]): boolean {
  if (!openingHours || openingHours.length === 0) return false;
  
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes
  
  // Get today's hours
  const todayHours = openingHours[currentDay === 0 ? 6 : currentDay - 1]; // Adjust for Google's format
  
  if (!todayHours || todayHours.includes('Closed')) return true;
  
  // Extract opening time from formats like "Monday: 9:30 AM – 5:30 PM"
  const timeMatch = todayHours.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/);
  if (timeMatch) {
    let openingHour = parseInt(timeMatch[1]);
    const openingMinute = parseInt(timeMatch[2]);
    const isPM = timeMatch[3] === 'PM';
    
    // Convert to 24-hour format
    if (isPM && openingHour !== 12) openingHour += 12;
    if (!isPM && openingHour === 12) openingHour = 0;
    
    const openingTimeInMinutes = openingHour * 60 + openingMinute;
    
    // Return true if current time has passed opening time
    return currentTime > openingTimeInMinutes;
  }
  
  return false;
}

// Helper function to get real-time status information including overnight period details
function getRealTimeStatus(openingHours?: string[], googleOpenNow?: boolean): {
  isOpen: boolean;
  currentPeriod?: {
    day: string;
    hours: string;
    isOvernightPeriod: boolean;
    closesAt?: string;
  };
  message?: string;
} {
  if (!openingHours || openingHours.length === 0) {
    return {
      isOpen: false,
      message: 'Hours not available'
    };
  }

  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayDisplayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Check if we might be in an overnight period from yesterday FIRST
  const yesterdayDayIndex = currentDay === 0 ? 5 : (currentDay === 1 ? 6 : currentDay - 2);
  const yesterdayName = dayNames[yesterdayDayIndex];
  const yesterdayDisplayName = dayDisplayNames[yesterdayDayIndex];
  
  const yesterdayHours = openingHours.find(hours => 
    hours.toLowerCase().includes(yesterdayName)
  );

  if (yesterdayHours && !yesterdayHours.toLowerCase().includes('closed')) {
    // Extract time range from yesterday
    const timeMatch = yesterdayHours.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)\s*[–\-—]\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    
    if (timeMatch) {
      const [, openHour, openMin, openPeriod, closeHour, closeMin, closePeriod] = timeMatch;
      
      let closeTimeInMinutes = parseInt(closeHour) * 60 + parseInt(closeMin || '0');
      
      if (closePeriod.toLowerCase() === 'pm' && parseInt(closeHour) !== 12) {
        closeTimeInMinutes += 12 * 60;
      }
      if (closePeriod.toLowerCase() === 'am' && parseInt(closeHour) === 12) {
        closeTimeInMinutes = parseInt(closeMin || '0');
      }

      // If yesterday's closing time is in early AM (indicating overnight), check if we're still in that period
      if (closePeriod.toLowerCase() === 'am' && closeTimeInMinutes <= 12 * 60) { // Closing before noon = overnight
        if (currentTimeInMinutes <= closeTimeInMinutes) {
          const closeTime12hr = `${closeHour}:${(closeMin || '00').padStart(2, '0')} ${closePeriod.toUpperCase()}`;
          
          return {
            isOpen: true,
            currentPeriod: {
              day: yesterdayDisplayName,
              hours: yesterdayHours.split(': ')[1] || yesterdayHours,
              isOvernightPeriod: true,
              closesAt: closeTime12hr
            },
            message: `Open until ${closeTime12hr} (${yesterdayDisplayName}'s overnight hours)`
          };
        }
      }
    }
  }

  // Check today's hours if not in yesterday's overnight period
  const googleDayIndex = currentDay === 0 ? 6 : currentDay - 1; // Convert JS day (0=Sunday) to Google format (0=Monday)
  const todayName = dayNames[googleDayIndex];
  const todayDisplayName = dayDisplayNames[googleDayIndex];
  
  const todayHours = openingHours.find(hours => 
    hours.toLowerCase().includes(todayName)
  );

  if (todayHours) {
    if (todayHours.toLowerCase().includes('closed')) {
      return {
        isOpen: false,
        currentPeriod: {
          day: todayDisplayName,
          hours: 'Closed',
          isOvernightPeriod: false
        },
        message: `Closed today (${todayDisplayName})`
      };
    }

    // Extract time range
    const timeMatch = todayHours.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)\s*[–\-—]\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    
    if (timeMatch) {
      const [, openHour, openMin, openPeriod, closeHour, closeMin, closePeriod] = timeMatch;
      
      // Convert to minutes since midnight
      let openTimeInMinutes = parseInt(openHour) * 60 + parseInt(openMin || '0');
      let closeTimeInMinutes = parseInt(closeHour) * 60 + parseInt(closeMin || '0');
      
      // Handle AM/PM conversion
      if (openPeriod.toLowerCase() === 'pm' && parseInt(openHour) !== 12) {
        openTimeInMinutes += 12 * 60;
      }
      if (openPeriod.toLowerCase() === 'am' && parseInt(openHour) === 12) {
        openTimeInMinutes = parseInt(openMin || '0');
      }
      
      if (closePeriod.toLowerCase() === 'pm' && parseInt(closeHour) !== 12) {
        closeTimeInMinutes += 12 * 60;
      }
      if (closePeriod.toLowerCase() === 'am' && parseInt(closeHour) === 12) {
        closeTimeInMinutes = parseInt(closeMin || '0');
      }

      const openTime12hr = `${openHour}:${(openMin || '00').padStart(2, '0')} ${openPeriod.toUpperCase()}`;
      const closeTime12hr = `${closeHour}:${(closeMin || '00').padStart(2, '0')} ${closePeriod.toUpperCase()}`;

      // Handle overnight hours (e.g., 5 PM - 4 AM)
      if (closeTimeInMinutes < openTimeInMinutes) {
        const isCurrentlyOpen = currentTimeInMinutes >= openTimeInMinutes || currentTimeInMinutes <= closeTimeInMinutes;
        
        if (isCurrentlyOpen) {
          if (currentTimeInMinutes >= openTimeInMinutes) {
            // We're in the opening day part of the overnight period
            return {
              isOpen: true,
              currentPeriod: {
                day: todayDisplayName,
                hours: todayHours.split(': ')[1] || todayHours,
                isOvernightPeriod: true,
                closesAt: closeTime12hr
              },
              message: `Open until ${closeTime12hr} tomorrow (overnight hours)`
            };
          } else {
            // We're in the next day part of the overnight period
            return {
              isOpen: true,
              currentPeriod: {
                day: todayDisplayName,
                hours: todayHours.split(': ')[1] || todayHours,
                isOvernightPeriod: true,
                closesAt: closeTime12hr
              },
              message: `Open until ${closeTime12hr} (${todayDisplayName}'s overnight hours)`
            };
          }
        } else {
          return {
            isOpen: false,
            currentPeriod: {
              day: todayDisplayName,
              hours: todayHours.split(': ')[1] || todayHours,
              isOvernightPeriod: true
            },
            message: `Closed - Opens at ${openTime12hr}`
          };
        }
      } else {
        // Same day hours
        const isCurrentlyOpen = currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes <= closeTimeInMinutes;
        
        return {
          isOpen: isCurrentlyOpen,
          currentPeriod: {
            day: todayDisplayName,
            hours: todayHours.split(': ')[1] || todayHours,
            isOvernightPeriod: false,
            closesAt: isCurrentlyOpen ? closeTime12hr : undefined
          },
          message: isCurrentlyOpen 
            ? `Open until ${closeTime12hr}` 
            : currentTimeInMinutes < openTimeInMinutes 
              ? `Closed - Opens at ${openTime12hr}` 
              : `Closed - Opens ${openTime12hr} tomorrow`
        };
      }
    }
  }

  // Fallback to Google's status if we can't parse hours
  return {
    isOpen: googleOpenNow || false,
    message: googleOpenNow ? 'Currently open' : 'Currently closed'
  };
}

interface Restaurant {
  id: string;
  name: string;
  rating: number;
  address: string;
  phone?: string;
  website?: string;
  googleMapsUrl: string;
  isOpen: boolean;
  openingHours?: string[];
  priceLevel?: number;
  cuisine?: string;
  distance?: number;
  photoUrl?: string;
  geometry?: {
    lat: number;
    lng: number;
  };
  aiRecommendation?: string;
  realTimeStatus?: {
    isOpen: boolean;
    currentPeriod?: {
      day: string;
      hours: string;
      isOvernightPeriod: boolean;
      closesAt?: string;
    };
    message?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { location, preferences = '', userLocation, radius = 10000 } = await request.json();

    if (!location) {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }

    // Check for required API keys
    if (!process.env.CLAUDE_API_KEY) {
      console.error('Claude API key not found');
      return NextResponse.json(
        { error: 'Claude API key not configured' },
        { status: 500 }
      );
    }

    if (!process.env.GOOGLE_PLACES_API_KEY) {
      console.error('Google Places API key not found');
      return NextResponse.json(
        { error: 'Google Places API key not configured' },
        { status: 500 }
      );
    }

    // Step 1: Use Google Places to Find Places to Eat
    // Enhanced keyword extraction from preferences
    let searchQuery = `restaurants in ${location}`;
    let searchType = 'restaurant'; // Default type
    
    // Parse location to extract coordinates if provided as lat,lng
    let searchLocation = location;
    let userCoords = userLocation;
    
    // Check if location is coordinates (e.g., "-33.8688, 151.2093")
    const coordsMatch = location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    if (coordsMatch) {
      const lat = parseFloat(coordsMatch[1]);
      const lng = parseFloat(coordsMatch[2]);
      
      // Use reverse geocoding to get a readable location name
      try {
        const geocodeResponse = await googleMapsClient.reverseGeocode({
          params: {
            latlng: `${lat},${lng}`,
            key: process.env.GOOGLE_PLACES_API_KEY!,
          },
        });
        
        if (geocodeResponse.data.results && geocodeResponse.data.results[0]) {
          const result = geocodeResponse.data.results[0];
          searchLocation = result.formatted_address;
          
          // Use the coordinates from the location input
          userCoords = { lat, lng };
        }
      } catch (error) {
        console.error('Reverse geocoding failed:', error);
      }
    }
    
    if (preferences) {
      const lowerPrefs = preferences.toLowerCase();
      
      // Enhanced cuisine detection
      const cuisineKeywords = {
        'italian': ['italian', 'pizza', 'pasta', 'spaghetti', 'lasagna', 'risotto'],
        'chinese': ['chinese', 'dim sum', 'dumplings', 'noodles', 'stir fry', 'fried rice'],
        'japanese': ['japanese', 'sushi', 'ramen', 'tempura', 'teriyaki', 'bento'],
        'thai': ['thai', 'pad thai', 'curry', 'tom yum', 'green curry', 'red curry'],
        'indian': ['indian', 'curry', 'biryani', 'tandoori', 'naan', 'masala'],
        'mexican': ['mexican', 'tacos', 'burritos', 'quesadilla', 'enchiladas', 'nachos'],
        'french': ['french', 'croissant', 'baguette', 'crepe', 'bistro', 'boeuf'],
        'american': ['american', 'burger', 'bbq', 'steak', 'ribs', 'wings'],
        'mediterranean': ['mediterranean', 'greek', 'hummus', 'falafel', 'gyros', 'kebab'],
        'korean': ['korean', 'kimchi', 'bulgogi', 'bibimbap', 'kbbq', 'korean bbq'],
        'vietnamese': ['vietnamese', 'pho', 'banh mi', 'spring rolls', 'bun bo hue'],
        'spanish': ['spanish', 'paella', 'tapas', 'sangria', 'churros'],
        'middle eastern': ['middle eastern', 'shawarma', 'kabab', 'lebanese', 'turkish']
      };
      
      // Food style/occasion detection
      const styleKeywords = {
        'fast food': ['fast food', 'quick', 'drive through', 'takeaway', 'grab and go'],
        'fine dining': ['fine dining', 'upscale', 'fancy', 'elegant', 'romantic', 'date night'],
        'casual dining': ['casual', 'family', 'relaxed', 'comfortable'],
        'cafe': ['cafe', 'coffee', 'breakfast', 'brunch', 'pastries'],
        'bar': ['bar', 'drinks', 'cocktails', 'beer', 'wine', 'happy hour'],
        'buffet': ['buffet', 'all you can eat', 'unlimited'],
        'food truck': ['food truck', 'street food', 'mobile']
      };
      
      // Dietary restrictions
      const dietaryKeywords = ['vegetarian', 'vegan', 'gluten free', 'halal', 'kosher', 'keto', 'paleo'];
      
      // Find matching cuisine
      let foundCuisine = '';
      for (const [cuisine, keywords] of Object.entries(cuisineKeywords)) {
        if (keywords.some(keyword => lowerPrefs.includes(keyword))) {
          foundCuisine = cuisine;
          break;
        }
      }
      
      // Find matching style
      let foundStyle = '';
      for (const [style, keywords] of Object.entries(styleKeywords)) {
        if (keywords.some(keyword => lowerPrefs.includes(keyword))) {
          foundStyle = style;
          break;
        }
      }
      
      // Build search query based on what we found
      if (foundCuisine && foundStyle) {
        searchQuery = `${foundCuisine} ${foundStyle} in ${searchLocation}`;
      } else if (foundCuisine) {
        searchQuery = `${foundCuisine} restaurants in ${searchLocation}`;
      } else if (foundStyle) {
        searchQuery = `${foundStyle} in ${searchLocation}`;
        searchType = foundStyle.includes('cafe') ? 'cafe' : foundStyle.includes('bar') ? 'bar' : 'restaurant';
      } else {
        // If no specific keywords found, include the preferences in the search
        const cleanPrefs = preferences.replace(/[^\w\s]/g, '').trim();
        if (cleanPrefs.length > 0) {
          searchQuery = `${cleanPrefs} restaurants in ${searchLocation}`;
        }
      }
    }
    
    // Prepare the API call parameters
    const searchParams: any = {
      query: searchQuery,
      key: process.env.GOOGLE_PLACES_API_KEY,
    };

    // Only add location and radius if userCoords is defined and has lat/lng properties
    if (userCoords && typeof userCoords === 'object' && 'lat' in userCoords && 'lng' in userCoords) {
      searchParams.location = `${userCoords.lat},${userCoords.lng}`;
      searchParams.radius = radius; // Use the provided radius
    }

    // Add type if it's not the default restaurant type
    if (searchType !== 'restaurant') {
      searchParams.type = searchType;
    }

    const placesResponse = await googleMapsClient.textSearch({
      params: searchParams,
    });

    if (!placesResponse.data.results || placesResponse.data.results.length === 0) {
      return NextResponse.json({
        restaurants: [],
        message: 'No restaurants found in the specified location',
      });
    }

    // Step 2: Get detailed information for each restaurant
    const restaurantPromises = placesResponse.data.results.slice(0, 12).map(async (place) => {
      try {
        // Get place details
        const detailsResponse = await googleMapsClient.placeDetails({
          params: {
            place_id: place.place_id!,
            key: process.env.GOOGLE_PLACES_API_KEY!,
            fields: ['name', 'formatted_address', 'formatted_phone_number', 'website', 'rating', 'opening_hours', 'price_level', 'photos', 'geometry', 'reviews', 'business_status'] as any,
          },
        });

        const details = detailsResponse.data.result;
        const isOpenNow = details.opening_hours?.open_now ?? false;
        
        // Also check with our custom logic for comparison
        const customOpenCheck = isRestaurantOpen(details.opening_hours?.weekday_text);

        // Skip places with no opening hours data or temporarily closed status
        if (!details.opening_hours?.weekday_text || details.business_status === 'CLOSED_TEMPORARILY') {
          console.log(`Skipping ${details.name} - no hours data or temporarily closed (status: ${details.business_status})`);
          return null;
        }

        // Skip if Google explicitly says it's closed or has no hours
        if (details.opening_hours?.open_now !== true) {
          console.log(`Skipping ${details.name} - Google says closed or unknown status`);
          return null;
        }

        // Debug logging to check what Google is returning vs our logic
        console.log(`Restaurant: ${details.name}`);
        console.log(`Google open_now: ${details.opening_hours?.open_now}`);
        console.log(`Business status: ${details.business_status || 'Not specified'}`);
        console.log(`Has opening hours: ${!!details.opening_hours?.weekday_text}`);
        console.log(`Our custom logic: ${customOpenCheck}`);
        
        // Early filtering debug
        if (!details.opening_hours?.weekday_text) {
          console.log(`❌ Will skip - No opening hours data available`);
        } else if (details.business_status === 'CLOSED_TEMPORARILY') {
          console.log(`❌ Will skip - Business temporarily closed`);
        } else if (details.opening_hours?.open_now !== true) {
          console.log(`❌ Will skip - Google says currently closed or unknown`);
        } else {
          console.log(`✅ Will process - Passes initial filters`);
        }
        if (details.opening_hours?.weekday_text) {
          const now = new Date();
          const currentDay = now.getDay();
          const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
          const googleDayIndex = currentDay === 0 ? 6 : currentDay - 1;
          const todayName = dayNames[googleDayIndex];
          const yesterdayDayIndex = currentDay === 0 ? 5 : (currentDay === 1 ? 6 : currentDay - 2);
          const yesterdayName = dayNames[yesterdayDayIndex];
          
          const todaysHoursEntry = details.opening_hours.weekday_text.find(h => h.toLowerCase().includes(todayName));
          const yesterdaysHoursEntry = details.opening_hours.weekday_text.find(h => h.toLowerCase().includes(yesterdayName));
          
          console.log(`Today is: ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDay]} (${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')})`);
          console.log(`Today's hours: ${todaysHoursEntry || 'Not found'}`);
          console.log(`Yesterday's hours: ${yesterdaysHoursEntry || 'Not found'}`);
          
          // Parse and show the times we're working with
          if (todaysHoursEntry && !todaysHoursEntry.toLowerCase().includes('closed')) {
            const timeMatch = todaysHoursEntry.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)\s*[–\-—]\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
            if (timeMatch) {
              const [, openHour, openMin, openPeriod, closeHour, closeMin, closePeriod] = timeMatch;
              console.log(`Parsed today: ${openHour}:${openMin || '00'} ${openPeriod} - ${closeHour}:${closeMin || '00'} ${closePeriod}`);
            }
          }
          
          if (yesterdaysHoursEntry && !yesterdaysHoursEntry.toLowerCase().includes('closed')) {
            const timeMatch = yesterdaysHoursEntry.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)\s*[–\-—]\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
            if (timeMatch) {
              const [, openHour, openMin, openPeriod, closeHour, closeMin, closePeriod] = timeMatch;
              console.log(`Parsed yesterday: ${openHour}:${openMin || '00'} ${openPeriod} - ${closeHour}:${closeMin || '00'} ${closePeriod}`);
              
              // Check if we're in yesterday's overnight period
              let closeTimeInMinutes = parseInt(closeHour) * 60 + parseInt(closeMin || '0');
              if (closePeriod.toLowerCase() === 'pm' && parseInt(closeHour) !== 12) {
                closeTimeInMinutes += 12 * 60;
              }
              if (closePeriod.toLowerCase() === 'am' && parseInt(closeHour) === 12) {
                closeTimeInMinutes = parseInt(closeMin || '0');
              }
              
              const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
              if (closePeriod.toLowerCase() === 'am' && closeTimeInMinutes <= 12 * 60) {
                console.log(`Yesterday's overnight period detected. Current time (${currentTimeInMinutes}min) vs close time (${closeTimeInMinutes}min)`);
                if (currentTimeInMinutes <= closeTimeInMinutes) {
                  console.log(`*** STILL IN YESTERDAY'S OVERNIGHT PERIOD - Should show until ${closeHour}:${closeMin || '00'} ${closePeriod.toUpperCase()} ***`);
                } else {
                  console.log(`*** YESTERDAY'S OVERNIGHT PERIOD ENDED - Now checking today's hours ***`);
                }
              }
            }
          }
        }
        console.log(`Final isOpen status: ${details.opening_hours?.open_now !== undefined ? isOpenNow : customOpenCheck}`);
        console.log(`Using ${details.opening_hours?.open_now !== undefined ? 'Google' : 'Custom'} logic for open status`);
        console.log('---');

        // Get photo URL if available
        let photoUrl = undefined;
        if (details.photos && details.photos.length > 0) {
          const photoReference = details.photos[0].photo_reference;
          photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${process.env.GOOGLE_PLACES_API_KEY}`;
        }

        // Generate one-sentence AI recommendation based on recent reviews
        let aiRecommendation = '';
        
        if (details.reviews && details.reviews.length > 0) {
          try {
            const recentReviews = details.reviews.slice(0, 5);
            const reviewTexts = recentReviews.map(r => r.text).filter(text => text && text.length > 0);
            if (reviewTexts.length > 0) {
              const reviewPrompt = `Based on these recent Google Maps reviews for ${details.name}, write ONE concise sentence (max 15 words) highlighting what makes this restaurant special:

Recent reviews:
${reviewTexts.slice(0, 3).map((text, i) => `${i + 1}. "${text.substring(0, 150)}"`).join('\n')}

Respond with just one sentence, no quotes or extra text.`;

              const quickResponse = await anthropic.messages.create({
                model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
                max_tokens: 50,
                messages: [{ role: 'user', content: reviewPrompt }],
              });

              aiRecommendation = quickResponse.content[0].type === 'text' 
                ? quickResponse.content[0].text.trim().replace(/['"]/g, '') 
                : '';
                
            } else {
              // Fallback: Create a generic recommendation based on rating and type
              const rating = details.rating || 0;
              const ratingText = rating >= 4.5 ? 'highly rated' : 
                               rating >= 4.0 ? 'well reviewed' : 
                               rating >= 3.5 ? 'popular' : 'local';
              aiRecommendation = `A ${ratingText} restaurant with ${rating}/5 stars.`;
            }
          } catch (error) {
            console.error(`Error generating AI recommendation for ${details.name}:`, error);
            // Fallback: Create a simple recommendation based on available data
            const rating = details.rating || 0;
            const ratingText = rating >= 4.5 ? 'highly rated' : 
                             rating >= 4.0 ? 'well reviewed' : 
                             rating >= 3.5 ? 'popular' : 'local';
            aiRecommendation = `A ${ratingText} restaurant with ${rating}/5 stars.`;
          }
        } else {
          // Fallback: Create a simple recommendation based on available data
          const rating = details.rating || 0;
          const ratingText = rating >= 4.5 ? 'highly rated' : 
                           rating >= 4.0 ? 'well reviewed' : 
                           rating >= 3.5 ? 'popular' : 'local';
          aiRecommendation = `A ${ratingText} restaurant with ${rating}/5 stars.`;
        }

        // Get real-time status information including overnight period details
        const realTimeStatus = getRealTimeStatus(details.opening_hours?.weekday_text, details.opening_hours?.open_now);

        const restaurant: Restaurant = {
          id: place.place_id!,
          name: details.name || 'Unknown Restaurant',
          rating: details.rating || 0,
          address: details.formatted_address || 'Address not available',
          phone: details.formatted_phone_number,
          website: details.website,
          googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
          isOpen: details.opening_hours?.open_now !== undefined ? isOpenNow : customOpenCheck, // Use Google's status if available, otherwise our logic
          openingHours: details.opening_hours?.weekday_text,
          priceLevel: details.price_level,
          photoUrl,
          geometry: details.geometry?.location ? {
            lat: details.geometry.location.lat,
            lng: details.geometry.location.lng
          } : undefined,
          distance: userCoords && details.geometry?.location ? 
            calculateDistance(
              userCoords.lat, 
              userCoords.lng, 
              details.geometry.location.lat, 
              details.geometry.location.lng
            ) : undefined,
          aiRecommendation: aiRecommendation,
          realTimeStatus: realTimeStatus
        };

        return restaurant;
      } catch (error) {
        console.error('Error fetching restaurant details:', error);
        return null;
      }
    });

    const restaurants = (await Promise.all(restaurantPromises)).filter(Boolean) as Restaurant[];

    // Filter to only show currently open restaurants and apply distance filtering
    const availableRestaurants = restaurants.filter(restaurant => {
      // Skip if restaurant data is invalid
      if (!restaurant) {
        return false;
      }
      
      // Only show currently open restaurants - trust Google's open_now status
      if (!restaurant.isOpen) {
        console.log(`Filtering out ${restaurant.name} - marked as closed`);
        return false;
      }
      
      // Check distance if user coordinates are available
      if (userCoords && restaurant.distance !== undefined) {
        const radiusInKm = radius / 1000; // Convert radius from meters to km
        return restaurant.distance <= radiusInKm;
      }
      
      // If no distance info, include the restaurant
      return true;
    });

    // Step 3: Use Claude AI to analyze and rank the restaurants
    const claudePrompt = `
You are an expert restaurant recommendation AI with deep knowledge of dining preferences, dietary restrictions, and food culture. I found ${availableRestaurants.length} restaurants in ${searchLocation}.

USER PREFERENCES:
- Location: ${searchLocation}
- Preferences: "${preferences || 'No specific preferences mentioned'}"

Here are the restaurants with their details:
${availableRestaurants.map((r, i) => `
${i + 1}. ${r.name}
   - Rating: ${r.rating}/5 (${r.rating >= 4.5 ? 'Excellent' : r.rating >= 4.0 ? 'Very Good' : r.rating >= 3.5 ? 'Good' : 'Average'})
   - Address: ${r.address}
   - Currently: ${r.isOpen ? 'OPEN' : 'CLOSED'}
   ${r.distance ? `- Distance: ${r.distance.toFixed(1)} km away` : ''}
   - Price Level: ${r.priceLevel ? '$'.repeat(r.priceLevel) + ` (${r.priceLevel === 1 ? 'Budget-friendly' : r.priceLevel === 2 ? 'Moderate' : r.priceLevel === 3 ? 'Expensive' : 'Very Expensive'})` : 'Price not specified'}
   ${r.phone ? `- Phone: ${r.phone}` : ''}
   ${r.website ? `- Website: Available` : ''}
   ${r.openingHours ? `- Hours: ${r.openingHours[0] || 'Hours vary'}` : ''}
`).join('')}

ANALYSIS TASK:
Please provide intelligent restaurant recommendations based on the user's preferences: "${preferences || 'general dining'}"

Consider:
1. **User Preferences**: Analyze their stated preferences for cuisine, dietary needs, occasion, style, price range, etc.
2. **Proximity**: Prioritize closer restaurants when possible (distance shown in km)
3. **Availability**: Prioritize open restaurants
4. **Quality**: Consider ratings and reputation
5. **Suitability**: Match the user's specific needs

For each recommendation, provide:
- Why it's well-suited for their stated preferences
- How distance and convenience factor into the recommendation
- How it matches their specific requirements
- What makes it special for their needs
- Quality and atmosphere insights

Return only a JSON object with this structure:
{
  "recommendations": [
    {
      "restaurantIndex": 0,
      "reasoning": "Detailed explanation focusing on why this restaurant is well-suited for their specific preferences and needs."
    }
  ],
  "summary": "A personalized summary highlighting how these recommendations match their preferences."
}

Important: Only return valid JSON, no additional text.
`;

    let rankedRestaurants = availableRestaurants;
    let aiSummary = '';

    try {
      const modelToUse = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';
      const maxTokens = parseInt(process.env.CLAUDE_MAX_TOKENS || '1000');
      
      const claudeResponse = await anthropic.messages.create({
        model: modelToUse,
        max_tokens: maxTokens,
        messages: [
          {
            role: 'user',
            content: claudePrompt,
          },
        ],
      });

      const responseText = claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : '';
      
      try {
        const aiResponse = JSON.parse(responseText);
        
        if (aiResponse.recommendations && Array.isArray(aiResponse.recommendations)) {
          // Reorder restaurants based on AI recommendations
          const reorderedRestaurants: Restaurant[] = [];
          const usedIndices = new Set<number>();

          // Add restaurants in AI-recommended order with reasoning
          for (const rec of aiResponse.recommendations) {
            const index = rec.restaurantIndex;
            if (index >= 0 && index < availableRestaurants.length && !usedIndices.has(index)) {
              const restaurantWithReasoning = {
                ...availableRestaurants[index],
                claudeReasoning: rec.reasoning
              };
              reorderedRestaurants.push(restaurantWithReasoning);
              usedIndices.add(index);
            }
          }

          // Add any remaining restaurants
          for (let i = 0; i < availableRestaurants.length; i++) {
            if (!usedIndices.has(i)) {
              reorderedRestaurants.push(availableRestaurants[i]);
            }
          }

          rankedRestaurants = reorderedRestaurants;
        }

        aiSummary = aiResponse.summary || '';
      } catch (parseError) {
        console.error('Error parsing Claude response:', parseError);
        // Fall back to smart sorting: open restaurants first, then by distance, then by rating
        rankedRestaurants = availableRestaurants.sort((a, b) => {
          // Open restaurants first
          if (a.isOpen !== b.isOpen) {
            return a.isOpen ? -1 : 1;
          }
          // Then by distance if available
          if (a.distance !== undefined && b.distance !== undefined) {
            if (Math.abs(a.distance - b.distance) > 0.5) { // Only prioritize if difference > 0.5km
              return a.distance - b.distance;
            }
          }
          // Finally by rating
          return b.rating - a.rating;
        });
      }
    } catch (claudeError) {
      console.error('Claude API error:', claudeError);
      // Fall back to smart sorting: open restaurants first, then by distance, then by rating
      rankedRestaurants = availableRestaurants.sort((a, b) => {
        // Open restaurants first
        if (a.isOpen !== b.isOpen) {
          return a.isOpen ? -1 : 1;
        }
        // Then by distance if available
        if (a.distance !== undefined && b.distance !== undefined) {
          if (Math.abs(a.distance - b.distance) > 0.5) { // Only prioritize if difference > 0.5km
            return a.distance - b.distance;
          }
        }
        // Finally by rating
        return b.rating - a.rating;
      });
    }

    return NextResponse.json({
      restaurants: rankedRestaurants,
      summary: aiSummary,
      location,
      preferences,
    });

  } catch (error) {
    console.error('Restaurant search error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to search restaurants',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
