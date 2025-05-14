// src/context/MapContext.tsx - Modified version with proper layer data loading

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import { mapService, projectService } from '../services';
import { ProjectConstructor, Layer, LayerGroup } from '../types';

// Define the context type
interface MapContextType {
    map: L.Map | null;
    projectData: ProjectConstructor | null;
    loading: boolean;
    error: string | null;
    loadProject: (id: number) => Promise<void>;
    initializeMap: (container: HTMLElement) => Promise<void>;
    layerVisibility: Record<number, boolean>;
    toggleLayerVisibility: (layerId: number) => void;
    setActiveBasemap: (basemapId: number) => void;
    activeBasemap: number | null;
}

// Create context with default values
const MapContext = createContext<MapContextType>({
    map: null,
    projectData: null,
    loading: false,
    error: null,
    loadProject: async () => {},
    initializeMap: async () => {},
    layerVisibility: {},
    toggleLayerVisibility: () => {},
    setActiveBasemap: () => {},
    activeBasemap: null,
});

// Define the provider component
export const MapProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [map, setMap] = useState<L.Map | null>(null);
    const [projectData, setProjectData] = useState<ProjectConstructor | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [layerVisibility, setLayerVisibility] = useState<Record<number, boolean>>({});
    const [activeBasemap, setActiveBasemap] = useState<number | null>(null);
    const [layerInstances, setLayerInstances] = useState<Record<number, L.Layer>>({});

    // Load project data
    const loadProject = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);

        try {
            console.log(`[MapContext] Loading project ${id}`);
            const data = await projectService.getProjectConstructor(id);

            console.log(`[MapContext] Project loaded successfully`);
            setProjectData(data);

            // Initialize layer visibility state
            const initialVisibility: Record<number, boolean> = {};
            data.layer_groups.forEach(group => {
                group.layers.forEach(layer => {
                    initialVisibility[layer.id] = layer.is_visible_by_default;
                });
            });

            setLayerVisibility(initialVisibility);

            // Set initial active basemap
            const defaultBasemap = data.basemaps.find(b => b.is_default);
            if (defaultBasemap) {
                setActiveBasemap(defaultBasemap.id);
            } else if (data.basemaps.length > 0) {
                setActiveBasemap(data.basemaps[0].id);
            }
        } catch (err) {
            console.error('[MapContext] Error loading project:', err);
            setError(`Failed to load project data: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initialize the map
    const initializeMap = useCallback(async (container: HTMLElement) => {
        if (!projectData) return;

        try {
            console.log('[MapContext] Initializing map');

            // Create map instance
            const mapInstance = L.map(container, {
                center: [
                    projectData.project.default_center_lat,
                    projectData.project.default_center_lng,
                ],
                zoom: projectData.project.default_zoom_level,
                ...projectData.project.map_options,
            });

            // Set active basemap
            if (activeBasemap) {
                const basemap = projectData.basemaps.find(b => b.id === activeBasemap);
                if (basemap) {
                    L.tileLayer(basemap.url_template, basemap.options).addTo(mapInstance);
                }
            }

            setMap(mapInstance);

            // Load initial visible layers
            await loadVisibleLayers(mapInstance);

            console.log('[MapContext] Map initialized successfully');
        } catch (err) {
            console.error('[MapContext] Error initializing map:', err);
            setError(`Failed to initialize map: ${err.message}`);
        }
    }, [projectData, activeBasemap]);

    // Load visible layers
    const loadVisibleLayers = async (mapInstance: L.Map) => {
        if (!projectData) return;

        setLoading(true);

        try {
            // Keep track of all layers to be loaded
            const layersToLoad: Layer[] = [];

            // Identify layers that should be visible initially
            projectData.layer_groups.forEach(group => {
                group.layers.forEach(layer => {
                    if (layerVisibility[layer.id]) {
                        layersToLoad.push(layer);
                    }
                });
            });

            // Load each visible layer
            for (const layer of layersToLoad) {
                await loadLayerData(layer, mapInstance);
            }
        } catch (err) {
            console.error('[MapContext] Error loading visible layers:', err);
            setError(`Failed to load layer data: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Load layer data using the appropriate service
    const loadLayerData = async (layer: Layer, mapInstance: L.Map) => {
        try {
            console.log(`[MapContext] Loading data for layer ${layer.id}: ${layer.name}`);

            // Get current map bounds and zoom level
            const bounds = mapInstance.getBounds();
            const zoom = mapInstance.getZoom();

            // Format bounds for API request
            const boundsParam = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;

            // Use the mapService to fetch layer data (this ensures proper API path)
            const layerData = await mapService.getLayerData(layer.id, {
                bounds: boundsParam,
                zoom: zoom,
                chunk_id: 1
            });

            console.log(`[MapContext] Layer data loaded successfully for ${layer.name}`);

            // Create and add the layer to the map
            let mapLayer: L.Layer;

            if (layer.layer_type_name === 'Point Layer' && layer.enable_clustering) {
                // Handle point clustering
                const clusterGroup = L.markerClusterGroup(layer.clustering_options);

                L.geoJSON(layerData, {
                    pointToLayer: (feature, latlng) => {
                        return L.circleMarker(latlng, {
                            radius: layer.style.radius || 6,
                            fillColor: layer.style.color || '#FF5500',
                            color: layer.style.color || '#FF5500',
                            weight: 1,
                            opacity: 1,
                            fillOpacity: 0.8
                        });
                    }
                }).addTo(clusterGroup);

                mapInstance.addLayer(clusterGroup);
                mapLayer = clusterGroup;
            } else {
                // Handle other layer types
                mapLayer = L.geoJSON(layerData, {
                    style: layer.style,
                    pointToLayer: (feature, latlng) => {
                        return L.circleMarker(latlng, {
                            radius: layer.style.radius || 6,
                            fillColor: layer.style.color || '#FF5500',
                            color: layer.style.color || '#FF5500',
                            weight: 1,
                            opacity: 1,
                            fillOpacity: 0.8
                        });
                    }
                }).addTo(mapInstance);
            }

            // Store the layer instance for later reference
            setLayerInstances(prev => ({
                ...prev,
                [layer.id]: mapLayer
            }));

        } catch (err) {
            console.error(`[MapContext] Error loading layer ${layer.id}:`, err);
            // Don't set global error - just log the error for this specific layer
        }
    };

    // Toggle layer visibility
    const toggleLayerVisibility = useCallback((layerId: number) => {
        setLayerVisibility(prev => {
            const newVisibility = !prev[layerId];

            // Update the map if available
            if (map) {
                if (newVisibility) {
                    // Find the layer and load it
                    if (projectData) {
                        let targetLayer: Layer | null = null;

                        projectData.layer_groups.forEach(group => {
                            group.layers.forEach(layer => {
                                if (layer.id === layerId) {
                                    targetLayer = layer;
                                }
                            });
                        });

                        if (targetLayer) {
                            // If the layer instance doesn't exist, load the data
                            if (!layerInstances[layerId]) {
                                loadLayerData(targetLayer, map);
                            } else {
                                // If it exists but was removed, add it back
                                map.addLayer(layerInstances[layerId]);
                            }
                        }
                    }
                } else {
                    // Hide the layer if it exists
                    if (layerInstances[layerId]) {
                        map.removeLayer(layerInstances[layerId]);
                    }
                }
            }

            return {
                ...prev,
                [layerId]: newVisibility
            };
        });
    }, [map, projectData, layerInstances]);

    // Set active basemap
    const setActiveBasemapLayer = useCallback((basemapId: number) => {
        if (!map || !projectData) return;

        // Remove current basemap
        map.eachLayer(layer => {
            if (layer instanceof L.TileLayer) {
                map.removeLayer(layer);
            }
        });

        // Add new basemap
        const basemap = projectData.basemaps.find(b => b.id === basemapId);
        if (basemap) {
            L.tileLayer(basemap.url_template, basemap.options).addTo(map);
            setActiveBasemap(basemapId);
        }
    }, [map, projectData]);

    // Context value
    const value = {
        map,
        projectData,
        loading,
        error,
        loadProject,
        initializeMap,
        layerVisibility,
        toggleLayerVisibility,
        setActiveBasemap: setActiveBasemapLayer,
        activeBasemap,
    };

    return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};

// Hook for using the context
export const useMap = () => useContext(MapContext);