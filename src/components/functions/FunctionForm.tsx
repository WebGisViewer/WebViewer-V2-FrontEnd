// src/components/functions/FunctionForm.tsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    FormControlLabel,
    Switch,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Alert,
    CircularProgress,
    Divider,
    Tooltip,
    IconButton,
    Card,
    CardContent,
} from '@mui/material';
import {
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    Info as InfoIcon,
    Code as CodeIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import MonacoEditor from 'react-monaco-editor';
import { getFunction, getFunctionCode, createFunction, updateFunction } from '../../services/functionService';
import { Function as MapFunction } from '../../types/function.types';

const defaultFunctionCode = `/**
 * Example layer function
 * @param {Object} layer - The layer to process
 * @param {Object} options - Function options
 * @returns {Object} - The processed layer
 */
function process(layer, options) {
  // Implement your function logic here
  return layer;
}

// For clustering functions
function cluster(points, options) {
  // Implement clustering logic
  return points;
}

// For styling functions
function style(feature, options) {
  // Implement styling logic
  return {
    color: "#ff0000",
    weight: 2,
    opacity: 0.8,
    fillOpacity: 0.4
  };
}`;

const FunctionForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(id ? true : false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Function form data
    const [formData, setFormData] = useState<Partial<MapFunction>>({
        name: '',
        description: '',
        function_type: 'clustering',
        function_config: {
            radius: 80,
            maxZoom: 16
        },
        function_code: defaultFunctionCode,
        is_system: false,
    });

    useEffect(() => {
        if (id) {
            loadFunction(parseInt(id));
        }
    }, [id]);

    const loadFunction = async (functionId: number) => {
        setLoading(true);
        setError(null);

        try {
            // Get function details
            const func = await getFunction(functionId);

            // Get function code (separate API call)
            const codeResponse = await getFunctionCode(functionId);

            setFormData({
                ...func,
                function_code: codeResponse.function_code
            });
        } catch (err) {
            setError('Failed to load function details. Please try again.');
            console.error('Error loading function:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
    ) => {
        const { name, value } = e.target;
        if (name) {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSwitchChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [name]: e.target.checked,
        }));
    };

    const handleFunctionConfigChange = (name: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            function_config: {
                ...prev.function_config,
                [name]: value,
            },
        }));
    };

    const handleCodeChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            function_code: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            if (id) {
                // Update existing function
                await updateFunction(parseInt(id), formData);
                setSuccess('Function updated successfully!');
            } else {
                // Create new function
                const createdFunction = await createFunction(formData);
                setSuccess('Function created successfully!');

                // Redirect to edit page after a short delay
                setTimeout(() => {
                    navigate(`/components/functions/${createdFunction.id}/edit`);
                }, 1500);
            }
        } catch (err) {
            setError('Failed to save function. Please check your input and try again.');
            console.error('Error saving function:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate('/components/functions');
    };

    // Function config fields based on function type
    const renderConfigFields = () => {
        const { function_type, function_config } = formData;

        if (function_type === 'clustering') {
            return (
                <>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Cluster Radius"
                            type="number"
                            value={function_config?.radius || 80}
                            onChange={(e) => handleFunctionConfigChange('radius', parseInt(e.target.value))}
                            fullWidth
                            InputProps={{ inputProps: { min: 20, max: 200 } }}
                            helperText="Distance in pixels within which markers will form a cluster"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Max Zoom for Clustering"
                            type="number"
                            value={function_config?.maxZoom || 16}
                            onChange={(e) => handleFunctionConfigChange('maxZoom', parseInt(e.target.value))}
                            fullWidth
                            InputProps={{ inputProps: { min: 1, max: 22 } }}
                            helperText="Maximum zoom level where clustering is applied"
                        />
                    </Grid>
                </>
            );
        }

        if (function_type === 'styling') {
            return (
                <>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Property Field"
                            value={function_config?.propertyField || ''}
                            onChange={(e) => handleFunctionConfigChange('propertyField', e.target.value)}
                            fullWidth
                            helperText="Feature property used for styling"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Default Color"
                            value={function_config?.defaultColor || '#3388FF'}
                            onChange={(e) => handleFunctionConfigChange('defaultColor', e.target.value)}
                            fullWidth
                            helperText="Default color for features"
                        />
                    </Grid>
                </>
            );
        }

        if (function_type === 'analysis') {
            return (
                <>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Analysis Type"
                            select
                            value={function_config?.analysisType || 'density'}
                            onChange={(e) => handleFunctionConfigChange('analysisType', e.target.value)}
                            fullWidth
                            helperText="Type of analysis to perform"
                        >
                            <MenuItem value="density">Density</MenuItem>
                            <MenuItem value="distance">Distance</MenuItem>
                            <MenuItem value="hotspot">Hotspot</MenuItem>
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Radius"
                            type="number"
                            value={function_config?.radius || 500}
                            onChange={(e) => handleFunctionConfigChange('radius', parseInt(e.target.value))}
                            fullWidth
                            InputProps={{ inputProps: { min: 50, max: 5000 } }}
                            helperText="Analysis radius in meters"
                        />
                    </Grid>
                </>
            );
        }

        return (
            <Grid item xs={12}>
                <Alert severity="info">
                    Configure the function parameters in the function code.
                </Alert>
            </Grid>
        );
    };

    // Function type options
    const functionTypes = [
        { value: 'clustering', label: 'Clustering', description: 'Group nearby features into clusters' },
        { value: 'styling', label: 'Styling', description: 'Apply dynamic styles to features' },
        { value: 'analysis', label: 'Analysis', description: 'Perform spatial analysis on features' },
        { value: 'filter', label: 'Filter', description: 'Filter features based on properties' },
        { value: 'transformation', label: 'Transformation', description: 'Transform feature geometries or properties' },
    ];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                }}
            >
                <Typography variant="h4" component="h1">
                    {id ? 'Edit Function' : 'Create Function'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Function'}
                    </Button>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    {success}
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Basic Information
                        </Typography>

                        <TextField
                            label="Function Name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            margin="normal"
                        />

                        <TextField
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            fullWidth
                            multiline
                            rows={3}
                            margin="normal"
                        />

                        <FormControl fullWidth margin="normal">
                            <InputLabel id="function-type-label">Function Type</InputLabel>
                            <Select
                                labelId="function-type-label"
                                id="function-type"
                                name="function_type"
                                value={formData.function_type}
                                label="Function Type"
                                onChange={handleInputChange}
                                required
                            >
                                {functionTypes.map(type => (
                                    <MenuItem key={type.value} value={type.value}>
                                        {type.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                            {functionTypes.find(t => t.value === formData.function_type)?.description}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="h6" gutterBottom>
                            Function Configuration
                        </Typography>

                        <Grid container spacing={2}>
                            {renderConfigFields()}
                        </Grid>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.is_system || false}
                                    onChange={handleSwitchChange('is_system')}
                                    color="primary"
                                />
                            }
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="body2">System Function</Typography>
                                    <Tooltip title="System functions are available to all users and cannot be deleted">
                                        <IconButton size="small">
                                            <InfoIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            }
                            sx={{ mt: 2 }}
                        />
                    </Paper>

                    <Card sx={{ mt: 3, borderRadius: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <CodeIcon sx={{ mr: 1 }} />
                                JavaScript Reference
                            </Typography>

                            <Typography variant="body2" paragraph>
                                Your function should implement one of these patterns based on its type:
                            </Typography>

                            <Box component="pre" sx={{
                                bgcolor: 'background.paper',
                                p: 2,
                                borderRadius: 1,
                                overflowX: 'auto',
                                fontSize: '0.75rem',
                                border: '1px solid',
                                borderColor: 'divider',
                            }}>
                                {`// Clustering function
function cluster(points, options) {
  // Return processed points
  return points;
}

// Styling function
function style(feature, options) {
  // Return style object
  return { color: "#ff0000" };
}

// Analysis function
function analyze(layer, options) {
  // Return processed data
  return result;
}`}
                            </Box>

                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                Functions receive layer data and configuration options. They should return the processed data in the appropriate format.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                        <Box sx={{ p: 2, bgcolor: 'grey.100' }}>
                            <Typography variant="subtitle1">
                                Function Code
                            </Typography>
                        </Box>

                        <Box sx={{ height: 500 }}>
                            <MonacoEditor
                                language="javascript"
                                theme="vs-light"
                                value={formData.function_code || defaultFunctionCode}
                                onChange={handleCodeChange}
                                options={{
                                    selectOnLineNumbers: true,
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                }}
                            />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default FunctionForm;