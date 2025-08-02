'use client';

import Script from 'next/script';

export default function GoogleMapsScript() {
  return (
    <Script
      src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&v=weekly`}
      strategy="beforeInteractive"
      onLoad={() => {
        console.log('Google Maps API loaded successfully');
        (window as any).googleMapsLoaded = true;
        window.dispatchEvent(new Event('googleMapsLoaded'));
      }}
      onError={(e) => {
        console.error('Failed to load Google Maps API:', e);
        (window as any).googleMapsLoadError = true;
      }}
    />
  );
}
