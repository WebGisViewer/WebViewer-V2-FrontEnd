// src/components/popups/PopupTemplateForm.tsx
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
    Alert,
    CircularProgress,
    Divider,
    IconButton,
    Card,
    CardContent,
    Tooltip,
    Chip,
    List,
    ListItem,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    Info as InfoIcon,
    Preview as PreviewIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import MonacoEditor from 'react-monaco-editor';
import {
    getPopupTemplate,
    createPopupTemplate,
    updatePopupTemplate,
    previewPopupTemplate,
} from '../../services/popupService';
import { PopupTemplate } from '../../types/popup.types';

const defaultHtmlTemplate = `<div class="popup">
  <h3>{{name}}</h3>
  <div class="popup-content">
    <p>{{description}}</p>
    <p>Value: {{value}}</p>
  </div>
</div>`;

const defaultCssStyles = `.popup {
  max-width: 300px;
  font-family: Arial, sans-serif;
}

.popup h3 {
  margin-top: 0;
  font-size: 16px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 8px;
}

.popup-content {
  font-size: 14px;
}

.popup p {
  margin: 6px 0;
}`;

const PopupTemplateForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(id ? true : false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const [fieldMappingDialogOpen, setFieldMappingDialogOpen] = useState(false);
    const [newField, setNewField] = useState({
        key: '',
        value: '',
    });

    // Template form data
    const [formData, setFormData] = useState<Partial<PopupTemplate>>({
        name: '',
        description: '',
        html_template: defaultHtmlTemplate,
        field_mappings: {
            name: 'properties.name',
            description: 'properties.description',
            value: 'properties.value',
        },
        css_styles: defaultCssStyles,
        max_width: 300,
        max_height: 400,
        include_zoom_to_feature: true,
        is_system: false,
    });

    useEffect(() => {
        if (id) {
            loadTemplate(parseInt(id));
        }
    }, [id]);

    const loadTemplate = async (templateId: number) => {
        setLoading(true);
        setError(null);

        try {
            const template = await getPopupTemplate(templateId);
            setFormData(template);
        } catch (err) {
            setError('Failed to load template details. Please try again.');
            console.error('Error loading template:', err);
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

    const handleHtmlChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            html_template: value,
        }));
    };

    const handleCssChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            css_styles: value,
        }));
    };

    const handleAddField = () => {
        if (!newField.key || !newField.value) return;

        setFormData((prev) => ({
            ...prev,
            field_mappings: {
                ...prev.field_mappings,
                [newField.key]: newField.value,
            },
        }));

        // Reset new field inputs
        setNewField({
            key: '',
            value: '',
        });

        // Close dialog
        setFieldMappingDialogOpen(false);
    };

    const handleRemoveField = (key: string) => {
        setFormData((prev) => {
            if (!prev.field_mappings) return prev;

            const updated = { ...prev.field_mappings };
            delete updated[key];

            return {
                ...prev,
                field_mappings: updated,
            };
        });
    };

    const handlePreviewClick = async () => {
        try {
            if (id) {
                // If template exists, use the API to preview
                const response = await previewPopupTemplate(parseInt(id));
                setPreviewHtml(response.html);
            } else {
                // For new templates, create a simple preview from the current template
                const html = formData.html_template || '';
                const css = formData.css_styles || '';

                // Simple template preview
                let preview = `<style>${css}</style>${html}`;

                // Replace template variables with sample data
                const sampleData = {
                    name: 'Sample Feature',
                    description: 'This is a sample description',
                    value: 1234.56,
                    category: 'Sample Category',
                    date: '2025-05-15',
                };

                // Replace {{variable}} with actual values
                Object.entries(sampleData).forEach(([key, value]) => {
                    const regex = new RegExp(`{{${key}}}`, 'g');
                    preview = preview.replace(regex, String(value));
                });

                setPreviewHtml(preview);
            }
            setShowPreview(true);
        } catch (err) {
            console.error('Error generating preview:', err);
            setError('Failed to generate template preview. Please try again.');
        }
    };

    const handleClosePreview = () => {
        setShowPreview(false);
        setPreviewHtml(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            if (id) {
                // Update existing template
                await updatePopupTemplate(parseInt(id), formData);
                setSuccess('Template updated successfully!');
            } else {
                // Create new template
                const createdTemplate = await createPopupTemplate(formData);
                setSuccess('Template created successfully!');

                // Redirect to edit page after a short delay
                setTimeout(() => {
                    navigate(`/components/popups/${createdTemplate.id}/edit`);
                }, 1500);
            }
        } catch (err) {
            setError('Failed to save template. Please check your input and try again.');
            console.error('Error saving template:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate('/components/popups');
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
                    {id ? 'Edit Popup Template' : 'Create Popup Template'}
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
                        variant="outlined"
                        color="secondary"
                        startIcon={<PreviewIcon />}
                        onClick={handlePreviewClick}
                    >
                        Preview
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Template'}
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
                    <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Basic Information
                        </Typography>

                        <TextField
                            label="Template Name"
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
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Max Width (px)"
                                    name="max_width"
                                    type="number"
                                    value={formData.max_width}
                                    onChange={handleInputChange}
                                    fullWidth
                                    InputProps={{ inputProps: { min: 100, max: 800 } }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Max Height (px)"
                                    name="max_height"
                                    type="number"
                                    value={formData.max_height}
                                    onChange={handleInputChange}
                                    fullWidth
                                    InputProps={{ inputProps: { min: 100, max: 800 } }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.include_zoom_to_feature || false}
                                            onChange={handleSwitchChange('include_zoom_to_feature')}
                                            color="primary"
                                        />
                                    }
                                    label="Include Zoom Button"
                                    sx={{ mt: 1 }}
                                />
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
                                    <Typography variant="body2">System Template</Typography>
                                    <Tooltip title="System templates are available to all users and cannot be deleted">
                                        <IconButton size="small">
                                            <InfoIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            }
                            sx={{ mt: 2 }}
                        />
                    </Paper>

                    <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
                        <Box sx={{ p: 2, bgcolor: 'grey.100', display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle1">
                                HTML Template
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Use {{variable}} syntax for dynamic content
                            </Typography>
                        </Box>

                        <Divider />

                        <Box sx={{ height: 300 }}>
                            <MonacoEditor
                                language="html"
                                theme="vs-light"
                                value={formData.html_template || defaultHtmlTemplate}
                                onChange={handleHtmlChange}
                                options={{
                                    selectOnLineNumbers: true,
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                }}
                            />
                        </Box>
                    </Paper>

                    <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                        <Box sx={{ p: 2, bgcolor: 'grey.100', display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle1">
                                CSS Styles
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Define styles for your popup
                            </Typography>
                        </Box>

                        <Divider />

                        <Box sx={{ height: 300 }}>
                            <MonacoEditor
                                language="css"
                                theme="vs-light"
                                value={formData.css_styles || defaultCssStyles}
                                onChange={handleCssChange}
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

                <Grid item xs={12} md={4}>
                    <Card sx={{ mb: 3, borderRadius: 2 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">
                                    Field Mappings
                                </Typography>
                                <Button
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={() => setFieldMappingDialogOpen(true)}
                                >
                                    Add Field
                                </Button>
                            </Box>

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Map template variables to feature properties
                            </Typography>

                            <List dense sx={{ bgcolor: 'background.paper' }}>
                                {formData.field_mappings && Object.entries(formData.field_mappings).length > 0 ? (
                                    Object.entries(formData.field_mappings).map(([key, value]) => (
                                        <ListItem
                                            key={key}
                                            secondaryAction={
                                                <IconButton
                                                    edge="end"
                                                    aria-label="delete"
                                                    onClick={() => handleRemoveField(key)}
                                                    disabled={formData.is_system}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            }
                                        >
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Chip
                                                            label={`{{${key}}}`}
                                                            size="small"
                                                            sx={{ mr: 1 }}
                                                        />
                                                        →
                                                    </Box>
                                                }
                                                secondary={value}
                                            />
                                        </ListItem>
                                    ))
                                ) : (
                                    <ListItem>
                                        <ListItemText
                                            primary="No fields defined"
                                            secondary="Add field mappings to connect template variables to feature properties"
                                        />
                                    </ListItem>
                                )}
                            </List>
                        </CardContent>
                    </Card>

                    <Card sx={{ borderRadius: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Template Guidelines
                            </Typography>

                            <Typography variant="body2" sx={{ mb: 2 }}>
                                Use these variables in your HTML template:
                            </Typography>

                            <Box
                                sx={{
                                    bgcolor: 'grey.100',
                                    p: 1.5,
                                    borderRadius: 1,
                                    mb: 2,
                                    fontFamily: 'monospace',
                                    fontSize: '0.875rem',
                                }}
                            >
                                {formData.field_mappings && Object.keys(formData.field_mappings).map(key => (
                                    <Box key={key} sx={{ mb: 0.5 }}>
                                        {`{{${key}}}`}
                                    </Box>
                                ))}
                            </Box>

                            <Typography variant="body2" paragraph>
                                Tips for creating effective popups:
                            </Typography>

                            <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                                <Typography component="li" variant="body2">Keep content concise and focused</Typography>
                                <Typography component="li" variant="body2">Use responsive width for mobile compatibility</Typography>
                                <Typography component="li" variant="body2">Include only the most important information</Typography>
                                <Typography component="li" variant="body2">Consider using icons for better visualization</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Field Mapping Dialog */}
            <Dialog
                open={fieldMappingDialogOpen}
                onClose={() => setFieldMappingDialogOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Add Field Mapping</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Template Variable"
                        value={newField.key}
                        onChange={(e) => setNewField({ ...newField, key: e.target.value })}
                        fullWidth
                        margin="normal"
                        placeholder="e.g., name"
                        helperText="This will be used as {{variable}} in the template"
                    />

                    <TextField
                        label="Feature Property"
                        value={newField.value}
                        onChange={(e) => setNewField({ ...newField, value: e.target.value })}
                        fullWidth
                        margin="normal"
                        placeholder="e.g., properties.name"
                        helperText="Path to the data in the feature properties"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFieldMappingDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleAddField} variant="contained" color="primary">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Preview Dialog */}
            <Dialog
                open={showPreview}
                onClose={handleClosePreview}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Template Preview</DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                            This preview shows how your popup will appear with sample data
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 1,
                            p: 2,
                            bgcolor: 'background.paper',
                            minHeight: 100,
                            '& .popup': {
                                maxWidth: formData.max_width,
                                maxHeight: formData.max_height,
                                overflow: 'auto',
                            },
                        }}
                        dangerouslySetInnerHTML={{ __html: previewHtml || '' }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosePreview}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PopupTemplateForm;