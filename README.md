# Nigerian Store Density Analyzer

A web application to analyze and visualize the density of commercial stores across different states in Nigeria using real-time data from OpenStreetMap. Users can select one or more states, compare their store densities, view the results on an interactive map, and leverage Google Gemini to predict new commercial hotspots.

## Features

-   **Multi-State Analysis**: Input and analyze multiple Nigerian states simultaneously.
-   **Interactive Map Visualization**: Uses Leaflet.js to display an interactive map of the selected state.
-   **Hexagonal Density Grid**: Store density is visualized using an H3 hexagonal grid, providing a clear and modern representation of data.
-   **Dynamic Color Scale**: A color gradient from cool (low density) to hot (high density) makes it easy to spot commercial hotspots at a glance.
-   **Detailed Summary Panel**: For each state, view key metrics:
    -   Total number of stores found.
    -   Average store density per grid cell.
    -   The location and count of the most dense area.
-   **AI Hotspot Prediction**: Utilizes the Google Gemini API to analyze existing store locations and suggest a new potential commercial hotspot with a rationale.
-   **Responsive Design**: A clean, modern UI built with Tailwind CSS that works seamlessly on desktop and mobile devices.
-   **Live Data**: Pulls data directly from the OpenStreetMap Overpass API, ensuring the information is up-to-date.
-   **Efficient & Asynchronous**: Fetches and processes data asynchronously, with clear loading indicators for a smooth user experience.

## How It Works

The application follows a simple yet powerful data processing pipeline:

1.  **Geocoding**: When a user inputs a state (e.g., "Lagos"), the application first queries the **OSM Nominatim API** to get the geographical bounding box (the coordinates defining the state's boundaries).
2.  **Data Fetching**: With the bounding box, a request is sent to the **OSM Overpass API**. This query fetches all map nodes tagged as a `shop` within that geographical area.
3.  **Density Calculation**: The GPS coordinates of each store are mapped to a specific hexagonal cell using the **H3 geospatial indexing system**. The application counts how many stores fall into each hexagon.
4.  **Data Aggregation**: The application calculates the total store count, average density across all non-empty cells, and identifies the single hexagon with the highest concentration of stores.
5.  **Visualization**: The processed data is rendered on the frontend:
    -   The **Summary Panel** displays the aggregated metrics in a clear, ranked list.
    -   The **Density Map** component renders each hexagon on a Leaflet map, coloring it based on its store count relative to the densest cell.
6.  **AI Prediction (Optional)**: The user can request an AI prediction for a state. The application sends the existing store coordinates to the **Google Gemini API** and receives a suggested latitude/longitude for a new hotspot, along with a reason for the choice.

## Technical Stack

-   **Frontend**: React, TypeScript
-   **Mapping**: React-Leaflet, h3-js
-   **Styling**: Tailwind CSS
-   **Data Source**: OpenStreetMap (via Nominatim and Overpass APIs)
-   **AI**: Google Gemini API (`@google/genai`)

## Project Structure

```
/
├── components/
│   ├── DensityMap.tsx       # Interactive Leaflet map component
│   ├── Loader.tsx           # Reusable loading spinner
│   ├── StateInputForm.tsx   # Form for user to input states
│   └── SummaryPanel.tsx     # Panel to display analysis results
│
├── services/
│   ├── osmService.ts        # Functions to fetch data from OSM APIs
│   └── geminiService.ts     # Functions to call the Google Gemini API
│
├── App.tsx                  # Main application component, handles state and logic
├── constants.ts             # App-wide constants (API URLs, state list)
├── index.html               # Main HTML entry point
├── index.tsx                # React root renderer
├── metadata.json            # Project metadata
└── types.ts                 # TypeScript type definitions
```

## Running the Application & Configuration

This is a client-side only application and can be run by opening the `index.html` file in a modern web browser.

### API Key Setup

The AI hotspot prediction feature requires a Google Gemini API key.

> #### 🚨 Security Warning 🚨
> Exposing your Google Gemini API key on the client-side (in the user's browser) is **highly insecure** for a public-facing application. Anyone can find and steal your API key, potentially leading to unauthorized use and unexpected charges.
>
> **The recommended approach is to use a deployment platform like Vercel that can securely inject your key at build time.** The instructions below cover this secure method, as well as a less secure method for local development only.


### Method 1: Local Development Only

For quickly running the app on your local machine:

1.  Open the `index.html` file in a text editor.
2.  Locate the `<script>` tag near the top of the file.
3.  Replace the placeholder `'%%GOOGLE_API_KEY%%'` with your actual Google Gemini API key.
    ```html
    <!-- Change this: -->
    <script>
      if (typeof process === 'undefined') {
        window.process = { env: { API_KEY: '%%GOOGLE_API_KEY%%' } };
      }
    </script>

    <!-- To this: -->
    <script>
      if (typeof process === 'undefined') {
        window.process = { env: { API_KEY: 'YOUR_API_KEY_HERE' } };
      }
    </script>
    ```
4.  **Important**: If you use version control (like Git), **do not commit this change**.

### Method 2: Deploying to Vercel (Recommended & Secure)

Vercel is an excellent platform for deploying this application. Here’s how to configure it to securely use your API key:

1.  **Create a New Vercel Project**: Connect your Git repository (GitHub, GitLab, etc.) to Vercel.
2.  **Configure Project Settings**:
    *   When importing, Vercel will ask you to configure the project.
    *   **Framework Preset**: Select `Other`.
    *   **Build & Development Settings** (expand this section):
        *   **Build Command**: Enter the following command: `sed -i "s|'%%GOOGLE_API_KEY%%'|'$GOOGLE_API_KEY'|g" index.html`
        *   **Output Directory**: Leave this blank. The build command modifies the file in place without creating an output directory.
    *   **Environment Variables** (expand this section):
        *   Add a new variable:
            *   **Name**: `GOOGLE_API_KEY`
            *   **Value**: Paste your actual Google Gemini API key.
        *   Ensure the variable is available to all environments (Production, Preview, Development).
3.  **Deploy**: Click the "Deploy" button. Vercel will run the build command, which replaces the `%%GOOGLE_API_KEY%%` placeholder in your `index.html` with the secure environment variable you just set.

This process ensures your API key is never exposed in your source code, providing a secure and professional setup.