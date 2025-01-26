import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapContext } from '@/contexts/MapContext';
import { useTheme } from "@/components/theme-provider";
import MapService from '@/services/mapService';
import { MapLoadingIndicator } from './MapLoadingIndicator';
import { fetchTopSongs } from "@/lib/api/itunes";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Initialize mapbox
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

interface MapProps {
  onCountryClick?: (countryData: { name: string; iso: string; color: string }) => void;
  isGlobe: boolean;
  onToggleProjection: () => void;
}

export default function Map({ onCountryClick, isGlobe, onToggleProjection }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { theme } = useTheme();
  const { 
    countryColors, 
    setCountryColors,
    isLoading,
    setIsLoading,
    loadingProgress,
    setLoadingProgress 
  } = useMapContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    const initializeMap = async () => {
      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: theme === 'dark' 
          ? 'mapbox://styles/mapbox/dark-v11'
          : 'mapbox://styles/mapbox/light-v11',
        center: [0, 0],
        zoom: 2,
        minZoom: 1.5,
        maxZoom: 6,
        projection: 'globe',
        renderWorldCopies: false,
        dragRotate: false,
        pitchWithRotate: false,
        pitch: 0,
        bearing: 0,
      });

      // Disable rotation
      map.current.dragRotate.disable();
      map.current.touchZoomRotate.disableRotation();

      // Process colors and setup map
      const mapService = new MapService({
        onProgress: setLoadingProgress
      });

      map.current.on('load', async () => {
        try {
          const colors = await mapService.processCountryColors();
          setCountryColors(colors);
          await setupMapLayers(colors);
          setIsLoading(false);
        } catch (error) {
          console.error('Error setting up map:', error);
          setIsLoading(false);
        }
      });
    };

    initializeMap();

    return () => {
      map.current?.remove();
    };
  }, [theme]);

  useEffect(() => {
    if (map.current) {
      map.current.setProjection(isGlobe ? 'globe' : 'mercator');
      map.current.setRenderWorldCopies(!isGlobe);
    }
  }, [isGlobe]);

  const setupMapLayers = async (colors: Record<string, string>) => {
    if (!map.current) return;

    // Add source
    map.current.addSource('countries', {
      type: 'geojson',
      data: '/geojson/countries.geojson',
    });

    // Add fill layer
    map.current.addLayer({
      id: 'country-fills',
      type: 'fill',
      source: 'countries',
      layout: {},
      paint: {
        'fill-color': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          theme === 'dark' ? '#4a4a4a' : '#cccccc',
          ['coalesce', ['get', ['get', 'ISO_A2'], ['literal', colors]], 
            theme === 'dark' ? '#2a2a2a' : '#e5e5e5']
        ],
        'fill-opacity': theme === 'dark' ? 0.8 : 0.6,
      },
    });

    // Add border layer
    map.current.addLayer({
      id: 'country-borders',
      type: 'line',
      source: 'countries',
      layout: {},
      paint: {
        'line-color': theme === 'dark' ? '#B0FC38' : '#000000',
        'line-width': 0.5,
        'line-opacity': theme === 'dark' ? 0.8 : 0.3
      },
    });

    // Add interactions
    setupMapInteractions();
  };

  const setupMapInteractions = () => {
    if (!map.current) return;

    // Click handler
    map.current.on('click', 'country-fills', (e) => {
      if (e.features?.[0]?.properties) {
        const countryData = e.features[0].properties;
        if ('ISO_A2' in countryData && 'ADMIN' in countryData) {
          onCountryClick?.({
            name: countryData.ADMIN,
            iso: countryData.ISO_A2,
            color: countryColors[countryData.ISO_A2]
          });
        }
      }
    });

    // Hover effects
    map.current.on('mouseenter', 'country-fills', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer';
    });

    map.current.on('mouseleave', 'country-fills', () => {
      if (map.current) map.current.getCanvas().style.cursor = '';
    });
  };

  const handleSearch = useCallback(async (query: string) => {
    if (!query || !map.current) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${mapboxgl.accessToken}&types=country`
      );
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const country = data.features[0];
        map.current.flyTo({
          center: country.center,
          zoom: 3,
          duration: 2000
        });

        const countryCode = country.properties.short_code?.toUpperCase();
        if (countryCode && onCountryClick) {
          setTimeout(() => {
            onCountryClick({
              name: country.text,
              iso: countryCode,
              color: countryColors[countryCode] || '#6b8620'
            });
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error searching country:', error);
    } finally {
      setIsSearching(false);
    }
  }, [countryColors, onCountryClick]);

  // Add debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

  return (
    <div className="relative w-full h-screen">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-72">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <Search className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <Input
            type="text"
            placeholder="Search for a country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full pl-9 pr-4",
              "bg-white/90 dark:bg-gray-800/90",
              "shadow-lg backdrop-blur-sm",
              "border border-gray-200 dark:border-gray-700",
              "placeholder:text-gray-500 dark:placeholder:text-gray-400",
              "focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400",
              "transition-all duration-200"
            )}
          />
        </div>
      </div>
      <div ref={mapContainer} className="w-full h-full" />
      <MapLoadingIndicator 
        isLoading={isLoading}
        progress={loadingProgress}
        countryCount={Object.keys(countryColors).length}
      />
    </div>
  );
}