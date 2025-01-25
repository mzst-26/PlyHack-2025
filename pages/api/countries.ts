import type { NextApiRequest, NextApiResponse } from 'next';

// Helper function to generate random color
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Cache for country colors
let colorCache: Record<string, string> | null = null;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Return cached colors if available
    if (colorCache) {
      return res.status(200).json(colorCache);
    }

    // Fetch the GeoJSON data
    const response = await fetch(`${process.env.BASE_URL}/geojson/countries.geojson`);
    const data = await response.json();

    // Create a map of country codes to colors
    colorCache = {};
    data.features.forEach((feature: any) => {
      if (feature.properties.ISO_A3) {
        colorCache![feature.properties.ISO_A3] = getRandomColor();
      }
    });

    res.status(200).json(colorCache);
  } catch (error) {
    console.error('Error processing countries data:', error);
    res.status(500).json({ error: 'Failed to process countries data' });
  }
}
