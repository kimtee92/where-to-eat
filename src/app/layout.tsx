import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Where to Eat - AI-Powered Restaurant Finder",
  description: "Find the best restaurants near you with AI-powered recommendations using Claude and Google Places API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet" />
        {googleMapsApiKey && (
          <script
            async
            defer
            src={`https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&callback=initGoogleMaps&v=weekly`}
          ></script>
        )}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              console.log('📡 Google Maps initialization script loaded');
              window.googleMapsLoaded = false;
              
              window.initGoogleMaps = function() {
                console.log('🎯 Google Maps callback triggered');
                window.googleMapsLoaded = true;
                
                // Dispatch event immediately
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('googleMapsReady', {
                    detail: { timestamp: Date.now() }
                  }));
                  console.log('📢 Dispatched googleMapsReady event');
                }
                
                // Also set a flag that polling can detect
                window.googleMapsInitialized = true;
              };
              
              // Fallback detection for cases where callback doesn't fire
              let fallbackAttempts = 0;
              const maxFallbackAttempts = 100;
              
              const checkAndDispatch = () => {
                fallbackAttempts++;
                
                if (window.google?.maps?.places?.Autocomplete && !window.googleMapsLoaded) {
                  console.log('🔍 Fallback detection: Google Maps API found');
                  window.googleMapsLoaded = true;
                  window.googleMapsInitialized = true;
                  
                  window.dispatchEvent(new CustomEvent('googleMapsReady', {
                    detail: { 
                      timestamp: Date.now(),
                      source: 'fallback',
                      attempt: fallbackAttempts 
                    }
                  }));
                  console.log('📢 Dispatched fallback googleMapsReady event');
                  return true;
                }
                
                if (fallbackAttempts < maxFallbackAttempts) {
                  setTimeout(checkAndDispatch, 100);
                }
                
                return false;
              };
              
              // Start fallback checking
              setTimeout(checkAndDispatch, 500);
            `
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
      </body>
    </html>
  );
}
