import { GoogleGenerativeAI, Type } from "@google/genai";
import type { OverpassElement, AIHotspot } from '../types';

// Create AI client once
const getAiClient = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY; // ✅ use Vite-style env var
  if (!apiKey) {
    console.error("VITE_GOOGLE_API_KEY is missing. Please configure it in Vercel → Project Settings → Environment Variables.");
    return null;
  }
  return new GoogleGenerativeAI({ apiKey });
};

const ai = getAiClient();

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    lat: { type: Type.NUMBER, description: "Predicted latitude for the new hotspot" },
    lon: { type: Type.NUMBER, description: "Predicted longitude for the new hotspot" },
    reasoning: { type: Type.STRING, description: "A brief, one-sentence explanation for why this location was chosen" }
  },
  required: ["lat", "lon", "reasoning"]
};

export const predictHotspot = async (
  stateName: string,
  stores: OverpassElement[],
  boundingBox: [number, number, number, number]
): Promise<AIHotspot> => {
  if (!ai) {
    throw new Error("AI client not initialized. Make sure VITE_GOOGLE_API_KEY is set correctly.");
  }

  // Sample store data if too large
  let storeSample = stores;
  if (stores.length > 500) {
    storeSample = stores.sort(() => 0.5 - Math.random()).slice(0, 500);
  }
  const storeCoords = storeSample.map(s => `(${s.lat.toFixed(4)}, ${s.lon.toFixed(4)})`).join('; ');
  const bboxString = `minLat: ${boundingBox[0]}, minLon: ${boundingBox[1]}, maxLat: ${boundingBox[2]}, maxLon: ${boundingBox[3]}`;

  const prompt = `
    You are a professional geospatial analyst.
    I am analyzing the commercial store density in ${stateName} State, Nigeria.
    The state's bounding box is approximately ${bboxString}.
    Here is a list of existing store coordinates: ${storeCoords}.

    Your task is to predict the latitude and longitude of a single, new potential commercial hotspot.
    This location should be a strategic point for a new store, likely near existing clusters but in an area with potential for commercial growth. The prediction must be within the provided bounding box.
    Provide a brief, one-sentence reasoning for your choice.

    Return your answer ONLY in valid JSON format matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const text = response.text().trim();
    const resultJson: AIHotspot = JSON.parse(text);

    if (typeof resultJson.lat !== "number" || typeof resultJson.lon !== "number" || typeof resultJson.reasoning !== "string") {
      throw new Error("AI response did not match the required format.");
    }

    return resultJson;
  } catch (e) {
    console.error("Error calling Gemini API:", e);
    throw new Error("Failed to get a prediction from the AI model.");
  }
};
  // To avoid overwhelming the API, sample the store data if it's too large
  let storeSample = stores;
  if (stores.length > 500) {
    storeSample = stores.sort(() => 0.5 - Math.random()).slice(0, 500);
  }
  const storeCoords = storeSample.map(s => `(${s.lat.toFixed(4)}, ${s.lon.toFixed(4)})`).join('; ');
  const bboxString = `minLat: ${boundingBox[0]}, minLon: ${boundingBox[1]}, maxLat: ${boundingBox[2]}, maxLon: ${boundingBox[3]}`;

  const prompt = `
    You are a professional geospatial analyst.
    I am analyzing the commercial store density in ${stateName} State, Nigeria.
    The state's bounding box is approximately ${bboxString}.
    Here is a list of existing store coordinates: ${storeCoords}.

    Your task is to predict the latitude and longitude of a single, new potential commercial hotspot.
    This location should be a strategic point for a new store, likely near existing clusters but in an area with potential for commercial growth. The prediction must be within the provided bounding box.
    Provide a brief, one-sentence reasoning for your choice.

    Return your answer ONLY in a valid JSON format that adheres to the following schema.
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
        },
    });

    const text = response.text.trim();
    // The response text is expected to be a clean JSON string based on the schema
    const resultJson: AIHotspot = JSON.parse(text);

    // Basic validation
    if (typeof resultJson.lat !== 'number' || typeof resultJson.lon !== 'number' || typeof resultJson.reasoning !== 'string') {
        throw new Error("AI response did not match the required format.");
    }
    
    return resultJson;
  } catch(e) {
      console.error("Error calling Gemini API:", e);
      throw new Error("Failed to get a prediction from the AI model.");
  }
};
