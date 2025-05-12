// src/pages/dashboard/DashboardPage.tsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Card,
    CardContent,
    CardHeader,
    Button,
    Divider,
    CircularProgress,
    Alert,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    useTheme,
} from '@mui/material';
import {
    Map as MapIcon,
    LayersOutlined as LayersIcon,
    People as PeopleIcon,
    Add as AddIcon,
    ZoomIn as ZoomInIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProjects } from '../../services/projectService';
import { Project } from '../../types/project.types';
import { formatDate } from '../../utils/format';

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const [recentProjects, setRecentProjects] = useState<Project[]>([]);
    const [projectCount, setProjectCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Load recent projects
            const response = await getProjects(1, '', undefined, undefined, '-created_at');
            setRecentProjects(response.results.slice(0, 5));
            setProjectCount(response.count);
        } catch (err) {
            setError('Failed to load dashboard data. Please try again.');
            console.error('Error loading dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Stats for the main cards
    const stats = [
        {
            title: 'Projects',
            value: projectCount,
            icon: <MapIcon fontSize="large" />,
            color: theme.palette.primary.main,
            link: '/projects',
        },
        {
            title: 'Layers',
            value: '- -',
            icon: <LayersIcon fontSize="large" />,
            color: theme.palette.secondary.main,
            link: '/layers',
        },
        {
            title: 'Clients',
            value: '- -',
            icon: <PeopleIcon fontSize="large" />,
            color: theme.palette.info.main,
            link: '/clients',
        },
    ];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    {`Welcome${user ? ', ' + user.full_name : ''}`}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Welcome to the WebGIS Viewer dashboard. Here's an overview of your projects and data.
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 4 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {stats.map((stat) => (
                    <Grid item xs={12} md={4} key={stat.title}>
                        <Paper
                            elevation={2}
                            sx={{
                                p: 3,
                                display: 'flex',
                                alignItems: 'center',
                                height: '100%',
                                borderRadius: 2,
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 6,
                                    cursor: 'pointer',
                                },
                            }}
                            onClick={() => navigate(stat.link)}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: stat.color + '15', // Add transparency
                                    color: stat.color,
                                    borderRadius: '50%',
                                    width: 60,
                                    height: 60,
                                    mr: 3,
                                }}
                            >
                                {stat.icon}
                            </Box>
                            <Box>
                                <Typography variant="h4" component="div">
                                    {stat.value}
                                </Typography>
                                <Typography variant="subtitle1" color="text.secondary">
                                    {stat.title}
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                    <Card elevation={2} sx={{ height: '100%', borderRadius: 2 }}>
                        <CardHeader
                            title="Recent Projects"
                            action={
                                <Button
                                    component={Link}
                                    to="/projects/create"
                                    variant="contained"
                                    size="small"
                                    startIcon={<AddIcon />}
                                >
                                    New Project
                                </Button>
                            }
                        />
                        <Divider />
                        {recentProjects.length === 0 ? (
                            <CardContent>
                                <Alert severity="info">
                                    You don't have any projects yet. Create your first project to get started.
                                </Alert>
                            </CardContent>
                        ) : (
                            <List>
                                {recentProjects.map((project) => (
                                    <React.Fragment key={project.id}>
                                        <ListItem>
                                            <ListItemText
                                                primary={project.name}
                                                secondary={`Created on ${formatDate(project.created_at)}`}
                                            />
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Chip
                                                    label={project.is_public ? 'Public' : 'Private'}
                                                    size="small"
                                                    color={project.is_public ? 'info' : 'default'}
                                                    variant="outlined"
                                                />
                                                <ListItemSecondaryAction>
                                                    <IconButton
                                                        edge="end"
                                                        aria-label="view"
                                                        onClick={() => navigate(`/projects/${project.id}/view`)}
                                                        sx={{ mr: 1 }}
                                                    >
                                                        <ZoomInIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        edge="end"
                                                        aria-label="edit"
                                                        onClick={() => navigate(`/projects/${project.id}/edit`)}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </ListItemSecondaryAction>
                                            </Box>
                                        </ListItem>
                                        <Divider />
                                    </React.Fragment>
                                ))}
                            </List>
                        )}
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                            <Button
                                component={Link}
                                to="/projects"
                                color="primary"
                            >
                                View All Projects
                            </Button>
                        </Box>
                    </Card>
                </Grid>

                <Grid item xs={12} md={5}>
                    <Card elevation={2} sx={{ height: '100%', borderRadius: 2 }}>
                        <CardHeader title="Quick Actions" />
                        <Divider />
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Button
                                        component={Link}
                                        to="/projects/create"
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        startIcon={<AddIcon />}
                                        size="large"
                                        sx={{ mb: 2 }}
                                    >
                                        Create New Project
                                    </Button>
                                </Grid>
                                <Grid item xs={6}>
                                    <Button
                                        component={Link}
                                        to="/layers"
                                        variant="outlined"
                                        fullWidth
                                        startIcon={<LayersIcon />}
                                    >
                                        Manage Layers
                                    </Button>
                                </Grid>
                                <Grid item xs={6}>
                                    <Button
                                        component={Link}
                                        to="/profile"
                                        variant="outlined"
                                        fullWidth
                                        startIcon={<EditIcon />}
                                    >
                                        Edit Profile
                                    </Button>
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Getting Started
                                </Typography>
                                <Typography variant="body2" paragraph>
                                    The WebGIS Viewer allows you to create interactive maps with custom layers and data visualization.
                                </Typography>
                                <List dense disablePadding>
                                    <ListItem sx={{ pl: 0 }}>
                                        <ListItemText primary="1. Create a new project" />
                                    </ListItem>
                                    <ListItem sx={{ pl: 0 }}>
                                        <ListItemText primary="2. Add layers and customize styling" />
                                    </ListItem>
                                    <ListItem sx={{ pl: 0 }}>
                                        <ListItemText primary="3. Configure tools and interactive features" />
                                    </ListItem>
                                    <ListItem sx={{ pl: 0 }}>
                                        <ListItemText primary="4. Share with clients and users" />
                                    </ListItem>
                                </List>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardPage;