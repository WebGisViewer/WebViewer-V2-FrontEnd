// src/context/MapContext.tsx
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
// Explicitly import Leaflet with the named import - this is critical
import * as L from 'leaflet';
import { projectService } from '../services';

// Define the context type
interface MapContextType {
    projectData: any | null;
    map: L.Map | null;
    loading: boolean;
    error: string | null;
    loadProject: (id: number) => Promise<void>;
    initializeMap: (container: HTMLElement) => void;
    toggleLayer: (layerId: number, visible: boolean) => void;
    changeBasemap: (basemapId: number) => void;
    currentBasemap: number | null;
    visibleLayers: Set<number>;
}

const MapContext = createContext<MapContextType>({
    projectData: null,
    map: null,
    loading: false,
    error: null,
    loadProject: async () => {},
    initializeMap: () => {},
    toggleLayer: () => {},
    changeBasemap: () => {},
    currentBasemap: null,
    visibleLayers: new Set()
});

export const useMap = () => useContext(MapContext);

export const MapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // State
    const [projectData, setProjectData] = useState<any | null>(null);
    const [map, setMap] = useState<L.Map | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [currentBasemap, setCurrentBasemap] = useState<number | null>(null);
    const [visibleLayers, setVisibleLayers] = useState<Set<number>>(new Set());

    // Refs
    const mapRef = useRef<L.Map | null>(null);
    const layersRef = useRef<{ [id: number]: L.Layer }>({});
    const basemapLayersRef = useRef<{ [id: number]: L.TileLayer }>({});

    // Load project data
    const loadProject = useCallback(async (id: number) => {
        console.log('[MapContext] loadProject called with id:', id);
        try {
            setLoading(true);
            setError(null);

            // Fetch project data from the API
            console.log('[MapContext] Fetching project data...');
            const data = await projectService.getProjectConstructor(id);
            console.log('[MapContext] Project data received:', data);

            // Make sure layer_groups is an array
            if (!data.layer_groups) {
                data.layer_groups = [];
            }

            // Initialize visible layers
            const initialVisibleLayers = new Set<number>();

            if (Array.isArray(data.layer_groups)) {
                data.layer_groups.forEach((group: any) => {
                    if (Array.isArray(group.layers)) {
                        group.layers.forEach((layer: any) => {
                            if (layer.is_visible_by_default) {
                                initialVisibleLayers.add(layer.id);
                            }
                        });
                    }
                });
            }

            console.log('[MapContext] Initial visible layers:', Array.from(initialVisibleLayers));
            setVisibleLayers(initialVisibleLayers);

            // Find default basemap
            if (Array.isArray(data.basemaps) && data.basemaps.length > 0) {
                const defaultBasemap = data.basemaps.find((b: any) => b.is_default);
                if (defaultBasemap) {
                    setCurrentBasemap(defaultBasemap.id);
                } else {
                    setCurrentBasemap(data.basemaps[0].id);
                }
            }

            setProjectData(data);
        } catch (err: any) {
            console.error('[MapContext] Error loading project:', err);
            setError(`Failed to load project: ${err.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initialize Leaflet map
    const initializeMap = useCallback((container: HTMLElement) => {
        console.log('[MapContext] initializeMap called');

        if (!projectData) {
            console.warn('[MapContext] Cannot initialize map: projectData is null');
            return;
        }

        try {
            // Remove existing map if there is one
            if (mapRef.current) {
                console.log('[MapContext] Removing existing map');
                mapRef.current.remove();
            }

            console.log('[MapContext] Creating new map');

            // Get center coordinates
            const center = [
                projectData.project?.default_center_lat || 40.7128,
                projectData.project?.default_center_lng || -74.0060
            ]; // Default to New York City

            const zoom = projectData.project?.default_zoom_level || 10;

            console.log('[MapContext] Map center:', center, 'zoom:', zoom);

            // Create the map
            const leafletMap = L.map(container, {
                center: center as [number, number],
                zoom: zoom,
                zoomControl: true
            });

            // Add a default OSM tile layer initially
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(leafletMap);

            // Store the map reference
            mapRef.current = leafletMap;
            setMap(leafletMap);

            console.log('[MapContext] Map initialized successfully');

            // Initialize basemap layers if available
            if (Array.isArray(projectData.basemaps) && projectData.basemaps.length > 0) {
                initializeBasemaps(leafletMap);
            }

        } catch (err: any) {
            console.error('[MapContext] Error initializing map:', err);
            setError(`Failed to initialize map: ${err.message || 'Unknown error'}`);
        }
    }, [projectData]);

    // Initialize basemap layers
    const initializeBasemaps = useCallback((leafletMap: L.Map) => {
        if (!projectData || !Array.isArray(projectData.basemaps)) return;

        console.log('[MapContext] Initializing basemaps');

        // Create basemap layers
        const basemapsObj: { [id: number]: L.TileLayer } = {};

        projectData.basemaps.forEach((basemap: any) => {
            if (basemap.url_template) {
                console.log('[MapContext] Creating basemap:', basemap.name);

                const tileLayer = L.tileLayer(basemap.url_template, {
                    attribution: basemap.attribution || '',
                    maxZoom: basemap.max_zoom || 19,
                    minZoom: basemap.min_zoom || 0
                });

                basemapsObj[basemap.id] = tileLayer;

                // Add default basemap to map
                if (basemap.id === currentBasemap) {
                    // Remove OSM layer first
                    leafletMap.eachLayer((layer) => {
                        if (layer instanceof L.TileLayer) {
                            leafletMap.removeLayer(layer);
                        }
                    });

                    tileLayer.addTo(leafletMap);
                }
            }
        });

        basemapLayersRef.current = basemapsObj;

    }, [projectData, currentBasemap]);

    // Toggle layer visibility
    const toggleLayer = useCallback((layerId: number, visible: boolean) => {
        console.log('[MapContext] toggleLayer:', layerId, visible);

        setVisibleLayers(prev => {
            const newSet = new Set(prev);
            if (visible) {
                newSet.add(layerId);
            } else {
                newSet.delete(layerId);
            }
            return newSet;
        });

        // TODO: Actually add/remove the layer from the map
        // This would be implemented with actual Leaflet operations

    }, []);

    // Change basemap
    const changeBasemap = useCallback((basemapId: number) => {
        console.log('[MapContext] changeBasemap:', basemapId);

        if (!mapRef.current) return;

        const map = mapRef.current;
        const basemaps = basemapLayersRef.current;

        // Remove current basemap layers
        map.eachLayer((layer) => {
            if (layer instanceof L.TileLayer) {
                map.removeLayer(layer);
            }
        });

        // Add new basemap if it exists
        if (basemaps[basemapId]) {
            basemaps[basemapId].addTo(map);
        } else {
            // Add default OSM if selected basemap doesn't exist
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
        }

        setCurrentBasemap(basemapId);

    }, []);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (mapRef.current) {
                console.log('[MapContext] Cleaning up map on unmount');
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    return (
        <MapContext.Provider value={{
            projectData,
            map,
            loading,
            error,
            loadProject,
            initializeMap,
            toggleLayer,
            changeBasemap,
            currentBasemap,
            visibleLayers
        }}>
            {children}
        </MapContext.Provider>
    );
};