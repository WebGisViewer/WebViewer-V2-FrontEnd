// src/pages/viewer/StandaloneViewerPage.tsx

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Paper, Button } from '@mui/material';
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
import { cbrsService, CBRSLicense } from '../../services/cbrsService';
import { createCBRSPopupHTML } from '../../components/viewer/CBRSPopupSystem';
import * as turf from '@turf/turf';
import { layerDataCache } from '../../utils/LayerDataCache';


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
    return (
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

const DebugCacheInfo: React.FC = () => {
    const [cacheInfo, setCacheInfo] = useState<any>(null);
    const [showDebug, setShowDebug] = useState(false);

    useEffect(() => {
        if (showDebug) {
            const updateCacheInfo = () => {
                const info = layerDataCache.getCacheInfo();
                setCacheInfo(info);
            };

            updateCacheInfo();
            const interval = setInterval(updateCacheInfo, 2000);

            return () => clearInterval(interval);
        }
    }, [showDebug]);

    // Only show in development
    if (process.env.NODE_ENV !== 'development') return null;

    return (
        <>
            <Button
                onClick={() => setShowDebug(!showDebug)}
                sx={{
                    position: 'fixed',
                    top: '60px',
                    right: '10px',
                    zIndex: 1001,
                    minWidth: 'auto',
                    p: 1
                }}
                variant="outlined"
                size="small"
            >
                {showDebug ? 'Hide' : 'Show'} Cache Debug
            </Button>

            {showDebug && cacheInfo && (
                <Paper
                    sx={{
                        position: 'fixed',
                        top: '100px',
                        right: '10px',
                        zIndex: 1001,
                        p: 2,
                        maxWidth: 300,
                        fontSize: '12px',
                        maxHeight: 400,
                        overflow: 'auto'
                    }}
                >
                    <Typography variant="subtitle2" gutterBottom>
                        Cache Status
                    </Typography>
                    <div><strong>Memory Entries:</strong> {cacheInfo.memoryEntries}</div>
                    <div><strong>Storage Entries:</strong> {cacheInfo.localStorageEntries}</div>
                    <div><strong>Memory Size:</strong> {cacheInfo.memorySize}</div>
                    <div><strong>Storage Size:</strong> {cacheInfo.storageSize}</div>
                    <div><strong>Storage Usage:</strong> {cacheInfo.storageUsage}</div>
                    <div><strong>Total Size:</strong> {cacheInfo.totalSize}</div>

                    <div style={{ marginTop: '12px', fontSize: '11px', color: '#666' }}>
                        <div>Fallback Data: {Object.keys(fallbackLayerData).length} layers</div>
                        <div>Preloaded Layers: {Object.keys(preloadedLayers).length} layers</div>
                        <div>Visible Layers: {visibleLayers.size} layers</div>
                    </div>

                    <Button
                        onClick={() => {
                            layerDataCache.clearAllCache();
                            console.log('Cache cleared manually');
                        }}
                        sx={{
                            mt: 1,
                            fontSize: '11px',
                            width: '100%'
                        }}
                        variant="outlined"
                        color="error"
                        size="small"
                    >
                        Clear All Cache
                    </Button>
                </Paper>
            )}
        </>
    );
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

    const [cbrsLicenses, setCbrsLicenses] = useState<CBRSLicense[]>([]);

    const [allLayersLoaded, setAllLayersLoaded] = useState<boolean>(false);
    const [loadingStatus, setLoadingStatus] = useState<string>('Loading project...');
    const [layerLoadProgress, setLayerLoadProgress] = useState<{ [layerId: number]: boolean }>({});
    const [preloadedLayers, setPreloadedLayers] = useState<{ [layerId: number]: L.Layer }>({});

    const [fallbackLayerData, setFallbackLayerData] = useState<{ [layerId: number]: any }>({});

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
                setLoadingProgress(5);
                setLoadingStatus('Loading project configuration...');

                if (!id) {
                    throw new Error('No project ID provided');
                }

                const data = await projectService.getProjectConstructor(Number(id));
                setLoadingProgress(15);

                if (!mounted) return;

                setProjectData(data);
                setLoadingStatus('Loading CBRS data...');

                // Load CBRS licenses
                if (data?.project?.state_abbr) {
                    try {
                        const licenses = await cbrsService.getCBRSLicensesByState(data.project.state_abbr);
                        setCbrsLicenses(licenses);
                        console.log(`Loaded ${licenses.length} CBRS licenses for ${data.project.state_abbr}`);
                    } catch (error) {
                        console.error('Error loading CBRS licenses:', error);
                    }
                }
                setLoadingProgress(25);

                // Initialize visible layers
                const initialVisibleLayers = new Set<number>();
                const allLayers: any[] = [];

                if (data.layer_groups) {
                    data.layer_groups.forEach((group: any) => {
                        if (group.layers) {
                            group.layers.forEach((layer: any) => {
                                allLayers.push(layer);
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

                setLoadingStatus('Pre-loading all layer data...');
                setLoadingProgress(30);

                // Pre-load ALL layer data
                await preloadAllLayerData(allLayers);

                if (mounted) {
                    setAllLayersLoaded(true);
                    setLoadingStatus('Initializing map...');
                    setLoadingProgress(100);

                    setTimeout(() => {
                        if (mounted) setLoading(false);
                    }, 500);
                }

            } catch (err: any) {
                console.error('Error loading project:', err);
                if (mounted) {
                    setError(err.message || 'Failed to load project');
                    setLoading(false);
                }
            }
        };

        const preloadAllLayerData = async (allLayers: any[]) => {
            if (allLayers.length === 0) return;

            const progressPerLayer = 65 / allLayers.length;
            let currentProgress = 30;
            const loadedData: { [layerId: number]: any } = {};

            for (let i = 0; i < allLayers.length; i++) {
                const layerInfo = allLayers[i];
                const layerId = layerInfo.id;

                try {
                    setLoadingStatus(`Loading ${layerInfo.name}... (${i + 1}/${allLayers.length})`);

                    // Check if data is already cached
                    const cachedData = layerDataCache.getLayerData(layerId);
                    if (cachedData) {
                        console.log(`Using cached data for layer: ${layerInfo.name}`);
                        loadedData[layerId] = cachedData.data;
                        setLayerLoadProgress(prev => ({ ...prev, [layerId]: true }));
                        currentProgress += progressPerLayer;
                        setLoadingProgress(Math.min(95, currentProgress));
                        continue;
                    }

                    console.log(`Loading layer: ${layerInfo.name} (ID: ${layerId})`);

                    // Load all chunks for the layer
                    let allFeatures: any[] = [];
                    let currentChunk = 1;
                    let hasMoreChunks = true;

                    while (hasMoreChunks) {
                        try {
                            const chunkData = await mapService.getLayerData(layerId, {
                                chunk_id: currentChunk,
                                bounds: '-180,-90,180,90',
                                zoom: 1
                            });

                            if (chunkData.features && chunkData.features.length > 0) {
                                allFeatures.push(...chunkData.features);
                                console.log(`Loaded chunk ${currentChunk} with ${chunkData.features.length} features for layer: ${layerInfo.name}`);
                                currentChunk++;

                                if (chunkData.features.length < 1000) {
                                    hasMoreChunks = false;
                                }
                            } else {
                                hasMoreChunks = false;
                            }
                        } catch (chunkError: any) {
                            console.log(`No more chunks available after chunk ${currentChunk - 1} for layer ${layerInfo.name}`);
                            hasMoreChunks = false;
                        }
                    }

                    // Create the combined data object
                    const combinedData = {
                        type: 'FeatureCollection' as const,
                        features: allFeatures
                    };

                    // Store data in memory regardless of cache success/failure
                    loadedData[layerId] = combinedData;

                    // Try to cache the data (may fail for large datasets)
                    try {
                        layerDataCache.setLayerData(layerId, layerInfo.name, combinedData);
                    } catch (cacheError) {
                        console.warn(`Failed to cache layer ${layerInfo.name}, but data is still available in memory:`, cacheError);
                    }

                    console.log(`Loaded ${allFeatures.length} features for layer: ${layerInfo.name}`);

                    setLayerLoadProgress(prev => ({ ...prev, [layerId]: true }));
                    currentProgress += progressPerLayer;
                    setLoadingProgress(Math.min(95, currentProgress));

                } catch (err) {
                    console.error(`Error loading layer ${layerInfo.name}:`, err);
                    // Continue with other layers even if one fails
                }
            }

            // Store all loaded data in fallback state
            setFallbackLayerData(loadedData);

            console.log('All layers loaded!');
            const cacheInfo = layerDataCache.getCacheInfo();
            console.log('Cache info:', cacheInfo);
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
                const newZoom = map.getZoom();
                setCurrentZoom(newZoom);

                // ✅ TRIGGER LAYER VISIBILITY UPDATE WHEN ZOOM CHANGES
                setTimeout(() => {
                    // Trigger the layer visibility update effect
                    setVisibleLayers(prev => new Set(prev));
                }, 0);
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
        if (!mapRef.current || !projectData || loading || !allLayersLoaded) return;

        const getLayerNameById = (layerId: number): string => {
            if (!projectData?.layer_groups) return '';

            for (const group of projectData.layer_groups) {
                if (group.layers) {
                    for (const layer of group.layers) {
                        if (layer.id === layerId) {
                            return layer.name;
                        }
                    }
                }
            }
            return '';
        };

        const updateLayerVisibility = async () => {
            // Get all layers from project data
            const allProjectLayers: any[] = [];
            if (projectData.layer_groups) {
                projectData.layer_groups.forEach((group: any) => {
                    if (group.layers) {
                        // FIXED: was allProjectLayers.forEach, now group.layers.forEach
                        group.layers.forEach((layer: any) => {
                            allProjectLayers.push(layer);
                        });
                    }
                });
            }

            console.log(`Processing ${allProjectLayers.length} layers:`, allProjectLayers.map(l => l.name));

            // Create map layers for layers that don't exist yet
            for (const layerInfo of allProjectLayers) {
                if (!preloadedLayers[layerInfo.id]) {
                    console.log(`Creating map layer for: ${layerInfo.name}`);
                    await createMapLayer(layerInfo);
                }
            }

            // Update visibility of all layers
            for (const [layerIdStr, layer] of Object.entries(preloadedLayers)) {
                const layerKey = layerIdStr;

                // Handle county labels separately
                if (layerKey.includes('_labels')) {
                    const parentLayerId = Number(layerKey.split('_')[0]);
                    const shouldBeVisible = visibleLayers.has(parentLayerId);
                    const isCurrentlyVisible = mapRef.current!.hasLayer(layer);

                    if (shouldBeVisible && !isCurrentlyVisible) {
                        mapRef.current!.addLayer(layer);
                        console.log(`Showed county labels for layer ${parentLayerId}`);
                    } else if (!shouldBeVisible && isCurrentlyVisible) {
                        mapRef.current!.removeLayer(layer);
                        console.log(`Hidden county labels for layer ${parentLayerId}`);
                    }
                    continue;
                }

                // Handle regular layers with zoom restrictions
                const layerId = Number(layerIdStr);
                const userWantsVisible = visibleLayers.has(layerId);

                // ✅ CHECK ZOOM RESTRICTIONS FOR TOWER LAYERS
                const layerName = getLayerNameById(layerId);
                const isTowerLayer = isAntennaTowerLayer(layerName);
                const zoomStatus = zoomVisibilityManager.getLayerZoomStatus(layerId);

                // ✅ Layer should only be visible if user wants it AND zoom allows it (for tower layers)
                const shouldBeVisible = userWantsVisible && (!isTowerLayer || zoomStatus.canShow);
                const isCurrentlyVisible = mapRef.current!.hasLayer(layer);

                if (shouldBeVisible && !isCurrentlyVisible) {
                    mapRef.current!.addLayer(layer);
                    console.log(`Showed layer ${layerId} (zoom allowed: ${!isTowerLayer || zoomStatus.canShow})`);
                } else if (!shouldBeVisible && isCurrentlyVisible) {
                    mapRef.current!.removeLayer(layer);
                    console.log(`Hidden layer ${layerId} (user wants: ${userWantsVisible}, zoom allows: ${!isTowerLayer || zoomStatus.canShow})`);
                }
            }
        };

        const createMapLayer = async (layerInfo: any): Promise<void> => {
            try {
                // Try to get data from cache first, then fallback
                let data = null;
                const cachedData = layerDataCache.getLayerData(layerInfo.id);

                if (cachedData) {
                    data = cachedData.data;
                    console.log(`Using cached data for map layer: ${layerInfo.name}`);
                } else if (fallbackLayerData[layerInfo.id]) {
                    data = fallbackLayerData[layerInfo.id];
                    console.log(`Using fallback data for map layer: ${layerInfo.name}`);
                } else {
                    console.error(`No data available for layer: ${layerInfo.name}`);
                    return;
                }

                if (!data.features || data.features.length === 0) {
                    console.log(`No features found for layer: ${layerInfo.name}`);
                    return;
                }

                console.log(`Creating map layer for: ${layerInfo.name} with ${data.features.length} features`);

                const isTowerLayer = isAntennaTowerLayer(layerInfo.name);
                const isCountyLayer = layerInfo.name === "County Outline" || layerInfo.id === 794;

                // Store tower data for buffer generation
                if (isTowerLayer) {
                    towerDataRef.current[layerInfo.id] = data;
                }

                let mapLayer: L.Layer;

                const shouldCluster = isPointLayer(layerInfo) && hasClusteringEnabled(layerInfo);

                if (shouldCluster) {
                    // Create clustered layer (same as before)
                    const L_MarkerCluster = await import('leaflet.markercluster');
                    const MarkerClusterGroup = (L as any).MarkerClusterGroup;

                    const clusteringOptions = getClusteringOptions(layerInfo);

                    const markerClusterGroup = new MarkerClusterGroup({
                        disableClusteringAtZoom: clusteringOptions.disableClusteringAtZoom || 11,
                        showCoverageOnHover: clusteringOptions.showCoverageOnHover || false,
                        zoomToBoundsOnClick: clusteringOptions.zoomToBoundsOnClick !== false,
                        spiderfyOnMaxZoom: clusteringOptions.spiderfyOnMaxZoom !== false,
                        removeOutsideVisibleBounds: clusteringOptions.removeOutsideVisibleBounds || false,
                        maxClusterRadius: clusteringOptions.maxClusterRadius || 80,
                        ...clusteringOptions
                    });

                    // Process each feature and add to cluster group
                    data.features.forEach((feature: any) => {
                        if (feature.geometry && feature.geometry.type === 'Point') {
                            const [lng, lat] = feature.geometry.coordinates;
                            let marker: L.Marker | L.CircleMarker;

                            if (isTowerLayer && feature.properties) {
                                const companyName = getTowerCompanyFromLayerName(layerInfo.name);
                                const towerIcon = createTowerIcon(companyName);
                                marker = L.marker([lat, lng], { icon: towerIcon });

                                const popupHTML = createTowerPopupHTML(feature.properties, layerInfo.name);
                                marker.bindPopup(popupHTML, {
                                    maxWidth: 400,
                                    className: 'tower-popup'
                                });
                            } else {
                                marker = L.circleMarker([lat, lng], {
                                    radius: 6,
                                    fillColor: '#01fbff',
                                    color: '#000000',
                                    weight: 2,
                                    opacity: 1,
                                    fillOpacity: 0.8
                                });
                            }

                            markerClusterGroup.addLayer(marker);
                        }
                    });

                    mapLayer = markerClusterGroup;
                } else {
                    // Create non-clustered layer
                    mapLayer = L.geoJSON(data, {
                        style: () => ({
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
                                return L.marker(latlng, { icon: towerIcon });
                            } else {
                                return L.circleMarker(latlng, {
                                    radius: 6,
                                    fillColor: '#3388ff',
                                    color: '#ffffff',
                                    weight: 2,
                                    opacity: 1,
                                    fillOpacity: 0.8
                                });
                            }
                        },
                        onEachFeature: (feature, leafletLayer) => {
                            if (feature.properties && isTowerLayer) {
                                const popupHTML = createTowerPopupHTML(feature.properties, layerInfo.name);
                                leafletLayer.bindPopup(popupHTML, {
                                    maxWidth: 400,
                                    className: 'tower-popup'
                                });
                            } else if (isCountyLayer && feature.geometry) {
                                console.log('Processing County Outline feature:', feature.properties);

                                const countyName = feature.properties?.NAME ||
                                    feature.properties?.name ||
                                    feature.properties?.county_name ||
                                    feature.properties?.COUNTY ||
                                    feature.properties?.County ||
                                    feature.properties?.NAMELSAD ||
                                    feature.properties?.COUNTYNAME ||
                                    `County ${feature.properties?.FIPS || 'Unknown'}`;

                                // Just bind the CBRS popup to the county outline itself
                                const countyLicenses = cbrsLicenses.filter(license => {
                                    const licenseName = license.county_name.toLowerCase().trim();
                                    const featureName = countyName.toLowerCase().trim();
                                    return licenseName === featureName ||
                                        licenseName.includes(featureName) ||
                                        featureName.includes(licenseName);
                                });

                                const cbrsPopupHTML = createCBRSPopupHTML(countyLicenses, countyName);
                                leafletLayer.bindPopup(cbrsPopupHTML, {
                                    maxWidth: 650,
                                    maxHeight: 450,
                                    className: 'cbrs-popup'
                                });
                            }
                        }
                    });
                }

                // Store the created layer
                setPreloadedLayers(prev => ({
                    ...prev,
                    [layerInfo.id]: mapLayer
                }));

                // FIX 1: IMMEDIATELY ADD TO MAP IF SHOULD BE VISIBLE
                const shouldBeVisible = visibleLayers.has(layerInfo.id);
                if (shouldBeVisible && mapRef.current) {
                    mapRef.current.addLayer(mapLayer);
                    console.log(`Initially showed layer ${layerInfo.id}`);
                }

                // Register with zoom visibility manager
                zoomVisibilityManager.registerLayer(
                    layerInfo.id,
                    layerInfo.name,
                    isTowerLayer,
                    shouldBeVisible // FIX 3: Pass actual visibility state
                );

                // Generate frontend buffer layers for antenna towers
                if (isTowerLayer) {
                    const companyName = getTowerCompanyFromLayerName(layerInfo.name);
                    console.log(`Generating frontend buffers for ${layerInfo.name} (${companyName})`);
                    const buffers = frontendBufferManager.generateBuffersFromTowerData(
                        data,
                        layerInfo.id,
                        layerInfo.name,
                        companyName
                    );
                    console.log(`Generated ${buffers.length} buffer layers`);
                }

                if (isCountyLayer) {
                    createCountyLabels(layerInfo.id, data);
                }

                console.log(`Successfully created map layer: ${layerInfo.name}`);

            } catch (err) {
                console.error(`Error creating map layer ${layerInfo.name}:`, err);
            }
        };

        updateLayerVisibility();
    }, [visibleLayers, projectData, loading, allLayersLoaded, cbrsLicenses]);

    useEffect(() => {
        const loadCBRSLicenses = async () => {
            if (!projectData?.project?.state_abbr) return;

            try {
                const licenses = await cbrsService.getCBRSLicensesByState(projectData.project.state_abbr);
                setCbrsLicenses(licenses);
                console.log(`Loaded ${licenses.length} CBRS licenses for ${projectData.project.state_abbr}`);
            } catch (error) {
                console.error('Error loading CBRS licenses:', error);
            }
        };

        if (projectData) {
            loadCBRSLicenses();
        }
    }, [projectData]);

    const createCountyLabels = (layerId: number, data: any) => {
        if (!mapRef.current) return;

        const countyLabelsGroup = L.layerGroup();

        data.features.forEach((feature: any) => {
            if (feature.geometry) {
                const countyName = feature.properties?.NAME ||
                    feature.properties?.name ||
                    feature.properties?.county_name ||
                    feature.properties?.COUNTY ||
                    feature.properties?.County ||
                    feature.properties?.NAMELSAD ||
                    feature.properties?.COUNTYNAME ||
                    `County ${feature.properties?.FIPS || 'Unknown'}`;

                try {
                    // Calculate polygon centroid for label placement
                    let centroid;
                    if (feature.geometry.type === 'Polygon') {
                        centroid = turf.centroid(feature);
                    } else if (feature.geometry.type === 'MultiPolygon') {
                        const polygons = feature.geometry.coordinates;
                        const largestPolygon = polygons.reduce((largest, current) =>
                            current[0].length > largest[0].length ? current : largest
                        );
                        centroid = turf.centroid({
                            type: 'Polygon',
                            coordinates: largestPolygon
                        });
                    } else {
                        return; // Skip unsupported geometry types
                    }

                    const [lng, lat] = centroid.geometry.coordinates;

                    // Filter CBRS licenses for this county
                    const countyLicenses = cbrsLicenses.filter(license => {
                        const licenseName = license.county_name.toLowerCase().trim();
                        const featureName = countyName.toLowerCase().trim();
                        return licenseName === featureName ||
                            licenseName.includes(featureName) ||
                            featureName.includes(licenseName);
                    });

                    const cbrsPopupHTML = createCBRSPopupHTML(countyLicenses, countyName);

                    // Create clickable county name label
                    const textLength = countyName.length;
                    const approximateWidth = Math.max(textLength * 8, 80);
                    const offsetLeft = approximateWidth / 2;
                    const offsetUp = 10;

                    const countyLabel = L.marker([lat, lng], {
                        icon: L.divIcon({
                            className: 'county-label-clickable',
                            html: `<div style="
                            font-size: 14px;
                            font-weight: bold;
                            text-shadow: -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white;
                            text-align: center;
                            pointer-events: auto;
                            cursor: pointer;
                            padding: 0;
                            margin: 0;
                            white-space: nowrap;
                            color: #333;
                            transition: all 0.2s ease;
                            width: ${approximateWidth}px;
                        " 
                        onmouseover="this.style.textShadow='-2px -2px 0 white, 2px -2px 0 white, -2px 2px 0 white, 2px 2px 0 white'; this.style.transform='scale(1.1)'" 
                        onmouseout="this.style.textShadow='-1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white'; this.style.transform='scale(1)'"
                        title="Click to view CBRS licenses for ${countyName}">${countyName}</div>`,
                            iconSize: [approximateWidth, 20],
                            iconAnchor: [offsetLeft, offsetUp],
                            popupAnchor: [0, 0]
                        }),
                        pane: 'markerPane'
                    });

                    // Add popup to the clickable label
                    countyLabel.bindPopup(cbrsPopupHTML, {
                        maxWidth: 650,
                        maxHeight: 450,
                        className: 'cbrs-popup'
                    });

                    // Add label to the county labels group
                    countyLabelsGroup.addLayer(countyLabel);

                } catch (error) {
                    console.error('Error processing county centroid for:', countyName, error);
                }
            }
        });

        // Store the county labels as a separate layer with a special key
        const labelsKey = `${layerId}_labels`;
        setPreloadedLayers(prev => ({
            ...prev,
            [labelsKey]: countyLabelsGroup
        }));

        // Add labels to map if county layer should be visible
        const shouldBeVisible = visibleLayers.has(layerId);
        if (shouldBeVisible && mapRef.current) {
            mapRef.current.addLayer(countyLabelsGroup);
            console.log(`County labels added for layer ${layerId}`);
        }
    };
    // Handle layer toggle
    const handleLayerToggle = useCallback((layerId: number) => {
        setVisibleLayers(prev => {
            const newSet = new Set(prev);
            const wasVisible = newSet.has(layerId);

            if (wasVisible) {
                newSet.delete(layerId);
                // ✅ Always update zoom manager when layer is toggled off
                zoomVisibilityManager.setUserVisibility(layerId, false);
            } else {
                newSet.add(layerId);
                // ✅ Always update zoom manager when layer is toggled on
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
        return (
            <StandaloneLoadingScreen
                progress={loadingProgress}
                projectName={projectData?.project?.name}
                statusMessage={loadingStatus}
            />
        );
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
