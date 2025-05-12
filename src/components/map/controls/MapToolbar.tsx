import React from 'react';
import {
    Box,
    SpeedDial,
    SpeedDialAction,
    SpeedDialIcon,
    Tooltip
} from '@mui/material';
import MeasureIcon from '@mui/icons-material/Straighten';
import PrintIcon from '@mui/icons-material/Print';
import ExportIcon from '@mui/icons-material/GetApp';
import SearchIcon from '@mui/icons-material/Search';
import FullscreenIcon from '@mui/icons-material/Fullscreen';

interface MapTool {
    id: number;
    name: string;
    type: string;
    icon: JSX.Element;
    action: () => void;
}

interface MapToolbarProps {
    tools: any[];
    onToolActivate?: (toolId: number) => void;
}

const MapToolbar: React.FC<MapToolbarProps> = ({ tools, onToolActivate }) => {
    const [open, setOpen] = React.useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    // Map of tool types to icons
    const toolIcons: { [key: string]: JSX.Element } = {
        measure_distance: <MeasureIcon />,
        print: <PrintIcon />,
        export_data: <ExportIcon />,
        search: <SearchIcon />,
        fullscreen: <FullscreenIcon />
    };

    // Default tools if none provided
    const defaultTools: MapTool[] = [
        {
            id: 1,
            name: 'Measure',
            type: 'measure_distance',
            icon: toolIcons.measure_distance,
            action: () => console.log('Measure tool activated')
        },
        {
            id: 2,
            name: 'Print',
            type: 'print',
            icon: toolIcons.print,
            action: () => console.log('Print tool activated')
        },
        {
            id: 3,
            name: 'Export',
            type: 'export_data',
            icon: toolIcons.export_data,
            action: () => console.log('Export tool activated')
        }
    ];

    // Use provided tools or default
    const availableTools = tools.length > 0
        ? tools.map(tool => ({
            id: tool.id,
            name: tool.name,
            type: tool.tool_type,
            icon: toolIcons[tool.tool_type] || <SearchIcon />,
            action: () => {
                if (onToolActivate) {
                    onToolActivate(tool.id);
                }
                handleClose();
            }
        }))
        : defaultTools;

    return (
        <Box position="absolute" bottom={30} left={10} zIndex={1000}>
            <SpeedDial
                ariaLabel="Map Tools"
                icon={<SpeedDialIcon />}
                onClose={handleClose}
                onOpen={handleOpen}
                open={open}
                direction="up"
            >
                {availableTools.map((tool) => (
                    <SpeedDialAction
                        key={tool.id}
                        icon={tool.icon}
                        tooltipTitle={tool.name}
                        onClick={tool.action}
                    />
                ))}
            </SpeedDial>
        </Box>
    );
};

export default MapToolbar;