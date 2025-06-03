// src/components/viewer/StandaloneLayerControl.tsx
import React, { useState, useRef } from 'react';
import { Box, FormControlLabel, Checkbox, Radio, RadioGroup, Typography, IconButton, Collapse } from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LayersIcon from '@mui/icons-material/Layers';
import CloseIcon from '@mui/icons-material/Close';

interface StandaloneLayerControlProps {
    projectData: any;
    visibleLayers: Set<number>;
    activeBasemap: number | null;
    onLayerToggle: (layerId: number) => void;
    onBasemapChange: (basemapId: number) => void;
}

// Style the control to look like Folium's layer control
const ControlContainer = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: 'white',
    borderRadius: '5px',
    boxShadow: '0 1px 5px rgba(0,0,0,0.65)',
    zIndex: 1000,
    fontFamily: '"Helvetica Neue", Arial, Helvetica, sans-serif',
    fontSize: '14px',
    transition: 'all 0.2s ease-in-out',
}));

const ControlToggle = styled(Box)({
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    borderRadius: '5px',
    '&:hover': {
        backgroundColor: '#f4f4f4',
    },
    '& svg': {
        fontSize: '26px',
        color: '#555',
    }
});

const ControlContent = styled(Box)({
    minWidth: '220px',
    maxWidth: '300px',
    maxHeight: '80vh',
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '10px',
    position: 'relative',

    '& .MuiFormControlLabel-root': {
        margin: '2px 0',
        width: '100%',
    },
    '& .MuiCheckbox-root, & .MuiRadio-root': {
        padding: '2px 8px',
        color: '#333',
        '&.Mui-checked': {
            color: '#333',
        }
    },
    '& .MuiFormControlLabel-label': {
        fontSize: '13px',
        fontWeight: 400,
        color: '#333',
        userSelect: 'none',
    }
});

const SectionHeader = styled(Typography)({
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#333',
    margin: '12px 0 6px 0',
    borderBottom: '1px solid #ddd',
    paddingBottom: '4px',
});

const LayerGroupContainer = styled(Box)({
    marginBottom: '8px',
});

const LayerGroupHeader = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '4px 0',
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: '#f5f5f5',
        marginLeft: '-4px',
        marginRight: '-4px',
        paddingLeft: '4px',
        paddingRight: '4px',
    }
});

const LayerGroupTitle = styled(Typography)({
    fontSize: '13px',
    fontWeight: 600,
    color: '#444',
    userSelect: 'none',
    flex: 1,
});

const LayerGroupContent = styled(Box)({
    paddingLeft: '16px',
});

const StandaloneLayerControl: React.FC<StandaloneLayerControlProps> = ({
                                                                           projectData,
                                                                           visibleLayers,
                                                                           activeBasemap,
                                                                           onLayerToggle,
                                                                           onBasemapChange,
                                                                       }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isManuallyExpanded, setIsManuallyExpanded] = useState(false);
    const collapseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<Set<number>>(() => {
        // Expand the first group by default
        if (projectData?.layer_groups && projectData.layer_groups.length > 0) {
            return new Set([projectData.layer_groups[0].id]);
        }
        return new Set();
    });

    // Clear any existing timeout
    const clearCollapseTimeout = () => {
        if (collapseTimeoutRef.current) {
            clearTimeout(collapseTimeoutRef.current);
            collapseTimeoutRef.current = null;
        }
    };

    // Auto-expand on hover if collapsed
    const handleMouseEnter = () => {
        clearCollapseTimeout();
        if (!isExpanded) {
            setIsExpanded(true);
            setIsManuallyExpanded(false);
        }
    };

    const handleMouseLeave = () => {
        // Only auto-collapse if it wasn't manually expanded
        if (!isManuallyExpanded && isExpanded) {
            collapseTimeoutRef.current = setTimeout(() => {
                setIsExpanded(false);
            }, 400);
        }
    };

    const toggleLayerGroup = (groupId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(groupId)) {
                newSet.delete(groupId);
            } else {
                newSet.add(groupId);
            }
            return newSet;
        });
    };

    const handleControlClick = (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        clearCollapseTimeout();
        const newExpanded = !isExpanded;
        setIsExpanded(newExpanded);
        setIsManuallyExpanded(newExpanded);
    };

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            clearCollapseTimeout();
        };
    }, []);

    return (
        <ControlContainer
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {!isExpanded ? (
                <ControlToggle onClick={handleControlClick}>
                    <LayersIcon />
                </ControlToggle>
            ) : (
                <ControlContent>
                    {/* Close button for manually expanded state */}
                    {isManuallyExpanded && (
                        <IconButton
                            size="small"
                            onClick={handleControlClick}
                            sx={{
                                position: 'absolute',
                                top: '2px',
                                right: '2px',
                                padding: '4px',
                                '& svg': {
                                    fontSize: '18px',
                                }
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    )}

                    {/* Basemaps section */}
                    {projectData.basemaps && projectData.basemaps.length > 0 && (
                        <>
                            <SectionHeader sx={{ marginTop: isManuallyExpanded ? '24px' : '12px' }}>
                                Base Layers
                            </SectionHeader>
                            <RadioGroup
                                value={activeBasemap || ''}
                                onChange={(e) => onBasemapChange(Number(e.target.value))}
                            >
                                {projectData.basemaps.map((basemap: any) => (
                                    <FormControlLabel
                                        key={basemap.id}
                                        value={basemap.id}
                                        control={<Radio size="small" />}
                                        label={basemap.name}
                                    />
                                ))}
                            </RadioGroup>
                        </>
                    )}

                    {/* Overlays section with layer groups */}
                    <SectionHeader
                        sx={{
                            marginTop: (!projectData.basemaps || projectData.basemaps.length === 0) && isManuallyExpanded
                                ? '24px'
                                : undefined
                        }}
                    >
                        Overlays
                    </SectionHeader>
                    {projectData.layer_groups?.map((group: any) => (
                        <LayerGroupContainer key={group.id}>
                            <LayerGroupHeader onClick={(e) => toggleLayerGroup(group.id, e)}>
                                <LayerGroupTitle>{group.name}</LayerGroupTitle>
                                <IconButton size="small" sx={{ padding: '2px' }}>
                                    {expandedGroups.has(group.id) ?
                                        <ExpandLessIcon sx={{ fontSize: '18px' }} /> :
                                        <ExpandMoreIcon sx={{ fontSize: '18px' }} />
                                    }
                                </IconButton>
                            </LayerGroupHeader>

                            <Collapse in={expandedGroups.has(group.id)}>
                                <LayerGroupContent>
                                    {group.layers?.map((layer: any) => (
                                        <FormControlLabel
                                            key={layer.id}
                                            control={
                                                <Checkbox
                                                    checked={visibleLayers.has(layer.id)}
                                                    onChange={() => onLayerToggle(layer.id)}
                                                    size="small"
                                                />
                                            }
                                            label={layer.name}
                                        />
                                    ))}
                                </LayerGroupContent>
                            </Collapse>
                        </LayerGroupContainer>
                    ))}
                </ControlContent>
            )}
        </ControlContainer>
    );
};

export default StandaloneLayerControl;