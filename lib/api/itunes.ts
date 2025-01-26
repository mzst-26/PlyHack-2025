import type { Song } from "@/types";

interface iTunesResponse {
  feed?: {
    entry: any | any[];
  };
}

export async function fetchTopSongs(countryCode: string, limit: number = 10): Promise<Song[]> {
  try {
    const response = await fetch(`/api/itunes?countryCode=${countryCode}&limit=${limit}`);
    
    if (!response.ok) {
      console.error(`API error for ${countryCode}: ${response.status}`);
      return [];
    }

    const data: iTunesResponse = await response.json();
    
    if (!data.feed?.entry) {
      console.error(`No entries found for ${countryCode}`);
      return [];
    }

    const entries = Array.isArray(data.feed.entry) ? data.feed.entry : [data.feed.entry];
    
    return entries.map((entry: any) => ({
      title: entry['im:name']?.label || 'Unknown Title',
      artist: entry['im:artist']?.label || 'Unknown Artist',
      artwork: entry['im:image']?.[2]?.label || '',
      previewUrl: entry?.link?.find((l: any) => l.attributes?.type === 'audio/x-m4a')?.attributes?.href || ''
    }));
  } catch (error) {
    console.error(`Failed to fetch songs for ${countryCode}:`, error);
    return [];
  }
} 