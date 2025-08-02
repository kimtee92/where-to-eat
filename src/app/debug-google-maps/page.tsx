'use client';

import { useEffect, useState } from 'react';

export default function DebugGoogleMaps() {
  const [logs, setLogs] = useState<string[]>([]);
  const [apiStatus, setApiStatus] = useState<string>('Checking...');

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    addLog('Debug page loaded');

    const checkApiStatus = () => {
      const scripts = Array.from(document.querySelectorAll('script[src*="maps.googleapis.com"]'));
      const status = {
        window_google: !!window.google,
        maps: !!window.google?.maps,
        places: !!window.google?.maps?.places,
        autocomplete: !!window.google?.maps?.places?.Autocomplete,
        googleMapsLoaded: !!(window as any).googleMapsLoaded,
        googleMapsInitialized: !!(window as any).googleMapsInitialized,
        scriptsFound: scripts.length,
        scriptSources: scripts.map(s => s.getAttribute('src')),
      };

      setApiStatus(JSON.stringify(status, null, 2));
      addLog(`API Status: ${JSON.stringify(status)}`);
    };

    // Check immediately
    checkApiStatus();

    // Check every second for the first 10 seconds
    const interval = setInterval(checkApiStatus, 1000);
    setTimeout(() => clearInterval(interval), 10000);

    // Listen for Google Maps events
    const handleGoogleMapsLoaded = (event: any) => {
      addLog(`GoogleMapsLoaded event received: ${JSON.stringify(event.detail)}`);
      checkApiStatus();
    };

    window.addEventListener('googleMapsLoaded', handleGoogleMapsLoaded);

    // Override the callback to see when it's called
    const originalCallback = (window as any).initGoogleMaps;
    (window as any).initGoogleMaps = function() {
      addLog('initGoogleMaps callback called');
      if (originalCallback) {
        originalCallback();
      }
      checkApiStatus();
    };

    return () => {
      window.removeEventListener('googleMapsLoaded', handleGoogleMapsLoaded);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="container py-5">
      <h1>Google Maps API Debug Page</h1>
      
      <div className="row">
        <div className="col-md-6">
          <h3>API Status</h3>
          <pre className="bg-light p-3 rounded">
            {apiStatus}
          </pre>
        </div>
        
        <div className="col-md-6">
          <h3>Event Log</h3>
          <div className="bg-light p-3 rounded" style={{ height: '400px', overflowY: 'scroll' }}>
            {logs.map((log, index) => (
              <div key={index} className="font-monospace small">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <button 
          className="btn btn-primary me-2"
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </button>
        
        <button 
          className="btn btn-secondary"
          onClick={() => setLogs([])}
        >
          Clear Logs
        </button>
      </div>
    </div>
  );
}
