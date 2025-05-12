// src/pages/projects/ProjectViewPage.tsx
import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useMap } from '../../context/MapContext';
import LayerControl from '../../components/map/controls/LayerControl';
import BasemapControl from '../../components/map/controls/BasemapControl';
import MapLoadingOverlay from '../../components/map/MapLoadingOverlay';
import MapError from '../../components/map/MapError';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

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
        if (id) {
            loadProject(Number(id));
        }
    }, [id, loadProject]);

    // Initialize map once project data is loaded
    useEffect(() => {
        if (projectData && mapContainerRef.current) {
            initializeMap(mapContainerRef.current);
        }
    }, [projectData, initializeMap]);

    if (loading && !projectData) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="calc(100vh - 64px)"
            >
                <CircularProgress />
            </Box>
        );
    }

    if (error || !projectData) {
        return (
            <Box mt={4}>
                <MapError message={error || 'Project data not available'} />
            </Box>
        );
    }

    return (
        <Box height="calc(100vh - 64px)" width="100%" position="relative">
            {/* Map Container */}
            <Box
                id="map"
                ref={mapContainerRef}
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
                    }
                }}
            />

            {/* Layer Control */}
            {projectData.project.map_controls?.showLayerControl !== false && (
                <Box position="absolute" top={10} right={10} zIndex={1000}>
                    <LayerControl />
                </Box>
            )}

            {/* Basemap Control */}
            <Box position="absolute" bottom={30} right={10} zIndex={1000}>
                <BasemapControl />
            </Box>

            {/* Loading Overlay */}
            {loading && <MapLoadingOverlay />}
        </Box>
    );
};

export default ProjectViewPage;