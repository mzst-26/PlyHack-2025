import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { countryCode, limit = '10' } = req.query;
  
  if (!countryCode || typeof countryCode !== 'string') {
    return res.status(400).json({ error: 'Country code is required' });
  }

  try {
    const url = `https://itunes.apple.com/${countryCode.toLowerCase()}/rss/topsongs/limit=${limit}/json`;
    console.log('Requesting iTunes:', url);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; MyApp/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`iTunes API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.feed?.entry) {
      throw new Error('Invalid data structure from iTunes API');
    }

    res.status(200).json(data);
  } catch (error) {
    console.error(`iTunes API error for ${countryCode}:`, error);
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