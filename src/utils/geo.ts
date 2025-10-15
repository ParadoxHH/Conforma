type ZipCoordinate = {
  lat: number;
  lng: number;
};

const zipCoordinates: Record<string, ZipCoordinate> = {
  '78701': { lat: 30.2682, lng: -97.7429 },
  '78702': { lat: 30.2620, lng: -97.7130 },
  '78703': { lat: 30.2870, lng: -97.7645 },
  '78704': { lat: 30.2500, lng: -97.7635 },
  '78744': { lat: 30.1934, lng: -97.7370 },
  '78205': { lat: 29.4252, lng: -98.4936 },
  '75201': { lat: 32.7876, lng: -96.7992 },
  '77002': { lat: 29.7558, lng: -95.3654 },
};

const EARTH_RADIUS_MILES = 3958.8;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function calculateDistanceMiles(zipA: string, zipB: string): number | null {
  const coordA = zipCoordinates[zipA];
  const coordB = zipCoordinates[zipB];
  if (!coordA || !coordB) {
    return null;
  }

  const latDiff = toRadians(coordB.lat - coordA.lat);
  const lngDiff = toRadians(coordB.lng - coordA.lng);
  const lat1 = toRadians(coordA.lat);
  const lat2 = toRadians(coordB.lat);

  const a =
    Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
    Math.sin(lngDiff / 2) * Math.sin(lngDiff / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_MILES * c;
}

export function getZipsWithinRadius(zip: string, radius: number): string[] {
  const coords = zipCoordinates[zip];
  if (!coords) {
    return [];
  }

  return Object.keys(zipCoordinates).filter((candidateZip) => {
    if (candidateZip === zip) {
      return true;
    }
    const distance = calculateDistanceMiles(zip, candidateZip);
    return distance !== null && distance <= radius;
  });
}

export function registerZipCoordinate(zip: string, lat: number, lng: number) {
  zipCoordinates[zip] = { lat, lng };
}

export function isKnownZip(zip: string): boolean {
  return !!zipCoordinates[zip];
}
