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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Fetch just the country IDs from the GeoJSON
    const response = await fetch(`${process.env.BASE_URL}/geojson/countries.geojson`);
    const data = await response.json();
    
    // Create a map of country codes to colors
    const countryColors = Object.fromEntries(
      data.features.map((feature: any) => [
        feature.properties.ISO_A3,
        getRandomColor()
      ])
    );

    res.status(200).json(countryColors);
  } catch (error) {
    console.error('Error generating country colors:', error);
    res.status(500).json({ error: 'Failed to generate country colors' });
  }
} 