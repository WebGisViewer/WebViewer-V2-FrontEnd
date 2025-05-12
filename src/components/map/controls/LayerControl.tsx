// src/components/map/controls/LayerControl.tsx
import React from 'react';
import { Box, Paper, Typography, Divider } from '@mui/material';
import { useMap } from '../../../context/MapContext';

const LayerControl: React.FC = () => {
    const { projectData, visibleLayers, toggleLayer } = useMap();

    console.log('[LayerControl] Rendering with:', {
        hasProjectData: !!projectData,
        layerGroups: projectData?.layer_groups || projectData?.layerGroups || [],
        visibleLayers: Array.from(visibleLayers)
    });

    if (!projectData) {
        console.warn('[LayerControl] No projectData available');
        return (
            <Paper sx={{ p: 2, width: 250 }}>
                <Typography color="error">No project data available</Typography>
            </Paper>
        );
    }

    // Try to safely access layer groups with fallbacks
    const layerGroups = projectData.layer_groups || projectData.layerGroups || [];

    if (!Array.isArray(layerGroups)) {
        console.warn('[LayerControl] layerGroups is not an array:', layerGroups);
        return (
            <Paper sx={{ p: 2, width: 250 }}>
                <Typography color="error">Layer groups data is invalid</Typography>
                <pre style={{ fontSize: '10px', maxHeight: '150px', overflow: 'auto' }}>
          {JSON.stringify(projectData, null, 2)}
        </pre>
            </Paper>
        );
    }

    if (layerGroups.length === 0) {
        console.warn('[LayerControl] No layer groups found in project data');
        return (
            <Paper sx={{ p: 2, width: 250 }}>
                <Typography>No layers available</Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 2, width: 250, maxHeight: '70vh', overflow: 'auto' }}>
            <Typography variant="subtitle1" gutterBottom>Layers</Typography>
            <Divider sx={{ mb: 1 }} />

            {layerGroups.map((group: any) => {
                // Safely access layers with fallback
                const layers = group.layers || [];

                return (
                    <Box key={group.id} sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                            {group.name || `Group ${group.id}`}
                        </Typography>

                        {Array.isArray(layers) && layers.length > 0 ? (
                            layers.map((layer: any) => (
                                <Box
                                    key={layer.id}
                                    sx={{
                                        pl: 2,
                                        py: 0.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        bgcolor: visibleLayers.has(layer.id) ? 'rgba(0, 0, 0, 0.08)' : 'transparent'
                                    }}
                                >
                                    <Typography variant="body2">
                                        {layer.name || `Layer ${layer.id}`}
                                    </Typography>
                                    <Box
                                        component="button"
                                        sx={{
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            p: '2px 8px',
                                            cursor: 'pointer',
                                            bgcolor: visibleLayers.has(layer.id) ? 'primary.main' : 'white',
                                            color: visibleLayers.has(layer.id) ? 'white' : 'text.primary',
                                        }}
                                        onClick={() => toggleLayer(layer.id, !visibleLayers.has(layer.id))}
                                    >
                                        {visibleLayers.has(layer.id) ? 'Hide' : 'Show'}
                                    </Box>
                                </Box>
                            ))
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
                                No layers in this group
                            </Typography>
                        )}
                    </Box>
                );
            })}

            <Divider sx={{ mt: 2, mb: 1 }} />
            <Typography variant="caption" color="text.secondary">
                Debug: {visibleLayers.size} layers visible
            </Typography>
        </Paper>
    );
};

export default LayerControl;