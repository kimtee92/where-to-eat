'use client';

import { useState, useEffect, useRef } from 'react';

interface SearchFormProps {
  onSearch: (location: string, preferences: string, selectedCoords?: {lat: number, lng: number}, radius?: number) => void;
  loading: boolean;
  onSortChange?: (sortBy: 'relevance' | 'distance' | 'rating') => void;
  currentSort?: string;
  onGetUserLocation?: () => Promise<{lat: number, lng: number}>;
}

export default function SearchForm({ onSearch, loading, onSortChange, currentSort, onGetUserLocation }: SearchFormProps) {
  const [isClient, setIsClient] = useState(false);
  const [location, setLocation] = useState('');
  const [preferences, setPreferences] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedLocationCoords, setSelectedLocationCoords] = useState<{lat: number, lng: number} | null>(null);
  const [searchRadius, setSearchRadius] = useState(10); // Default to 10km
  const locationInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Fix hydration mismatch by ensuring client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Initialize Google Places Autocomplete when the component mounts
    const initAutocomplete = () => {
      if (window.google && locationInputRef.current && !autocompleteRef.current) {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          locationInputRef.current,
          {
            types: ['(cities)'],
            fields: ['place_id', 'formatted_address', 'name', 'geometry']
          }
        ) as any;

        autocompleteRef.current!.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace();
          if (place && place.formatted_address) {
            setLocation(place.formatted_address);
            
            // Extract coordinates if available
            if (place.geometry && place.geometry.location) {
              const location = place.geometry.location;
              const lat = typeof location.lat === 'function' ? location.lat() : location.lat;
              const lng = typeof location.lng === 'function' ? location.lng() : location.lng;
              
              const coords = { lat: lat as number, lng: lng as number };
              setSelectedLocationCoords(coords);
            }
          }
        });
      }
    };

    // Check if Google Maps API is loaded
    if (window.google) {
      initAutocomplete();
    } else {
      // Wait for Google Maps API to load
      const checkGoogle = setInterval(() => {
        if (window.google) {
          initAutocomplete();
          clearInterval(checkGoogle);
        }
      }, 100);

      return () => clearInterval(checkGoogle);
    }
  }, []);

  const getUserLocation = async () => {
    setLocationLoading(true);
    try {
      if (onGetUserLocation) {
        const coords = await onGetUserLocation();
        setLocation(`${coords.lat}, ${coords.lng}`);
        setSelectedLocationCoords(coords); // Set the coordinates for distance calculation
      } else {
        // Fallback to direct geolocation
        if (navigator.geolocation) {
          // Enhanced options for mobile devices
          const options = {
            enableHighAccuracy: true, // Use GPS if available
            timeout: 15000, // 15 second timeout
            maximumAge: 300000 // Accept location up to 5 minutes old
          };

          navigator.geolocation.getCurrentPosition(
            (position) => {
              const coords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              setLocation(`${coords.lat}, ${coords.lng}`);
              setSelectedLocationCoords(coords); // Set the coordinates for distance calculation
              setLocationLoading(false);
            },
            (error) => {
              console.error('❌ Geolocation error:', {
                code: error.code,
                message: error.message,
                errorType: error.code === 1 ? 'PERMISSION_DENIED' : 
                          error.code === 2 ? 'POSITION_UNAVAILABLE' :
                          error.code === 3 ? 'TIMEOUT' : 'UNKNOWN'
              });
              setLocationLoading(false);
              
              let errorMessage = 'Unable to get your location. ';
              switch(error.code) {
                case error.PERMISSION_DENIED:
                  errorMessage += 'Please enable location permissions in your browser settings.';
                  break;
                case error.POSITION_UNAVAILABLE:
                  errorMessage += 'Location services are unavailable.';
                  break;
                case error.TIMEOUT:
                  errorMessage += 'Location request timed out.';
                  break;
                default:
                  errorMessage += 'Please enter your location manually.';
              }
              alert(errorMessage);
            },
            options
          );
        } else {
          console.error('❌ Geolocation not supported');
          setLocationLoading(false);
          alert('Geolocation is not supported by this browser. Please enter your location manually.');
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Unable to get your location. Please enter it manually.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      onSearch(location.trim(), preferences.trim(), selectedLocationCoords || undefined, searchRadius);
    }
  };

  // Prevent hydration mismatch by only rendering form after client-side hydration
  if (!isClient) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-flame-scarlet" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-4">
        {/* Location Input */}
        <div className="col-12">
          <label htmlFor="location" className="form-label fw-semibold text-charcoal-gray">
            <i className="bi bi-geo-alt-fill me-2 text-flame-scarlet"></i>
            Location
          </label>
          <div className="input-group">
            <input
              ref={locationInputRef}
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Start typing a city or location..."
              className="form-control form-control-appetizing"
              required
            />
            <button
              type="button"
              onClick={getUserLocation}
              disabled={locationLoading}
              className="btn btn-fresh-green"
            >
              {locationLoading ? (
                <span className="spinner-border spinner-border-sm" role="status"></span>
              ) : (
                <>
                  <i className="bi bi-crosshair me-1"></i>
                  Use My Location
                </>
              )}
            </button>
          </div>
          <div className="form-text">
            Start typing and select from suggestions, or click "Use My Location"
            <br />
            <small className="text-muted">
              📱 Mobile users: Allow location access when prompted for best results
            </small>
          </div>
        </div>

        {/* Preferences Input */}
        <div className="col-12">
          <label htmlFor="preferences" className="form-label fw-semibold text-charcoal-gray">
            <i className="bi bi-chat-text-fill me-2 text-flame-scarlet"></i>
            What are you craving?
          </label>
          <textarea
            id="preferences"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            placeholder="e.g., I want to eat Mexican food for a family lunch, preferably vegetarian options"
            className="form-control form-control-appetizing"
            rows={3}
          />
          <div className="form-text">
            Describe what you're looking for: cuisine type, occasion, dietary needs, price range, atmosphere, etc.
          </div>
        </div>

        {/* Search Radius */}
        <div className="col-12">
          <label htmlFor="searchRadius" className="form-label fw-semibold text-charcoal-gray">
            <i className="bi bi-bullseye me-2 text-flame-scarlet"></i>
            Search Radius: {searchRadius} km
          </label>
          <div className="position-relative">
            <input
              type="range"
              id="searchRadius"
              min="5"
              max="50"
              step="5"
              value={searchRadius}
              onChange={(e) => setSearchRadius(Number(e.target.value))}
              className="form-range custom-slider"
              style={{
                background: `linear-gradient(to right, #F5C842 0%, #F5C842 ${((searchRadius - 5) / 45) * 100}%, #e9ecef ${((searchRadius - 5) / 45) * 100}%, #e9ecef 100%)`,
                height: '8px',
                borderRadius: '4px',
                outline: 'none',
                appearance: 'none',
                WebkitAppearance: 'none'
              }}
            />
            <style jsx>{`
              .custom-slider::-webkit-slider-thumb {
                appearance: none;
                height: 20px;
                width: 20px;
                border-radius: 50%;
                background: #E53E3E;
                cursor: pointer;
                border: 2px solid #ffffff;
                box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                transition: all 0.2s ease;
              }
              .custom-slider::-moz-range-thumb {
                height: 20px;
                width: 20px;
                border-radius: 50%;
                background: #E53E3E;
                cursor: pointer;
                border: 2px solid #ffffff;
                box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                transition: all 0.2s ease;
              }
              .custom-slider:focus::-webkit-slider-thumb {
                box-shadow: 0 0 0 3px rgba(245, 200, 66, 0.3);
              }
              .custom-slider:hover::-webkit-slider-thumb {
                transform: scale(1.1);
              }
            `}</style>
          </div>
          <div className="d-flex justify-content-between text-muted small mt-1">
            <span>5 km</span>
            <span>25 km</span>
            <span>50 km</span>
          </div>
          <div className="form-text">
            How far are you willing to travel for great food?
          </div>
        </div>
      </div>

      {/* Sort Options */}
      {onSortChange && (
        <div className="row g-4 mt-2">
          <div className="col-12">
            <label htmlFor="sortBy" className="form-label fw-semibold">
              <i className="bi bi-sort-down me-2 text-info"></i>
              Sort Results By
            </label>
            <select
              id="sortBy"
              value={currentSort || 'relevance'}
              onChange={(e) => onSortChange(e.target.value as 'relevance' | 'distance' | 'rating')}
              className="form-select form-select-appetizing"
            >
              <option value="relevance">AI Relevance</option>
              <option value="distance">Distance (Closest First)</option>
              <option value="rating">Rating (Highest First)</option>
            </select>
            <div className="form-text">
              Choose how to order your restaurant results
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="text-center mt-5">
        <button
          type="submit"
          disabled={loading || !location.trim()}
          className={`btn btn-lg px-5 py-3 fw-bold rounded-3 ${
            loading || !location.trim()
              ? 'btn-secondary disabled'
              : 'btn-flame-scarlet'
          }`}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Finding Great Restaurants...
            </>
          ) : (
            <>
              <i className="bi bi-search me-2"></i>
              Find Restaurants
            </>
          )}
        </button>
      </div>
    </form>
  );
}
