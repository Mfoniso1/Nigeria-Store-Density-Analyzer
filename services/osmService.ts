
import { NOMINATIM_API_URL, OVERPASS_API_URL } from '../constants';
import type { NominatimResult, OverpassElement } from '../types';

export const getStateBoundingBox = async (stateName: string): Promise<[number, number, number, number]> => {
  const query = `${stateName} State, Nigeria`;
  const url = `${NOMINATIM_API_URL}?q=${encodeURIComponent(query)}&format=json&limit=1`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch bounding box for ${stateName}`);
  }
  
  const data: NominatimResult[] = await response.json();
  if (data.length === 0 || !data[0].boundingbox) {
    throw new Error(`Could not find location data for ${stateName}`);
  }
  
  const [minLat, maxLat, minLon, maxLon] = data[0].boundingbox.map(parseFloat);
  return [minLat, minLon, maxLat, maxLon]; // south, west, north, east
};

export const getStoresInBoundingBox = async (bbox: [number, number, number, number]): Promise<OverpassElement[]> => {
  const [south, west, north, east] = bbox;
  const query = `
    [out:json][timeout:60];
    (
      node["shop"](${south},${west},${north},${east});
    );
    out geom;
  `;

  const response = await fetch(OVERPASS_API_URL, {
    method: 'POST',
    body: query,
  });

  if (!response.ok) {
    throw new Error(`Overpass API request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.elements;
};
