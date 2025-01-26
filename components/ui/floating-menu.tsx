import { HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { useState } from "react"
import { HelpDrawer } from "@/components/ui/help-drawer"

export function FloatingMenu() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <div className="fixed top-4 left-4 flex flex-col gap-2 z-10">
        <ModeToggle />
        <Button 
          variant="outline" 
          size="icon"
          className="w-[2.5rem] h-[2.5rem] bg-background"
          onClick={() => setShowHelp(true)}
        >
          <HelpCircle className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Help</span>
        </Button>
      </div>

      <HelpDrawer 
        open={showHelp} 
        onOpenChange={setShowHelp}
      />
    </>
  )
} 