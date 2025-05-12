// src/components/markers/MarkerForm.tsx
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
    InputAdornment,
    Tooltip,
    IconButton,
} from '@mui/material';
import {
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    Info as InfoIcon,
    Upload as UploadIcon,
    Image as ImageIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { HexColorPicker } from 'react-colorful';
import { getMarker, createMarker, updateMarker, uploadSvgMarker } from '../../services/markerService';
import { Marker } from '../../types/marker.types';
import { fileToDataURL } from '../../utils/download';

const MarkerForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(id ? true : false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const colorPickerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Preview state
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Marker form data
    const [formData, setFormData] = useState<Partial<Marker>>({
        name: '',
        description: '',
        icon_type: 'image',
        icon_url: '',
        default_size: 32,
        default_anchor: 'bottom',
        default_color: '#FF5500',
        default_options: {},
        is_system: false,
        tags: '',
        category: '',
    });

    useEffect(() => {
        if (id) {
            loadMarker(parseInt(id));
        }
    }, [id]);

    // Close color picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
                setShowColorPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const loadMarker = async (markerId: number) => {
        setLoading(true);
        setError(null);

        try {
            const marker = await getMarker(markerId);
            setFormData(marker);

            if (marker.icon_url) {
                setPreviewImage(marker.icon_url);
            } else if (marker.icon_data_base64) {
                setPreviewImage(marker.icon_data_base64);
            }
        } catch (err) {
            setError('Failed to load marker details. Please try again.');
            console.error('Error loading marker:', err);
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

    const handleOptionChange = (name: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            default_options: {
                ...prev.default_options,
                [name]: value,
            },
        }));
    };

    const handleColorChange = (color: string) => {
        setFormData((prev) => ({
            ...prev,
            default_color: color,
        }));
    };

    const handleIconTypeChange = (iconType: string) => {
        setFormData((prev) => ({
            ...prev,
            icon_type: iconType,
            // Reset icon URL if changing from image to SVG
            ...(iconType === 'svg' && prev.icon_type === 'image' && { icon_url: '' }),
            // Reset icon data if changing from SVG to image
            ...(iconType === 'image' && prev.icon_type === 'svg' && { icon_data_base64: '' }),
        }));
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];

        try {
            if (formData.icon_type === 'image') {
                // For image uploads, just preview and store the URL
                const dataUrl = await fileToDataURL(file);
                setPreviewImage(dataUrl);

                setFormData((prev) => ({
                    ...prev,
                    icon_url: dataUrl,
                }));
            } else if (formData.icon_type === 'svg') {
                // For SVG uploads, read file content
                const reader = new FileReader();
                reader.onload = (event) => {
                    const content = event.target?.result as string;
                    setPreviewImage(content);

                    setFormData((prev) => ({
                        ...prev,
                        icon_data_base64: content,
                    }));
                };
                reader.readAsDataURL(file);
            }
        } catch (err) {
            console.error('Error processing file:', err);
            setError('Failed to process the selected file.');
        }

        // Reset the file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClearImage = () => {
        setPreviewImage(null);

        setFormData((prev) => ({
            ...prev,
            icon_url: '',
            icon_data_base64: '',
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            if (id) {
                // Update existing marker
                await updateMarker(parseInt(id), formData);
                setSuccess('Marker updated successfully!');
            } else {
                // Create new marker
                const createdMarker = await createMarker(formData);
                setSuccess('Marker created successfully!');

                // Redirect to edit page after a short delay
                setTimeout(() => {
                    navigate(`/components/markers/${createdMarker.id}/edit`);
                }, 1500);
            }
        } catch (err) {
            setError('Failed to save marker. Please check your input and try again.');
            console.error('Error saving marker:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate('/components/markers');
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
                    {id ? 'Edit Marker' : 'Create Marker'}
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
                        {saving ? 'Saving...' : 'Save Marker'}
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
                <Grid item xs={12} md={8}>
                    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Basic Information
                        </Typography>

                        <TextField
                            label="Marker Name"
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

                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    fullWidth
                                    placeholder="e.g., Buildings, Landmarks, Transportation"
                                    helperText="Group related markers together"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Tags"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleInputChange}
                                    fullWidth
                                    placeholder="e.g., house,building,residence"
                                    helperText="Comma-separated tags for searching"
                                />
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="h6" gutterBottom>
                            Marker Configuration
                        </Typography>

                        <FormControl fullWidth margin="normal">
                            <InputLabel id="icon-type-label">Icon Type</InputLabel>
                            <Select
                                labelId="icon-type-label"
                                id="icon-type"
                                name="icon_type"
                                value={formData.icon_type}
                                label="Icon Type"
                                onChange={(e) => handleIconTypeChange(e.target.value as string)}
                                required
                            >
                                <MenuItem value="image">Image</MenuItem>
                                <MenuItem value="svg">SVG</MenuItem>
                            </Select>
                        </FormControl>

                        {formData.icon_type === 'image' && (
                            <TextField
                                label="Icon URL"
                                name="icon_url"
                                value={formData.icon_url}
                                onChange={handleInputChange}
                                fullWidth
                                margin="normal"
                                placeholder="URL to icon image"
                                helperText="Enter a URL or upload an image"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <Button
                                                component="label"
                                                variant="contained"
                                                size="small"
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
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        )}

                        {formData.icon_type === 'svg' && (
                            <Box sx={{ mt: 2 }}>
                                <Button
                                    component="label"
                                    variant="contained"
                                    startIcon={<UploadIcon />}
                                    sx={{ mb: 2 }}
                                >
                                    Upload SVG
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".svg"
                                        hidden
                                        onChange={handleFileSelect}
                                    />
                                </Button>

                                {formData.icon_data_base64 && (
                                    <Alert severity="success" sx={{ mb: 2 }}>
                                        SVG file uploaded successfully
                                    </Alert>
                                )}
                            </Box>
                        )}

                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Default Size"
                                    name="default_size"
                                    type="number"
                                    value={formData.default_size}
                                    onChange={handleInputChange}
                                    fullWidth
                                    InputProps={{ inputProps: { min: 8, max: 128 } }}
                                    helperText="Size in pixels"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel id="anchor-label">Default Anchor</InputLabel>
                                    <Select
                                        labelId="anchor-label"
                                        id="default_anchor"
                                        name="default_anchor"
                                        value={formData.default_anchor}
                                        label="Default Anchor"
                                        onChange={handleInputChange}
                                    >
                                        <MenuItem value="center">Center</MenuItem>
                                        <MenuItem value="top">Top</MenuItem>
                                        <MenuItem value="bottom">Bottom</MenuItem>
                                        <MenuItem value="left">Left</MenuItem>
                                        <MenuItem value="right">Right</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <Box sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                                            Default Color
                                        </Typography>
                                        <Box
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 1,
                                                bgcolor: formData.default_color || '#FF5500',
                                                border: 1,
                                                borderColor: 'divider',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => setShowColorPicker(!showColorPicker)}
                                        />
                                    </Box>
                                    {showColorPicker && (
                                        <Box
                                            ref={colorPickerRef}
                                            sx={{
                                                position: 'absolute',
                                                zIndex: 1000,
                                                boxShadow: 3,
                                                borderRadius: 1,
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <HexColorPicker
                                                color={formData.default_color || '#FF5500'}
                                                onChange={handleColorChange}
                                            />
                                            <Box sx={{ p: 1, bgcolor: 'background.paper' }}>
                                                <TextField
                                                    value={formData.default_color || '#FF5500'}
                                                    onChange={(e) => handleColorChange(e.target.value)}
                                                    size="small"
                                                    fullWidth
                                                    variant="outlined"
                                                />
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            </Grid>
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
                                    <Typography variant="body2">System Marker</Typography>
                                    <Tooltip title="System markers are available to all users and cannot be deleted">
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
                                Marker Preview
                            </Typography>

                            <Box
                                sx={{
                                    bgcolor: 'action.hover',
                                    height: 200,
                                    borderRadius: 1,
                                    overflow: 'hidden',
                                    mb: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                }}
                            >
                                {previewImage ? (
                                    <>
                                        <img
                                            src={previewImage}
                                            alt="Marker Preview"
                                            style={{
                                                maxHeight: '80%',
                                                maxWidth: '80%',
                                                objectFit: 'contain'
                                            }}
                                        />
                                        <IconButton
                                            size="small"
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                bgcolor: 'rgba(255,255,255,0.7)',
                                            }}
                                            onClick={handleClearImage}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </>
                                ) : (
                                    <Box sx={{ textAlign: 'center' }}>
                                        <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                        <Typography variant="body2" color="text.secondary">
                                            No image uploaded
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

                            <Typography variant="body2" color="text.secondary">
                                This is a preview of how your marker will appear on the map.
                            </Typography>

                            <Box sx={{ mt: 4 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Marker Tips
                                </Typography>
                                <Typography variant="body2" paragraph>
                                    • Use transparent PNG or SVG for better results
                                </Typography>
                                <Typography variant="body2" paragraph>
                                    • Recommended size is 32x32 pixels
                                </Typography>
                                <Typography variant="body2" paragraph>
                                    • Choose colors that stand out against map backgrounds
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default MarkerForm;