export interface GeoLocation {
  ip: string;
  country: string;
  city: string;
  region: string;
  loc: number;
}

export async function getUserCountry(): Promise<string> {
  try {
    //const response = await fetch('/api/geolocation');
    //if (!response.ok) throw new Error('Failed to fetch location');
    
    const response = await fetch('https://ipinfo.io/json?token=13276a697eed96');
    if (!response.ok) throw new Error('Failed to fetch location');
    
    const data: GeoLocation = await response.json();
    return data.country;
  } catch (error) {
    console.error('Error detecting country:', error);
    return 'FR'; // Default to France if detection fails
  }
}

export async function getUserLocation(): Promise<string> {
  try {
    const response = await fetch('https://ipinfo.io/json?token=13276a697eed96');
    if (!response.ok) throw new Error('Failed to fetch location');
    
    const data: GeoLocation = await response.json();
    return data.loc;
  } catch (error) {
    console.error('Error detecting country:', error);
    return '6.4485,2.3557'; // Default to France if detection fails
  }
}