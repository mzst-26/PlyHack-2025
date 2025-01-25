import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { countryCode } = req.query;
  
  if (!countryCode || typeof countryCode !== 'string') {
    return res.status(400).json({ error: 'Country code is required' });
  }

  try {
    console.log(`Fetching iTunes data for ${countryCode}...`);
    
    // Use a simpler iTunes API endpoint
    const url = `https://itunes.apple.com/${countryCode.toLowerCase()}/rss/topsongs/limit=1/json`;
    console.log('Requesting URL:', url);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; MyApp/1.0)'
      }
    });

    if (!response.ok) {
      console.error(`iTunes API error: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error('Response:', text);
      throw new Error(`iTunes API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.feed || !data.feed.entry) {
      console.error('Invalid data structure received:', JSON.stringify(data, null, 2));
      throw new Error('Invalid data structure from iTunes API');
    }

    console.log(`Successfully fetched data for ${countryCode}`);
    res.status(200).json(data);
  } catch (error) {
    console.error(`Detailed error for ${countryCode}:`, error);
    res.status(500).json({ 
      error: 'Failed to fetch iTunes data',
      details: error.message,
      countryCode 
    });
  }
}

function getStoreId(countryCode: string): number {
  const storeIds: { [key: string]: number } = {
    'us': 143441,  // United States
    'gb': 143444,  // United Kingdom
    'ca': 143455,  // Canada
    'de': 143443,  // Germany
    'fr': 143442,  // France
    'au': 143460,  // Australia
    'jp': 143462,  // Japan
  };

  return storeIds[countryCode] || 143441;
} 