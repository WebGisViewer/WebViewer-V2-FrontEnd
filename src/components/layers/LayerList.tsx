// src/components/layers/LayerList.tsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    InputAdornment,
    Button,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Tooltip,
    Pagination,
    FormControl,
    InputLabel,
    Select,
    Alert,
    CircularProgress,
    alpha,
    styled,
} from '@mui/material';
import {
    Search as SearchIcon,
    Add as AddIcon,
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    ContentCopy as CloneIcon,
    Download as DownloadIcon,
    FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getLayers } from '../../services/layerService';
import { Layer } from '../../types/layer.types';
import { formatDate } from '../../utils/format';
import { PaginatedResponse } from '../../types/common.types';

const ColorBox = styled(Box)(({ theme }) => ({
    width: 24,
    height: 24,
    display: 'inline-block',
    borderRadius: 4,
    marginRight: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
    verticalAlign: 'middle',
}));

const LayerList: React.FC = () => {
    const [layers, setLayers] = useState<Layer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [ordering, setOrdering] = useState('-created_at');
    const [layerTypeFilter, setLayerTypeFilter] = useState<string>('all');
    const [projectFilter, setProjectFilter] = useState<string>('all');
    const [menuAnchorEl, setMenuAnchorEl] = useState<Record<number, HTMLElement | null>>({});
    const navigate = useNavigate();

    useEffect(() => {
        loadLayers();
    }, [page, ordering, layerTypeFilter, projectFilter]);

    const loadLayers = async (searchTerm = search) => {
        setLoading(true);
        setError(null);

        try {
            // Prepare filters
            const filterParams: Record<string, any> = {
                page,
                ordering,
                search: searchTerm,
            };

            if (layerTypeFilter !== 'all') {
                filterParams.layer_type = layerTypeFilter;
            }

            if (projectFilter !== 'all') {
                filterParams.project = projectFilter;
            }

            // Fetch layers with filters
            const response = await getLayers(filterParams);

            setLayers(response.results);
            setTotalCount(response.count);
            setTotalPages(Math.ceil(response.count / 10)); // Assuming 10 items per page
        } catch (err) {
            setError('Failed to load layers. Please try again.');
            console.error('Error loading layers:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        setPage(1); // Reset to first page on new search
        loadLayers(search);
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const handleOrderingChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setOrdering(event.target.value as string);
        setPage(1); // Reset to first page when changing ordering
    };

    const handleLayerTypeFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setLayerTypeFilter(event.target.value as string);
        setPage(1);
    };

    const handleProjectFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setProjectFilter(event.target.value as string);
        setPage(1);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, layerId: number) => {
        setMenuAnchorEl({ ...menuAnchorEl, [layerId]: event.currentTarget });
    };

    const handleMenuClose = (layerId: number) => {
        setMenuAnchorEl({ ...menuAnchorEl, [layerId]: null });
    };

    const handleEditLayer = (layerId: number) => {
        navigate(`/layers/${layerId}/edit`);
        handleMenuClose(layerId);
    };

    const handleViewLayer = (layerId: number) => {
        navigate(`/layers/${layerId}/view`);
        handleMenuClose(layerId);
    };

    const handleDeleteLayer = (layerId: number) => {
        // Implement delete logic
        console.log('Delete layer:', layerId);
        handleMenuClose(layerId);
    };

    const handleCloneLayer = (layerId: number) => {
        // Implement clone logic
        console.log('Clone layer:', layerId);
        handleMenuClose(layerId);
    };

    const handleExportLayer = (layerId: number) => {
        // Implement export logic
        console.log('Export layer:', layerId);
        handleMenuClose(layerId);
    };

    const handleCreateLayer = () => {
        navigate('/layers/create');
    };

    const clearFilters = () => {
        setLayerTypeFilter('all');
        setProjectFilter('all');
        setSearch('');
        setOrdering('-created_at');
        setPage(1);
    };

    const hasActiveFilters = layerTypeFilter !== 'all' || projectFilter !== 'all' || search !== '';

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
                <Typography variant="h4" component="h1">
                    Layers
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleCreateLayer}
                >
                    Create Layer
                </Button>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    mb: 3,
                    alignItems: 'center',
                }}
            >
                <Box
                    component="form"
                    onSubmit={handleSearch}
                    sx={{
                        display: 'flex',
                        flexGrow: 1,
                        maxWidth: { xs: '100%', sm: 400 }
                    }}
                >
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search layers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel id="layer-type-filter-label">Layer Type</InputLabel>
                    <Select
                        labelId="layer-type-filter-label"
                        id="layer-type-filter"
                        value={layerTypeFilter}
                        label="Layer Type"
                        onChange={handleLayerTypeFilterChange}
                    >
                        <MenuItem value="all">All Types</MenuItem>
                        <MenuItem value="1">Line</MenuItem>
                        <MenuItem value="2">Point</MenuItem>
                        <MenuItem value="3">Polygon</MenuItem>
                        <MenuItem value="4">Raster</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel id="project-filter-label">Project</InputLabel>
                    <Select
                        labelId="project-filter-label"
                        id="project-filter"
                        value={projectFilter}
                        label="Project"
                        onChange={handleProjectFilterChange}
                    >
                        <MenuItem value="all">All Projects</MenuItem>
                        {/* This would be populated from a projects API call */}
                        <MenuItem value="1">Project 1</MenuItem>
                        <MenuItem value="2">Project 2</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel id="sort-label">Sort By</InputLabel>
                    <Select
                        labelId="sort-label"
                        id="sort"
                        value={ordering}
                        label="Sort By"
                        onChange={handleOrderingChange}
                    >
                        <MenuItem value="-created_at">Newest First</MenuItem>
                        <MenuItem value="created_at">Oldest First</MenuItem>
                        <MenuItem value="name">Name (A-Z)</MenuItem>
                        <MenuItem value="-name">Name (Z-A)</MenuItem>
                        <MenuItem value="feature_count">Feature Count (Low-High)</MenuItem>
                        <MenuItem value="-feature_count">Feature Count (High-Low)</MenuItem>
                    </Select>
                </FormControl>

                {hasActiveFilters && (
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={clearFilters}
                        startIcon={<FilterListIcon />}
                    >
                        Clear Filters
                    </Button>
                )}
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
            ) : layers.length === 0 ? (
                <Alert severity="info" sx={{ mb: 3 }}>
                    No layers found. {hasActiveFilters && 'Try adjusting your filters or '}
                    <Button
                        color="primary"
                        size="small"
                        onClick={handleCreateLayer}
                    >
                        create a new layer
                    </Button>
                </Alert>
            ) : (
                <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Project</TableCell>
                                    <TableCell align="right">Features</TableCell>
                                    <TableCell>Last Updated</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {layers.map((layer) => (
                                    <TableRow
                                        key={layer.id}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <ColorBox sx={{ backgroundColor: layer.style.color || '#cccccc' }} />
                                                <Typography variant="body2" fontWeight="medium">
                                                    {layer.name}
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">
                                                {layer.description?.substring(0, 60)}{layer.description?.length > 60 ? '...' : ''}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={layer.layer_type_name}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>{layer.project_name}</TableCell>
                                        <TableCell align="right">{layer.feature_count.toLocaleString()}</TableCell>
                                        <TableCell>
                                            {layer.last_data_update ? formatDate(layer.last_data_update) : 'Never'}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Box>
                                                <Tooltip title="View Layer">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleViewLayer(layer.id)}
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit Layer">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleEditLayer(layer.id)}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => handleMenuOpen(e, layer.id)}
                                                >
                                                    <MoreVertIcon fontSize="small" />
                                                </IconButton>
                                                <Menu
                                                    anchorEl={menuAnchorEl[layer.id]}
                                                    open={Boolean(menuAnchorEl[layer.id])}
                                                    onClose={() => handleMenuClose(layer.id)}
                                                >
                                                    <MenuItem onClick={() => handleCloneLayer(layer.id)}>
                                                        <ListItemIcon>
                                                            <CloneIcon fontSize="small" />
                                                        </ListItemIcon>
                                                        <ListItemText>Clone</ListItemText>
                                                    </MenuItem>
                                                    <MenuItem onClick={() => handleExportLayer(layer.id)}>
                                                        <ListItemIcon>
                                                            <DownloadIcon fontSize="small" />
                                                        </ListItemIcon>
                                                        <ListItemText>Export GeoJSON</ListItemText>
                                                    </MenuItem>
                                                    <MenuItem
                                                        onClick={() => handleDeleteLayer(layer.id)}
                                                        sx={{ color: 'error.main' }}
                                                    >
                                                        <ListItemIcon>
                                                            <DeleteIcon fontSize="small" color="error" />
                                                        </ListItemIcon>
                                                        <ListItemText>Delete</ListItemText>
                                                    </MenuItem>
                                                </Menu>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            px: 2,
                            py: 1.5,
                            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            Showing {(page - 1) * 10 + 1}-
                            {Math.min(page * 10, totalCount)} of {totalCount} layers
                        </Typography>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                            shape="rounded"
                            size="small"
                        />
                    </Box>
                </Paper>
            )}
        </Box>
    );
};

export default LayerList;