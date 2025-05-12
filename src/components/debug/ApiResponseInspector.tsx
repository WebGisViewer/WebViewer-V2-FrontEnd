// src/components/debug/ApiResponseInspector.tsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Button,
    TextField
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { projectService } from '../../services';

const ApiResponseInspector: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any | null>(null);
    const [projectId, setProjectId] = useState<string>('10'); // Default to ID 10

    const fetchProjectData = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await projectService.getProjectConstructor(Number(projectId));
            console.log('API Response:', response);
            setData(response);
        } catch (err: any) {
            console.error('Error fetching project data:', err);
            setError(err.message || 'Error fetching project data');
        } finally {
            setLoading(false);
        }
    };

    // Format data for display
    const formatDataSection = (title: string, data: any) => {
        if (!data) return null;

        return (
            <Accordion key={title} defaultExpanded={false}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">
                        {title} {Array.isArray(data) ? `(${data.length})` : ''}
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Box
                        component="pre"
                        sx={{
                            fontSize: '12px',
                            maxHeight: 300,
                            overflow: 'auto',
                            p: 2,
                            bgcolor: '#f5f5f5',
                            borderRadius: 1
                        }}
                    >
                        {JSON.stringify(data, null, 2)}
                    </Box>
                </AccordionDetails>
            </Accordion>
        );
    };

    return (
        <Box maxWidth={800} mx="auto" my={4}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                    API Response Inspector
                </Typography>

                <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <TextField
                        label="Project ID"
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        size="small"
                        sx={{ width: 100 }}
                    />
                    <Button
                        variant="contained"
                        onClick={fetchProjectData}
                        disabled={loading}
                    >
                        Fetch Project Data
                    </Button>
                </Box>

                {loading && (
                    <Box display="flex" alignItems="center" gap={2} my={3}>
                        <CircularProgress size={24} />
                        <Typography>Loading project data...</Typography>
                    </Box>
                )}

                {error && (
                    <Box
                        p={2}
                        mb={3}
                        bgcolor="#ffebee"
                        borderRadius={1}
                        border="1px solid #f44336"
                    >
                        <Typography color="error">{error}</Typography>
                    </Box>
                )}

                {data && (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Project Constructor Response:
                        </Typography>

                        {formatDataSection("Project", data.project)}

                        {/* Check both naming conventions */}
                        {formatDataSection(
                            "Layer Groups",
                            data.layer_groups || data.layerGroups
                        )}

                        {formatDataSection("Basemaps", data.basemaps)}

                        {formatDataSection("Tools", data.tools)}

                        <Typography variant="subtitle2" mt={3} mb={1}>
                            Raw API Response
                        </Typography>

                        <Button
                            variant="outlined"
                            onClick={() => navigator.clipboard.writeText(JSON.stringify(data, null, 2))}
                            size="small"
                            sx={{ mb: 2 }}
                        >
                            Copy Raw Data
                        </Button>

                        <Box
                            component="pre"
                            sx={{
                                fontSize: '12px',
                                maxHeight: 400,
                                overflow: 'auto',
                                p: 2,
                                bgcolor: '#f5f5f5',
                                borderRadius: 1
                            }}
                        >
                            {JSON.stringify(data, null, 2)}
                        </Box>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default ApiResponseInspector;