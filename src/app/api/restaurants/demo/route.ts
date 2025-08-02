import { NextRequest, NextResponse } from 'next/server';

// Helper function to check if a restaurant is currently open
function isRestaurantOpen(openingHours?: string[]): boolean {
  if (!openingHours || openingHours.length === 0) {
    return true; // Assume open if no hours provided
  }

  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentTime = now.getHours() * 100 + now.getMinutes(); // e.g., 14:30 = 1430

  // Map day numbers to day names
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayName = dayNames[currentDay];

  // Find today's hours
  const todayHours = openingHours.find(hours => 
    hours.toLowerCase().includes(todayName)
  );

  if (!todayHours) {
    return false; // No hours found for today
  }

  // Check if closed today
  if (todayHours.toLowerCase().includes('closed')) {
    return false;
  }

  // Extract time range - handle various formats
  // Match patterns like "Monday: 9:00 AM – 9:00 PM" or "Monday: 9:00 AM - 9:00 PM"
  const timeMatch = todayHours.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*[–\-—]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  
  if (!timeMatch) {
    return true; // Assume open if can't parse hours
  }

  const [, openHour, openMin, openPeriod, closeHour, closeMin, closePeriod] = timeMatch;
  
  // Convert to 24-hour format
  let openTime = parseInt(openHour) * 100 + parseInt(openMin);
  let closeTime = parseInt(closeHour) * 100 + parseInt(closeMin);
  
  if (openPeriod.toUpperCase() === 'PM' && parseInt(openHour) !== 12) {
    openTime += 1200;
  }
  if (openPeriod.toUpperCase() === 'AM' && parseInt(openHour) === 12) {
    openTime = parseInt(openMin); // 12 AM = 00:xx
  }
  
  if (closePeriod.toUpperCase() === 'PM' && parseInt(closeHour) !== 12) {
    closeTime += 1200;
  }
  if (closePeriod.toUpperCase() === 'AM' && parseInt(closeHour) === 12) {
    closeTime = parseInt(closeMin); // 12 AM = 00:xx
  }

  // Handle overnight hours (e.g., 9 PM - 2 AM)
  if (closeTime < openTime) {
    return currentTime >= openTime || currentTime <= closeTime;
  }
  
  return currentTime >= openTime && currentTime <= closeTime;
}

// Demo data for testing without API keys
const demoRestaurants = [
  {
    id: '1',
    name: 'Sakura Japanese Restaurant',
    rating: 4.5,
    address: '123 Collins Street, Melbourne VIC 3000',
    phone: '+61 3 9123 4567',
    website: 'https://sakura-melbourne.com',
    googleMapsUrl: 'https://www.google.com/maps/search/japanese+restaurant+melbourne',
    isOpen: true,
    openingHours: [
      'Monday: 11:30 AM – 10:00 PM',
      'Tuesday: 11:30 AM – 10:00 PM', 
      'Wednesday: 11:30 AM – 10:00 PM',
      'Thursday: 11:30 AM – 10:00 PM',
      'Friday: 11:30 AM – 11:00 PM',
      'Saturday: 5:00 PM – 11:00 PM',
      'Sunday: 5:00 PM – 9:00 PM'
    ],
    priceLevel: 3,
    cuisine: 'Japanese',
    distance: 0.5,
    photoUrl: 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400&h=300&fit=crop',
    reviews: [
      {
        author: 'Sarah M.',
        rating: 5,
        text: 'Amazing authentic Japanese cuisine! The sashimi was incredibly fresh and the service was exceptional.',
        time: '2 days ago'
      },
      {
        author: 'David L.',
        rating: 4,
        text: 'Great atmosphere and delicious food. Excellent for date night. The tasting menu was fantastic.',
        time: '1 week ago'
      }
    ],
    geometry: { lat: -37.8136, lng: 144.9631 }
  },
  {
    id: '2',
    name: 'Bangkok Palace Thai Restaurant',
    rating: 4.2,
    address: '456 Bourke Street, Melbourne VIC 3000',
    phone: '+61 3 9876 5432',
    googleMapsUrl: 'https://www.google.com/maps/search/thai+restaurant+melbourne',
    isOpen: true,
    openingHours: [
      'Monday: 12:00 PM – 10:00 PM',
      'Tuesday: 12:00 PM – 10:00 PM',
      'Wednesday: 12:00 PM – 10:00 PM',
      'Thursday: 12:00 PM – 10:00 PM',
      'Friday: 12:00 PM – 10:30 PM',
      'Saturday: 5:30 PM – 10:30 PM',
      'Sunday: 5:30 PM – 9:30 PM'
    ],
    priceLevel: 2,
    cuisine: 'Thai',
    distance: 0.8,
    photoUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=300&fit=crop',
    reviews: [
      {
        author: 'Emma K.',
        rating: 4,
        text: 'Excellent pad thai and green curry. Authentic flavors and generous portions. Service could be faster.',
        time: '3 days ago'
      },
      {
        author: 'Mike R.',
        rating: 5,
        text: 'Best Thai food in Melbourne! The Tom Yum soup is incredible and staff are so friendly.',
        time: '5 days ago'
      }
    ],
    geometry: { lat: -37.8136, lng: 144.9641 }
  },
  {
    id: '3',
    name: 'Prime Steakhouse Melbourne',
    rating: 4.7,
    address: '789 Flinders Lane, Melbourne VIC 3000',
    phone: '+61 3 9555 0123',
    website: 'https://primesteakhouse.com.au',
    googleMapsUrl: 'https://www.google.com/maps/search/steakhouse+melbourne',
    isOpen: false,
    openingHours: [
      'Monday: Closed',
      'Tuesday: 6:00 PM – 11:00 PM',
      'Wednesday: 6:00 PM – 11:00 PM',
      'Thursday: 6:00 PM – 11:00 PM',
      'Friday: 6:00 PM – 12:00 AM',
      'Saturday: 6:00 PM – 12:00 AM',
      'Sunday: 6:00 PM – 10:00 PM'
    ],
    priceLevel: 4,
    cuisine: 'Steak/American',
    distance: 1.2
  },
  {
    id: '4',
    name: 'Little Italy Pizzeria',
    rating: 4.0,
    address: '321 Lygon Street, Carlton VIC 3053',
    phone: '+61 3 9999 8888',
    googleMapsUrl: 'https://www.google.com/maps/search/pizza+carlton+melbourne',
    isOpen: true,
    openingHours: [
      'Monday: 11:00 AM – 11:00 PM',
      'Tuesday: 11:00 AM – 11:00 PM',
      'Wednesday: 11:00 AM – 11:00 PM',
      'Thursday: 11:00 AM – 11:00 PM',
      'Friday: 11:00 AM – 12:00 AM',
      'Saturday: 11:00 AM – 12:00 AM',
      'Sunday: 11:00 AM – 11:00 PM'
    ],
    priceLevel: 2,
    cuisine: 'Pizza',
    distance: 2.1
  },
  {
    id: '5',
    name: 'Spice Garden Indian Cuisine',
    rating: 4.3,
    address: '654 Chapel Street, South Yarra VIC 3141',
    phone: '+61 3 9777 6543',
    website: 'https://spicegarden.melbourne',
    googleMapsUrl: 'https://www.google.com/maps/search/indian+restaurant+south+yarra',
    isOpen: true,
    openingHours: [
      'Monday: 5:00 PM – 10:00 PM',
      'Tuesday: 5:00 PM – 10:00 PM',
      'Wednesday: 5:00 PM – 10:00 PM',
      'Thursday: 5:00 PM – 10:00 PM',
      'Friday: 5:00 PM – 10:30 PM',
      'Saturday: 5:00 PM – 10:30 PM',
      'Sunday: 5:00 PM – 9:30 PM'
    ],
    priceLevel: 2,
    cuisine: 'Indian',
    distance: 3.5
  },
  {
    id: '6',
    name: 'Green Leaf Vegan Kitchen',
    rating: 4.6,
    address: '789 Brunswick Street, Fitzroy VIC 3065',
    phone: '+61 3 9888 7654',
    website: 'https://greenleafvegan.com',
    googleMapsUrl: 'https://www.google.com/maps/search/vegan+restaurant+fitzroy',
    isOpen: true,
    openingHours: [
      'Monday: Closed',
      'Tuesday: 11:00 AM – 9:00 PM',
      'Wednesday: 11:00 AM – 9:00 PM',
      'Thursday: 11:00 AM – 9:00 PM',
      'Friday: 11:00 AM – 10:00 PM',
      'Saturday: 10:00 AM – 10:00 PM',
      'Sunday: 10:00 AM – 9:00 PM'
    ],
    priceLevel: 2,
    cuisine: 'Vegetarian',
    distance: 2.8
  },
  {
    id: '7',
    name: 'The Halal Corner',
    rating: 4.4,
    address: '321 Sydney Road, Brunswick VIC 3056',
    phone: '+61 3 9999 8765',
    website: 'https://halalcorner.melbourne',
    googleMapsUrl: 'https://www.google.com/maps/search/halal+restaurant+brunswick',
    isOpen: true,
    openingHours: [
      'Monday: 11:00 AM – 10:00 PM',
      'Tuesday: 11:00 AM – 10:00 PM',
      'Wednesday: 11:00 AM – 10:00 PM',
      'Thursday: 11:00 AM – 10:00 PM',
      'Friday: 11:00 AM – 11:00 PM',
      'Saturday: 11:00 AM – 11:00 PM',
      'Sunday: 11:00 AM – 10:00 PM'
    ],
    priceLevel: 2,
    cuisine: 'Middle Eastern',
    distance: 4.2
  },
  {
    id: '8',
    name: 'Celiac Safe Gluten-Free Bistro',
    rating: 4.5,
    address: '456 High Street, Prahran VIC 3181',
    phone: '+61 3 9111 2345',
    website: 'https://celiacsafe.com.au',
    googleMapsUrl: 'https://www.google.com/maps/search/gluten+free+restaurant+prahran',
    isOpen: false,
    openingHours: [
      'Monday: Closed',
      'Tuesday: 11:30 AM – 3:00 PM, 5:30 PM – 9:30 PM',
      'Wednesday: 11:30 AM – 3:00 PM, 5:30 PM – 9:30 PM',
      'Thursday: 11:30 AM – 3:00 PM, 5:30 PM – 9:30 PM',
      'Friday: 11:30 AM – 3:00 PM, 5:30 PM – 10:00 PM',
      'Saturday: 10:00 AM – 3:00 PM, 5:30 PM – 10:00 PM',
      'Sunday: 10:00 AM – 3:00 PM, 5:30 PM – 9:00 PM'
    ],
    priceLevel: 3,
    cuisine: 'Modern Australian',
    distance: 1.9
  }
];

export async function POST(request: NextRequest) {
  try {
    // Extract all the new parameters
    const { location, cuisine, dietaryRestrictions = [], foodStyle, occasion } = await request.json();

    if (!location) {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }

    // Simulate a delay to make it feel real
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Filter restaurants based on cuisine preference
    let filteredRestaurants = demoRestaurants;
    
    if (cuisine !== 'Any') {
      filteredRestaurants = demoRestaurants.filter(restaurant => 
        restaurant.cuisine.toLowerCase().includes(cuisine.toLowerCase()) ||
        cuisine.toLowerCase().includes(restaurant.cuisine.toLowerCase())
      );
    }

    // Filter to only show currently open restaurants
    const openRestaurants = filteredRestaurants.map(restaurant => ({
      ...restaurant,
      isOpen: isRestaurantOpen(restaurant.openingHours)
    })).filter(restaurant => restaurant.isOpen);

    // Sort by rating (highest first) since all are already open
    const sortedRestaurants = openRestaurants.sort((a, b) => {
      return b.rating - a.rating;
    });

    // Add mock Claude reasoning to demonstrate the feature
    const restaurantsWithReasoning = sortedRestaurants.map((restaurant, index) => {
      let reasoning = '';
      
      // Generate contextual reasoning based on restaurant and user preferences
      const openStatus = restaurant.isOpen ? 'currently open' : 'currently closed';
      const ratingDesc = restaurant.rating >= 4.5 ? 'exceptional' : restaurant.rating >= 4.0 ? 'excellent' : 'good';
      
      if (index === 0) {
        reasoning = `Top recommendation: ${restaurant.name} combines ${ratingDesc} ratings (${restaurant.rating}/5) with ${restaurant.cuisine.toLowerCase()} cuisine and is ${openStatus}. ${dietaryRestrictions.length > 0 ? `Known to accommodate ${dietaryRestrictions.slice(0,2).join(' and ')} dietary needs.` : ''} ${occasion !== 'Any' ? `Great atmosphere for ${occasion.toLowerCase()}.` : ''}`;
      } else if (index === 1) {
        reasoning = `Strong alternative: Offers authentic ${restaurant.cuisine.toLowerCase()} flavors with ${ratingDesc} customer satisfaction. ${restaurant.isOpen ? 'Ready to serve you now' : 'Plan ahead as they are currently closed'}. ${foodStyle !== 'Any' ? `Great for ${foodStyle.toLowerCase()} dining experience.` : ''}`;
      } else {
        reasoning = `Quality option: ${ratingDesc.charAt(0).toUpperCase() + ratingDesc.slice(1)} ${restaurant.cuisine.toLowerCase()} restaurant with ${restaurant.rating}/5 stars. ${restaurant.isOpen ? 'Open and available' : 'Currently closed but worth visiting when open'}.`;
      }

      return {
        ...restaurant,
        claudeReasoning: reasoning
      };
    });

    // Create enhanced summary with new parameters
    const dietaryText = dietaryRestrictions.length > 0 ? 
      ` with options for ${dietaryRestrictions.join(', ')} dietary needs` : '';
    
    const styleText = foodStyle && foodStyle !== 'Any' ? 
      ` featuring ${foodStyle.toLowerCase()} dining` : '';
    
    const occasionText = occasion && occasion !== 'Any' ? 
      ` great for ${occasion.toLowerCase()}` : '';

    const enhancedSummary = `Found ${restaurantsWithReasoning.length} excellent ${cuisine === 'Any' ? '' : cuisine} restaurants in ${location}${dietaryText}${styleText}${occasionText}. Results prioritize currently open restaurants with the highest ratings and are analyzed for your specific preferences.`;

    return NextResponse.json({
      restaurants: restaurantsWithReasoning,
      summary: enhancedSummary,
      location,
      cuisine,
      dietaryRestrictions,
      foodStyle,
      occasion,
      note: 'This is demo data with simulated AI analysis. Configure your API keys to get real restaurant data with Claude AI-powered recommendations.'
    });

  } catch (error) {
    console.error('Demo restaurant search error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to search restaurants',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
