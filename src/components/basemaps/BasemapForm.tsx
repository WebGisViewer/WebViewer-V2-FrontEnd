// src/components/basemaps/BasemapForm.tsx
import React, { useState, useEffect, useRef } from 'react';
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
    Card,
    CardContent,
    Tooltip,
    IconButton,
} from '@mui/material';
import {
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    Info as InfoIcon,
    NetworkCheck as TestConnectionIcon,
    Upload as UploadIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { getBasemap, createBasemap, updateBasemap, testBasemapConnection } from '../../services/basemapService';
import { Basemap } from '../../types/map.types';
import { fileToDataURL } from '../../utils/download';

const BasemapForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(id ? true : false);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<{
        success: boolean;
        message: string;
    } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Preview state
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Basemap form data
    const [formData, setFormData] = useState<Partial<Basemap>>({
        name: '',
        description: '',
        provider: 'openstreetmap',
        url_template: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors',
        options: {
            maxZoom: 19,
            subdomains: ['a', 'b', 'c'],
        },
        min_zoom: 0,
        max_zoom: 19,
        is_system: false,
    });

    useEffect(() => {
        if (id) {
            loadBasemap(parseInt(id));
        }
    }, [id]);

    const loadBasemap = async (basemapId: number) => {
        setLoading(true);
        setError(null);

        try {
            const basemap = await getBasemap(basemapId);
            setFormData(basemap);

            if (basemap.preview_image_base64) {
                setPreviewImage(basemap.preview_image_base64);
            }
        } catch (err) {
            setError('Failed to load basemap details. Please try again.');
            console.error('Error loading basemap:', err);
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

    const handleOptionChange = (name: string, value: never) => {
        setFormData((prev) => ({
            ...prev,
            options: {
                ...prev.options,
                [name]: value,
            },
        }));
    };

    const handleProviderChange = (provider: string) => {
        setFormData((prev) => {
            let newFormData = { ...prev, provider };

            // Set default URL template based on provider
            switch (provider) {
                case 'openstreetmap':
                    newFormData = {
                        ...newFormData,
                        url_template: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        attribution: '© OpenStreetMap contributors',
                        options: {
                            ...prev.options,
                            maxZoom: 19,
                            subdomains: ['a', 'b', 'c'],
                        },
                    };
                    break;
                case 'mapbox':
                    newFormData = {
                        ...newFormData,
                        url_template: 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
                        attribution: '© Mapbox',
                        options: {
                            ...prev.options,
                            id: 'mapbox/streets-v11',
                            accessToken: 'YOUR_MAPBOX_TOKEN',
                            tileSize: 512,
                            zoomOffset: -1,
                            maxZoom: 19,
                        },
                    };
                    break;
                case 'google':
                    newFormData = {
                        ...newFormData,
                        url_template: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
                        attribution: '© Google',
                        options: {
                            ...prev.options,
                            maxZoom: 20,
                        },
                    };
                    break;
                case 'custom':
                    // Keep current URL and attribution for custom providers
                    break;
            }

            return newFormData;
        });
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];

        try {
            const dataUrl = await fileToDataURL(file);
            setPreviewImage(dataUrl);
            setFormData((prev) => ({
                ...prev,
                preview_image_base64: dataUrl,
            }));
        } catch (err) {
            console.error('Error processing file:', err);
            setError('Failed to process the selected file.');
        }

        // Reset the file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleTestConnection = async () => {
        if (!formData.url_template) {
            setError('URL template is required for testing connection.');
            return;
        }

        setTesting(true);
        setError(null);
        setSuccess(null);
        setConnectionStatus(null);

        try {
            const result = id
                ? await testBasemapConnection(parseInt(id))
                : await testBasemapConnection(0, {
                    url_template: formData.url_template,
                    options: formData.options,
                });

            setConnectionStatus({
                success: true,
                message: `Connection successful: ${result.url_tested}`,
            });
        } catch (err) {
            console.error('Error testing connection:', err);
            setConnectionStatus({
                success: false,
                message: 'Connection test failed. Please check your URL template and options.',
            });
        } finally {
            setTesting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            if (id) {
                // Update existing basemap
                await updateBasemap(parseInt(id), formData);
                setSuccess('Basemap updated successfully!');
            } else {
                // Create new basemap
                const createdBasemap = await createBasemap(formData);
                setSuccess('Basemap created successfully!');

                // Redirect to edit page after a short delay
                setTimeout(() => {
                    navigate(`/components/basemaps/${createdBasemap.id}/edit`);
                }, 1500);
            }
        } catch (err) {
            setError('Failed to save basemap. Please check your input and try again.');
            console.error('Error saving basemap:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate('/components/basemaps');
    };

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
                    {id ? 'Edit Basemap' : 'Create Basemap'}
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
                        {saving ? 'Saving...' : 'Save Basemap'}
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

            {connectionStatus && (
                <Alert severity={connectionStatus.success ? 'success' : 'error'} sx={{ mb: 3 }}>
                    {connectionStatus.message}
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Basic Information
                        </Typography>

                        <TextField
                            label="Basemap Name"
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
                            rows={2}
                            margin="normal"
                        />

                        <FormControl fullWidth margin="normal">
                            <InputLabel id="provider-label">Provider</InputLabel>
                            <Select
                                labelId="provider-label"
                                id="provider"
                                name="provider"
                                value={formData.provider}
                                label="Provider"
                                onChange={(e) => handleProviderChange(e.target.value as string)}
                                required
                            >
                                <MenuItem value="openstreetmap">OpenStreetMap</MenuItem>
                                <MenuItem value="mapbox">Mapbox</MenuItem>
                                <MenuItem value="google">Google Maps</MenuItem>
                                <MenuItem value="custom">Custom</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Attribution"
                            name="attribution"
                            value={formData.attribution}
                            onChange={handleInputChange}
                            fullWidth
                            margin="normal"
                            placeholder="e.g., © OpenStreetMap contributors"
                            helperText="Required attribution for the map provider"
                        />

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="h6" gutterBottom>
                            Tile Configuration
                        </Typography>

                        <TextField
                            label="URL Template"
                            name="url_template"
                            value={formData.url_template}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            margin="normal"
                            placeholder="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            helperText="URL template for the tile service. {x}, {y}, {z} are placeholders for coordinates and zoom level."
                        />

                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                startIcon={testing ? <CircularProgress size={20} /> : <TestConnectionIcon />}
                                onClick={handleTestConnection}
                                disabled={testing || !formData.url_template}
                            >
                                {testing ? 'Testing...' : 'Test Connection'}
                            </Button>
                        </Box>

                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Min Zoom"
                                    name="min_zoom"
                                    type="number"
                                    value={formData.min_zoom}
                                    onChange={handleInputChange}
                                    fullWidth
                                    margin="normal"
                                    InputProps={{ inputProps: { min: 0, max: 25 } }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Max Zoom"
                                    name="max_zoom"
                                    type="number"
                                    value={formData.max_zoom}
                                    onChange={handleInputChange}
                                    fullWidth
                                    margin="normal"
                                    InputProps={{ inputProps: { min: 0, max: 25 } }}
                                />
                            </Grid>
                        </Grid>

                        {formData.provider === 'openstreetmap' && (
                            <TextField
                                label="Subdomains"
                                value={formData.options?.subdomains?.join(', ') || ''}
                                onChange={(e) => handleOptionChange(
                                    'subdomains',
                                    e.target.value.split(',').map(s => s.trim())
                                )}
                                fullWidth
                                margin="normal"
                                helperText="Comma-separated list of subdomains (e.g., a, b, c)"
                            />
                        )}

                        {formData.provider === 'mapbox' && (
                            <>
                                <TextField
                                    label="Style ID"
                                    value={formData.options?.id || ''}
                                    onChange={(e) => handleOptionChange('id', e.target.value)}
                                    fullWidth
                                    margin="normal"
                                    placeholder="mapbox/streets-v11"
                                    helperText="Mapbox style ID (e.g., mapbox/streets-v11, mapbox/satellite-v9)"
                                />
                                <TextField
                                    label="Access Token"
                                    value={formData.options?.accessToken || ''}
                                    onChange={(e) => handleOptionChange('accessToken', e.target.value)}
                                    fullWidth
                                    margin="normal"
                                    placeholder="pk.eyJ1Ijoibm..."
                                    helperText="Your Mapbox access token"
                                />
                            </>
                        )}

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
                                    <Typography variant="body2">System Basemap</Typography>
                                    <Tooltip title="System basemaps are available to all users and cannot be deleted">
                                        <IconButton size="small">
                                            <InfoIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            }
                            sx={{ mt: 2 }}
                        />
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', borderRadius: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Basemap Preview
                            </Typography>

                            <Box
                                sx={{
                                    bgcolor: 'action.hover',
                                    height: 200,
                                    borderRadius: 1,
                                    overflow: 'hidden',
                                    mb: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    ...(previewImage && {
                                        backgroundImage: `url(${previewImage})`,
                                    }),
                                }}
                            >
                                {!previewImage && (
                                    <Typography variant="body2" color="text.secondary">
                                        Upload a preview image
                                    </Typography>
                                )}

                                <Button
                                    component="label"
                                    variant="contained"
                                    startIcon={<UploadIcon />}
                                    sx={{
                                        position: 'absolute',
                                        bottom: 8,
                                        right: 8,
                                    }}
                                >
                                    Upload
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={handleFileSelect}
                                    />
                                </Button>
                            </Box>

                            <Typography variant="body2" color="text.secondary">
                                The preview image helps users identify the basemap in the selection interface.
                            </Typography>

                            <Box sx={{ mt: 4 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Popular Basemap Providers
                                </Typography>
                                <Typography variant="body2" paragraph>
                                    • OpenStreetMap: Free and widely used, good for general mapping
                                </Typography>
                                <Typography variant="body2" paragraph>
                                    • Mapbox: High quality maps with customization options (requires API key)
                                </Typography>
                                <Typography variant="body2" paragraph>
                                    • Google Maps: Familiar mapping style (requires API key)
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default BasemapForm;