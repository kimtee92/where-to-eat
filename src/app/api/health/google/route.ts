import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Places API key not configured' },
        { status: 400 }
      );
    }

    // Test the new Google Places API with a simple request
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName'
      },
      body: JSON.stringify({
        textQuery: 'restaurant',
        maxResultCount: 1
      })
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({ 
        status: 'connected', 
        message: 'Google Places API (New) is working',
        apiVersion: 'v1'
      });
    } else {
      throw new Error(`API returned status: ${response.status} ${response.statusText}`);
    }

  } catch (error) {
    console.error('Google Places API health check failed:', error);
    return NextResponse.json(
      { 
        error: 'Google Places API connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
