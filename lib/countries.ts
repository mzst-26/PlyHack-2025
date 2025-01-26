type CountryCodeMap = { [key: string]: string };

export function getCountryCode(): CountryCodeMap {
  return {
    "Afghanistan": "AF",
    "Albania": "AL",
    "Algeria": "DZ",
    "Andorra": "AD",
    "Angola": "AO",
    "Argentina": "AR",
    "Armenia": "AM",
    "Australia": "AU",
    "Austria": "AT",
    "Azerbaijan": "AZ",
    // ... add more countries
    "United States": "US",
    "United Kingdom": "GB",
    "Canada": "CA",
    "France": "FR",
    "Germany": "DE",
    "Italy": "IT",
    "Japan": "JP",
    "Spain": "ES",
    "Brazil": "BR",
    "Mexico": "MX"
  };
} 