// src/components/map/controls/BasemapControl.tsx
import React from 'react';
import {
    Box,
    SpeedDial,
    SpeedDialAction,
    Typography
} from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import { useMap } from '../../../context/MapContext';

const BasemapControl: React.FC = () => {
    const { projectData, currentBasemap, changeBasemap } = useMap();
    const [open, setOpen] = React.useState(false);

    if (!projectData) return null;

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleBasemapSelect = (basemapId: number) => {
        changeBasemap(basemapId);
        handleClose();
    };

    // Get the selected basemap
    const selectedBasemap = projectData.basemaps.find(basemap => basemap.id === currentBasemap);

    return (
        <Box>
            <SpeedDial
                ariaLabel="Basemap Selector"
                icon={
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                    >
                        <MapIcon />
                        <Typography variant="caption" fontSize={9}>
                            {selectedBasemap?.name.split(' ').slice(-1)[0] || 'Basemap'}
                        </Typography>
                    </Box>
                }
                onClose={handleClose}
                onOpen={handleOpen}
                open={open}
                direction="up"
                sx={{
                    '& .MuiSpeedDial-fab': {
                        width: 60,
                        height: 60,
                    }
                }}
            >
                {projectData.basemaps.map((basemap) => (
                    <SpeedDialAction
                        key={basemap.id}
                        icon={
                            <Box
                                display="flex"
                                flexDirection="column"
                                alignItems="center"
                                position="relative"
                            >
                                <Box
                                    width={40}
                                    height={26}
                                    border="1px solid #ccc"
                                    borderRadius="2px"
                                    bgcolor={!basemap.url_template ? 'white' : 'transparent'}
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                    mb={0.5}
                                >
                                    {basemap.url_template ? (
                                        basemap.provider === 'google' ? (
                                            basemap.url_template.includes('lyrs=s') ? (
                                                <Box
                                                    component="img"
                                                    src="https://cdn-icons-png.flaticon.com/512/2411/2411600.png"
                                                    alt="Satellite"
                                                    width={24}
                                                    height={24}
                                                />
                                            ) : (
                                                <Box
                                                    component="img"
                                                    src="https://cdn-icons-png.flaticon.com/512/854/854878.png"
                                                    alt="Map"
                                                    width={24}
                                                    height={24}
                                                />
                                            )
                                        ) : (
                                            <MapIcon fontSize="small" />
                                        )
                                    ) : (
                                        <Box
                                            component="span"
                                            fontSize={10}
                                        >
                                            White
                                        </Box>
                                    )}
                                </Box>
                                <Typography variant="caption" fontSize={8} textAlign="center">
                                    {basemap.name.split(' ').slice(-1)[0]}
                                </Typography>
                                {basemap.id === currentBasemap && (
                                    <Box
                                        position="absolute"
                                        top={-5}
                                        right={-5}
                                        width={14}
                                        height={14}
                                        borderRadius="50%"
                                        bgcolor="primary.main"
                                        display="flex"
                                        justifyContent="center"
                                        alignItems="center"
                                        color="white"
                                        fontSize={10}
                                    >
                                        ✓
                                    </Box>
                                )}
                            </Box>
                        }
                        tooltipTitle={basemap.name}
                        onClick={() => handleBasemapSelect(basemap.id)}
                    />
                ))}
            </SpeedDial>
        </Box>
    );
};

export default BasemapControl;