import React, { useState, useCallback, useEffect } from 'react';
import * as h3 from 'h3-js';
import StateInputForm from './components/StateInputForm';
import SummaryPanel from './components/SummaryPanel';
import DensityMap from './components/DensityMap';
import Loader from './components/Loader';
import { getStateBoundingBox, getStoresInBoundingBox } from './services/osmService';
import { predictHotspot } from './services/geminiService';
import type { StateAnalysis, HexData, OverpassElement } from './types';
import { H3_RESOLUTION } from './constants';

const App: React.FC = () => {
  const [analysisResults, setAnalysisResults] = useState<StateAnalysis[]>([]);
  const [activeStateName, setActiveStateName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPredicting, setIsPredicting] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const analyzeState = async (stateName: string): Promise<StateAnalysis> => {
    setLoadingMessage(`Fetching bounding box for ${stateName}...`);
    const boundingBox = await getStateBoundingBox(stateName);
    
    setLoadingMessage(`Querying stores in ${stateName} from OpenStreetMap...`);
    const stores = await getStoresInBoundingBox(boundingBox);
    
    setLoadingMessage(`Calculating store density for ${stateName}...`);
    const hexes: Record<string, HexData> = {};
    stores.forEach((store: OverpassElement) => {
      const hexId = h3.latLngToCell(store.lat, store.lon, H3_RESOLUTION);
      if (!hexes[hexId]) {
        const [lat, lon] = h3.cellToLatLng(hexId);
        hexes[hexId] = { hexId, count: 0, lat, lon };
      }
      hexes[hexId].count++;
    });

    const totalStores = stores.length;
    const hexValues = Object.values(hexes);
    const averageDensity = hexValues.length > 0 ? totalStores / hexValues.length : 0;

    let densestHex: HexData | null = null;
    if (hexValues.length > 0) {
      densestHex = hexValues.reduce((max, hex) => (hex.count > max.count ? hex : max), hexValues[0]);
    }
    
    const [minLat, minLon, maxLat, maxLon] = boundingBox;
    const mapCenter: [number, number] = [(minLat + maxLat) / 2, (minLon + maxLon) / 2];

    return {
      stateName,
      totalStores,
      averageDensity,
      densestHex,
      hexes,
      boundingBox,
      mapCenter,
      stores,
      aiHotspot: null,
    };
  };

  const handleAnalyze = useCallback(async (states: string[]) => {
    setIsLoading(true);
    setError(null);
    const results: StateAnalysis[] = [];
    
    try {
      for (const state of states) {
        const existingResult = analysisResults.find(r => r.stateName === state);
        if (existingResult) {
            results.push(existingResult);
            continue;
        }
        const result = await analyzeState(state);
        results.push(result);
      }
      setAnalysisResults(results);
      if (results.length > 0) {
        // Sort by total stores and set active to the one with most stores initially
        const sorted = [...results].sort((a,b) => b.totalStores - a.totalStores);
        setActiveStateName(sorted[0].stateName);
      } else {
        setActiveStateName(null);
      }
    } catch (e) {
      const err = e as Error;
      setError(`Analysis failed: ${err.message}`);
      console.error(e);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [analysisResults]);
  
  const handleSelectState = (stateName: string) => {
      const result = analysisResults.find(r => r.stateName === stateName);
      if(result) {
          // Create a new object to ensure the map updater's dependency array catches the change
          const updatedResult = {...result, aiHotspot: null};
          setAnalysisResults(prev => prev.map(r => r.stateName === stateName ? updatedResult : r));
          setActiveStateName(stateName);
      }
  };

  const handlePredictHotspot = useCallback(async (stateName: string) => {
    setIsPredicting(stateName);
    setError(null);
    try {
        const resultToUpdate = analysisResults.find(r => r.stateName === stateName);
        if (!resultToUpdate) throw new Error("State data not found for prediction.");

        const prediction = await predictHotspot(stateName, resultToUpdate.stores, resultToUpdate.boundingBox);

        setAnalysisResults(prevResults =>
            prevResults.map(r =>
                r.stateName === stateName ? { ...r, aiHotspot: prediction } : r
            )
        );
        setActiveStateName(stateName); // Ensure the updated state is active
    } catch (e) {
        const err = e as Error;
        setError(`AI Prediction failed: ${err.message}`);
        console.error(e);
    } finally {
        setIsPredicting(null);
    }
}, [analysisResults]);

  const activeAnalysis = analysisResults.find(r => r.stateName === activeStateName) || null;

  useEffect(() => {
      // Pre-run analysis for default states
      handleAnalyze(['Lagos', 'Rivers']);
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col p-4 sm:p-6 lg:p-8">
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-bold text-white">Nigerian Store Density Analyzer</h1>
        <p className="text-lg text-cyan-300 mt-2">Visualize store distribution and predict new hotspots with AI.</p>
      </header>
      
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <StateInputForm onAnalyze={handleAnalyze} isLoading={isLoading} />
          <SummaryPanel 
            results={analysisResults} 
            isLoading={isLoading} 
            error={error}
            activeStateName={activeStateName}
            onSelectState={handleSelectState}
            onPredictHotspot={handlePredictHotspot}
            isPredicting={isPredicting}
          />
        </div>
        
        <div className="lg:col-span-2 bg-gray-800 rounded-lg shadow-lg min-h-[400px] lg:min-h-0">
          {isLoading && analysisResults.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center">
                <Loader message={loadingMessage} />
            </div>
          ) : (
            <DensityMap analysis={activeAnalysis} />
          )}
        </div>
      </main>
      
      <footer className="text-center mt-8 text-gray-500 text-sm">
        <p>Data sourced from OpenStreetMap. Map tiles by CARTO. AI predictions by Google Gemini.</p>
      </footer>
    </div>
  );
};

export default App;