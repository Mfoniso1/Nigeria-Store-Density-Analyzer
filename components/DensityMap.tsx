import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip, useMap } from 'react-leaflet';
import * as h3 from 'h3-js';
import type { StateAnalysis } from '../types';

const MapUpdater: React.FC<{ analysis: StateAnalysis }> = ({ analysis }) => {
  const map = useMap();
  useEffect(() => {
    if (analysis) {
      const [minLat, minLon, maxLat, maxLon] = analysis.boundingBox;
      map.fitBounds([
        [minLat, minLon],
        [maxLat, maxLon],
      ]);
    }
  }, [analysis, map]);
  return null;
};

const getColor = (count: number, maxCount: number): string => {
  if (maxCount === 0) return '#0891b2'; // cyan-600
  const intensity = Math.sqrt(count / maxCount); // Use sqrt for better visual distribution
  if (intensity < 0.2) return '#0e7490'; // cyan-700
  if (intensity < 0.4) return '#06b6d4'; // cyan-500
  if (intensity < 0.6) return '#67e8f9'; // cyan-300
  if (intensity < 0.8) return '#facc15'; // yellow-400
  return '#ef4444'; // red-500
};

interface DensityMapProps {
  analysis: StateAnalysis | null;
}

const DensityMap: React.FC<DensityMapProps> = ({ analysis }) => {
  const maxDensity = useMemo(() => {
    if (!analysis || !analysis.densestHex) return 1;
    return analysis.densestHex.count;
  }, [analysis]);

  if (!analysis) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-800 rounded-lg text-gray-400">
        Select a state to view the map.
      </div>
    );
  }
  
  return (
    <MapContainer center={analysis.mapCenter} zoom={9} scrollWheelZoom={true} className="h-full w-full rounded-lg z-0">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      
      {Object.values(analysis.hexes).map(hex => {
        const boundaries = h3.cellToBoundary(hex.hexId); // Get [lat, lon]
        return (
          <Polygon
            key={hex.hexId}
            positions={boundaries}
            pathOptions={{
              fillColor: getColor(hex.count, maxDensity),
              color: '#1f2937', // gray-800
              weight: 1,
              fillOpacity: 0.7,
            }}
          >
            <Tooltip>
              <div>
                <strong>Stores:</strong> {hex.count}
              </div>
            </Tooltip>
          </Polygon>
        );
      })}
      <MapUpdater analysis={analysis} />
    </MapContainer>
  );
};

export default DensityMap;
