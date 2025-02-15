import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { PlayCircle, PauseCircle } from "lucide-react";
import { useState, useRef } from "react";
import type { Song } from "@/types";
import { useTheme } from "@/components/theme-provider";

interface SongDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  country: { name: string; iso: string } | null;
  songs: Song[];
  loading: boolean;
}

export function SongDrawer({ open, onOpenChange, country, songs, loading }: SongDrawerProps) {
  const [playingSongId, setPlayingSongId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { theme } = useTheme();

  const handlePlayPause = (index: number, previewUrl: string) => {
    if (playingSongId === index) {
      // Pause current song
      audioRef.current?.pause();
      setPlayingSongId(null);
    } else {
      // Stop current song if any
      if (audioRef.current) {
        audioRef.current.pause();
      }
      // Play new song
      audioRef.current = new Audio(previewUrl);
      audioRef.current.play();
      setPlayingSongId(index);
      
      // Add ended event listener
      audioRef.current.onended = () => {
        setPlayingSongId(null);
      };
    }
  };

  // Cleanup audio on drawer close or unmount
  const handleDrawerClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayingSongId(null);
    }
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={handleDrawerClose}>
      <DrawerContent className="max-h-[85vh]">
        <div className="mx-auto w-auto max-w-[800px] px-4">
          <DrawerHeader className="pb-2">
            <DrawerTitle>
              {country ? `Top Songs in ${country.name}` : 'Select a country'}
            </DrawerTitle>
            <DrawerDescription>
              {loading ? 'Loading songs...' : `Current Top Songs in ${country?.name || ''}`}
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {songs.map((song, index) => (
                  <div 
                    key={`${song.title}-${index}`} 
                    className={`
                      flex items-center space-x-2 p-2 rounded-lg 
                      ${theme === 'dark' 
                        ? 'bg-gray-800 hover:bg-gray-700' 
                        : 'bg-white hover:bg-gray-50'
                      } 
                      shadow-sm hover:shadow-md transition-all duration-200
                    `}
                  >
                    <div className="relative w-12 h-12 flex-shrink-0 group">
                      <img 
                        src={song.artwork} 
                        alt={song.title} 
                        className="w-full h-full rounded-md object-cover"
                      />
                      {song.previewUrl && (
                        <button
                          onClick={() => handlePlayPause(index, song.previewUrl)}
                          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
                        >
                          {playingSongId === index ? (
                            <PauseCircle className="w-6 h-6 text-white" />
                          ) : (
                            <PlayCircle className="w-6 h-6 text-white" />
                          )}
                        </button>
                      )}
                      <div className="absolute -top-1 -right-1 bg-black/50 text-white px-1.5 py-0.5 rounded-full text-xs">
                        #{index + 1}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`font-medium truncate text-xs ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                        {song.title}
                      </div>
                      <div className={`text-xs truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {song.artist}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DrawerFooter className="pt-4">
            <DrawerClose asChild>
              <Button variant={theme === 'dark' ? 'outline' : 'secondary'}>
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
} 