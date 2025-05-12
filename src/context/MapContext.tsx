// src/context/MapContext.tsx
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import L from 'leaflet';
import { projectService } from '../services';
import { mapService } from '../services/mapService';
import { Project, LayerGroup, Basemap, Layer } from '../types/map.types';

// Define the context type
interface MapContextType {
    projectData: {
        project: Project;
        layerGroups: LayerGroup[];
        basemaps: Basemap[];
        tools: any[];
    } | null;
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
    const [projectData, setProjectData] = useState<{
        project: Project;
        layerGroups: LayerGroup[];
        basemaps: Basemap[];
        tools: any[];
    } | null>(null);
    const [map, setMap] = useState<L.Map | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [currentBasemap, setCurrentBasemap] = useState<number | null>(null);
    const [visibleLayers, setVisibleLayers] = useState<Set<number>>(new Set());

    // Refs
    const mapRef = useRef<L.Map | null>(null);
    const layersRef = useRef<{ [id: number]: L.Layer }>({});
    const clusterGroupsRef = useRef<{ [id: number]: L.MarkerClusterGroup }>({});
    const basemapLayersRef = useRef<{ [id: number]: L.TileLayer }>({});

    // Load project data
    const loadProject = useCallback(async (id: number) => {
        try {
            setLoading(true);
            setError(null);

            // Fetch project data from the constructor endpoint
            const data = await projectService.getProjectConstructor(Number(id));
            setProjectData(data);

            // Initialize visible layers
            const initialVisibleLayers = new Set<number>();
            data.layerGroups.forEach(group => {
                group.layers.forEach(layer => {
                    if (layer.is_visible) {
                        initialVisibleLayers.add(layer.id);
                    }
                });
            });
            setVisibleLayers(initialVisibleLayers);

            // Set default basemap
            const defaultBasemap = data.basemaps.find(b => b.is_default);
            if (defaultBasemap) {
                setCurrentBasemap(defaultBasemap.id);
            }
        } catch (err) {
            console.error('Error fetching project data:', err);
            setError('Failed to load project data. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Initialize Leaflet map
    const initializeMap = useCallback((container: HTMLElement) => {
        if (!projectData || mapRef.current) return;

        const { project } = projectData;

        // Create Leaflet map
        const center = project.default_center
            ? [project.default_center.lat, project.default_center.lng]
            : [39.8283, -98.5795]; // Fallback to USA center

        const mapInstance = L.map(container, {
            center: center as L.LatLngExpression,
            zoom: project.default_zoom || 4,
            minZoom: project.min_zoom || 1,
            maxZoom: project.max_zoom || 18,
            zoomControl: project.map_controls?.showZoomControl !== false,
        });

        // Add scale control if enabled
        if (project.map_controls?.showScaleControl) {
            L.control.scale().addTo(mapInstance);
        }

        // Initialize basemap layers
        const basemapLayersObj: { [id: number]: L.TileLayer } = {};

        projectData.basemaps.forEach(basemap => {
            if (basemap.url_template) {
                const tileLayer = L.tileLayer(basemap.url_template, {
                    attribution: basemap.attribution || '',
                    maxZoom: basemap.options?.maxZoom || 19,
                    ...basemap.options
                });

                basemapLayersObj[basemap.id] = tileLayer;

                if (basemap.is_default) {
                    tileLayer.addTo(mapInstance);
                }
            } else if (basemap.is_default) {
                // Handle empty URL template (like white background)
                const emptyLayer = L.tileLayer('', {
                    attribution: basemap.attribution || ''
                });
                basemapLayersObj[basemap.id] = emptyLayer;
                emptyLayer.addTo(mapInstance);

                // Apply white background to map
                container.classList.add('white-background');
            }
        });

        basemapLayersRef.current = basemapLayersObj;
        mapRef.current = mapInstance;
        setMap(mapInstance);

        // Load visible layers
        visibleLayers.forEach(layerId => {
            loadLayerData(layerId, mapInstance);
        });

    }, [projectData, visibleLayers]);

    // Load layer data
    const loadLayerData = async (layerId: number, mapInstance: L.Map) => {
        if (!projectData || layersRef.current[layerId]) return;

        try {
            // Find layer in project data
            const layer = projectData.layerGroups
                .flatMap(group => group.layers)
                .find(l => l.id === layerId);

            if (!layer) return;

            // Get layer bounds and zoom
            const bounds = mapInstance.getBounds();
            const zoom = mapInstance.getZoom();
            const boundingBox = [
                bounds.getWest(),
                bounds.getSouth(),
                bounds.getEast(),
                bounds.getNorth()
            ].join(',');

            // Check if layer has clustering enabled
            const clusterFunction = layer.functions?.find(fn => fn.type === 'clustering');

            if (clusterFunction) {
                await loadClusteredLayer(layer, clusterFunction, boundingBox, zoom, mapInstance);
            } else {
                await loadRegularLayer(layer, boundingBox, zoom, mapInstance);
            }
        } catch (error) {
            console.error(`Error loading layer ${layerId}:`, error);
        }
    };

    // Load clustered layer
    const loadClusteredLayer = async (layer: Layer, clusterFunction: any, bounds: string, zoom: number, mapInstance: L.Map) => {
        try {
            // Create cluster group with custom options
            let clusterGroup: L.MarkerClusterGroup;

            if (clusterGroupsRef.current[layer.id]) {
                clusterGroup = clusterGroupsRef.current[layer.id];
            } else {
                const clusterOptions: L.MarkerClusterGroupOptions = {
                    maxClusterRadius: clusterFunction.arguments?.radius || 80,
                    disableClusteringAtZoom: clusterFunction.arguments?.maxZoom || undefined
                };

                // If there's a custom icon create function, evaluate it
                if (clusterFunction.arguments?.iconCreateFunction) {
                    try {
                        // This is potentially unsafe as it evaluates code from the server
                        const iconCreateFn = new Function('return ' + clusterFunction.arguments.iconCreateFunction)();
                        clusterOptions.iconCreateFunction = iconCreateFn;
                    } catch (e) {
                        console.error('Error evaluating custom cluster icon function:', e);
                    }
                }

                clusterGroup = L.markerClusterGroup(clusterOptions);
                clusterGroupsRef.current[layer.id] = clusterGroup;
            }

            // Fetch layer data
            const { features } = await mapService.getLayerData(layer.id, 1, bounds, zoom);

            // Process features based on layer type
            const geoJsonLayer = L.geoJSON(features, {
                style: (feature) => {
                    // Apply style from layer
                    return {
                        color: layer.style?.color || '#3388ff',
                        weight: layer.style?.weight || 3,
                        opacity: layer.style?.opacity || 1,
                        fillColor: layer.style?.fillColor || layer.style?.color || '#3388ff',
                        fillOpacity: layer.style?.fillOpacity || 0.2,
                        radius: layer.style?.radius || 6
                    };
                },
                pointToLayer: (feature, latlng) => {
                    // Create circle markers for points
                    return L.circleMarker(latlng, {
                        radius: layer.style?.radius || 6,
                        fillColor: layer.style?.fillColor || '#3388ff',
                        color: layer.style?.color || '#000',
                        weight: layer.style?.weight || 1,
                        opacity: layer.style?.opacity || 1,
                        fillOpacity: layer.style?.fillOpacity || 0.8
                    });
                },
                onEachFeature: (feature, leafletLayer) => {
                    // Add popup if properties exist
                    if (feature.properties) {
                        const popupContent = createPopupContent(feature.properties);
                        leafletLayer.bindPopup(popupContent);
                    }
                }
            });

            // Add features to cluster group and add to map
            clusterGroup.addLayer(geoJsonLayer);
            mapInstance.addLayer(clusterGroup);
            layersRef.current[layer.id] = clusterGroup;

        } catch (error) {
            console.error(`Error loading clustered layer ${layer.name}:`, error);
        }
    };

    // Load regular layer
    const loadRegularLayer = async (layer: Layer, bounds: string, zoom: number, mapInstance: L.Map) => {
        try {
            // Fetch layer data
            const { features } = await mapService.getLayerData(layer.id, 1, bounds, zoom);

            // Process features based on layer type
            const geoJsonLayer = L.geoJSON(features, {
                style: (feature) => {
                    // Apply style from layer
                    return {
                        color: layer.style?.color || '#3388ff',
                        weight: layer.style?.weight || 3,
                        opacity: layer.style?.opacity || 1,
                        fillColor: layer.style?.fillColor || layer.style?.color || '#3388ff',
                        fillOpacity: layer.style?.fillOpacity || 0.2,
                        radius: layer.style?.radius || 6
                    };
                },
                pointToLayer: (feature, latlng) => {
                    // Create circle markers for points
                    return L.circleMarker(latlng, {
                        radius: layer.style?.radius || 6,
                        fillColor: layer.style?.fillColor || '#3388ff',
                        color: layer.style?.color || '#000',
                        weight: layer.style?.weight || 1,
                        opacity: layer.style?.opacity || 1,
                        fillOpacity: layer.style?.fillOpacity || 0.8
                    });
                },
                onEachFeature: (feature, leafletLayer) => {
                    // Add popup if properties exist
                    if (feature.properties) {
                        const popupContent = createPopupContent(feature.properties);
                        leafletLayer.bindPopup(popupContent);
                    }
                }
            });

            mapInstance.addLayer(geoJsonLayer);
            layersRef.current[layer.id] = geoJsonLayer;

        } catch (error) {
            console.error(`Error loading layer ${layer.name}:`, error);
        }
    };

    // Create basic popup content from feature properties
    const createPopupContent = (properties: any): string => {
        if (!properties) return 'No properties';

        let content = '<div class="feature-popup">';

        // Try to find a title property
        const titleProps = ['name', 'title', 'id', 'label'];
        let title = null;

        for (const prop of titleProps) {
            if (properties[prop]) {
                title = properties[prop];
                break;
            }
        }

        if (title) {
            content += `<h4>${title}</h4>`;
        }

        // Add all properties
        content += '<table>';
        Object.entries(properties).forEach(([key, value]) => {
            // Skip if it's the title we already displayed
            if (title && titleProps.includes(key) && properties[key] === title) {
                return;
            }

            // Format value if it's an object
            let displayValue = value;
            if (typeof value === 'object' && value !== null) {
                displayValue = JSON.stringify(value);
            }

            content += `<tr><td><strong>${key}:</strong></td><td>${displayValue}</td></tr>`;
        });
        content += '</table></div>';

        return content;
    };

    // Toggle layer visibility
    const toggleLayer = useCallback((layerId: number, visible: boolean) => {
        if (!mapRef.current) return;

        if (visible) {
            // Add to visible layers
            setVisibleLayers(prev => {
                const newSet = new Set(prev);
                newSet.add(layerId);
                return newSet;
            });

            // Load layer if not already loaded
            if (!layersRef.current[layerId]) {
                loadLayerData(layerId, mapRef.current);
            } else {
                // Layer already loaded, just add it to map
                mapRef.current.addLayer(layersRef.current[layerId]);
            }
        } else {
            // Remove from visible layers
            setVisibleLayers(prev => {
                const newSet = new Set(prev);
                newSet.delete(layerId);
                return newSet;
            });

            // Remove layer from map
            if (layersRef.current[layerId]) {
                mapRef.current.removeLayer(layersRef.current[layerId]);
            }
        }
    }, []);

    // Change basemap
    const changeBasemap = useCallback((basemapId: number) => {
        if (!mapRef.current) return;

        // Remove current basemap
        if (currentBasemap !== null && basemapLayersRef.current[currentBasemap]) {
            mapRef.current.removeLayer(basemapLayersRef.current[currentBasemap]);
            mapRef.current.getContainer().classList.remove('white-background');
        }

        // Add new basemap
        const newBasemap = projectData?.basemaps.find(b => b.id === basemapId);
        if (newBasemap) {
            if (newBasemap.url_template && basemapLayersRef.current[basemapId]) {
                mapRef.current.addLayer(basemapLayersRef.current[basemapId]);
            } else {
                // Handle empty URL template (white background)
                mapRef.current.getContainer().classList.add('white-background');
            }

            setCurrentBasemap(basemapId);
        }
    }, [currentBasemap, projectData]);

    // Clean up on unmount
    React.useEffect(() => {
        return () => {
            if (mapRef.current) {
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