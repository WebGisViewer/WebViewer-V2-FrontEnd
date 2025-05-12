// src/components/map/controls/BasemapControl.tsx
import React from 'react';
import { Box, Paper, Typography, Divider, List, ListItem } from '@mui/material';
import { useMap } from '../../../context/MapContext';

const BasemapControl: React.FC = () => {
    const { projectData, currentBasemap, changeBasemap } = useMap();

    console.log('[BasemapControl] Rendering with:', {
        hasProjectData: !!projectData,
        basemaps: projectData?.basemaps || [],
        currentBasemap
    });

    if (!projectData) {
        console.warn('[BasemapControl] No projectData available');
        return (
            <Paper sx={{ p: 2, width: 200 }}>
                <Typography color="error">No project data available</Typography>
            </Paper>
        );
    }

    // Try to safely access basemaps with fallbacks
    const basemaps = projectData.basemaps || [];

    if (!Array.isArray(basemaps)) {
        console.warn('[BasemapControl] basemaps is not an array:', basemaps);
        return (
            <Paper sx={{ p: 2, width: 200 }}>
                <Typography color="error">Basemaps data is invalid</Typography>
            </Paper>
        );
    }

    if (basemaps.length === 0) {
        console.warn('[BasemapControl] No basemaps found in project data');
        return (
            <Paper sx={{ p: 2, width: 200 }}>
                <Typography>No basemaps available</Typography>
            </Paper>
        );
    }

    // Find the current basemap
    const selected = basemaps.find((b: any) => b.id === currentBasemap);

    return (
        <Paper sx={{ width: 200 }}>
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="subtitle2">Basemaps</Typography>
                {selected && (
                    <Typography variant="caption">
                        Current: {selected.name || `Basemap ${selected.id}`}
                    </Typography>
                )}
            </Box>

            <Divider />

            <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                {basemaps.map((basemap: any) => (
                    <ListItem
                        key={basemap.id}
                        button
                        selected={basemap.id === currentBasemap}
                        onClick={() => changeBasemap(basemap.id)}
                        sx={{
                            py: 1,
                            bgcolor: basemap.id === currentBasemap ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
                            '&:hover': {
                                bgcolor: 'rgba(0, 0, 0, 0.04)'
                            }
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Box
                                sx={{
                                    width: 24,
                                    height: 24,
                                    mr: 1,
                                    border: '1px solid #ccc',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '10px',
                                    bgcolor: basemap.id === currentBasemap ? 'primary.main' : 'white',
                                    color: basemap.id === currentBasemap ? 'white' : 'text.primary',
                                }}
                            >
                                {basemap.id === currentBasemap ? '✓' : 'B'}
                            </Box>
                            <Typography variant="body2">
                                {basemap.name || `Basemap ${basemap.id}`}
                            </Typography>
                        </Box>
                    </ListItem>
                ))}
            </List>

            <Divider />

            <Box sx={{ p: 1 }}>
                <Typography variant="caption" color="text.secondary">
                    Debug: {basemaps.length} basemaps available
                </Typography>
            </Box>
        </Paper>
    );
};

export default BasemapControl;