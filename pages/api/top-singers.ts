import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { countryCode } = req.query;

  if (!countryCode || typeof countryCode !== 'string') {
    return res.status(400).json({ error: 'Country code is required' });
  }

  // Fixed mock data for top songs by country
  const mockData: Record<string, { title: string; artist: string; url: string }[]> = {
    US: [
      { title: 'Blinding Lights', artist: 'The Weeknd', url: 'https://spotify.com/track/us1' },
      { title: 'Save Your Tears', artist: 'The Weeknd', url: 'https://spotify.com/track/us2' },
    ],
    UK: [
      { title: 'Shivers', artist: 'Ed Sheeran', url: 'https://spotify.com/track/uk1' },
      { title: 'Easy On Me', artist: 'Adele', url: 'https://spotify.com/track/uk2' },
    ],
    IN: [
      { title: 'Kesariya', artist: 'Arijit Singh', url: 'https://spotify.com/track/in1' },
      { title: 'Raatan Lambiyan', artist: 'Tanishk Bagchi', url: 'https://spotify.com/track/in2' },
    ],
  };

  // Default response if no data is available for the country
  const songs = mockData[countryCode] || [];

  res.status(200).json(songs);
}
