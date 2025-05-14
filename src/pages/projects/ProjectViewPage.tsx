// src/pages/projects/ProjectViewPage.tsx - With Fixed API URL
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Paper, List, ListItem, Switch, Divider } from '@mui/material';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { projectService } from '../../services';
import { mapService } from '../../services'; // Adjust the import path as needed


const ProjectViewPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const layersRef = useRef<{ [id: number]: L.Layer }>({});

    // Basic state
    const [projectData, setProjectData] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [visibleLayers, setVisibleLayers] = useState<Set<number>>(new Set());

    // Load project data only once
    useEffect(() => {
        let mounted = true;

        const loadProject = async () => {
            try {
                setLoading(true);
                console.log('Loading project data for ID:', id);

                if (!id) {
                    throw new Error('No project ID provided');
                }

                const data = await projectService.getProjectConstructor(Number(id));
                console.log('Project data loaded:', data);

                if (!mounted) return;

                // Set project data
                setProjectData(data);

                // Initialize visible layers based on default visibility
                const initialVisibleLayers = new Set<number>();
                if (data.layer_groups) {
                    data.layer_groups.forEach((group: any) => {
                        if (group.layers) {
                            group.layers.forEach((layer: any) => {
                                if (layer.is_visible_by_default || layer.is_visible) {
                                    initialVisibleLayers.add(layer.id);
                                }
                            });
                        }
                    });
                }
                setVisibleLayers(initialVisibleLayers);

            } catch (err: any) {
                console.error('Error loading project:', err);
                if (mounted) {
                    setError(err.message || 'Failed to load project');
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadProject();

        return () => {
            mounted = false;
        };
    }, [id]);

    // Initialize map once project data is loaded
    useEffect(() => {
        if (!projectData || !mapContainerRef.current) return;

        // Clean up previous map if it exists
        if (mapRef.current) {
            mapRef.current.remove();
        }

        try {
            console.log('Initializing map');

            // Get center coordinates from project data
            const project = projectData.project;
            const center = [
                project.default_center_lat || 40.7128,
                project.default_center_lng || -74.0060
            ];
            const zoom = project.default_zoom_level || 10;

            // Create map
            const map = L.map(mapContainerRef.current, {
                center: center as [number, number],
                zoom: zoom,
                zoomControl: true
            });

            // Add default OSM basemap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
            }).addTo(map);

            // Store map reference
            mapRef.current = map;

            console.log('Map initialized successfully');
        } catch (err) {
            console.error('Error initializing map:', err);
            setError('Failed to initialize map');
        }
    }, [projectData]);

    useEffect(() => {
        if (!mapRef.current || !projectData) return;

        const loadVisibleLayers = async () => {
            console.log('Loading visible layers:', Array.from(visibleLayers));

            // For each visible layer that's not already loaded
            for (const layerId of Array.from(visibleLayers)) {
                if (layersRef.current[layerId]) {
                    console.log('Layer already loaded:', layerId);
                    continue;
                }

                try {
                    // Find layer info
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

                    if (!layerInfo) {
                        console.error('Layer not found:', layerId);
                        continue;
                    }

                    console.log('Loading data for layer:', layerInfo.name);

                    // FIXED: Use mapService instead of direct fetch
                    // Get current map bounds and zoom level for viewport filtering (optional)
                    const bounds = mapRef.current.getBounds();
                    const zoom = mapRef.current.getZoom();

                    // Format bounds for API request
                    const boundsParam = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;

                    console.log(`Fetching layer data for layer ${layerId} using mapService`);

                    // Use the service function instead of direct fetch
                    const data = await mapService.getLayerData(layerId, {
                        chunk_id: 1,
                        bounds: boundsParam,
                        zoom: zoom
                    });

                    console.log(`Received data for layer ${layerId}:`,
                        data.features ? `${data.features.length} features` : 'No features');

                    if (!data.features || data.features.length === 0) {
                        console.warn('No features in layer data');
                        continue;
                    }

                    // Create GeoJSON layer
                    const geoJsonLayer = L.geoJSON(data, {
                        style: (feature) => ({
                            color: layerInfo.style?.color || '#3388ff',
                            weight: layerInfo.style?.weight || 1,
                            opacity: layerInfo.style?.opacity || 1,
                            fillColor: layerInfo.style?.fillColor || layerInfo.style?.color || '#3388ff',
                            fillOpacity: layerInfo.style?.fillOpacity || 0.2
                        }),
                        pointToLayer: (feature, latlng) => (
                            L.circleMarker(latlng, {
                                radius: layerInfo.style?.radius || 6,
                                fillColor: layerInfo.style?.fillColor || '#3388ff',
                                color: layerInfo.style?.color || '#000',
                                weight: layerInfo.style?.weight || 1,
                                opacity: layerInfo.style?.opacity || 1,
                                fillOpacity: layerInfo.style?.fillOpacity || 0.8
                            })
                        ),
                        onEachFeature: (feature, leafletLayer) => {
                            // Create simple popup
                            if (feature.properties) {
                                let popupContent = '<div>';
                                for (const [key, value] of Object.entries(feature.properties)) {
                                    popupContent += `<strong>${key}:</strong> ${value}<br>`;
                                }
                                popupContent += '</div>';
                                leafletLayer.bindPopup(popupContent);
                            }
                        }
                    });

                    // Add to map and store reference
                    geoJsonLayer.addTo(mapRef.current);
                    layersRef.current[layerId] = geoJsonLayer;

                    console.log('Layer added to map:', layerId);
                } catch (err) {
                    console.error(`Error loading layer ${layerId}:`, err);
                }
            }

            // Remove layers that are no longer visible
            for (const loadedLayerId of Object.keys(layersRef.current).map(Number)) {
                if (!visibleLayers.has(loadedLayerId) && mapRef.current) {
                    console.log('Removing layer from map:', loadedLayerId);
                    mapRef.current.removeLayer(layersRef.current[loadedLayerId]);
                    delete layersRef.current[loadedLayerId];
                }
            }
        };

        loadVisibleLayers();
    }, [visibleLayers, projectData]);

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

    // Show loading state
    if (loading && !projectData) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="calc(100vh - 64px)">
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2 }}>
                    Loading project...
                </Typography>
            </Box>
        );
    }

    // Show error state
    if (error) {
        return (
            <Box p={3} textAlign="center">
                <Paper elevation={3} sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
                    <Typography variant="h5" color="error" gutterBottom>
                        Error
                    </Typography>
                    <Typography>{error}</Typography>
                </Paper>
            </Box>
        );
    }

    return (
        <Box display="flex" height="calc(100vh - 64px)">
            {/* Layer control panel */}
            <Box width="250px" bgcolor="#f5f5f5" padding={2} overflow="auto">
                <Typography variant="h6" gutterBottom>Layers</Typography>

                {projectData?.layer_groups?.map((group: any) => (
                    <Box key={group.id} mb={2}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            {group.name}
                        </Typography>

                        <List dense disablePadding>
                            {group.layers?.map((layer: any) => (
                                <ListItem key={layer.id} disablePadding sx={{ mb: 0.5 }}>
                                    <Box
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        width="100%"
                                        px={1}
                                        py={0.5}
                                        borderRadius={1}
                                        bgcolor={visibleLayers.has(layer.id) ? 'rgba(0, 0, 0, 0.05)' : 'transparent'}
                                    >
                                        <Typography variant="body2">
                                            {layer.name}
                                        </Typography>

                                        <Switch
                                            size="small"
                                            checked={visibleLayers.has(layer.id)}
                                            onChange={() => handleLayerToggle(layer.id)}
                                        />
                                    </Box>
                                </ListItem>
                            ))}
                        </List>

                        <Divider sx={{ mt: 1 }} />
                    </Box>
                ))}
            </Box>

            {/* Map container */}
            <Box flexGrow={1} position="relative">
                <Box
                    ref={mapContainerRef}
                    width="100%"
                    height="100%"
                    sx={{ border: '1px solid #ddd' }}
                />
            </Box>
        </Box>
    );
};

export default ProjectViewPage;