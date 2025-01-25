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
    // Fetch the GeoJSON data
    const response = await fetch(`${process.env.BASE_URL}/geojson/countries.geojson`);
    const data = await response.json();

    // Add random color property to each feature
    data.features = data.features.map((feature: any) => ({
      ...feature,
      properties: {
        ...feature.properties,
        color: getRandomColor()
      }
    }));

    res.status(200).json(data);
  } catch (error) {
    console.error('Error processing countries data:', error);
    res.status(500).json({ error: 'Failed to process countries data' });
  }
}
