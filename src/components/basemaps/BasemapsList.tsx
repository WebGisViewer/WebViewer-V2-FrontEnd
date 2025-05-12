// src/components/basemaps/BasemapsList.tsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
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
    Chip,
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    ContentCopy as CloneIcon,
    MoreVert as MoreVertIcon,
    Map as MapIcon,
    Public as PublicIcon,
    NetworkCheck as TestConnectionIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getBasemaps, deleteBasemap, testBasemapConnection } from '../../services/basemapService';
import ConfirmDialog from '../common/ConfirmDialog';
import EmptyState from '../common/EmptyState';
import { Basemap } from '../../types/map.types';

const BasemapsList: React.FC = () => {
    const [basemaps, setBasemaps] = useState<Basemap[]>([]);
    const [loading, setLoading] = useState(true);
    const [testing, setTesting] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [provider, setProvider] = useState('all');
    const [isSystem, setIsSystem] = useState('all');
    const [menuAnchorEl, setMenuAnchorEl] = useState<Record<number, HTMLElement | null>>({});
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadBasemaps();
    }, [provider, isSystem]);

    const loadBasemaps = async () => {
        setLoading(true);
        setError(null);

        try {
            const params: Record<string, any> = {
                search,
            };

            if (provider !== 'all') {
                params.provider = provider;
            }

            if (isSystem !== 'all') {
                params.is_system = isSystem === 'true';
            }

            const response = await getBasemaps(params);
            setBasemaps(response.results);
        } catch (err) {
            setError('Failed to load basemaps. Please try again.');
            console.error('Error loading basemaps:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        loadBasemaps();
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, basemapId: number) => {
        setMenuAnchorEl({ ...menuAnchorEl, [basemapId]: event.currentTarget });
    };

    const handleMenuClose = (basemapId: number) => {
        setMenuAnchorEl({ ...menuAnchorEl, [basemapId]: null });
    };

    const handleEdit = (basemapId: number) => {
        navigate(`/components/basemaps/${basemapId}/edit`);
        handleMenuClose(basemapId);
    };

    const handleClone = (basemapId: number) => {
        // Implement clone logic
        console.log('Clone basemap:', basemapId);
        handleMenuClose(basemapId);
    };

    const handleDeleteClick = (basemapId: number) => {
        setConfirmDelete(basemapId);
        handleMenuClose(basemapId);
    };

    const handleDeleteConfirm = async () => {
        if (confirmDelete) {
            try {
                await deleteBasemap(confirmDelete);
                setBasemaps(basemaps.filter(basemap => basemap.id !== confirmDelete));
            } catch (err) {
                console.error('Error deleting basemap:', err);
                setError('Failed to delete basemap. Please try again.');
            }
            setConfirmDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setConfirmDelete(null);
    };

    const handleCreateBasemap = () => {
        navigate('/components/basemaps/create');
    };

    const handleTestConnection = async (basemapId: number) => {
        handleMenuClose(basemapId);
        setTesting(basemapId);
        setSuccess(null);
        setError(null);

        try {
            const result = await testBasemapConnection(basemapId);
            setSuccess(`Connection test successful: ${result.url_tested}`);
        } catch (err) {
            setError('Connection test failed. Please check the basemap configuration.');
            console.error('Error testing basemap connection:', err);
        } finally {
            setTesting(null);
        }
    };

    // Find the name of the basemap to be deleted for the confirmation dialog
    const basemapToDelete = basemaps.find(basemap => basemap.id === confirmDelete);

    // Get unique providers for filter dropdown
    const providers = [...new Set(basemaps.map(basemap => basemap.provider))];

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
                        maxWidth: 700,
                    }}
                >
                    <TextField
                        size="small"
                        placeholder="Search basemaps..."
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
                        <InputLabel id="provider-label">Provider</InputLabel>
                        <Select
                            labelId="provider-label"
                            id="provider"
                            value={provider}
                            label="Provider"
                            onChange={(e) => setProvider(e.target.value)}
                        >
                            <MenuItem value="all">All Providers</MenuItem>
                            {providers.map(prov => (
                                <MenuItem key={prov} value={prov}>
                                    {prov.charAt(0).toUpperCase() + prov.slice(1)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel id="is-system-label">Type</InputLabel>
                        <Select
                            labelId="is-system-label"
                            id="is-system"
                            value={isSystem}
                            label="Type"
                            onChange={(e) => setIsSystem(e.target.value)}
                        >
                            <MenuItem value="all">All Types</MenuItem>
                            <MenuItem value="true">System Basemaps</MenuItem>
                            <MenuItem value="false">Custom Basemaps</MenuItem>
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
                    onClick={handleCreateBasemap}
                >
                    Create Basemap
                </Button>
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
            ) : basemaps.length === 0 ? (
                <EmptyState
                    title="No basemaps found"
                    description="Create your first basemap to provide different background maps for your projects."
                    action={{
                        label: "Create Basemap",
                        onClick: handleCreateBasemap
                    }}
                    icon={MapIcon}
                />
            ) : (
                <Grid container spacing={3}>
                    {basemaps.map((basemap) => (
                        <Grid item xs={12} sm={6} md={4} key={basemap.id}>
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
                                <CardMedia
                                    component="div"
                                    sx={{
                                        height: 140,
                                        backgroundColor: 'action.hover',
                                        position: 'relative',
                                    }}
                                    image={basemap.preview_image_base64 || '/map-thumbnails/default-map.jpg'}
                                >
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                        }}
                                    >
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleMenuOpen(e, basemap.id)}
                                            sx={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
                                        >
                                            <MoreVertIcon fontSize="small" />
                                        </IconButton>
                                        <Menu
                                            anchorEl={menuAnchorEl[basemap.id]}
                                            open={Boolean(menuAnchorEl[basemap.id])}
                                            onClose={() => handleMenuClose(basemap.id)}
                                        >
                                            <MenuItem onClick={() => handleEdit(basemap.id)}>
                                                <ListItemIcon>
                                                    <EditIcon fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText>Edit</ListItemText>
                                            </MenuItem>
                                            <MenuItem onClick={() => handleTestConnection(basemap.id)}>
                                                <ListItemIcon>
                                                    <TestConnectionIcon fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText>Test Connection</ListItemText>
                                            </MenuItem>
                                            <MenuItem onClick={() => handleClone(basemap.id)}>
                                                <ListItemIcon>
                                                    <CloneIcon fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText>Clone</ListItemText>
                                            </MenuItem>
                                            <MenuItem
                                                onClick={() => handleDeleteClick(basemap.id)}
                                                sx={{ color: 'error.main' }}
                                                disabled={basemap.is_system}
                                            >
                                                <ListItemIcon>
                                                    <DeleteIcon fontSize="small" color="error" />
                                                </ListItemIcon>
                                                <ListItemText>Delete</ListItemText>
                                            </MenuItem>
                                        </Menu>
                                    </Box>

                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            bgcolor: 'rgba(0, 0, 0, 0.6)',
                                            p: 1,
                                        }}
                                    >
                                        <Typography variant="subtitle1" sx={{ color: 'white' }}>
                                            {basemap.name}
                                        </Typography>
                                    </Box>
                                </CardMedia>

                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {basemap.description || "No description"}
                                    </Typography>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <PublicIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                                            <Typography variant="body2">
                                                {basemap.provider_display || basemap.provider.charAt(0).toUpperCase() + basemap.provider.slice(1)}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            <Chip
                                                label={`Zoom: ${basemap.min_zoom}-${basemap.max_zoom}`}
                                                size="small"
                                                variant="outlined"
                                            />

                                            {basemap.is_system && (
                                                <Chip
                                                    label="System"
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            )}
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <ConfirmDialog
                open={confirmDelete !== null}
                title="Delete Basemap"
                message={`Are you sure you want to delete "${basemapToDelete?.name}"? This action cannot be undone. Projects using this basemap may be affected.`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
                confirmColor="error"
            />
        </Box>
    );
};

export default BasemapsList;