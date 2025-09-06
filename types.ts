
export interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: [string, string, string, string];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
}

export interface OverpassElement {
  type: string;
  id: number;
  lat: number;
  lon: number;
}

export interface HexData {
  hexId: string;
  count: number;
  lat: number;
  lon: number;
}

export interface StateAnalysis {
  stateName: string;
  totalStores: number;
  averageDensity: number;
  densestHex: HexData | null;
  hexes: Record<string, HexData>;
  boundingBox: [number, number, number, number];
  mapCenter: [number, number];
}
