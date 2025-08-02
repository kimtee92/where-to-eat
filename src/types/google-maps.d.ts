// Global type declarations for Google Maps API
declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google {
  namespace maps {
    namespace places {
      class Autocomplete {
        constructor(
          input: HTMLInputElement,
          opts?: {
            types?: string[];
            fields?: string[];
            componentRestrictions?: { country?: string | string[] };
          }
        );
        addListener(eventName: string, handler: () => void): void;
        getPlace(): {
          place_id?: string;
          formatted_address?: string;
          name?: string;
          geometry?: {
            location?: {
              lat(): number;
              lng(): number;
            };
          };
        };
      }
    }
  }
}

export {};
