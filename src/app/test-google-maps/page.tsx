'use client';

import { useEffect, useState } from 'react';

export default function TestGoogleMaps() {
  const [apiStatus, setApiStatus] = useState('Checking...');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    addLog('Test page loaded');

    const checkApi = () => {
      const status = {
        google: !!window.google,
        maps: !!window.google?.maps,
        places: !!window.google?.maps?.places,
        autocomplete: !!window.google?.maps?.places?.Autocomplete,
        loaded: !!(window as any).googleMapsLoaded
      };

      setApiStatus(JSON.stringify(status, null, 2));
      addLog(`Status: ${JSON.stringify(status)}`);

      return status.autocomplete;
    };

    // Check immediately
    if (checkApi()) {
      addLog('✅ Google Maps API ready immediately');
      return;
    }

    // Listen for ready event
    const handleReady = () => {
      addLog('📡 Received googleMapsReady event');
      if (checkApi()) {
        addLog('✅ Google Maps API ready after event');
      }
    };

    window.addEventListener('googleMapsReady', handleReady);

    // Polling fallback
    let attempts = 0;
    const maxAttempts = 20;
    const poll = () => {
      attempts++;
      addLog(`🔄 Polling attempt ${attempts}/${maxAttempts}`);
      
      if (checkApi()) {
        addLog('✅ Google Maps API ready via polling');
        return;
      }
      
      if (attempts < maxAttempts) {
        setTimeout(poll, 500);
      } else {
        addLog('❌ API not available after polling');
      }
    };

    setTimeout(poll, 1000);

    return () => {
      window.removeEventListener('googleMapsReady', handleReady);
    };
  }, []);

  return (
    <div className="container py-5">
      <h1>Google Maps API Test</h1>
      
      <div className="row">
        <div className="col-md-6">
          <h3>Current Status</h3>
          <pre className="bg-light p-3 rounded">
            {apiStatus}
          </pre>
        </div>
        
        <div className="col-md-6">
          <h3>Logs</h3>
          <div className="bg-light p-3 rounded" style={{ height: '300px', overflowY: 'scroll' }}>
            {logs.map((log, index) => (
              <div key={index} className="font-monospace small">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <a href="/" className="btn btn-primary me-2">
          Go to Main Page
        </a>
        
        <button 
          className="btn btn-secondary"
          onClick={() => window.location.reload()}
        >
          Refresh Test
        </button>
      </div>
    </div>
  );
}
