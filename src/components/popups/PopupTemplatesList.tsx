// src/components/popups/PopupTemplatesList.tsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    Typography,
    Alert,
    TextField,
    InputAdornment,
    Menu,
    MenuItem,
    IconButton,
    ListItemIcon,
    ListItemText,
    FormControl,
    InputLabel,
    Select,
    Divider,
    Chip,
    Paper,
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    ContentCopy as CloneIcon,
    MoreVert as MoreVertIcon,
    Visibility as PreviewIcon,
    Code as CodeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getPopupTemplates, deletePopupTemplate, previewPopupTemplate } from '../../services/popupService';
import ConfirmDialog from '../common/ConfirmDialog';
import EmptyState from '../common/EmptyState';
import { PopupTemplate } from '../../types/popup.types';

const PopupTemplatesList: React.FC = () => {
    const [templates, setTemplates] = useState<PopupTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [isSystem, setIsSystem] = useState('all');
    const [menuAnchorEl, setMenuAnchorEl] = useState<Record<number, HTMLElement | null>>({});
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
    const [previewData, setPreviewData] = useState<{
        open: boolean;
        html: string | null;
        templateId: number | null;
    }>({
        open: false,
        html: null,
        templateId: null,
    });
    const navigate = useNavigate();

    useEffect(() => {
        loadTemplates();
    }, [isSystem]);

    const loadTemplates = async () => {
        setLoading(true);
        setError(null);

        try {
            const params: Record<string, any> = {
                search,
            };

            if (isSystem !== 'all') {
                params.is_system = isSystem === 'true';
            }

            const response = await getPopupTemplates(params);
            setTemplates(response.results);
        } catch (err) {
            setError('Failed to load popup templates. Please try again.');
            console.error('Error loading popup templates:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        loadTemplates();
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, templateId: number) => {
        setMenuAnchorEl({ ...menuAnchorEl, [templateId]: event.currentTarget });
    };

    const handleMenuClose = (templateId: number) => {
        setMenuAnchorEl({ ...menuAnchorEl, [templateId]: null });
    };

    const handleEdit = (templateId: number) => {
        navigate(`/components/popups/${templateId}/edit`);
        handleMenuClose(templateId);
    };

    const handleClone = (templateId: number) => {
        // Implement clone logic
        console.log('Clone template:', templateId);
        handleMenuClose(templateId);
    };

    const handleDeleteClick = (templateId: number) => {
        setConfirmDelete(templateId);
        handleMenuClose(templateId);
    };

    const handleDeleteConfirm = async () => {
        if (confirmDelete) {
            try {
                await deletePopupTemplate(confirmDelete);
                setTemplates(templates.filter(template => template.id !== confirmDelete));
            } catch (err) {
                console.error('Error deleting template:', err);
                setError('Failed to delete template. Please try again.');
            }
            setConfirmDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setConfirmDelete(null);
    };

    const handleCreateTemplate = () => {
        navigate('/components/popups/create');
    };

    const handlePreviewClick = async (templateId: number) => {
        handleMenuClose(templateId);

        try {
            const response = await previewPopupTemplate(templateId);
            setPreviewData({
                open: true,
                html: response.html,
                templateId,
            });
        } catch (err) {
            console.error('Error generating preview:', err);
            setError('Failed to generate template preview. Please try again.');
        }
    };

    const handleClosePreview = () => {
        setPreviewData({
            open: false,
            html: null,
            templateId: null,
        });
    };

    // Find the name of the template to be deleted for the confirmation dialog
    const templateToDelete = templates.find(template => template.id === confirmDelete);

    // Preview dialog component
    const PreviewDialog = () => {
        if (!previewData.open || !previewData.html) return null;

        return (
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 1300,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                }}
            >
                <Paper
                    sx={{
                        maxWidth: 500,
                        width: '100%',
                        maxHeight: '80vh',
                        overflow: 'auto',
                        borderRadius: 2,
                    }}
                >
                    <Box
                        sx={{
                            p: 2,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: 1,
                            borderColor: 'divider',
                        }}
                    >
                        <Typography variant="h6">
                            Template Preview
                        </Typography>
                        <IconButton onClick={handleClosePreview}>
                            <DeleteIcon />
                        </IconButton>
                    </Box>

                    <Box
                        sx={{
                            p: 0,
                            '& .popup': {
                                maxWidth: '100%',
                            },
                        }}
                        dangerouslySetInnerHTML={{ __html: previewData.html }}
                    />

                    <Box
                        sx={{
                            p: 2,
                            borderTop: 1,
                            borderColor: 'divider',
                            textAlign: 'right',
                        }}
                    >
                        <Button onClick={handleClosePreview}>
                            Close
                        </Button>
                    </Box>
                </Paper>
            </Box>
        );
    };

    return (
        <Box>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                }}
            >
                <Box
                    component="form"
                    onSubmit={handleSearch}
                    sx={{
                        display: 'flex',
                        gap: 2,
                        alignItems: 'center',
                        flexGrow: 1,
                        maxWidth: 600,
                    }}
                >
                    <TextField
                        size="small"
                        placeholder="Search templates..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ flexGrow: 1 }}
                    />

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel id="is-system-label">Template Type</InputLabel>
                        <Select
                            labelId="is-system-label"
                            id="is-system"
                            value={isSystem}
                            label="Template Type"
                            onChange={(e) => setIsSystem(e.target.value)}
                        >
                            <MenuItem value="all">All Templates</MenuItem>
                            <MenuItem value="true">System Templates</MenuItem>
                            <MenuItem value="false">Custom Templates</MenuItem>
                        </Select>
                    </FormControl>

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                    >
                        Search
                    </Button>
                </Box>

                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleCreateTemplate}
                >
                    Create Template
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: 400,
                    }}
                >
                    <CircularProgress />
                </Box>
            ) : templates.length === 0 ? (
                <EmptyState
                    title="No popup templates found"
                    description="Create your first popup template to enhance map feature information."
                    action={{
                        label: "Create Template",
                        onClick: handleCreateTemplate
                    }}
                    icon={CodeIcon}
                />
            ) : (
                <Grid container spacing={3}>
                    {templates.map((template) => (
                        <Grid item xs={12} sm={6} md={4} key={template.id}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 6,
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        p: 2,
                                        backgroundColor: (theme) =>
                                            theme.palette.mode === 'light'
                                                ? theme.palette.info.main + '10'
                                                : theme.palette.info.dark + '20',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <CodeIcon color="info" sx={{ mr: 1 }} />
                                        <Typography variant="subtitle1" component="div">
                                            {template.name}
                                        </Typography>
                                    </Box>

                                    <IconButton
                                        size="small"
                                        onClick={(e) => handleMenuOpen(e, template.id)}
                                    >
                                        <MoreVertIcon fontSize="small" />
                                    </IconButton>
                                    <Menu
                                        anchorEl={menuAnchorEl[template.id]}
                                        open={Boolean(menuAnchorEl[template.id])}
                                        onClose={() => handleMenuClose(template.id)}
                                    >
                                        <MenuItem onClick={() => handleEdit(template.id)}>
                                            <ListItemIcon>
                                                <EditIcon fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText>Edit</ListItemText>
                                        </MenuItem>
                                        <MenuItem onClick={() => handlePreviewClick(template.id)}>
                                            <ListItemIcon>
                                                <PreviewIcon fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText>Preview</ListItemText>
                                        </MenuItem>
                                        <MenuItem onClick={() => handleClone(template.id)}>
                                            <ListItemIcon>
                                                <CloneIcon fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText>Clone</ListItemText>
                                        </MenuItem>
                                        <MenuItem
                                            onClick={() => handleDeleteClick(template.id)}
                                            sx={{ color: 'error.main' }}
                                            disabled={template.is_system}
                                        >
                                            <ListItemIcon>
                                                <DeleteIcon fontSize="small" color="error" />
                                            </ListItemIcon>
                                            <ListItemText>Delete</ListItemText>
                                        </MenuItem>
                                    </Menu>
                                </Box>

                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {template.description || "No description"}
                                    </Typography>

                                    <Box
                                        sx={{
                                            p: 1,
                                            backgroundColor: 'grey.100',
                                            borderRadius: 1,
                                            mb: 2,
                                            maxHeight: 80,
                                            overflow: 'hidden',
                                            position: 'relative',
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontFamily: 'monospace',
                                                whiteSpace: 'pre-wrap',
                                            }}
                                        >
                                            {template.html_template.substring(0, 100)}
                                            {template.html_template.length > 100 && '...'}
                                        </Typography>
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                height: 24,
                                                background: 'linear-gradient(transparent, rgba(0,0,0,0.05))',
                                            }}
                                        />
                                    </Box>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                                            <Typography variant="caption" sx={{ mr: 1 }}>
                                                Fields:
                                            </Typography>
                                            {Object.keys(template.field_mappings || {}).map((field) => (
                                                <Chip
                                                    key={field}
                                                    label={field}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ fontSize: '0.625rem' }}
                                                />
                                            ))}
                                        </Box>

                                        {template.is_system && (
                                            <Typography variant="caption">
                                                System Template
                                            </Typography>
                                        )}
                                    </Box>
                                </CardContent>

                                <Divider />

                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                                    <Button
                                        size="small"
                                        startIcon={<PreviewIcon />}
                                        onClick={() => handlePreviewClick(template.id)}
                                    >
                                        Preview
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <ConfirmDialog
                open={confirmDelete !== null}
                title="Delete Popup Template"
                message={`Are you sure you want to delete "${templateToDelete?.name}"? This action cannot be undone. Any layers using this template may be affected.`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
                confirmColor="error"
            />

            <PreviewDialog />
        </Box>
    );
};

export default PopupTemplatesList;