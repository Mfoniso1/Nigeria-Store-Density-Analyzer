
import React from 'react';
import type { StateAnalysis } from '../types';

interface SummaryPanelProps {
  results: StateAnalysis[];
  isLoading: boolean;
  error: string | null;
  activeStateName: string | null;
  onSelectState: (stateName: string) => void;
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({ results, isLoading, error, activeStateName, onSelectState }) => {
  if (isLoading && results.length === 0) return <div className="p-4 text-center">Fetching initial data...</div>;
  if (error) return <div className="p-4 text-red-400 text-center">{error}</div>;
  if (results.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400">
        <h3 className="text-lg font-semibold mb-2 text-white">Ready to Analyze</h3>
        <p>Add states and click "Analyze" to see store density data here.</p>
      </div>
    );
  }

  const sortedResults = [...results].sort((a, b) => b.totalStores - a.totalStores);

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg h-full overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-cyan-300">Analysis Results</h2>
      <div className="space-y-4">
        {sortedResults.map((result) => (
          <div
            key={result.stateName}
            onClick={() => onSelectState(result.stateName)}
            className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
              activeStateName === result.stateName
                ? 'bg-cyan-900/70 ring-2 ring-cyan-400'
                : 'bg-gray-700/50 hover:bg-gray-700'
            }`}
          >
            <h3 className="font-bold text-lg text-white">{result.stateName}</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 text-sm">
              <div className="text-gray-400">Total Stores Found:</div>
              <div className="text-right font-mono text-white">{result.totalStores.toLocaleString()}</div>
              
              <div className="text-gray-400">Avg. Density:</div>
              <div className="text-right font-mono text-white">{result.averageDensity.toFixed(2)} stores/cell</div>
              
              <div className="text-gray-400">Peak Density:</div>
              <div className="text-right font-mono text-white">{result.densestHex?.count.toLocaleString() ?? 'N/A'} stores</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SummaryPanel;
