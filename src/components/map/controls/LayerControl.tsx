// src/components/map/controls/LayerControl.tsx

import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Checkbox,
    Collapse,
    IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LayersIcon from '@mui/icons-material/Layers';
import { useMap } from '../../../context/MapContext';

const LayerControl: React.FC = () => {
    const { projectData, layerVisibility, toggleLayerVisibility } = useMap();
    const [expandedGroups, setExpandedGroups] = React.useState<Record<number, boolean>>({});

    // If no project data, don't render
    if (!projectData || !projectData.layer_groups) {
        return null;
    }

    // Toggle layer group expansion
    const toggleGroupExpansion = (groupId: number) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    };

    // Initialize group expansion state if not already set
    React.useEffect(() => {
        const initialExpandedState: Record<number, boolean> = {};
        projectData.layer_groups.forEach(group => {
            initialExpandedState[group.id] = group.is_expanded_by_default;
        });
        setExpandedGroups(initialExpandedState);
    }, [projectData.layer_groups]);

    return (
        <Card sx={{ minWidth: 250, maxWidth: 300, opacity: 0.9 }}>
            <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                    <LayersIcon sx={{ mr: 1 }} />
                    Layers
                </Typography>

                {projectData.layer_groups.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        No layers available
                    </Typography>
                ) : (
                    <List disablePadding dense>
                        {projectData.layer_groups.map(group => (
                            <React.Fragment key={group.id}>
                                <ListItem
                                    button
                                    onClick={() => toggleGroupExpansion(group.id)}
                                    sx={{
                                        bgcolor: 'background.paper',
                                        borderRadius: 1,
                                        mb: 0.5,
                                        pl: 1
                                    }}
                                >
                                    <ListItemText
                                        primary={group.name}
                                        primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                                    />
                                    <IconButton edge="end" size="small">
                                        {expandedGroups[group.id] ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                                    </IconButton>
                                </ListItem>

                                <Collapse in={expandedGroups[group.id]} timeout="auto">
                                    <List disablePadding dense>
                                        {group.layers.map(layer => (
                                            <ListItem
                                                key={layer.id}
                                                button
                                                onClick={() => toggleLayerVisibility(layer.id)}
                                                sx={{ pl: 3 }}
                                            >
                                                <ListItemIcon sx={{ minWidth: 36 }}>
                                                    <Checkbox
                                                        edge="start"
                                                        checked={!!layerVisibility[layer.id]}
                                                        tabIndex={-1}
                                                        disableRipple
                                                        size="small"
                                                    />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={layer.name}
                                                    primaryTypographyProps={{ variant: 'body2' }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Collapse>
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </CardContent>
        </Card>
    );
};

export default LayerControl;