"use client"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useState, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import dynamic from "next/dynamic";
import { MapProvider } from "@/contexts/MapContext";
import { fetchTopSongs } from "@/lib/api/itunes";
import { SongDrawer } from "@/components/ui/SongDrawer";
import type { Song } from "@/types";

const Map = dynamic(() => import('../components/map/map'), { ssr: false });

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<{ name: string; iso: string } | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();

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

  return (
    <MapProvider>
      <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <AppSidebar />
        <main className="max-w-full overflow-hidden min-w-full min-h-full">
          {!isMobile && <SidebarTrigger/>}
          <Map onCountryClick={handleCountryClick} />
          <SongDrawer
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            country={selectedCountry}
            songs={songs}
            loading={loading}
          />
        </main>
      </SidebarProvider>
    </MapProvider>
  );
}

