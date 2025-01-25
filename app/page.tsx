"use client"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import dynamic from "next/dynamic";
import 'mapbox-gl/dist/mapbox-gl.css'
import { getCountryCodes } from "@/components/modules/getCountryCode";
export default function Home() {
  const [open, setOpen] = useState(true);
  const isMobile = useIsMobile();
  const Map = dynamic(() => import('../components/map/map'), { ssr: false });
  
  const geojsonFilePath = './public/geojson/countries.geojson';
  const countryCodes = getCountryCodes(geojsonFilePath);
  
  console.log('Country Codes:', countryCodes);
  
  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <AppSidebar />
      <main className="max-w-full overflow-hidden min-w-full min-h-full">
        {!isMobile && <SidebarTrigger/>}
        <Map />
      </main>

    </SidebarProvider>
  );
}
