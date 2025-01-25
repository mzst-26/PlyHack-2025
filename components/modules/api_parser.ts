// fetch #1 song from given country 

interface dataOutput {
    title: string;
    image: string;
    url: string;
}

export async function fetchTopSong(country_code: string, count: Number): Promise<dataOutput> {
    const response = await fetch(`https://itunes.apple.com/${country_code}/rss/topsongs/limit=${count}/json`);
    const data = await response.json();
    return{
        title: data.feed.entry.title.label,
        image: data.feed.entry['im:image'][2].label,
        url: data.feed.entry.link.attributes.href
    }
}