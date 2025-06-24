// src/pages/viewer/StandaloneViewerPage.tsx - With Zoom-Based Tower Visibility
import React, { useEffect, useState, useRef, useCallback } from 'react';
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
import {
    frontendBufferManager,
    isAntennaTowerLayer,
    getTowerCompanyFromLayerName,
    TowerWithBuffers,
    BufferVisibilityState
} from '../../components/viewer/FrontendAntennaBufferSystem';
import {
    zoomVisibilityManager,
    ZoomHint,
    createZoomHintMessage
} from '../../components/viewer/ZoomVisibilityManager';
import '../../styles/standalone-viewer.css';
import { createTowerPopupHTML, isAntennaLayer } from '../../components/viewer/EnhancedTowerPopupSystem';


// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Enhanced interfaces for JSON structure support
interface ClusteringOptions {
    disableClusteringAtZoom?: number;
    showCoverageOnHover?: boolean;
    zoomToBoundsOnClick?: boolean;
    spiderfyOnMaxZoom?: boolean;
    removeOutsideVisibleBounds?: boolean;
    maxClusterRadius?: number;
    [key: string]: any;
}

interface ClusteringConfig {
    enabled: boolean;
    options?: ClusteringOptions;
}

interface LayerFunction {
    id?: number;
    type: string;
    name?: string;
    arguments?: Record<string, any>;
    priority?: number;
}

interface StandaloneLayer {
    id: number;
    name: string;
    layer_type_name?: string;
    type?: string;
    is_visible?: boolean;
    is_visible_by_default?: boolean;
    z_index?: number;
    style?: any;
    marker_type?: string;
    marker_image_url?: string;

    // Clustering properties - multiple formats supported
    enable_clustering?: boolean;
    clustering_options?: ClusteringOptions;
    clustering?: ClusteringConfig;
    functions?: LayerFunction[];
}

// WiFi Tower Icon Generator
const createWiFiTowerSVG = (color: string, size: number = 32): string => {
    return `
        <svg width="${size}" height="${size}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <!-- Marker background -->
            <path d="M16 2C10.477 2 6 6.477 6 12c0 7.2 10 18 10 18s10-10.8 10-18c0-5.523-4.477-10-10-10z" 
                  fill="${color}" stroke="white" stroke-width="1"/>
            
            <!-- WiFi tower icon -->
            <g transform="translate(16,12)">
                <!-- Tower base -->
                <rect x="-1" y="2" width="2" height="6" fill="white"/>
                
                <!-- WiFi signal arcs -->
                <path d="M-6,-2 A8,8 0 0,1 6,-2" fill="none" stroke="white" stroke-width="1.5" opacity="0.9"/>
                <path d="M-4,-1 A5,5 0 0,1 4,-1" fill="none" stroke="white" stroke-width="1.5" opacity="0.9"/>
                <path d="M-2,0 A2.5,2.5 0 0,1 2,0" fill="none" stroke="white" stroke-width="1.5" opacity="0.9"/>
                
                <!-- Center dot -->
                <circle cx="0" cy="1" r="1" fill="white"/>
            </g>
        </svg>
    `;
};

// Tower company colors matching the upload pipeline
const towerCompanyColors = {
    'American Towers': '#dc3545', // red
    'SBA': '#6f42c1', // purple
    'Crown Castle': '#fd7e14', // orange
    'Other': '#0d6efd' // blue
};

// Helper functions
const hasClusteringEnabled = (layer: StandaloneLayer): boolean => {
    return !!(
        layer.enable_clustering ||
        (layer.clustering && layer.clustering.enabled) ||
        (layer.functions && layer.functions.some(func => func.type === 'clustering'))
    );
};

const getClusteringOptions = (layer: StandaloneLayer): ClusteringOptions => {
    if (layer.clustering_options) return layer.clustering_options;
    if (layer.clustering && layer.clustering.options) return layer.clustering.options;
    if (layer.functions) {
        const clusteringFunction = layer.functions.find(func => func.type === 'clustering');
        if (clusteringFunction && clusteringFunction.arguments) return clusteringFunction.arguments;
    }
    return {
        disableClusteringAtZoom: 11,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        spiderfyOnMaxZoom: true
    };
};

const isPointLayer = (layer: StandaloneLayer): boolean => {
    return !!(
        layer.layer_type_name === 'Point Layer' ||
        layer.layer_type_name === 'Point' ||
        layer.type === 'Default-Line' ||
        layer.type === 'Point'
    );
};

const createTowerIcon = (companyName: string): L.DivIcon => {
    const color = towerCompanyColors[companyName] || towerCompanyColors['Other'];
    const svgString = createWiFiTowerSVG(color);

    return L.divIcon({
        html: svgString,
        className: 'custom-tower-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
};

const StandaloneViewerPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const layersRef = useRef<{ [id: number]: L.Layer }>({});
    const basemapLayersRef = useRef<{ [id: number]: L.TileLayer }>({});
    const towerDataRef = useRef<{ [id: number]: any }>({});

    const [projectData, setProjectData] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingProgress, setLoadingProgress] = useState<number>(5);
    const [error, setError] = useState<string | null>(null);
    const [visibleLayers, setVisibleLayers] = useState<Set<number>>(new Set());
    const [activeBasemap, setActiveBasemap] = useState<number | null>(null);

    // Frontend buffer system state
    const [towerBufferRelationships, setTowerBufferRelationships] = useState<TowerWithBuffers[]>([]);
    const [bufferVisibility, setBufferVisibility] = useState<BufferVisibilityState>({});

    // Zoom visibility state
    const [zoomHints, setZoomHints] = useState<ZoomHint[]>([]);
    const [currentZoom, setCurrentZoom] = useState<number>(7);

    // Inject tower icon CSS
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .custom-tower-icon {
                background: none !important;
                border: none !important;
            }
            .custom-tower-icon svg {
                filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.3));
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    // Subscribe to buffer manager changes
    useEffect(() => {
        const handleBufferChange = (towers: TowerWithBuffers[]) => {
            setTowerBufferRelationships(towers);

            // Update buffer visibility state
            setBufferVisibility(prev => {
                const newState = { ...prev };
                towers.forEach(tower => {
                    tower.buffers.forEach(buffer => {
                        if (!(buffer.id in newState)) {
                            newState[buffer.id] = false; // Default to hidden
                        }
                    });
                });
                return newState;
            });
        };

        frontendBufferManager.onVisibilityChange(handleBufferChange);

        return () => {
            frontendBufferManager.offVisibilityChange(handleBufferChange);
        };
    }, []);

    // Subscribe to zoom visibility manager changes
    useEffect(() => {
        const handleZoomLayerToggle = (layerId: number, visible: boolean, reason: 'zoom' | 'user') => {
            if (reason === 'zoom') {
                // Update the actual layer visibility when zoom changes
                if (mapRef.current && layersRef.current[layerId]) {
                    if (visible) {
                        mapRef.current.addLayer(layersRef.current[layerId]);
                    } else {
                        mapRef.current.removeLayer(layersRef.current[layerId]);
                    }
                }
                console.log(`Zoom manager toggled layer ${layerId}: ${visible}`);
            }
        };

        const handleZoomHints = (hints: ZoomHint[]) => {
            setZoomHints(hints);
        };

        zoomVisibilityManager.onLayerToggle(handleZoomLayerToggle);
        zoomVisibilityManager.onZoomHints(handleZoomHints);

        return () => {
            zoomVisibilityManager.offLayerToggle(handleZoomLayerToggle);
            zoomVisibilityManager.offZoomHints(handleZoomHints);
        };
    }, []);

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

                const progressInterval = setInterval(() => {
                    setLoadingProgress(prev => {
                        if (prev >= 90) return prev;
                        return prev + Math.random() * 15;
                    });
                }, 300);

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

        if (mapRef.current) {
            frontendBufferManager.cleanup(mapRef.current);
            zoomVisibilityManager.cleanup();
            mapRef.current.remove();
        }

        try {
            const map = L.map(mapContainerRef.current, {
                center: [
                    projectData.project?.default_center_lat || 40.0,
                    projectData.project?.default_center_lng || -83.0
                ],
                zoom: projectData.project?.default_zoom_level || 7,
                zoomControl: false,
                attributionControl: false
            });

            // Create panes for better layer ordering
            map.createPane('basemapPane');
            map.createPane('overlayPane');
            map.createPane('markerPane');

            map.getPane('basemapPane')!.style.zIndex = '200';
            map.getPane('overlayPane')!.style.zIndex = '400';
            map.getPane('markerPane')!.style.zIndex = '600';

            L.control.zoom({ position: 'bottomright' }).addTo(map);

            // Track zoom changes
            map.on('zoomend', () => {
                setCurrentZoom(map.getZoom());
            });

            mapRef.current = map;
            setCurrentZoom(map.getZoom());

            // Initialize zoom visibility manager
            zoomVisibilityManager.initialize(map, frontendBufferManager);

            console.log('Map initialized with zoom visibility manager');

        } catch (err) {
            console.error('Error initializing map:', err);
            setError('Failed to initialize map');
        }
    }, [projectData, loading]);

    // Handle basemap changes
    useEffect(() => {
        if (!mapRef.current || !projectData || loading || !activeBasemap) return;

        Object.values(basemapLayersRef.current).forEach(layer => {
            if (mapRef.current!.hasLayer(layer)) {
                mapRef.current!.removeLayer(layer);
            }
        });
        basemapLayersRef.current = {};

        const basemap = projectData.basemaps?.find((b: any) => b.id === activeBasemap);
        if (basemap) {
            const tileLayer = L.tileLayer(basemap.url_template, {
                ...basemap.options,
                attribution: basemap.attribution,
                pane: 'basemapPane'
            });

            tileLayer.addTo(mapRef.current);
            basemapLayersRef.current[basemap.id] = tileLayer;

            mapRef.current.getPane('basemapPane')!.style.zIndex = '200';
            mapRef.current.getPane('overlayPane')!.style.zIndex = '400';
            mapRef.current.getPane('markerPane')!.style.zIndex = '600';
        }
    }, [activeBasemap, projectData, loading]);

    // Load layers when visibility changes
    useEffect(() => {
        if (!mapRef.current || !projectData || loading) return;

        const loadVisibleLayers = async () => {
            const layersToLoad: StandaloneLayer[] = [];

            for (const layerId of Array.from(visibleLayers)) {
                if (layersRef.current[layerId]) continue;

                let layerInfo: StandaloneLayer | null = null;
                for (const group of projectData.layer_groups) {
                    for (const layer of group.layers) {
                        if (layer.id === layerId) {
                            layerInfo = layer as StandaloneLayer;
                            break;
                        }
                    }
                    if (layerInfo) break;
                }

                if (layerInfo) {
                    layersToLoad.push(layerInfo);
                }
            }

            layersToLoad.sort((a, b) => (a.z_index || 0) - (b.z_index || 0));

            for (const layerInfo of layersToLoad) {
                try {
                    const bounds = mapRef.current!.getBounds();
                    const zoom = mapRef.current!.getZoom();
                    const boundsParam = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;

                    const data = await mapService.getLayerData(layerInfo.id, {
                        chunk_id: 1,
                        bounds: boundsParam,
                        zoom: zoom
                    });

                    if (!data.features || data.features.length === 0) continue;

                    // Store tower data for buffer generation
                    const isTowerLayer = isAntennaTowerLayer(layerInfo.name);
                    if (isTowerLayer) {
                        towerDataRef.current[layerInfo.id] = data;
                    }

                    let mapLayer: L.Layer;

                    const shouldCluster = isPointLayer(layerInfo) && hasClusteringEnabled(layerInfo);

                    if (shouldCluster) {
                        // Create clustered layer (for BEAD locations, etc.)
                        const clusteringOptions = getClusteringOptions(layerInfo);

                        const clusterGroup = L.markerClusterGroup({
                            ...clusteringOptions,
                            showCoverageOnHover: clusteringOptions.showCoverageOnHover ?? false,
                            zoomToBoundsOnClick: clusteringOptions.zoomToBoundsOnClick ?? true,
                            spiderfyOnMaxZoom: clusteringOptions.spiderfyOnMaxZoom ?? true,
                            removeOutsideVisibleBounds: true,
                            pane: 'overlayPane'
                        });

                        L.geoJSON(data, {
                            pointToLayer: (feature, latlng) => {
                                if (isTowerLayer) {
                                    const companyName = getTowerCompanyFromLayerName(layerInfo.name);
                                    const towerIcon = createTowerIcon(companyName);
                                    return L.marker(latlng, {
                                        icon: towerIcon,
                                        pane: 'markerPane'
                                    });
                                } else if (layerInfo.marker_type === 'image' && layerInfo.marker_image_url) {
                                    const icon = L.icon({
                                        iconUrl: layerInfo.marker_image_url,
                                        iconSize: [32, 32],
                                        iconAnchor: [16, 32],
                                        popupAnchor: [0, -32]
                                    });
                                    return L.marker(latlng, {
                                        icon,
                                        pane: 'markerPane'
                                    });
                                } else {
                                    return L.circleMarker(latlng, {
                                        radius: layerInfo.style?.radius || 4,
                                        fillColor: layerInfo.style?.fillColor || '#01fbff',
                                        color: layerInfo.style?.color || 'black',
                                        weight: layerInfo.style?.weight || 1,
                                        opacity: layerInfo.style?.opacity || 1,
                                        fillOpacity: layerInfo.style?.fillOpacity || 1,
                                        pane: 'overlayPane'
                                    });
                                }
                            },
                            onEachFeature: (feature, leafletLayer) => {
                                if (feature.properties && isTowerLayer) {
                                    // Only add popups for tower layers
                                    const companyName = getTowerCompanyFromLayerName(layerInfo.name);
                                    const popupHTML = createTowerPopupHTML(feature.properties, companyName);
                                    leafletLayer.bindPopup(popupHTML, {
                                        maxWidth: 450,
                                        maxHeight: 400,
                                        className: 'tower-popup'
                                    });
                                }
                            }
                        }).addTo(clusterGroup);

                        mapLayer = clusterGroup;

                    } else {
                        // Create non-clustered layer
                        mapLayer = L.geoJSON(data, {
                            style: (feature) => ({
                                color: layerInfo.style?.color || '#3388ff',
                                weight: layerInfo.style?.weight || 2,
                                opacity: layerInfo.style?.opacity || 1,
                                fillColor: layerInfo.style?.fillColor || layerInfo.style?.color || '#3388ff',
                                fillOpacity: layerInfo.style?.fillOpacity || 0.2
                            }),
                            pointToLayer: (feature, latlng) => {
                                if (isTowerLayer) {
                                    const companyName = getTowerCompanyFromLayerName(layerInfo.name);
                                    const towerIcon = createTowerIcon(companyName);
                                    return L.marker(latlng, {
                                        icon: towerIcon,
                                        pane: 'markerPane'
                                    });
                                } else if (layerInfo.marker_type === 'image' && layerInfo.marker_image_url) {
                                    const icon = L.icon({
                                        iconUrl: layerInfo.marker_image_url,
                                        iconSize: [32, 32],
                                        iconAnchor: [16, 32],
                                        popupAnchor: [0, -32]
                                    });
                                    return L.marker(latlng, { icon });
                                } else {
                                    return L.circleMarker(latlng, {
                                        radius: layerInfo.style?.radius || 6,
                                        fillColor: layerInfo.style?.fillColor || layerInfo.style?.color || '#3388ff',
                                        color: layerInfo.style?.color || '#3388ff',
                                        weight: layerInfo.style?.weight || 1,
                                        opacity: layerInfo.style?.opacity || 1,
                                        fillOpacity: layerInfo.style?.fillOpacity || 0.8
                                    });
                                }
                            },
                            onEachFeature: (feature, leafletLayer) => {
                                if (feature.properties && isTowerLayer) {
                                    // Only add popups for tower layers
                                    const companyName = getTowerCompanyFromLayerName(layerInfo.name);
                                    const popupHTML = createTowerPopupHTML(feature.properties, companyName);
                                    leafletLayer.bindPopup(popupHTML, {
                                        maxWidth: 450,
                                        maxHeight: 400,
                                        className: 'tower-popup'
                                    });
                                }
                            }
                        });
                    }

                    // Store layer reference but don't add to map yet - zoom manager will control this
                    layersRef.current[layerInfo.id] = mapLayer;

                    // Register with zoom visibility manager
                    zoomVisibilityManager.registerLayer(
                        layerInfo.id,
                        layerInfo.name,
                        isTowerLayer,
                        true // User wants it visible
                    );

                    // Generate frontend buffer layers for antenna towers
                    if (isTowerLayer) {
                        const companyName = getTowerCompanyFromLayerName(layerInfo.name);

                        console.log(`Generating frontend buffers for ${layerInfo.name} (${companyName}) with zoom control`);

                        const buffers = frontendBufferManager.generateBuffersFromTowerData(
                            data,
                            layerInfo.id,
                            layerInfo.name,
                            companyName
                        );

                        console.log(`Generated ${buffers.length} buffer layers with ${buffers.reduce((sum, b) => sum + b.featureCount, 0)} total buffer circles`);
                    }

                    console.log(`Successfully loaded ${isTowerLayer ? 'tower' : 'regular'} layer: ${layerInfo.name}`, {
                        isTowerLayer,
                        companyName: isTowerLayer ? getTowerCompanyFromLayerName(layerInfo.name) : 'N/A',
                        clustered: shouldCluster,
                        featureCount: data.features.length,
                        buffersGenerated: isTowerLayer,
                        zoomControlled: isTowerLayer
                    });

                } catch (err) {
                    console.error(`Error loading layer ${layerInfo.name}:`, err);
                }
            }

            // Remove layers that are no longer visible
            for (const loadedLayerId of Object.keys(layersRef.current).map(Number)) {
                if (!visibleLayers.has(loadedLayerId)) {
                    if (mapRef.current && layersRef.current[loadedLayerId]) {
                        mapRef.current.removeLayer(layersRef.current[loadedLayerId]);
                        delete layersRef.current[loadedLayerId];
                    }

                    // Remove tower data and buffers
                    delete towerDataRef.current[loadedLayerId];
                    if (mapRef.current) {
                        frontendBufferManager.removeBuffersForTower(loadedLayerId, mapRef.current);
                    }

                    // Unregister from zoom manager
                    zoomVisibilityManager.unregisterLayer(loadedLayerId);
                }
            }
        };

        loadVisibleLayers();
    }, [visibleLayers, projectData, loading]);

    // Handle layer toggle
    const handleLayerToggle = useCallback((layerId: number) => {
        setVisibleLayers(prev => {
            const newSet = new Set(prev);
            const wasVisible = newSet.has(layerId);

            if (wasVisible) {
                newSet.delete(layerId);
                // Update zoom manager
                zoomVisibilityManager.setUserVisibility(layerId, false);
            } else {
                newSet.add(layerId);
                // Update zoom manager
                zoomVisibilityManager.setUserVisibility(layerId, true);
            }

            return newSet;
        });
    }, []);

    // Handle buffer toggle
    const handleBufferToggle = useCallback((bufferId: string, isVisible: boolean) => {
        setBufferVisibility(prev => ({
            ...prev,
            [bufferId]: isVisible
        }));

        if (mapRef.current) {
            // Check if parent tower is visible
            const buffer = frontendBufferManager.getBufferLayer(bufferId);
            const parentVisible = buffer ? visibleLayers.has(buffer.parentLayerId) : false;

            frontendBufferManager.toggleBufferLayer(bufferId, isVisible, mapRef.current, parentVisible);
        }
    }, [visibleLayers]);

    const handleBasemapChange = (basemapId: number) => {
        setActiveBasemap(basemapId);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (mapRef.current) {
                frontendBufferManager.cleanup(mapRef.current);
                zoomVisibilityManager.cleanup();
            }
        };
    }, []);

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
            <StandaloneHeader projectName={projectData?.project?.name} />
            <Box
                position="relative"
                height="calc(100vh - 48px)"
                marginTop="48px"
            >
                <Box
                    ref={mapContainerRef}
                    width="100%"
                    height="100%"
                    sx={{ position: 'absolute', top: 0, left: 0 }}
                />

                {/* Zoom hints notification */}
                {zoomHints.length > 0 && (
                    <Box
                        position="absolute"
                        bottom="50px"
                        left="10px"
                        backgroundColor="rgba(0,0,0,0.8)"
                        color="white"
                        padding="8px 12px"
                        borderRadius="5px"
                        zIndex={1000}
                        maxWidth="300px"
                    >
                        <Typography variant="body2" sx={{ fontSize: '12px', fontWeight: 600 }}>
                            Zoom Level: {currentZoom}
                        </Typography>
                        {zoomHints.map((hint, index) => (
                            <Typography key={index} variant="body2" sx={{ fontSize: '11px', marginTop: '2px' }}>
                                {createZoomHintMessage(hint)}
                            </Typography>
                        ))}
                    </Box>
                )}

                {projectData && (
                    <StandaloneLayerControl
                        projectData={projectData}
                        visibleLayers={visibleLayers}
                        activeBasemap={activeBasemap}
                        onLayerToggle={handleLayerToggle}
                        onBasemapChange={handleBasemapChange}
                        towerBufferRelationships={towerBufferRelationships}
                        onBufferToggle={handleBufferToggle}
                        bufferVisibility={bufferVisibility}
                        zoomHints={zoomHints}
                        currentZoom={currentZoom}
                    />
                )}
            </Box>
        </>
    );
};

export default StandaloneViewerPage;