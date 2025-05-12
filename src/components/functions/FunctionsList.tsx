// src/components/functions/FunctionsList.tsx
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
    Chip,
    Divider,
    Paper,
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    ContentCopy as CloneIcon,
    MoreVert as MoreVertIcon,
    Code as CodeIcon,
    PlayArrow as ExecuteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getFunctions, deleteFunction } from '../../services/functionService';
import ConfirmDialog from '../common/ConfirmDialog';
import EmptyState from '../common/EmptyState';
import { Function as MapFunction } from '../../types/function.types';

const FunctionsList: React.FC = () => {
    const [functions, setFunctions] = useState<MapFunction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [functionType, setFunctionType] = useState('all');
    const [menuAnchorEl, setMenuAnchorEl] = useState<Record<number, HTMLElement | null>>({});
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadFunctions();
    }, [functionType]);

    const loadFunctions = async () => {
        setLoading(true);
        setError(null);

        try {
            const params: Record<string, any> = {
                search,
            };

            if (functionType !== 'all') {
                params.function_type = functionType;
            }

            const response = await getFunctions(params);
            setFunctions(response.results);
        } catch (err) {
            setError('Failed to load functions. Please try again.');
            console.error('Error loading functions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        loadFunctions();
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, functionId: number) => {
        setMenuAnchorEl({ ...menuAnchorEl, [functionId]: event.currentTarget });
    };

    const handleMenuClose = (functionId: number) => {
        setMenuAnchorEl({ ...menuAnchorEl, [functionId]: null });
    };

    const handleEdit = (functionId: number) => {
        navigate(`/components/functions/${functionId}/edit`);
        handleMenuClose(functionId);
    };

    const handleViewCode = (functionId: number) => {
        navigate(`/components/functions/${functionId}/code`);
        handleMenuClose(functionId);
    };

    const handleClone = (functionId: number) => {
        // Implement clone logic
        console.log('Clone function:', functionId);
        handleMenuClose(functionId);
    };

    const handleDeleteClick = (functionId: number) => {
        setConfirmDelete(functionId);
        handleMenuClose(functionId);
    };

    const handleDeleteConfirm = async () => {
        if (confirmDelete) {
            try {
                await deleteFunction(confirmDelete);
                setFunctions(functions.filter(func => func.id !== confirmDelete));
            } catch (err) {
                console.error('Error deleting function:', err);
                setError('Failed to delete function. Please try again.');
            }
            setConfirmDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setConfirmDelete(null);
    };

    const handleCreateFunction = () => {
        navigate('/components/functions/create');
    };

    // Find the name of the function to be deleted for the confirmation dialog
    const functionToDelete = functions.find(func => func.id === confirmDelete);

    // Function type options
    const functionTypes = [
        { value: 'all', label: 'All Types' },
        { value: 'clustering', label: 'Clustering' },
        { value: 'styling', label: 'Styling' },
        { value: 'analysis', label: 'Analysis' },
        { value: 'filter', label: 'Filter' },
        { value: 'transformation', label: 'Transformation' },
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
                        placeholder="Search functions..."
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
                        <InputLabel id="function-type-label">Function Type</InputLabel>
                        <Select
                            labelId="function-type-label"
                            id="function-type"
                            value={functionType}
                            label="Function Type"
                            onChange={(e) => setFunctionType(e.target.value)}
                        >
                            {functionTypes.map(type => (
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
                    onClick={handleCreateFunction}
                >
                    Create Function
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
            ) : functions.length === 0 ? (
                <EmptyState
                    title="No functions found"
                    description="Create your first function to add custom behavior to your layers."
                    action={{
                        label: "Create Function",
                        onClick: handleCreateFunction
                    }}
                    icon={CodeIcon}
                />
            ) : (
                <Grid container spacing={3}>
                    {functions.map((func) => (
                        <Grid item xs={12} sm={6} md={4} key={func.id}>
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
                                                ? theme.palette.primary.main + '10'
                                                : theme.palette.primary.dark + '20',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <CodeIcon color="primary" sx={{ mr: 1 }} />
                                        <Typography variant="subtitle1" component="div">
                                            {func.name}
                                        </Typography>
                                    </Box>

                                    <IconButton
                                        size="small"
                                        onClick={(e) => handleMenuOpen(e, func.id)}
                                    >
                                        <MoreVertIcon fontSize="small" />
                                    </IconButton>
                                    <Menu
                                        anchorEl={menuAnchorEl[func.id]}
                                        open={Boolean(menuAnchorEl[func.id])}
                                        onClose={() => handleMenuClose(func.id)}
                                    >
                                        <MenuItem onClick={() => handleEdit(func.id)}>
                                            <ListItemIcon>
                                                <EditIcon fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText>Edit</ListItemText>
                                        </MenuItem>
                                        <MenuItem onClick={() => handleViewCode(func.id)}>
                                            <ListItemIcon>
                                                <CodeIcon fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText>View Code</ListItemText>
                                        </MenuItem>
                                        <MenuItem onClick={() => handleClone(func.id)}>
                                            <ListItemIcon>
                                                <CloneIcon fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText>Clone</ListItemText>
                                        </MenuItem>
                                        <MenuItem
                                            onClick={() => handleDeleteClick(func.id)}
                                            sx={{ color: 'error.main' }}
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
                                        {func.description || "No description"}
                                    </Typography>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                                            Type:
                                            <Chip
                                                label={func.function_type_display || func.function_type}
                                                size="small"
                                                variant="outlined"
                                                sx={{ ml: 1 }}
                                            />
                                        </Typography>

                                        {func.is_system && (
                                            <Typography variant="caption">
                                                System Function
                                            </Typography>
                                        )}
                                    </Box>
                                </CardContent>

                                <Divider />

                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                                    <Button
                                        size="small"
                                        startIcon={<ExecuteIcon />}
                                        color="primary"
                                        onClick={() => navigate(`/components/functions/${func.id}/execute`)}
                                    >
                                        Execute
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            <ConfirmDialog
                open={confirmDelete !== null}
                title="Delete Function"
                message={`Are you sure you want to delete "${functionToDelete?.name}"? This action cannot be undone. Any layers using this function may be affected.`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
                confirmColor="error"
            />
        </Box>
    );
};

export default FunctionsList