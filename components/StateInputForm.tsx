
import React, { useState, useCallback } from 'react';
import { NIGERIAN_STATES } from '../constants';

interface StateInputFormProps {
  onAnalyze: (states: string[]) => void;
  isLoading: boolean;
}

const StateInputForm: React.FC<StateInputFormProps> = ({ onAnalyze, isLoading }) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [states, setStates] = useState<string[]>(['Lagos', 'Rivers']);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (value) {
      const filtered = NIGERIAN_STATES.filter(state => 
        state.toLowerCase().startsWith(value.toLowerCase()) && !states.includes(state)
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const addState = useCallback((state: string) => {
    const formattedState = state.trim();
    if (formattedState && !states.includes(formattedState)) {
      setStates([...states, formattedState]);
      setInputValue('');
      setSuggestions([]);
    }
  }, [states]);

  const removeState = (index: number) => {
    setStates(states.filter((_, i) => i !== index));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      addState(inputValue);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-cyan-300">Select States to Analyze</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {states.map((state, index) => (
          <div key={index} className="flex items-center bg-cyan-800/50 text-cyan-200 px-3 py-1 rounded-full text-sm">
            <span>{state}</span>
            <button onClick={() => removeState(index)} className="ml-2 text-cyan-200 hover:text-white">&times;</button>
          </div>
        ))}
      </div>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a state name (e.g., Kano)"
          className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          disabled={isLoading}
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-gray-700 border border-gray-600 rounded-md mt-1 shadow-lg max-h-48 overflow-y-auto">
            {suggestions.map(suggestion => (
              <li 
                key={suggestion} 
                onClick={() => addState(suggestion)}
                className="px-4 py-2 cursor-pointer hover:bg-gray-600"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        onClick={() => onAnalyze(states)}
        disabled={isLoading || states.length === 0}
        className="w-full mt-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
      >
        {isLoading ? 'Analyzing...' : `Analyze ${states.length} State(s)`}
      </button>
    </div>
  );
};

export default StateInputForm;
