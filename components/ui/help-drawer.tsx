import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

interface HelpDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HelpDrawer({ open, onOpenChange }: HelpDrawerProps) {
  const { theme } = useTheme()

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <div className="mx-auto w-auto max-w-[800px] px-4">
          <DrawerHeader>
            <DrawerTitle>How it works</DrawerTitle>
            <DrawerDescription>
              Learn about the World Music Map
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 space-y-4">
            <section>
              <h3 className="font-semibold mb-2">About the Map</h3>
              <p className="text-sm text-muted-foreground">
                The World Music Map visualizes each country's current top songs from iTunes. 
                The color of each country is uniquely generated based on its top 10 songs.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">How to Use</h3>
              <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-2">
                <li>Click on any country to see its top 10 songs</li>
                <li>Preview songs by clicking the play button</li>
                <li>Toggle between light and dark mode using the theme switch</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">Color Generation</h3>
              <p className="text-sm text-muted-foreground">
                Each country's color is algorithmically generated based on the titles of its current top 10 songs, 
                creating a unique musical fingerprint.
              </p>
            </section>
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant={theme === 'dark' ? 'outline' : 'secondary'}>
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
} 