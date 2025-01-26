'use client'

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Palette } from "lucide-react"
import { useMapContext } from "@/contexts/MapContext"

export function ColorToggle() {
  const { colorMode, setColorMode, isLoading } = useMapContext()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="w-[2.5rem] h-[2.5rem]"
          disabled={isLoading}
        >
          <Palette className={`h-[1.2rem] w-[1.2rem] ${isLoading ? 'animate-spin' : ''}`} />
          <span className="sr-only">Toggle color mode</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setColorMode("hash")}
          disabled={isLoading}
        >
          Hash Colors
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setColorMode("average")}
          disabled={isLoading}
        >
          Average Colors
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 