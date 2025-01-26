import { createContext, useContext, useState, useCallback } from 'react';

interface MapContextType {
  countryColors: Record<string, string>;
  setCountryColors: (colors: Record<string, string>) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  loadingProgress: number;
  setLoadingProgress: (progress: number) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export function MapProvider({ children }: { children: React.ReactNode }) {
  const [countryColors, setCountryColors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  return (
    <MapContext.Provider value={{
      countryColors,
      setCountryColors,
      isLoading,
      setIsLoading,
      loadingProgress,
      setLoadingProgress,
    }}>
      {children}
    </MapContext.Provider>
  );
}

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error('useMapContext must be used within a MapProvider');
  }
  return context;
}; 