import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { fetchTopSong } from '@/components/modules/api_parser';
import { hashColour } from '@/components/modules/hash_colours';
import { getCountryCodes } from '@/components/modules/getCountryCode';
import { throttle } from 'lodash';

// Initialize mapbox
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

interface CountryColors {
  [key: string]: string;
}

const API_CONCURRENCY_LIMIT = 25; // Maximum concurrent API calls
const BATCH_SIZE = 25; // Much larger batch size

const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [countryColors, setCountryColors] = useState<CountryColors>({});
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Throttled state update to prevent too many rerenders
  const throttledSetCountryColors = useRef(
    throttle((colors: CountryColors) => {
      setCountryColors(colors);
    }, 500)
  ).current;

  const fetchWithTimeout = async (url: string, timeout = 3000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  // Semaphore for rate limiting
  class Semaphore {
    private permits: number;
    private queue: (() => void)[] = [];

    constructor(permits: number) {
      this.permits = permits;
    }

    async acquire(): Promise<void> {
      if (this.permits > 0) {
        this.permits--;
        return Promise.resolve();
      }
      return new Promise(resolve => this.queue.push(resolve));
    }

    release(): void {
      this.permits++;
      const next = this.queue.shift();
      if (next) {
        this.permits--;
        next();
      }
    }
  }

  const processCountryColors = async () => {
    try {
      console.log('Starting to process country colors...');
      
      // Check cache first
      const cachedColors = localStorage.getItem('countryColors');
      const cacheTimestamp = localStorage.getItem('countryColorsTimestamp');
      
      if (cachedColors && cacheTimestamp) {
        const cacheAge = Date.now() - parseInt(cacheTimestamp);
        if (cacheAge < 24 * 60 * 60 * 1000) {
          const colors = JSON.parse(cachedColors);
          setCountryColors(colors);
          setIsLoading(false);
          return colors;
        }
      }

      const countryCodes = await getCountryCodes();
      const entries = Object.entries(countryCodes)
        .map(([name, code]) => [name, code.toUpperCase()]);
      
      const colors: CountryColors = {};
      const semaphore = new Semaphore(API_CONCURRENCY_LIMIT);
      let processed = 0;

      // Process in larger chunks
      const chunks = [];
      for (let i = 0; i < entries.length; i += BATCH_SIZE) {
        chunks.push(entries.slice(i, i + BATCH_SIZE));
      }

      // Process all chunks concurrently with rate limiting
      await Promise.all(chunks.map(async (chunk) => {
        await Promise.all(chunk.map(async ([countryName, isoCode]) => {
          await semaphore.acquire();
          
          try {
            if (colors[isoCode]) return;

            const response = await fetchWithTimeout(
              `https://itunes.apple.com/${isoCode}/rss/topsongs/limit=1/json`
            );

            if (!response.ok) {
              colors[isoCode] = '#6b8620';
            } else {
              const songData = await fetchTopSong(isoCode, 1);
              colors[isoCode] = hashColour(songData.title);
            }

            processed++;
            const progress = Math.round((processed / entries.length) * 100);
            setLoadingProgress(progress);
            
            // Batch update the UI
            throttledSetCountryColors({ ...colors });

          } catch (error) {
            colors[isoCode] = '#6b8620';
          } finally {
            semaphore.release();
          }
        }));
      }));

      // Cache the final results
      localStorage.setItem('countryColors', JSON.stringify(colors));
      localStorage.setItem('countryColorsTimestamp', Date.now().toString());

      setIsLoading(false);
      setLoadingProgress(100);
      setCountryColors(colors);
      return colors;

    } catch (error) {
      console.error('Error processing colors:', error);
      setIsLoading(false);
      return {};
    }
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [0, 0],
      zoom: 1.5,
      projection: 'mercator',
      renderWorldCopies: false
    });

    // Load map
    map.current.on('load', async () => {
      try {
        console.log('🗺️ Map loaded, processing country colors...');
        
        // Process country colors
        const colors = await processCountryColors();
        console.log('🎨 Processed colors for', Object.keys(colors).length, 'countries');

        // Add country boundaries source
        console.log('📍 Adding country boundaries...');
        map.current?.addSource('countries', {
          type: 'geojson',
          data: '/geojson/countries.geojson',
        });

        // Add country layer
        console.log('🖌️ Adding country fill layer...');
        map.current?.addLayer({
          id: 'country-fills',
          type: 'fill',
          source: 'countries',
          layout: {},
          paint: {
            'fill-color': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              '#777777',
              ['coalesce', ['get', ['get', 'ISO_A2'], ['literal', colors]], '#6b8620']
            ],
            'fill-opacity': 0.7,
          },
        });

        // Add country borders
        map.current?.addLayer({
          id: 'country-borders',
          type: 'line',
          source: 'countries',
          layout: {},
          paint: {
            'line-color': '#000000',
            'line-width': 1,
          },
        });

        // Add click event
        map.current?.on('click', 'country-fills', (e) => {
          if (e.features?.[0]?.properties) {
            const countryData = e.features[0].properties;
            // Add type guard to ensure properties exist
            if ('ISO_A2' in countryData && 'ADMIN' in countryData) {
              const isoCode = countryData.ISO_A2;
              console.log('🏷️ Clicked country:', {
                name: countryData.ADMIN,
                iso: isoCode,
                color: countryColors[isoCode],
                allProperties: countryData
              });
            }
          }
        });

        // Change cursor on hover
        map.current?.on('mouseenter', 'country-fills', () => {
          if (map.current) {
            map.current.getCanvas().style.cursor = 'pointer';
          }
        });

        map.current?.on('mouseleave', 'country-fills', () => {
          if (map.current) {
            map.current.getCanvas().style.cursor = '';
          }
        });

        console.log('✅ Map setup complete!');
      } catch (error) {
        console.error('💥 Error loading map data:', error);
      }
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <div>
      <div 
        ref={mapContainer} 
        style={{ 
          width: '100%', 
          height: '100vh',
          position: 'relative'
        }} 
      />
      <div 
        style={{ 
          position: 'absolute', 
          top: 10, 
          right: 10, 
          background: 'white', 
          padding: 10, 
          borderRadius: 5,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        {isLoading ? (
          <div>
            Loading... {loadingProgress}%
            <div style={{ 
              width: '100px', 
              height: '4px', 
              background: '#eee', 
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${loadingProgress}%`,
                height: '100%',
                background: '#4CAF50',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        ) : (
          <div>Countries colored: {Object.keys(countryColors).length}</div>
        )}
      </div>
    </div>
  );
};

export default Map;
