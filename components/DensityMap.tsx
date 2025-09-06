import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip, useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import * as h3 from 'h3-js';
import type { StateAnalysis } from '../types';

const predictionIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" stroke-width="1.5">
      <style>
        .pulse {
          animation: pulse 2s infinite;
          transform-origin: center;
        }
        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 1; }
          70% { transform: scale(1.4); opacity: 0; }
          100% { transform: scale(0.9); opacity: 0; }
        }
      </style>
      <circle cx="12" cy="12" r="10" class="pulse" />
      <path d="M12 2L12 6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 18L12 22" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M4.93 4.93L7.76 7.76" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M16.24 16.24L19.07 19.07" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M2 12L6 12" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M18 12L22 12" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M4.93 19.07L7.76 16.24" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M16.24 7.76L19.07 4.93" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `)}`,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -20],
});

const MapUpdater: React.FC<{ analysis: StateAnalysis }> = ({ analysis }) => {
  const map = useMap();
  useEffect(() => {
    if (analysis?.aiHotspot) {
      // If there's a prediction, fly to it
      map.flyTo([analysis.aiHotspot.lat, analysis.aiHotspot.lon], 14);
    } else if (analysis) {
      // Otherwise, fit the state boundaries
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

      {analysis.aiHotspot && (
          <Marker
            position={[analysis.aiHotspot.lat, analysis.aiHotspot.lon]}
            icon={predictionIcon}
          >
            <Popup>
              <div className="text-base font-sans">
                <b className="text-cyan-600">AI Predicted Hotspot</b><br />
                <p className="my-1 text-sm">{analysis.aiHotspot.reasoning}</p>
                <code className="text-xs">
                  {analysis.aiHotspot.lat.toFixed(4)}, {analysis.aiHotspot.lon.toFixed(4)}
                </code>
              </div>
            </Popup>
          </Marker>
      )}

      <MapUpdater analysis={analysis} />
    </MapContainer>
  );
};

export default DensityMap;