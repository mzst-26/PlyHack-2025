"use client"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Home() {
  const [open, setOpen] = useState(true);
  const isMobile = useIsMobile();

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <AppSidebar />
      <main className="max-w-full overflow-hidden">
        {!isMobile && <SidebarTrigger/>}
      </main>
      
    </SidebarProvider>
  );
}
