// src/components/markers/MarkersList.tsx
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
    LocalOffer as TagIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getMarkers, deleteMarker } from '../../services/markerService';
import ConfirmDialog from '../common/ConfirmDialog';
import EmptyState from '../common/EmptyState';
import { Marker } from '../../types/marker.types';

const MarkersList: React.FC = () => {
    const [markers, setMarkers] = useState<Marker[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [iconType, setIconType] = useState('all');
    const [menuAnchorEl, setMenuAnchorEl] = useState<Record<number, HTMLElement | null>>({});
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadMarkers();
    }, [category, iconType]);

    const loadMarkers = async () => {
        setLoading(true);
        setError(null);

        try {
            const params: Record<string, any> = {
                search,
            };

            if (category !== 'all') {
                params.category = category;
            }

            if (iconType !== 'all') {
                params.icon_type = iconType;
            }

            const response = await getMarkers(params);
            setMarkers(response.results);
        } catch (err) {
            setError('Failed to load markers. Please try again.');
            console.error('Error loading markers:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        loadMarkers();
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, markerId: number) => {
        setMenuAnchorEl({ ...menuAnchorEl, [markerId]: event.currentTarget });
    };

    const handleMenuClose = (markerId: number) => {
        setMenuAnchorEl({ ...menuAnchorEl, [markerId]: null });
    };

    const handleEdit = (markerId: number) => {
        navigate(`/components/markers/${markerId}/edit`);
        handleMenuClose(markerId);
    };

    const handleClone = (markerId: number) => {
        // Implement clone logic
        console.log('Clone marker:', markerId);
        handleMenuClose(markerId);
    };

    const handleDeleteClick = (markerId: number) => {
        setConfirmDelete(markerId);
        handleMenuClose(markerId);
    };

    const handleDeleteConfirm = async () => {
        if (confirmDelete) {
            try {
                await deleteMarker(confirmDelete);
                setMarkers(markers.filter(marker => marker.id !== confirmDelete));
            } catch (err) {
                console.error('Error deleting marker:', err);
                setError('Failed to delete marker. Please try again.');
            }
            setConfirmDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setConfirmDelete(null);
    };

    const handleCreateMarker = () => {
        navigate('/components/markers/create');
    };

    // Find the name of the marker to be deleted for the confirmation dialog
    const markerToDelete = markers.find(marker => marker.id === confirmDelete);

    // Categories extracted from markers for filter dropdown
    const categories = [...new Set(markers.map(marker => marker.category).filter(Boolean))];

    // Icon types
    const iconTypes = [
        { value: 'all', label: 'All Types' },
        { value: 'image', label: 'Image' },
        { value: 'svg', label: 'SVG' },
        { value: 'font', label: 'Font Icon' },
    ];

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
                        placeholder="Search markers..."
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

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel id="category-label">Category</InputLabel>
                        <Select
                            labelId="category-label"
                            id="category"
                            value={category}
                            label="Category"
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <MenuItem value="all">All Categories</MenuItem>
                            {categories.map(cat => (
                                <MenuItem key={cat} value={cat}>
                                    {cat}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel id="icon-type-label">Icon Type</InputLabel>
                        <Select
                            labelId="icon-type-label"
                            id="icon-type"
                            value={iconType}
                            label="Icon Type"
                            onChange={(e) => setIconType(e.target.value)}
                        >
                            {iconTypes.map(type => (
                                <MenuItem key={type.value} value={type.value}>
                                    {type.label}
                                </MenuItem>
                            ))}
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
                    onClick={handleCreateMarker}
                >
                    Create Marker
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
            ) : markers.length === 0 ? (
                <EmptyState
                    title="No markers found"
                    description="Create your first marker to enhance your map visualizations."
                    action={{
                        label: "Create Marker",
                        onClick: handleCreateMarker
                    }}
                />
            ) : (
                <Grid container spacing={3}>
                    {markers.map((marker) => (
                        <Grid item xs={12} sm={6} md={3} key={marker.id}>
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
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative',
                                    }}
                                >
                                    {marker.icon_type === 'image' && (
                                        <img
                                            src={marker.icon_url}
                                            alt={marker.name}
                                            style={{
                                                maxHeight: '80%',
                                                maxWidth: '80%',
                                                objectFit: 'contain'
                                            }}
                                        />
                                    )}

                                    {marker.icon_type === 'svg' && (
                                        <div
                                            dangerouslySetInnerHTML={{ __html: marker.icon_data_base64 || '' }}
                                            style={{
                                                maxHeight: '80%',
                                                maxWidth: '80%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        />
                                    )}

                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                        }}
                                    >
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleMenuOpen(e, marker.id)}
                                            sx={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
                                        >
                                            <MoreVertIcon fontSize="small" />
                                        </IconButton>
                                        <Menu
                                            anchorEl={menuAnchorEl[marker.id]}
                                            open={Boolean(menuAnchorEl[marker.id])}
                                            onClose={() => handleMenuClose(marker.id)}
                                        >
                                            <MenuItem onClick={() => handleEdit(marker.id)}>
                                                <ListItemIcon>
                                                    <EditIcon fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText>Edit</ListItemText>
                                            </MenuItem>
                                            <MenuItem onClick={() => handleClone(marker.id)}>
                                                <ListItemIcon>
                                                    <CloneIcon fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText>Clone</ListItemText>
                                            </MenuItem>
                                            <MenuItem
                                                onClick={() => handleDeleteClick(marker.id)}
                                                sx={{ color: 'error.main' }}
                                            >
                                                <ListItemIcon>
                                                    <DeleteIcon fontSize="small" color="error" />
                                                </ListItemIcon>
                                                <ListItemText>Delete</ListItemText>
                                            </MenuItem>
                                        </Menu>
                                    </Box>
                                </CardMedia>

                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" component="div" gutterBottom>
                                        {marker.name}
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {marker.description || "No description"}
                                    </Typography>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                                            Type:
                                            <Chip
                                                label={marker.icon_type}
                                                size="small"
                                                variant="outlined"
                                                sx={{ ml: 1 }}
                                            />
                                        </Typography>

                                        {marker.category && (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <TagIcon
                                                    fontSize="small"
                                                    sx={{ mr: 0.5, fontSize: 16 }}
                                                />
                                                {marker.category}
                                            </Typography>
                                        )}

                                        {marker.is_system && (
                                            <Typography variant="caption">
                                                System Marker
                                            </Typography>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <ConfirmDialog
                open={confirmDelete !== null}
                title="Delete Marker"
                message={`Are you sure you want to delete "${markerToDelete?.name}"? This action cannot be undone. Layers using this marker may be affected.`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
                confirmColor="error"
            />
        </Box>
    );
};

export default MarkersList;