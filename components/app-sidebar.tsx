import { HelpCircle } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { HelpDrawer } from "@/components/ui/help-drawer"

export function AppSidebar() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <Sidebar className="w-[4rem] border-r">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="flex flex-col items-center gap-2 p-2">
              <ModeToggle />
              <Button 
                variant="outline" 
                size="icon"
                className="w-[2.5rem] h-[2.5rem]"
                onClick={() => setShowHelp(true)}
              >
                <HelpCircle className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Help</span>
              </Button>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <HelpDrawer 
        open={showHelp} 
        onOpenChange={setShowHelp}
      />
    </>
  )
}
