export async function getCountriesData() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/countries`, {
    next: { revalidate: 3600 } // Revalidate every hour
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch countries data');
  }
  
  return res.json();
} 