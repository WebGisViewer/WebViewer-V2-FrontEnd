// src/components/projects/ProjectList.tsx
import React, { useState, useEffect } from 'react';
import {
    Grid,
    Box,
    Typography,
    TextField,
    InputAdornment,
    Button,
    MenuItem,
    CircularProgress,
    Alert,
    Pagination,
    FormControl,
    Select,
    InputLabel,
    Chip,
} from '@mui/material';
import {
    Search as SearchIcon,
    Add as AddIcon,
    FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ProjectCard from './ProjectCard';
import { getProjects } from '../../services/projectService';
import { Project } from '../../types/project.types';
import { PaginatedResponse } from '../../types/common.types';

const ProjectList: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [ordering, setOrdering] = useState('-created_at');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [visibilityFilter, setVisibilityFilter] = useState<string>('all');
    const navigate = useNavigate();

    useEffect(() => {
        loadProjects();
    }, [page, ordering, statusFilter, visibilityFilter]);

    const loadProjects = async (searchTerm = search) => {
        setLoading(true);
        setError(null);

        try {
            // Prepare filters
            const isActive = statusFilter === 'active' ? true :
                statusFilter === 'inactive' ? false : undefined;

            const isPublic = visibilityFilter === 'public' ? true :
                visibilityFilter === 'private' ? false : undefined;

            // Fetch projects with filters
            const response = await getProjects(
                page,
                searchTerm,
                isActive,
                isPublic,
                ordering
            );

            setProjects(response.results);
            setTotalCount(response.count);
            setTotalPages(Math.ceil(response.count / 9)); // Assuming 9 items per page
        } catch (err) {
            setError('Failed to load projects. Please try again.');
            console.error('Error loading projects:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        setPage(1); // Reset to first page on new search
        loadProjects(search);
    };

    const handleDelete = (id: number) => {
        // Implement delete logic
        console.log('Delete project:', id);
    };

    const handleClone = (id: number) => {
        // Implement clone logic
        console.log('Clone project:', id);
    };

    const handleShare = (id: number) => {
        // Implement share logic
        console.log('Share project:', id);
    };

    const handleCreateProject = () => {
        navigate('/projects/create');
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const handleOrderingChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setOrdering(event.target.value as string);
        setPage(1); // Reset to first page when changing ordering
    };

    const handleStatusFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setStatusFilter(event.target.value as string);
        setPage(1);
    };

    const handleVisibilityFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setVisibilityFilter(event.target.value as string);
        setPage(1);
    };

    const clearFilters = () => {
        setStatusFilter('all');
        setVisibilityFilter('all');
        setSearch('');
        setOrdering('-created_at');
        setPage(1);
    };

    const hasActiveFilters = statusFilter !== 'all' || visibilityFilter !== 'all' || search !== '';

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
                    Projects
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleCreateProject}
                >
                    Create Project
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
                        placeholder="Search projects..."
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
                    <InputLabel id="status-filter-label">Status</InputLabel>
                    <Select
                        labelId="status-filter-label"
                        id="status-filter"
                        value={statusFilter}
                        label="Status"
                        onChange={handleStatusFilterChange}
                    >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel id="visibility-filter-label">Visibility</InputLabel>
                    <Select
                        labelId="visibility-filter-label"
                        id="visibility-filter"
                        value={visibilityFilter}
                        label="Visibility"
                        onChange={handleVisibilityFilterChange}
                    >
                        <MenuItem value="all">All Visibility</MenuItem>
                        <MenuItem value="public">Public</MenuItem>
                        <MenuItem value="private">Private</MenuItem>
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

            {hasActiveFilters && (
                <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {statusFilter !== 'all' && (
                        <Chip
                            label={`Status: ${statusFilter}`}
                            onDelete={() => setStatusFilter('all')}
                            size="small"
                            color="primary"
                            variant="outlined"
                        />
                    )}
                    {visibilityFilter !== 'all' && (
                        <Chip
                            label={`Visibility: ${visibilityFilter}`}
                            onDelete={() => setVisibilityFilter('all')}
                            size="small"
                            color="primary"
                            variant="outlined"
                        />
                    )}
                    {search && (
                        <Chip
                            label={`Search: ${search}`}
                            onDelete={() => { setSearch(''); loadProjects(''); }}
                            size="small"
                            color="primary"
                            variant="outlined"
                        />
                    )}
                </Box>
            )}

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
            ) : projects.length === 0 ? (
                <Alert severity="info" sx={{ mb: 3 }}>
                    No projects found. {hasActiveFilters && 'Try adjusting your filters or '}
                    <Button
                        color="primary"
                        size="small"
                        onClick={handleCreateProject}
                    >
                        create a new project
                    </Button>
                </Alert>
            ) : (
                <>
                    <Grid container spacing={3}>
                        {projects.map((project) => (
                            <Grid item xs={12} sm={6} md={4} key={project.id}>
                                <ProjectCard
                                    project={project}
                                    onDelete={handleDelete}
                                    onClone={handleClone}
                                    onShare={handleShare}
                                />
                            </Grid>
                        ))}
                    </Grid>

                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mt: 4,
                            flexWrap: 'wrap',
                            gap: 2,
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            Showing {(page - 1) * 9 + 1}-
                            {Math.min(page * 9, totalCount)} of {totalCount} projects
                        </Typography>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                            shape="rounded"
                        />
                    </Box>
                </>
            )}
        </Box>
    );
};

export default ProjectList;