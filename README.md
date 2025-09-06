
# Nigerian Store Density Analyzer

A web application to analyze and visualize the density of commercial stores across different states in Nigeria using real-time data from OpenStreetMap. Users can select one or more states, compare their store densities, and view the results on an interactive map and a summary panel.

## Features

-   **Multi-State Analysis**: Input and analyze multiple Nigerian states simultaneously.
-   **Interactive Map Visualization**: Uses Leaflet.js to display an interactive map of the selected state.
-   **Hexagonal Density Grid**: Store density is visualized using an H3 hexagonal grid, providing a clear and modern representation of data.
-   **Dynamic Color Scale**: A color gradient from cool (low density) to hot (high density) makes it easy to spot commercial hotspots at a glance.
-   **Detailed Summary Panel**: For each state, view key metrics:
    -   Total number of stores found.
    -   Average store density per grid cell.
    -   The location and count of the most dense area.
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

## Technical Stack

-   **Frontend**: React, TypeScript
-   **Mapping**: React-Leaflet, h3-js
-   **Styling**: Tailwind CSS
-   **Data Source**: OpenStreetMap (via Nominatim and Overpass APIs)

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
│   └── osmService.ts        # Functions to fetch data from OSM APIs
│
├── App.tsx                  # Main application component, handles state and logic
├── constants.ts             # App-wide constants (API URLs, state list)
├── index.html               # Main HTML entry point
├── index.tsx                # React root renderer
├── metadata.json            # Project metadata
└── types.ts                 # TypeScript type definitions
```

## Getting Started

To run this project locally, you'll need Node.js and a package manager like npm or yarn.

1.  **Clone the repository** (or ensure all the project files are in a single directory).

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start the development server**:
    ```bash
    npm run start
    ```
    (This assumes you have a `start` script in your `package.json` configured to run a local web server, e.g., using `vite`).

4.  Open your browser and navigate to the local address provided (usually `http://localhost:5173`).

The application requires an internet connection to fetch data from the OpenStreetMap APIs. No API keys are needed.
