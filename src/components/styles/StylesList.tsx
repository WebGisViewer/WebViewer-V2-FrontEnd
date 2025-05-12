// src/components/styles/StylesList.tsx
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
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    ContentCopy as CloneIcon,
    MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getStyles, deleteStyle } from '../../services/styleService';
import ConfirmDialog from '../common/ConfirmDialog';
import EmptyState from '../common/EmptyState';
import { Style } from '../../types/style.types';

const StylesList: React.FC = () => {
    const [styles, setStyles] = useState<Style[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [styleType, setStyleType] = useState('all');
    const [menuAnchorEl, setMenuAnchorEl] = useState<Record<number, HTMLElement | null>>({});
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadStyles();
    }, [styleType]);

    const loadStyles = async () => {
        setLoading(true);
        setError(null);

        try {
            const params: Record<string, any> = {
                search,
            };

            if (styleType !== 'all') {
                params.style_type = styleType;
            }

            const response = await getStyles(params);
            setStyles(response.results);
        } catch (err) {
            setError('Failed to load styles. Please try again.');
            console.error('Error loading styles:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        loadStyles();
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, styleId: number) => {
        setMenuAnchorEl({ ...menuAnchorEl, [styleId]: event.currentTarget });
    };

    const handleMenuClose = (styleId: number) => {
        setMenuAnchorEl({ ...menuAnchorEl, [styleId]: null });
    };

    const handleEdit = (styleId: number) => {
        navigate(`/components/styles/${styleId}/edit`);
        handleMenuClose(styleId);
    };

    const handleClone = (styleId: number) => {
        // Implement clone logic
        console.log('Clone style:', styleId);
        handleMenuClose(styleId);
    };

    const handleDeleteClick = (styleId: number) => {
        setConfirmDelete(styleId);
        handleMenuClose(styleId);
    };

    const handleDeleteConfirm = async () => {
        if (confirmDelete) {
            try {
                await deleteStyle(confirmDelete);
                setStyles(styles.filter(style => style.id !== confirmDelete));
            } catch (err) {
                console.error('Error deleting style:', err);
                setError('Failed to delete style. Please try again.');
            }
            setConfirmDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setConfirmDelete(null);
    };

    const handleCreateStyle = () => {
        navigate('/components/styles/create');
    };

    // Find the name of the style to be deleted for the confirmation dialog
    const styleToDelete = styles.find(style => style.id === confirmDelete);

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
                        placeholder="Search styles..."
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
                        <InputLabel id="style-type-label">Style Type</InputLabel>
                        <Select
                            labelId="style-type-label"
                            id="style-type"
                            value={styleType}
                            label="Style Type"
                            onChange={(e) => setStyleType(e.target.value)}
                        >
                            <MenuItem value="all">All Types</MenuItem>
                            <MenuItem value="point">Point</MenuItem>
                            <MenuItem value="line">Line</MenuItem>
                            <MenuItem value="polygon">Polygon</MenuItem>
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
                    onClick={handleCreateStyle}
                >
                    Create Style
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
            ) : styles.length === 0 ? (
                <EmptyState
                    title="No styles found"
                    description="Create your first style to get started."
                    action={{
                        label: "Create Style",
                        onClick: handleCreateStyle
                    }}
                />
            ) : (
                <Grid container spacing={3}>
                    {styles.map((style) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={style.id}>
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
                                        backgroundColor: style.style_type === 'point' ? 'transparent' : style.style_definition.color || '#ccc',
                                        position: 'relative',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {style.style_type === 'point' && (
                                        <Box
                                            sx={{
                                                width: style.style_definition.radius * 2 || 24,
                                                height: style.style_definition.radius * 2 || 24,
                                                borderRadius: '50%',
                                                backgroundColor: style.style_definition.color || '#ccc',
                                                opacity: style.style_definition.opacity || 0.8,
                                            }}
                                        />
                                    )}

                                    {style.style_type === 'line' && (
                                        <Box
                                            sx={{
                                                width: '80%',
                                                height: style.style_definition.weight || 3,
                                                backgroundColor: '#fff',
                                                opacity: style.style_definition.opacity || 0.8,
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
                                            onClick={(e) => handleMenuOpen(e, style.id)}
                                            sx={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
                                        >
                                            <MoreVertIcon fontSize="small" />
                                        </IconButton>
                                        <Menu
                                            anchorEl={menuAnchorEl[style.id]}
                                            open={Boolean(menuAnchorEl[style.id])}
                                            onClose={() => handleMenuClose(style.id)}
                                        >
                                            <MenuItem onClick={() => handleEdit(style.id)}>
                                                <ListItemIcon>
                                                    <EditIcon fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText>Edit</ListItemText>
                                            </MenuItem>
                                            <MenuItem onClick={() => handleClone(style.id)}>
                                                <ListItemIcon>
                                                    <CloneIcon fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText>Clone</ListItemText>
                                            </MenuItem>
                                            <MenuItem
                                                onClick={() => handleDeleteClick(style.id)}
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
                                        {style.name}
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary">
                                        {style.description || "No description"}
                                    </Typography>

                                    <Box sx={{ mt: 1 }}>
                                        <Typography variant="caption" sx={{ display: 'block' }}>
                                            Type: {style.style_type_display || style.style_type}
                                        </Typography>

                                        {style.is_system && (
                                            <Typography variant="caption" sx={{ display: 'block' }}>
                                                System Style
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
                title="Delete Style"
                message={`Are you sure you want to delete "${styleToDelete?.name}"? This action cannot be undone.`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
                confirmColor="error"
            />
        </Box>
    );
};

export default StylesList;