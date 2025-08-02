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
        <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet" />
        {googleMapsApiKey && (
          <script
            async
            defer
            src={`https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`}
          ></script>
        )}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Simple detection without callback - more reliable
              (function checkGoogleMaps() {
                if (window.google && window.google.maps && window.google.maps.places) {
                  console.log('✅ Google Maps API fully loaded');
                  window.googleMapsReady = true;
                } else {
                  setTimeout(checkGoogleMaps, 100);
                }
              })();
              
              // Error handling for script loading
              window.addEventListener('error', function(e) {
                if (e.target && e.target.src && e.target.src.includes('maps.googleapis.com')) {
                  console.error('❌ Google Maps API script failed to load');
                  console.error('URL:', e.target.src);
                  console.error('Check: API key, internet connection, CORS settings');
                }
              }, true);
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
