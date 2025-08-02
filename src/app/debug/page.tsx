'use client';

import { useEffect } from 'react';

export default function GoogleMapsTest() {
  useEffect(() => {
    console.log('🧪 Google Maps Test Page Loaded');
    
    // Check environment variables
    console.log('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      hasApiKey: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    });
    
    // Check if Google Maps script is in the DOM
    const scripts = Array.from(document.querySelectorAll('script')).filter(script => 
      script.src && script.src.includes('maps.googleapis.com')
    );
    console.log('Google Maps scripts found:', scripts.length);
    scripts.forEach((script, index) => {
      console.log(`Script ${index + 1}:`, script.src);
    });
    
    // Check window.google availability every second
    let attempts = 0;
    const checkGoogle = setInterval(() => {
      attempts++;
      console.log(`Attempt ${attempts}:`, {
        'window.google': !!window.google,
        'window.google.maps': !!window.google?.maps,
        'window.google.maps.places': !!window.google?.maps?.places,
        'window.google.maps.places.Autocomplete': !!window.google?.maps?.places?.Autocomplete
      });
      
      if (window.google?.maps?.places?.Autocomplete) {
        console.log('✅ Google Maps API is fully loaded!');
        
        // Test creating an autocomplete
        const input = document.getElementById('test-input') as HTMLInputElement;
        if (input) {
          try {
            const autocomplete = new window.google.maps.places.Autocomplete(input, {
              types: ['(cities)']
            });
            console.log('✅ Successfully created autocomplete instance');
            
            autocomplete.addListener('place_changed', () => {
              const place = autocomplete.getPlace();
              console.log('Place selected:', place);
            });
          } catch (error) {
            console.error('❌ Error creating autocomplete:', error);
          }
        }
        
        clearInterval(checkGoogle);
      } else if (attempts >= 10) {
        console.error('❌ Google Maps API failed to load after 10 seconds');
        clearInterval(checkGoogle);
      }
    }, 1000);
    
    return () => clearInterval(checkGoogle);
  }, []);

  return (
    <div className="container py-5">
      <h1 className="mb-4">Google Maps API Debug Test</h1>
      
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Test Autocomplete Input</h5>
          <input
            id="test-input"
            type="text"
            className="form-control"
            placeholder="Type a city name (e.g., New York, London, Tokyo)..."
          />
          <div className="form-text mt-2">
            If Google Places is working, you should see suggestions when typing.
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <h3>Debug Information</h3>
        <div className="alert alert-info">
          <p><strong>Check the browser console (F12) for detailed debugging information.</strong></p>
          <p>This page will test:</p>
          <ul>
            <li>Environment variable availability</li>
            <li>Google Maps script loading</li>
            <li>API object availability</li>
            <li>Autocomplete creation</li>
          </ul>
        </div>
      </div>
      
      <div className="mt-3">
        <a href="/" className="btn btn-primary">← Back to Main App</a>
      </div>
    </div>
  );
}
