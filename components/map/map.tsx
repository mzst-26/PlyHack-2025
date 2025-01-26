import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapContext } from '@/contexts/MapContext';
import MapService from '@/services/mapService';
import { MapLoadingIndicator } from './MapLoadingIndicator';
import { fetchTopSongs } from "@/lib/api/itunes";

// Initialize mapbox
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

interface MapProps {
  onCountryClick?: (countryData: { name: string; iso: string; color: string }) => void;
}

export default function Map({ onCountryClick }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { 
    countryColors, 
    setCountryColors,
    isLoading,
    setIsLoading,
    loadingProgress,
    setLoadingProgress 
  } = useMapContext();

  useEffect(() => {
    if (!mapContainer.current) return;

    const initializeMap = async () => {
      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [0, 0],
        zoom: 1.5,
        minZoom: 1,
        maxZoom: 3,
        projection: 'mercator',
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
  }, []);

  const setupMapLayers = async (colors: Record<string, string>) => {
    if (!map.current) return;

    // Add source
    map.current.addSource('countries', {
      type: 'geojson',
      data: '/geojson/countries.geojson',
    });

    // Add layers
    map.current.addLayer({
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

    // Add borders
    map.current.addLayer({
      id: 'country-borders',
      type: 'line',
      source: 'countries',
      layout: {},
      paint: {
        'line-color': '#000000',
        'line-width': 1,
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

  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainer} className="w-full h-full" />
      <MapLoadingIndicator 
        isLoading={isLoading}
        progress={loadingProgress}
        countryCount={Object.keys(countryColors).length}
      />
    </div>
  );
}
