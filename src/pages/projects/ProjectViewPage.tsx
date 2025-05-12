// src/pages/projects/ProjectViewPage.tsx
import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useMap } from '../../context/MapContext';
import LayerControl from '../../components/map/controls/LayerControl';
import BasemapControl from '../../components/map/controls/BasemapControl';
import MapLoadingOverlay from '../../components/map/MapLoadingOverlay';
import MapError from '../../components/map/MapError';

// Import Leaflet CSS - Make sure these imports are available
import 'leaflet/dist/leaflet.css';
// Only include these if you've installed leaflet.markercluster
// import 'leaflet.markercluster/dist/MarkerCluster.css';
// import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

const ProjectViewPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const {
        loadProject,
        initializeMap,
        projectData,
        loading,
        error
    } = useMap();

    // Load project data
    useEffect(() => {
        console.log('[ProjectViewPage] useEffect for loadProject with id:', id);
        if (id) {
            loadProject(Number(id));
        }
    }, [id, loadProject]);

    // Initialize map once project data is loaded
    useEffect(() => {
        console.log('[ProjectViewPage] useEffect for initializeMap, projectData:',
            projectData ? 'exists' : 'null',
            'mapContainerRef:', mapContainerRef.current ? 'exists' : 'null');

        if (projectData && mapContainerRef.current) {
            console.log('[ProjectViewPage] Initializing map');
            initializeMap(mapContainerRef.current);
        }
    }, [projectData, initializeMap]);

    // Show loading state
    if (loading && !projectData) {
        console.log('[ProjectViewPage] Rendering loading state');
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="calc(100vh - 64px)"
            >
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2 }}>
                    Loading project {id}...
                </Typography>
            </Box>
        );
    }

    // Show error state
    if (error) {
        console.log('[ProjectViewPage] Rendering error state:', error);
        return (
            <MapError
                message={error}
                onRetry={() => id && loadProject(Number(id))}
            />
        );
    }

    // Show empty state if no project data
    if (!projectData) {
        console.log('[ProjectViewPage] Rendering empty state (no project data)');
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="calc(100vh - 64px)"
                flexDirection="column"
                p={3}
            >
                <Typography variant="h5" gutterBottom color="text.secondary">
                    No Project Data Available
                </Typography>
                <Typography variant="body1">
                    Could not load project with ID: {id}
                </Typography>
            </Box>
        );
    }

    console.log('[ProjectViewPage] Rendering map view');

    return (
        <Box height="calc(100vh - 64px)" width="100%" position="relative">
            {/* Map Container */}
            <Box
                id="map"
                ref={mapContainerRef}
                width="100%"
                height="100%"
                sx={{
                    border: '1px solid #ddd',
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
                    }
                }}
            />

            {/* Layer Control */}
            {projectData.project?.map_controls?.showLayerControl !== false && (
                <Box position="absolute" top={10} right={10} zIndex={1000}>
                    <LayerControl />
                </Box>
            )}

            {/* Basemap Control */}
            <Box position="absolute" bottom={40} right={10} zIndex={1000}>
                <BasemapControl />
            </Box>

            {/* Loading Overlay when loading data after initial render */}
            {loading && <MapLoadingOverlay />}
        </Box>
    );
};

export default ProjectViewPage;