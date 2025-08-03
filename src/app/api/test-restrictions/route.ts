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

    const results = {
      apiKey: apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4),
      tests: [] as any[],
      summary: {
        passed: 0,
        failed: 0,
        warnings: [] as string[]
      }
    };

    // Test 1: Places API v1 - Search Text
    try {
      console.log('Testing Places API v1 Search Text...');
      const searchResponse = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.googleMapsUri,places.websiteUri,places.nationalPhoneNumber,places.priceLevel,places.userRatingCount,places.businessStatus,places.currentOpeningHours,places.photos,places.reviews'
        },
        body: JSON.stringify({
          textQuery: 'restaurant in New York',
          maxResultCount: 1,
          languageCode: 'en'
        })
      });

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        results.tests.push({
          name: 'Places API v1 - Search Text',
          status: 'PASS',
          statusCode: searchResponse.status,
          hasPhotos: searchData.places?.[0]?.photos?.length > 0,
          hasReviews: searchData.places?.[0]?.reviews?.length > 0
        });
        results.summary.passed++;
      } else {
        const errorText = await searchResponse.text();
        results.tests.push({
          name: 'Places API v1 - Search Text',
          status: 'FAIL',
          statusCode: searchResponse.status,
          error: errorText
        });
        results.summary.failed++;
      }
    } catch (error) {
      results.tests.push({
        name: 'Places API v1 - Search Text',
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      results.summary.failed++;
    }

    // Test 2: Places API v1 - Photo Media
    try {
      console.log('Testing Places API v1 Photo Media...');
      // First get a place with photos
      const searchForPhotos = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.photos'
        },
        body: JSON.stringify({
          textQuery: 'restaurant in New York',
          maxResultCount: 5
        })
      });

      if (searchForPhotos.ok) {
        const searchData = await searchForPhotos.json();
        const placeWithPhotos = searchData.places?.find((p: any) => p.photos?.length > 0);
        
        if (placeWithPhotos?.photos?.[0]?.name) {
          const photoName = placeWithPhotos.photos[0].name;
          console.log('Photo name from API:', photoName);
          
          // The photo name should be the direct resource name
          const photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=400&maxHeightPx=400&key=${apiKey}`;
          
          const photoResponse = await fetch(photoUrl, { method: 'HEAD' });
          
          results.tests.push({
            name: 'Places API v1 - Photo Media',
            status: photoResponse.ok ? 'PASS' : 'FAIL',
            statusCode: photoResponse.status,
            photoUrl: photoUrl.replace(apiKey, 'API_KEY'),
            photoName: photoName,
            contentType: photoResponse.headers.get('content-type')
          });
          
          if (photoResponse.ok) {
            results.summary.passed++;
          } else {
            results.summary.failed++;
          }
        } else {
          results.tests.push({
            name: 'Places API v1 - Photo Media',
            status: 'SKIP',
            reason: 'No places with photos found'
          });
          results.summary.warnings.push('No places with photos found for testing');
        }
      } else {
        results.tests.push({
          name: 'Places API v1 - Photo Media',
          status: 'FAIL',
          statusCode: searchForPhotos.status,
          error: 'Failed to get places for photo test'
        });
        results.summary.failed++;
      }
    } catch (error) {
      results.tests.push({
        name: 'Places API v1 - Photo Media',
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      results.summary.failed++;
    }

    // Test 3: Maps API - Timezone
    try {
      console.log('Testing Maps API Timezone...');
      const timezoneUrl = 'https://maps.googleapis.com/maps/api/timezone/json';
      const params = new URLSearchParams({
        location: '40.7128,-74.0060', // New York
        timestamp: String(Math.floor(Date.now() / 1000)),
        key: apiKey
      });

      const timezoneResponse = await fetch(`${timezoneUrl}?${params}`);
      
      if (timezoneResponse.ok) {
        const timezoneData = await timezoneResponse.json();
        results.tests.push({
          name: 'Maps API - Timezone',
          status: timezoneData.status === 'OK' ? 'PASS' : 'FAIL',
          statusCode: timezoneResponse.status,
          apiStatus: timezoneData.status,
          timeZoneId: timezoneData.timeZoneId
        });
        
        if (timezoneData.status === 'OK') {
          results.summary.passed++;
        } else {
          results.summary.failed++;
        }
      } else {
        const errorText = await timezoneResponse.text();
        results.tests.push({
          name: 'Maps API - Timezone',
          status: 'FAIL',
          statusCode: timezoneResponse.status,
          error: errorText
        });
        results.summary.failed++;
      }
    } catch (error) {
      results.tests.push({
        name: 'Maps API - Timezone',
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      results.summary.failed++;
    }

    // Test 4: Maps API - Geocoding
    try {
      console.log('Testing Maps API Geocoding...');
      const geocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
      const params = new URLSearchParams({
        latlng: '40.7128,-74.0060', // New York
        key: apiKey
      });

      const geocodeResponse = await fetch(`${geocodeUrl}?${params}`);
      
      if (geocodeResponse.ok) {
        const geocodeData = await geocodeResponse.json();
        results.tests.push({
          name: 'Maps API - Geocoding',
          status: geocodeData.status === 'OK' ? 'PASS' : 'FAIL',
          statusCode: geocodeResponse.status,
          apiStatus: geocodeData.status,
          resultsCount: geocodeData.results?.length || 0
        });
        
        if (geocodeData.status === 'OK') {
          results.summary.passed++;
        } else {
          results.summary.failed++;
        }
      } else {
        const errorText = await geocodeResponse.text();
        results.tests.push({
          name: 'Maps API - Geocoding',
          status: 'FAIL',
          statusCode: geocodeResponse.status,
          error: errorText
        });
        results.summary.failed++;
      }
    } catch (error) {
      results.tests.push({
        name: 'Maps API - Geocoding',
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      results.summary.failed++;
    }

    // Check for common restriction patterns
    const failedTests = results.tests.filter(t => t.status === 'FAIL');
    
    for (const test of failedTests) {
      if (test.statusCode === 403) {
        results.summary.warnings.push(`${test.name}: 403 Forbidden - Check API key restrictions or enable the API`);
      } else if (test.statusCode === 429) {
        results.summary.warnings.push(`${test.name}: 429 Rate Limited - API quota exceeded`);
      } else if (test.error?.includes('PERMISSION_DENIED')) {
        results.summary.warnings.push(`${test.name}: Permission denied - API may not be enabled`);
      } else if (test.error?.includes('REQUEST_DENIED')) {
        results.summary.warnings.push(`${test.name}: Request denied - Check API key restrictions`);
      }
    }

    return NextResponse.json(results);

  } catch (error) {
    console.error('API restrictions test failed:', error);
    return NextResponse.json(
      { 
        error: 'API restrictions test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
