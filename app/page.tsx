"use client"
import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { MapProvider } from "@/contexts/MapContext";
import { fetchTopSongs } from "@/lib/api/itunes";
import { SongDrawer } from "@/components/ui/SongDrawer";
import { FloatingMenu } from "@/components/ui/floating-menu";
import type { Song } from "@/types";

const Map = dynamic(() => import('../components/map/map'), { ssr: false });

export default function Home() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<{ name: string; iso: string } | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGlobe, setIsGlobe] = useState(true);

  const handleCountryClick = useCallback(async (countryData: { name: string; iso: string }) => {
    setSelectedCountry(countryData);
    setDrawerOpen(true);
    setLoading(true);

    try {
      const songs = await fetchTopSongs(countryData.iso);
      setSongs(songs);
    } catch (error) {
      console.error('Error fetching songs:', error);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleToggleProjection = useCallback(() => {
    setIsGlobe(prev => !prev);
  }, []);

  return (
    <MapProvider>
      <main className="fixed inset-0">
        <FloatingMenu 
          isGlobe={isGlobe} 
          onToggleProjection={handleToggleProjection} 
        />
        <Map 
          onCountryClick={handleCountryClick} 
          isGlobe={isGlobe}
          onToggleProjection={handleToggleProjection}
        />
        <SongDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          country={selectedCountry}
          songs={songs}
          loading={loading}
        />
      </main>
    </MapProvider>
  );
}

