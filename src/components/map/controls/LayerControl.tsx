// src/components/map/controls/LayerControl.tsx
import React from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Switch,
    Collapse,
    Typography,
    IconButton,
    Paper,
    Divider
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import LayersIcon from '@mui/icons-material/Layers';
import { useMap } from '../../../context/MapContext';

const LayerControl: React.FC = () => {
    const { projectData, visibleLayers, toggleLayer } = useMap();

    // State for expanded groups
    const [expandedGroups, setExpandedGroups] = React.useState<{ [key: number]: boolean }>(() => {
        // Initialize with groups that should be expanded by default
        const expanded: { [key: number]: boolean } = {};
        if (projectData) {
            projectData.layerGroups.forEach(group => {
                expanded[group.id] = group.is_expanded !== false;
            });
        }
        return expanded;
    });

    // State for control expansion
    const [controlExpanded, setControlExpanded] = React.useState(true);

    if (!projectData) return null;

    // Toggle layer group expansion
    const handleGroupToggle = (groupId: number) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    };

    // Toggle layer visibility
    const handleLayerToggle = (layerId: number) => {
        toggleLayer(layerId, !visibleLayers.has(layerId));
    };

    // Toggle the entire control
    const toggleControlExpansion = () => {
        setControlExpanded(prev => !prev);
    };

    return (
        <Paper sx={{ maxWidth: 320, maxHeight: 'calc(100vh - 100px)', overflow: 'hidden' }}>
            {/* Header */}
            <Box
                display="flex"
                alignItems="center"
                p={1}
                px={2}
                bgcolor="primary.main"
                color="primary.contrastText"
            >
                <LayersIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1" flexGrow={1}>
                    Layers
                </Typography>
                <IconButton
                    size="small"
                    onClick={toggleControlExpansion}
                    sx={{ color: 'inherit' }}
                >
                    {controlExpanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
            </Box>

            <Collapse in={controlExpanded} timeout="auto">
                <Box
                    sx={{
                        overflowY: 'auto',
                        maxHeight: 'calc(100vh - 170px)'
                    }}
                >
                    <List sx={{ width: '100%' }} component="nav" dense>
                        {projectData.layerGroups.map((group) => (
                            <React.Fragment key={group.id}>
                                {/* Layer Group Item */}
                                <ListItem
                                    button
                                    onClick={() => handleGroupToggle(group.id)}
                                    sx={{ bgcolor: 'grey.100' }}
                                >
                                    <ListItemText
                                        primary={group.name}
                                        primaryTypographyProps={{
                                            variant: 'subtitle2',
                                            fontWeight: 'medium'
                                        }}
                                    />
                                    {expandedGroups[group.id] ? <ExpandLess /> : <ExpandMore />}
                                </ListItem>

                                {/* Layer Items */}
                                <Collapse in={expandedGroups[group.id]} timeout="auto">
                                    <List component="div" disablePadding dense>
                                        {group.layers.map((layer) => (
                                            <ListItem
                                                key={layer.id}
                                                sx={{
                                                    pl: 4,
                                                    '&:hover': {
                                                        bgcolor: 'rgba(0, 0, 0, 0.04)'
                                                    }
                                                }}
                                            >
                                                <ListItemIcon sx={{ minWidth: 36 }}>
                                                    <Box
                                                        sx={{
                                                            width: 16,
                                                            height: 16,
                                                            borderRadius: '50%',
                                                            bgcolor: layer.style?.color || layer.style?.fillColor || '#808080',
                                                            border: '1px solid',
                                                            borderColor: layer.style?.color || '#000'
                                                        }}
                                                    />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={layer.name}
                                                    primaryTypographyProps={{
                                                        fontSize: '0.875rem',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                />
                                                <Switch
                                                    edge="end"
                                                    size="small"
                                                    checked={visibleLayers.has(layer.id)}
                                                    onChange={() => handleLayerToggle(layer.id)}
                                                    sx={{
                                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                                            color: 'primary.main'
                                                        }
                                                    }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Collapse>
                                <Divider />
                            </React.Fragment>
                        ))}
                    </List>
                </Box>
            </Collapse>
        </Paper>
    );
};

export default LayerControl;