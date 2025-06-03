// src/pages/viewer/StandaloneViewerPage.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { projectService, mapService } from '../../services';
import StandaloneLayerControl from '../../components/viewer/StandaloneLayerControl';
import StandaloneLoadingScreen from '../../components/viewer/StandaloneLoadingScreen';
import StandaloneHeader from '../../components/viewer/StandaloneHeader';
import '../../styles/standalone-viewer.css';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const StandaloneViewerPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const layersRef = useRef<{ [id: number]: L.Layer }>({});
    const basemapLayersRef = useRef<{ [id: number]: L.TileLayer }>({});

    const [projectData, setProjectData] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingProgress, setLoadingProgress] = useState<number>(5);
    const [error, setError] = useState<string | null>(null);
    const [visibleLayers, setVisibleLayers] = useState<Set<number>>(new Set());
    const [activeBasemap, setActiveBasemap] = useState<number | null>(null);

    // Load project data
    useEffect(() => {
        let mounted = true;

        const loadProject = async () => {
            try {
                setLoading(true);
                setLoadingProgress(10);

                if (!id) {
                    throw new Error('No project ID provided');
                }

                // Simulate loading progress
                const progressInterval = setInterval(() => {
                    setLoadingProgress(prev => {
                        if (prev >= 90) return prev;
                        return prev + Math.random() * 15;
                    });
                }, 300);

                // For development, use getProjectConstructor with ID
                const data = await projectService.getProjectConstructor(Number(id));

                clearInterval(progressInterval);
                setLoadingProgress(100);

                if (!mounted) return;

                setProjectData(data);

                // Initialize visible layers
                const initialVisibleLayers = new Set<number>();
                if (data.layer_groups) {
                    data.layer_groups.forEach((group: any) => {
                        if (group.layers) {
                            group.layers.forEach((layer: any) => {
                                // Check both is_visible and is_visible_by_default
                                if (layer.is_visible || layer.is_visible_by_default) {
                                    initialVisibleLayers.add(layer.id);
                                }
                            });
                        }
                    });
                }
                setVisibleLayers(initialVisibleLayers);

                // Set default basemap
                const defaultBasemap = data.basemaps?.find((b: any) => b.is_default);
                if (defaultBasemap) {
                    setActiveBasemap(defaultBasemap.id);
                } else if (data.basemaps?.length > 0) {
                    setActiveBasemap(data.basemaps[0].id);
                }

                // Small delay to show 100% progress
                setTimeout(() => {
                    if (mounted) setLoading(false);
                }, 500);

            } catch (err: any) {
                console.error('Error loading project:', err);
                if (mounted) {
                    setError(err.message || 'Failed to load project');
                    setLoading(false);
                }
            }
        };

        loadProject();

        return () => {
            mounted = false;
        };
    }, [id]);

    // Initialize map
    useEffect(() => {
        if (!projectData || !mapContainerRef.current || loading) return;

        // Clean up previous map
        if (mapRef.current) {
            mapRef.current.remove();
        }

        try {
            const project = projectData.project;

            // Handle both possible structures for default center
            let center: [number, number];
            if (project.default_center && typeof project.default_center === 'object') {
                // New structure: default_center: { lat: number, lng: number }
                center = [
                    project.default_center.lat || 40.7128,
                    project.default_center.lng || -74.0060
                ];
            } else {
                // Old structure: default_center_lat, default_center_lng
                center = [
                    project.default_center_lat || 40.7128,
                    project.default_center_lng || -74.0060
                ];
            }

            const zoom = project.default_zoom_level || project.default_zoom || 10;

            // Create map
            const map = L.map(mapContainerRef.current, {
                center: center as [number, number],
                zoom: zoom,
                zoomControl: true
            });

            // Create custom panes for better layer management
            map.createPane('basemapPane');
            map.getPane('basemapPane')!.style.zIndex = '200';

            map.createPane('overlayPane');
            map.getPane('overlayPane')!.style.zIndex = '400';

            console.log('Map initialized with center:', center, 'and zoom:', zoom);

            // Add basemap
            if (activeBasemap && projectData.basemaps) {
                const basemap = projectData.basemaps.find((b: any) => b.id === activeBasemap);
                if (basemap) {
                    const tileLayer = L.tileLayer(basemap.url_template, {
                        ...basemap.options,
                        attribution: basemap.attribution,
                        pane: 'basemapPane'
                    }).addTo(map);

                    basemapLayersRef.current[basemap.id] = tileLayer;
                }
            } else if (!projectData.basemaps || projectData.basemaps.length === 0) {
                // Add default OSM basemap if no basemaps are configured
                const defaultTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    maxZoom: 19,
                    pane: 'basemapPane'
                }).addTo(map);
            }

            mapRef.current = map;

        } catch (err) {
            console.error('Error initializing map:', err);
            setError('Failed to initialize map');
        }
    }, [projectData, loading, activeBasemap]);

    // Load layers when visibility changes
    useEffect(() => {
        if (!mapRef.current || !projectData || loading) return;

        const loadVisibleLayers = async () => {
            // Collect all visible layers and sort by z-index
            const layersToLoad: any[] = [];

            for (const layerId of Array.from(visibleLayers)) {
                if (layersRef.current[layerId]) continue;

                let layerInfo: any = null;
                for (const group of projectData.layer_groups) {
                    for (const layer of group.layers) {
                        if (layer.id === layerId) {
                            layerInfo = layer;
                            break;
                        }
                    }
                    if (layerInfo) break;
                }

                if (layerInfo) {
                    layersToLoad.push(layerInfo);
                }
            }

            // Sort by z-index (lower z-index loads first)
            layersToLoad.sort((a, b) => (a.z_index || 0) - (b.z_index || 0));

            // Load each layer in order
            for (const layerInfo of layersToLoad) {
                try {

                    // Get map bounds and zoom
                    const bounds = mapRef.current!.getBounds();
                    const zoom = mapRef.current!.getZoom();
                    const boundsParam = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;

                    // Fetch layer data
                    const data = await mapService.getLayerData(layerInfo.id, {
                        chunk_id: 1,
                        bounds: boundsParam,
                        zoom: zoom
                    });

                    if (!data.features || data.features.length === 0) continue;

                    // Create layer based on type
                    let mapLayer: L.Layer;

                    if (layerInfo.layer_type_name === 'Point Layer' && layerInfo.enable_clustering) {
                        // Clustered points
                        const clusterGroup = L.markerClusterGroup({
                            ...layerInfo.clustering_options,
                            showCoverageOnHover: false,
                            zoomToBoundsOnClick: true,
                            spiderfyOnMaxZoom: true,
                            removeOutsideVisibleBounds: true,
                            pane: 'overlayPane'
                        });

                        L.geoJSON(data, {
                            pointToLayer: (feature, latlng) => {
                                // Check for custom marker
                                if (layerInfo.marker_type === 'image' && layerInfo.marker_image_url) {
                                    const icon = L.icon({
                                        iconUrl: layerInfo.marker_image_url,
                                        iconSize: [32, 32],
                                        iconAnchor: [16, 32],
                                        popupAnchor: [0, -32]
                                    });
                                    return L.marker(latlng, { icon, pane: 'overlayPane' });
                                } else {
                                    return L.circleMarker(latlng, {
                                        radius: layerInfo.style?.radius || 6,
                                        fillColor: layerInfo.style?.fillColor || layerInfo.style?.color || '#3388ff',
                                        color: layerInfo.style?.color || '#3388ff',
                                        weight: layerInfo.style?.weight || 1,
                                        opacity: layerInfo.style?.opacity || 1,
                                        fillOpacity: layerInfo.style?.fillOpacity || 0.8,
                                        pane: 'overlayPane'
                                    });
                                }
                            },
                            onEachFeature: (feature, leafletLayer) => {
                                if (feature.properties) {
                                    let popupContent = '<div style="max-width: 300px;">';
                                    for (const [key, value] of Object.entries(feature.properties)) {
                                        popupContent += `<strong>${key}:</strong> ${value}<br>`;
                                    }
                                    popupContent += '</div>';
                                    leafletLayer.bindPopup(popupContent);
                                }
                            }
                        }).addTo(clusterGroup);

                        mapLayer = clusterGroup;
                    } else {
                        // Non-clustered layer
                        mapLayer = L.geoJSON(data, {
                            style: (feature) => ({
                                color: layerInfo.style?.color || '#3388ff',
                                weight: layerInfo.style?.weight || 2,
                                opacity: layerInfo.style?.opacity || 1,
                                fillColor: layerInfo.style?.fillColor || layerInfo.style?.color || '#3388ff',
                                fillOpacity: layerInfo.style?.fillOpacity || 0.2
                            }),
                            pane: 'overlayPane',
                            pointToLayer: (feature, latlng) => {
                                if (layerInfo.marker_type === 'image' && layerInfo.marker_image_url) {
                                    const icon = L.icon({
                                        iconUrl: layerInfo.marker_image_url,
                                        iconSize: [32, 32],
                                        iconAnchor: [16, 32],
                                        popupAnchor: [0, -32]
                                    });
                                    return L.marker(latlng, { icon, pane: 'overlayPane' });
                                } else {
                                    return L.circleMarker(latlng, {
                                        radius: layerInfo.style?.radius || 6,
                                        fillColor: layerInfo.style?.fillColor || '#3388ff',
                                        color: layerInfo.style?.color || '#000',
                                        weight: layerInfo.style?.weight || 1,
                                        opacity: layerInfo.style?.opacity || 1,
                                        fillOpacity: layerInfo.style?.fillOpacity || 0.8,
                                        pane: 'overlayPane'
                                    });
                                }
                            },
                            onEachFeature: (feature, leafletLayer) => {
                                if (feature.properties) {
                                    let popupContent = '<div style="max-width: 300px;">';
                                    for (const [key, value] of Object.entries(feature.properties)) {
                                        popupContent += `<strong>${key}:</strong> ${value}<br>`;
                                    }
                                    popupContent += '</div>';
                                    leafletLayer.bindPopup(popupContent);
                                }
                            }
                        });
                    }

                    mapLayer.addTo(mapRef.current!);

                    // Set the z-index if specified
                    if (layerInfo.z_index && mapLayer instanceof L.FeatureGroup || mapLayer instanceof L.LayerGroup) {
                        (mapLayer as any).setZIndex?.(layerInfo.z_index);
                    }

                    layersRef.current[layerInfo.id] = mapLayer;

                } catch (err) {
                    console.error(`Error loading layer ${layerInfo.id}:`, err);
                }
            }

            // Remove layers that are no longer visible
            for (const loadedLayerId of Object.keys(layersRef.current).map(Number)) {
                if (!visibleLayers.has(loadedLayerId) && mapRef.current) {
                    mapRef.current.removeLayer(layersRef.current[loadedLayerId]);
                    delete layersRef.current[loadedLayerId];
                }
            }
        };

        loadVisibleLayers();
    }, [visibleLayers, projectData, loading]);

    const handleLayerToggle = (layerId: number) => {
        setVisibleLayers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(layerId)) {
                newSet.delete(layerId);
            } else {
                newSet.add(layerId);
            }
            return newSet;
        });
    };

    const handleBasemapChange = (basemapId: number) => {
        if (!mapRef.current || !projectData) return;

        // Remove current basemap
        Object.values(basemapLayersRef.current).forEach(layer => {
            mapRef.current!.removeLayer(layer);
        });
        basemapLayersRef.current = {};

        // Add new basemap
        const basemap = projectData.basemaps?.find((b: any) => b.id === basemapId);
        if (basemap) {
            const tileLayer = L.tileLayer(basemap.url_template, {
                ...basemap.options,
                attribution: basemap.attribution,
                pane: 'basemapPane'
            }).addTo(mapRef.current);

            basemapLayersRef.current[basemap.id] = tileLayer;
            setActiveBasemap(basemapId);
        }
    };

    // Show loading screen
    if (loading && !error) {
        return <StandaloneLoadingScreen progress={loadingProgress} projectName={projectData?.project?.name} />;
    }

    // Show error state
    if (error) {
        return (
            <>
                <StandaloneHeader />
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="calc(100vh - 48px)"
                    marginTop="48px"
                >
                    <Paper elevation={3} sx={{ p: 3, maxWidth: 500 }}>
                        <Typography variant="h5" color="error" gutterBottom>
                            Error
                        </Typography>
                        <Typography>{error}</Typography>
                    </Paper>
                </Box>
            </>
        );
    }

    return (
        <>
            {/* Header - Always at the top */}
            <StandaloneHeader projectName={projectData?.project?.name} />

            {/* Map Container - Below the header */}
            <Box
                position="relative"
                height="calc(100vh - 48px)"
                marginTop="48px"
            >
                {/* Map */}
                <Box
                    ref={mapContainerRef}
                    width="100%"
                    height="100%"
                    sx={{ position: 'absolute', top: 0, left: 0 }}
                />

                {/* Layer Control */}
                {projectData && (
                    <StandaloneLayerControl
                        projectData={projectData}
                        visibleLayers={visibleLayers}
                        activeBasemap={activeBasemap}
                        onLayerToggle={handleLayerToggle}
                        onBasemapChange={handleBasemapChange}
                    />
                )}
            </Box>
        </>
    );
};

export default StandaloneViewerPage;