'use client';

import { useEffect, useState } from 'react';

export default function DiagnoseGoogleMaps() {
  const [status, setStatus] = useState<any>({});
  const [logs, setLogs] = useState<string[]>([]);
  const [isPolling, setIsPolling] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const checkStatus = () => {
    const currentStatus = {
      timestamp: new Date().toLocaleTimeString(),
      window_google: !!window.google,
      google_maps: !!window.google?.maps,
      google_places: !!window.google?.maps?.places,
      google_autocomplete: !!window.google?.maps?.places?.Autocomplete,
      googleMapsLoaded: !!(window as any).googleMapsLoaded,
      googleMapsInitialized: !!(window as any).googleMapsInitialized,
      document_ready: document.readyState,
      scripts_count: document.querySelectorAll('script[src*="maps.googleapis.com"]').length,
      page_url: window.location.href,
      user_agent: navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                   navigator.userAgent.includes('Firefox') ? 'Firefox' :
                   navigator.userAgent.includes('Safari') ? 'Safari' : 'Other'
    };

    setStatus(currentStatus);
    return currentStatus;
  };

  useEffect(() => {
    addLog('🚀 Diagnostic page loaded');
    checkStatus();

    // Listen for Google Maps events
    const handleGoogleMapsReady = (event: any) => {
      addLog(`📡 googleMapsReady event: ${JSON.stringify(event.detail)}`);
      checkStatus();
    };

    window.addEventListener('googleMapsReady', handleGoogleMapsReady);

    // Start aggressive polling
    setIsPolling(true);
    let pollCount = 0;
    const maxPolls = 60; // Poll for 30 seconds

    const poll = () => {
      pollCount++;
      const currentStatus = checkStatus();
      
      if (currentStatus.google_autocomplete) {
        addLog(`✅ Google Maps Autocomplete detected on poll ${pollCount}`);
        setIsPolling(false);
        return;
      }
      
      if (pollCount < maxPolls) {
        setTimeout(poll, 500);
      } else {
        addLog(`❌ Polling stopped after ${maxPolls} attempts`);
        setIsPolling(false);
      }
    };

    setTimeout(poll, 1000);

    return () => {
      window.removeEventListener('googleMapsReady', handleGoogleMapsReady);
      setIsPolling(false);
    };
  }, []);

  const testAutocomplete = () => {
    const input = document.createElement('input');
    input.type = 'text';
    input.style.position = 'absolute';
    input.style.left = '-9999px';
    document.body.appendChild(input);

    try {
      if (window.google?.maps?.places?.Autocomplete) {
        const autocomplete = new window.google.maps.places.Autocomplete(input, {
          types: ['(cities)']
        });
        addLog('✅ Test autocomplete created successfully');
        google.maps.event.clearInstanceListeners(autocomplete);
        document.body.removeChild(input);
        return true;
      } else {
        addLog('❌ Google Maps Autocomplete not available for testing');
        document.body.removeChild(input);
        return false;
      }
    } catch (error) {
      addLog(`❌ Test autocomplete failed: ${error}`);
      document.body.removeChild(input);
      return false;
    }
  };

  const forceRefresh = () => {
    addLog('🔄 Force refreshing page...');
    window.location.reload();
  };

  const clearCache = async () => {
    addLog('🧹 Clearing Google Maps related cache and storage...');
    try {
      // Clear localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('google') || key.includes('maps') || key.includes('places'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        addLog(`🗑️ Removed localStorage: ${key}`);
      });
      
      // Clear sessionStorage
      const sessionKeysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.includes('google') || key.includes('maps') || key.includes('places'))) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach(key => {
        sessionStorage.removeItem(key);
        addLog(`🗑️ Removed sessionStorage: ${key}`);
      });
      
      // Clear Service Worker caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        const googleMapsCaches = cacheNames.filter(name => 
          name.includes('google') || name.includes('maps') || name.includes('places')
        );
        
        for (const cacheName of googleMapsCaches) {
          await caches.delete(cacheName);
          addLog(`🗑️ Deleted cache: ${cacheName}`);
        }
        
        if (googleMapsCaches.length === 0) {
          addLog('ℹ️ No Google Maps caches found to delete');
        }
      }
      
      addLog('✅ Google Maps cache cleared successfully');
    } catch (error) {
      addLog(`❌ Cache clearing error: ${error}`);
    }
  };

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">🔧 Google Maps Diagnostic Tool</h1>
          
          <div className="alert alert-info">
            <strong>Instructions:</strong>
            <ol className="mb-0 mt-2">
              <li>Watch the status updates in real-time</li>
              <li>Check if autocomplete becomes available</li>
              <li>If it doesn't work, try "Force Refresh"</li>
              <li>If still broken, try "Clear Cache" then refresh</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">📊 Current Status</h5>
              {isPolling && (
                <span className="badge bg-warning">
                  <span className="spinner-border spinner-border-sm me-1"></span>
                  Polling...
                </span>
              )}
            </div>
            <div className="card-body">
              <pre className="bg-light p-3 rounded small">
                {JSON.stringify(status, null, 2)}
              </pre>
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-header">
              <h5 className="mb-0">🧪 Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-primary"
                  onClick={checkStatus}
                >
                  🔄 Check Status Now
                </button>
                
                <button 
                  className="btn btn-success"
                  onClick={testAutocomplete}
                  disabled={!status.google_autocomplete}
                >
                  🧪 Test Autocomplete Creation
                </button>
                
                <button 
                  className="btn btn-warning"
                  onClick={forceRefresh}
                >
                  🔄 Force Refresh Page
                </button>
                
                <button 
                  className="btn btn-danger"
                  onClick={clearCache}
                >
                  🗑️ Clear Cache & Storage
                </button>

                <a 
                  href="/"
                  className="btn btn-outline-primary"
                >
                  🏠 Go to Main Page
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">📋 Event Log</h5>
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setLogs([])}
              >
                Clear
              </button>
            </div>
            <div className="card-body">
              <div 
                className="bg-light p-3 rounded" 
                style={{ height: '500px', overflowY: 'scroll' }}
              >
                {logs.length === 0 ? (
                  <div className="text-muted">No logs yet...</div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="font-monospace small mb-1">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="alert alert-secondary">
            <h6>🔍 What to Look For:</h6>
            <ul className="mb-0">
              <li><strong>google_autocomplete: true</strong> - This means the API is fully loaded</li>
              <li><strong>googleMapsReady events</strong> - These show when our callback fires</li>
              <li><strong>Poll attempts</strong> - Shows how long it takes to detect the API</li>
              <li><strong>Test autocomplete success</strong> - Confirms the API actually works</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
