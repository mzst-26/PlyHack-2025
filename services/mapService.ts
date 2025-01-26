import { fetchTopSongs } from '@/lib/api/itunes';
import { generateColor } from '@/components/modules/hash_colours';
import { getCountryCodes } from '@/components/modules/getCountryCode';

interface MapServiceConfig {
  onProgress: (progress: number) => void;
  batchSize?: number;
  concurrencyLimit?: number;
}

class MapService {
  private semaphore: Semaphore;
  private config: MapServiceConfig;

  constructor(config: MapServiceConfig) {
    this.config = {
      batchSize: 25,
      concurrencyLimit: 25,
      ...config
    };
    this.semaphore = new Semaphore(this.config.concurrencyLimit!);
  }

  async processCountryColors(): Promise<Record<string, string>> {
    try {
      // Check cache first
      const cachedResult = await this.checkCache();
      if (cachedResult) return cachedResult;

      const countryCodes = await getCountryCodes();
      const entries = Object.entries(countryCodes)
        .map(([name, code]) => [name, code.toUpperCase()]);
      
      const colors: Record<string, string> = {};
      let processed = 0;

      // Process in chunks
      const chunks = this.createChunks(entries, this.config.batchSize!);
      await this.processChunks(chunks, colors, () => {
        processed++;
        const progress = Math.round((processed / entries.length) * 100);
        this.config.onProgress(progress);
      });

      // Cache results
      this.cacheResults(colors);
      return colors;
    } catch (error) {
      console.error('Error processing colors:', error);
      return {};
    }
  }

  private async checkCache(): Promise<Record<string, string> | null> {
    const cachedColors = localStorage.getItem('countryColors');
    const cacheTimestamp = localStorage.getItem('countryColorsTimestamp');
    
    if (cachedColors && cacheTimestamp) {
      const cacheAge = Date.now() - parseInt(cacheTimestamp);
      if (cacheAge < 24 * 60 * 60 * 1000) {
        return JSON.parse(cachedColors);
      }
    }
    return null;
  }

  private createChunks<T>(array: T[], size: number): T[][] {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private async processChunks(
    chunks: string[][],
    colors: Record<string, string>,
    onProgress: () => void
  ) {
    await Promise.all(chunks.map(chunk => 
      Promise.all(chunk.map(async ([_, isoCode]) => {
        await this.semaphore.acquire();
        try {
          if (colors[isoCode]) return;
          const songs = await fetchTopSongs(isoCode, 10); // Fetch top 10 songs
          colors[isoCode] = 10 > 0 // Any songs found
            ? generateColor(songs.map(song => song.title)) // Generate color based on song titles
            : '#6b8620';
            songs.map(song => {console.log("song titles are:",song.title) })
          onProgress();
        } catch (error) {
          colors[isoCode] = '#6b8620';
        } finally {
          this.semaphore.release();
        }
      }))
    ));
  }

  private cacheResults(colors: Record<string, string>) {
    localStorage.setItem('countryColors', JSON.stringify(colors));
    localStorage.setItem('countryColorsTimestamp', Date.now().toString());
  }
}

class Semaphore {
  private permits: number;
  private queue: (() => void)[] = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return Promise.resolve();
    }
    return new Promise(resolve => this.queue.push(resolve));
  }

  release(): void {
    this.permits++;
    const next = this.queue.shift();
    if (next) {
      this.permits--;
      next();
    }
  }
}

export default MapService;