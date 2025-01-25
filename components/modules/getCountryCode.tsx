interface CountryCode {
  [key: string]: string;
}

export async function getCountryCodes(): Promise<CountryCode> {
  try {
    // Fetch the GeoJSON file
    const response = await fetch('/geojson/countries.geojson');
    const geojsonData = await response.json();
    
    // Create an object to store country codes
    const countryCodes: CountryCode = {};

    // Add logging to check the data
    console.log('GeoJSON features count:', geojsonData.features.length);

    // Extract only ISO_A2 codes from features
    geojsonData.features.forEach((feature: any) => {
      const countryName = feature.properties.ADMIN;
      const isoA2 = feature.properties.ISO_A2;
      
      // Only store if ISO_A2 exists and is not "-"
      if (isoA2 && isoA2 !== "-") {
        countryCodes[countryName] = isoA2;
      }
    });

    // Log the final result
    console.log('Processed country codes count:', Object.keys(countryCodes).length);

    return countryCodes;

  } catch (error) {
    console.error('Error loading country codes:', error);
    return {};
  }
}

// Example usage:
// const codes = getCountryCodes();
// console.log(codes['Canada']); // 'CA'
