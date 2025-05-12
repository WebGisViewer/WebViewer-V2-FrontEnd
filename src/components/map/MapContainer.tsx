import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { Project, LayerGroup, Basemap, Layer } from '../../types';
import MapLoadingOverlay from './MapLoadingOverlay';
import LayerControl from './controls/LayerControl';
import BasemapControl from './controls/BasemapControl';
import MapToolbar from './controls/MapToolbar';
import { mapService } from '../../services/mapService';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapContainerProps {
    project: Project;
    layerGroups: LayerGroup[];
    basemaps: Basemap[];
    tools: any[];
}

const MapContainer: React.FC<MapContainerProps> = ({ project, layerGroups, basemaps, tools }) => {
    const mapRef = useRef<L.Map | null>(null);
    const layersRef = useRef<{ [id: number]: L.Layer }>({});
    const clusterGroupsRef = useRef<{ [id: number]: L.MarkerClusterGroup }>({});

    const [loading, setLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [currentBasemap, setCurrentBasemap] = useState<number | null>(null);
    const [mapReady, setMapReady] = useState<boolean>(false);
    const [basemapLayers, setBasemapLayers] = useState<{ [id: number]: L.TileLayer }>({});

    // Initialize map
    useEffect(() => {
        if (!mapRef.current) {
            const center = project.default_center
                ? [project.default_center.lat, project.default_center.lng]
                : [39.8283, -98.5795]; // Fallback to USA center

            const map = L.map('map', {
                center: center as L.LatLngExpression,
                zoom: project.default_zoom || 4,
                minZoom: project.min_zoom || 1,
                maxZoom: project.max_zoom || 18,
                zoomControl: project.map_controls?.showZoomControl !== false,
            });

            // Add scale control if enabled
            if (project.map_controls?.showScaleControl) {
                L.control.scale().addTo(map);
            }

            mapRef.current = map;

            // Initialize basemap layers
            const basemapLayersObj: { [id: number]: L.TileLayer } = {};
            let defaultBasemapId: number | null = null;

            basemaps.forEach(basemap => {
                if (basemap.url_template) {
                    const tileLayer = L.tileLayer(basemap.url_template, {
                        attribution: basemap.attribution || '',
                        maxZoom: basemap.options?.maxZoom || 19,
                        ...basemap.options
                    });

                    basemapLayersObj[basemap.id] = tileLayer;

                    if (basemap.is_default) {
                        tileLayer.addTo(map);
                        defaultBasemapId = basemap.id;
                    }
                } else if (basemap.is_default) {
                    // Handle empty URL template (like white background)
                    const emptyLayer = L.tileLayer('', {
                        attribution: basemap.attribution || ''
                    });
                    basemapLayersObj[basemap.id] = emptyLayer;
                    emptyLayer.addTo(map);
                    defaultBasemapId = basemap.id;

                    // Apply white background to map
                    document.querySelector('#map')?.classList.add('white-background');
                }
            });

            setBasemapLayers(basemapLayersObj);
            setCurrentBasemap(defaultBasemapId);
            setMapReady(true);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                document.querySelector('#map')?.classList.remove('white-background');
            }
        };
    }, [project, basemaps]);

    // Load visible layers on initial load
    useEffect(() => {
        if (mapReady && mapRef.current) {
            const visibleLayers = layerGroups
                .filter(group => group.is_visible !== false)
                .flatMap(group =>
                    group.layers.filter(layer => layer.is_visible)
                );

            if (visibleLayers.length > 0) {
                loadLayers(visibleLayers);
            }
        }
    }, [mapReady, layerGroups]);

    // Load layer data from backend
    const loadLayers = async (layers: Layer[]) => {
        if (!mapRef.current) return;

        setLoading(true);
        setLoadingMessage('Loading layer data...');

        try {
            for (const layer of layers) {
                if (layersRef.current[layer.id]) {
                    // Layer already loaded
                    continue;
                }

                setLoadingMessage(`Loading ${layer.name}...`);

                const bounds = mapRef.current.getBounds();
                const zoom = mapRef.current.getZoom();
                const boundingBox = [
                    bounds.getWest(),
                    bounds.getSouth(),
                    bounds.getEast(),
                    bounds.getNorth()
                ].join(',');

                // Check if layer has clustering enabled
                const clusterFunction = layer.functions?.find(fn => fn.type === 'clustering');

                if (clusterFunction) {
                    await loadClusteredLayer(layer, clusterFunction, boundingBox, zoom);
                } else {
                    await loadRegularLayer(layer, boundingBox, zoom);
                }
            }
        } catch (error) {
            console.error('Error loading layers:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadClusteredLayer = async (layer: Layer, clusterFunction: any, bounds: string, zoom: number) => {
        if (!mapRef.current) return;

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
                        // In production, you should validate this code or use a safer approach
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
            mapRef.current.addLayer(clusterGroup);
            layersRef.current[layer.id] = clusterGroup;

        } catch (error) {
            console.error(`Error loading clustered layer ${layer.name}:`, error);
        }
    };

    const loadRegularLayer = async (layer: Layer, bounds: string, zoom: number) => {
        if (!mapRef.current) return;

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

            mapRef.current.addLayer(geoJsonLayer);
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

    // Handle layer visibility toggle
    const handleLayerToggle = (layerId: number, visible: boolean) => {
        if (!mapRef.current) return;

        const layer = layerGroups
            .flatMap(group => group.layers)
            .find(l => l.id === layerId);

        if (!layer) return;

        if (visible) {
            if (!layersRef.current[layerId]) {
                // Layer needs to be loaded
                loadLayers([layer]);
            } else {
                // Layer already loaded, just add it to map
                const layerInstance = layersRef.current[layerId];
                mapRef.current.addLayer(layerInstance);
            }
        } else {
            // Remove layer from map
            if (layersRef.current[layerId]) {
                const layerInstance = layersRef.current[layerId];
                mapRef.current.removeLayer(layerInstance);
            }
        }
    };

    // Handle basemap change
    const handleBasemapChange = (basemapId: number) => {
        if (!mapRef.current) return;

        // Remove current basemap
        if (currentBasemap !== null && basemapLayers[currentBasemap]) {
            mapRef.current.removeLayer(basemapLayers[currentBasemap]);
            document.querySelector('#map')?.classList.remove('white-background');
        }

        // Add new basemap
        const newBasemap = basemaps.find(b => b.id === basemapId);
        if (newBasemap) {
            if (newBasemap.url_template && basemapLayers[basemapId]) {
                mapRef.current.addLayer(basemapLayers[basemapId]);
            } else {
                // Handle empty URL template (white background)
                document.querySelector('#map')?.classList.add('white-background');
            }

            setCurrentBasemap(basemapId);
        }
    };

    return (
        <Box position="relative" width="100%" height="100%">
            {/* Map Container */}
            <Box
                id="map"
                width="100%"
                height="100%"
                sx={{
                    '&.white-background': {
                        background: '#fff'
                    },
                    '.feature-popup': {
                        maxHeight: '300px',
                        overflowY: 'auto',
                        padding: '5px',
                        '& table': {
                            borderCollapse: 'collapse',
                            width: '100%'
                        },
                        '& td': {
                            padding: '3px',
                            verticalAlign: 'top'
                        }
                    },
                    '.marker-cluster-small': {
                        backgroundColor: 'rgba(181, 226, 140, 0.6)'
                    },
                    '.marker-cluster-medium': {
                        backgroundColor: 'rgba(241, 211, 87, 0.6)'
                    },
                    '.marker-cluster-large': {
                        backgroundColor: 'rgba(253, 156, 115, 0.6)'
                    }
                }}
            />

            {/* Layer Control */}
            {project.map_controls?.showLayerControl !== false && (
                <Box position="absolute" top={10} right={10} zIndex={1000} bgcolor="white" boxShadow={2} borderRadius={1}>
                    <LayerControl
                        layerGroups={layerGroups}
                        onLayerToggle={handleLayerToggle}
                    />
                </Box>
            )}

            {/* Basemap Control */}
            <Box position="absolute" bottom={30} right={10} zIndex={1000}>
                <BasemapControl
                    basemaps={basemaps}
                    selectedBasemapId={currentBasemap}
                    onBasemapChange={handleBasemapChange}
                />
            </Box>

            {/* Loading Overlay */}
            {loading && (
                <MapLoadingOverlay message={loadingMessage} />
            )}
        </Box>
    );
};

export default MapContainer;