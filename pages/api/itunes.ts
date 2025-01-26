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
    // Always fetch 10 songs
    const url = `https://itunes.apple.com/${countryCode.toLowerCase()}/rss/topsongs/limit=10/json`;
    console.log('Requesting URL:', url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`iTunes API responded with status: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error(`iTunes API error for ${countryCode}:`, error);
    res.status(500).json({ error: 'Failed to fetch iTunes data' });
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