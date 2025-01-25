// fetch #1 song from given country 

interface dataOutput {
    title: string;
    image: string;
    url: string;
}

export async function fetchTopSong(country_code: string, count: number): Promise<dataOutput> {
    try {
        // Keep country code uppercase and use the exact working URL format
        const url = `https://itunes.apple.com/${country_code}/rss/topsongs/limit=${count}/json`;
        console.log('Fetching from:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Match the exact structure from the working example
        if (!data.feed?.entry) {
            throw new Error('Invalid feed data structure');
        }

        return {
            title: data.feed.entry['im:name'].label,
            image: data.feed.entry['im:image'][2].label,
            url: data.feed.entry.link[0].attributes.href
        };
    } catch (error) {
        console.error(`Failed to fetch song for ${country_code}:`, error);
        throw error;
    }
}