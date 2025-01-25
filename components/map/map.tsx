import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Initialize mapbox
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Generate random color for countries
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [0, 0],
      zoom: 1.5,
    });

    // Load map
    map.current.on('load', async () => {
      // Add country boundaries source
      map.current?.addSource('countries', {
        type: 'geojson',
        data: '/geojson/countries.geojson',
      });

      // Add country layer
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
            ['get', 'color']
          ],
          'fill-opacity': 0.7,
        },
      });

      // Assign random colors to each country
      const source = map.current?.getSource('countries') as mapboxgl.GeoJSONSource;
      const data = await fetch('/geojson/countries.geojson').then(res => res.json());
      
      // Add random color property to each feature
      data.features = data.features.map((feature: any) => ({
        ...feature,
        properties: {
          ...feature.properties,
          color: getRandomColor()
    }

      }));
      // Update the source data with colors
      source.setData(data);

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
        if (e.features && e.features[0]) {
          const countryData = e.features[0].properties;
          console.log('Country data:', JSON.stringify(countryData, null, 2));
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
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <div 
      ref={mapContainer} 
      style={{ 
        width: '100%', 
        height: '100vh',
        position: 'relative'
      }} 
    />
  );
};

export default Map;
