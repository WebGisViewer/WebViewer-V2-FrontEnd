// src/components/styles/StyleForm.tsx
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
    Slider,
    Card,
    CardContent,
    Alert,
    CircularProgress,
    IconButton,
    Divider,
    Tooltip,
} from '@mui/material';
import {
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    Info as InfoIcon,
    Help as HelpIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { HexColorPicker } from 'react-colorful';
import { getStyle, createStyle, updateStyle } from '../../services/styleService';
import { Style } from '../../types/style.types';

const StyleForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(id ? true : false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const colorPickerRef = useRef<HTMLDivElement>(null);

    // Style form data
    const [formData, setFormData] = useState<Partial<Style>>({
        name: '',
        description: '',
        style_type: 'point',
        style_definition: {
            color: '#3388FF',
            radius: 6,
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.4,
            fillColor: '#3388FF',
        },
        is_system: false,
    });

    useEffect(() => {
        if (id) {
            loadStyle(parseInt(id));
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

    const loadStyle = async (styleId: number) => {
        setLoading(true);
        setError(null);

        try {
            const style = await getStyle(styleId);
            setFormData(style);
        } catch (err) {
            setError('Failed to load style details. Please try again.');
            console.error('Error loading style:', err);
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

    const handleStyleDefinitionChange = (name: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            style_definition: {
                ...prev.style_definition,
                [name]: value,
            },
        }));
    };

    const handleColorChange = (color: string) => {
        handleStyleDefinitionChange('color', color);

        // Also update fillColor for polygons if they're the same
        if (formData.style_type === 'polygon' &&
            formData.style_definition?.color === formData.style_definition?.fillColor) {
            handleStyleDefinitionChange('fillColor', color);
        }
    };

    const handleFillColorChange = (color: string) => {
        handleStyleDefinitionChange('fillColor', color);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            if (id) {
                // Update existing style
                await updateStyle(parseInt(id), formData);
                setSuccess('Style updated successfully!');
            } else {
                // Create new style
                const createdStyle = await createStyle(formData);
                setSuccess('Style created successfully!');

                // Redirect to edit page after a short delay
                setTimeout(() => {
                    navigate(`/components/styles/${createdStyle.id}/edit`);
                }, 1500);
            }
        } catch (err) {
            setError('Failed to save style. Please check your input and try again.');
            console.error('Error saving style:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate('/components/styles');
    };

    // Style preview component based on style type
    const StylePreview = () => {
        const { style_type, style_definition } = formData;

        if (!style_definition) return null;

        if (style_type === 'point') {
            return (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                    }}
                >
                    <Box
                        sx={{
                            width: (style_definition.radius || 6) * 2,
                            height: (style_definition.radius || 6) * 2,
                            borderRadius: '50%',
                            backgroundColor: style_definition.color || '#3388FF',
                            opacity: style_definition.opacity || 0.8,
                        }}
                    />
                </Box>
            );
        }

        if (style_type === 'line') {
            return (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                    }}
                >
                    <Box
                        sx={{
                            width: '80%',
                            height: style_definition.weight || 2,
                            backgroundColor: style_definition.color || '#3388FF',
                            opacity: style_definition.opacity || 0.8,
                        }}
                    />
                </Box>
            );
        }

        if (style_type === 'polygon') {
            return (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                    }}
                >
                    <Box
                        sx={{
                            width: '80%',
                            height: '80%',
                            border: `${style_definition.weight || 2}px solid ${style_definition.color || '#3388FF'}`,
                            backgroundColor: style_definition.fillColor || '#3388FF',
                            opacity: style_definition.fillOpacity || 0.4,
                        }}
                    />
                </Box>
            );
        }

        return null;
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
                    {id ? 'Edit Style' : 'Create Style'}
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
                        {saving ? 'Saving...' : 'Save Style'}
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
                            label="Style Name"
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
                            <InputLabel id="style-type-label">Style Type</InputLabel>
                            <Select
                                labelId="style-type-label"
                                id="style-type"
                                name="style_type"
                                value={formData.style_type}
                                label="Style Type"
                                onChange={handleInputChange}
                                required
                            >
                                <MenuItem value="point">Point</MenuItem>
                                <MenuItem value="line">Line</MenuItem>
                                <MenuItem value="polygon">Polygon</MenuItem>
                            </Select>
                        </FormControl>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="h6" gutterBottom>
                            Style Properties
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                                            Color
                                        </Typography>
                                        <Box
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 1,
                                                bgcolor: formData.style_definition?.color || '#3388FF',
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
                                                color={formData.style_definition?.color || '#3388FF'}
                                                onChange={handleColorChange}
                                            />
                                            <Box sx={{ p: 1, bgcolor: 'background.paper' }}>
                                                <TextField
                                                    value={formData.style_definition?.color || '#3388FF'}
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

                            <Grid item xs={12} sm={6}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" gutterBottom>
                                        Opacity ({((formData.style_definition?.opacity || 0.8) * 100).toFixed(0)}%)
                                    </Typography>
                                    <Slider
                                        value={(formData.style_definition?.opacity || 0.8) * 100}
                                        onChange={(e, value) => handleStyleDefinitionChange('opacity', (value as number) / 100)}
                                        step={5}
                                        marks
                                        min={0}
                                        max={100}
                                    />
                                </Box>
                            </Grid>

                            {formData.style_type === 'point' && (
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Radius"
                                        type="number"
                                        value={formData.style_definition?.radius || 6}
                                        onChange={(e) => handleStyleDefinitionChange('radius', parseInt(e.target.value))}
                                        fullWidth
                                        InputProps={{ inputProps: { min: 1, max: 50 } }}
                                    />
                                </Grid>
                            )}

                            {(formData.style_type === 'line' || formData.style_type === 'polygon') && (
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Line Weight"
                                        type="number"
                                        value={formData.style_definition?.weight || 2}
                                        onChange={(e) => handleStyleDefinitionChange('weight', parseInt(e.target.value))}
                                        fullWidth
                                        InputProps={{ inputProps: { min: 1, max: 10 } }}
                                    />
                                </Grid>
                            )}

                            {formData.style_type === 'polygon' && (
                                <>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                                                    Fill Color
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        width: 36,
                                                        height: 36,
                                                        borderRadius: 1,
                                                        bgcolor: formData.style_definition?.fillColor || '#3388FF',
                                                        border: 1,
                                                        borderColor: 'divider',
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={() => setShowColorPicker(!showColorPicker)}
                                                />
                                            </Box>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2" gutterBottom>
                                                Fill Opacity ({((formData.style_definition?.fillOpacity || 0.4) * 100).toFixed(0)}%)
                                            </Typography>
                                            <Slider
                                                value={(formData.style_definition?.fillOpacity || 0.4) * 100}
                                                onChange={(e, value) => handleStyleDefinitionChange('fillOpacity', (value as number) / 100)}
                                                step={5}
                                                marks
                                                min={0}
                                                max={100}
                                            />
                                        </Box>
                                    </Grid>
                                </>
                            )}
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
                                    <Typography variant="body2">System Style</Typography>
                                    <Tooltip title="System styles are available to all users and cannot be deleted">
                                        <IconButton size="small">
                                            <InfoIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            }
                        />
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', borderRadius: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Style Preview
                            </Typography>

                            <Box
                                sx={{
                                    bgcolor: 'action.hover',
                                    height: 200,
                                    borderRadius: 1,
                                    overflow: 'hidden',
                                    mb: 2
                                }}
                            >
                                <StylePreview />
                            </Box>

                            <Typography variant="body2" color="text.secondary">
                                This is a preview of how your style will appear on the map.
                            </Typography>

                            <Box sx={{ mt: 4 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Usage Tips
                                </Typography>
                                <Typography variant="body2" paragraph>
                                    • Use bright colors for better visibility
                                </Typography>
                                <Typography variant="body2" paragraph>
                                    • Consider color blindness when choosing colors
                                </Typography>
                                <Typography variant="body2" paragraph>
                                    • Adjust opacity for better overlay visibility
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default StyleForm;