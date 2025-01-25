"use client"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import dynamic from "next/dynamic";
import 'mapbox-gl/dist/mapbox-gl.css'
import { getCountryCodes } from "@/components/modules/getCountryCode";

interface CountryCode {
  [key: string]: string;
}

export default function Home() {
  const [open, setOpen] = useState(true);
  const [countryCodes, setCountryCodes] = useState<CountryCode>({});
  const isMobile = useIsMobile();
  const Map = dynamic(() => import('../components/map/map'), { ssr: false });

  useEffect(() => {
    // Load country codes when component mounts
    async function loadCountryCodes() {
      const codes = await getCountryCodes();
      setCountryCodes(codes);
      console.log('Country Codes loaded:', codes);
    }

    loadCountryCodes();
  }, []); // Empty dependency array means this runs once when component mounts

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
