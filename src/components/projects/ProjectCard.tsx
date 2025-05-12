// src/components/projects/ProjectCard.tsx
import React from 'react';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    CardActions,
    Button,
    Chip,
    Box,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
    styled,
} from '@mui/material';
import {
    Map as MapIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    ContentCopy as CloneIcon,
    Share as ShareIcon,
    MoreVert as MoreVertIcon,
    PublishedWithChanges as PublishedIcon,
    UnpublishedOutlined as UnpublishedIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Project } from '../../types/project.types';
import { formatDate } from '../../utils/format';

const ProjectCardStyled = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[6],
    },
}));

const CardMediaStyled = styled(CardMedia)(({ theme }) => ({
    height: 160,
    position: 'relative',
}));

const StatusChip = styled(Chip)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
}));

interface ProjectCardProps {
    project: Project;
    onDelete: (id: number) => void;
    onClone: (id: number) => void;
    onShare: (id: number) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
                                                     project,
                                                     onDelete,
                                                     onClone,
                                                     onShare,
                                                 }) => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleView = () => {
        navigate(`/projects/${project.id}/view`);
    };

    const handleEdit = () => {
        navigate(`/projects/${project.id}/edit`);
        handleMenuClose();
    };

    const handleDelete = () => {
        onDelete(project.id);
        handleMenuClose();
    };

    const handleClone = () => {
        onClone(project.id);
        handleMenuClose();
    };

    const handleShare = () => {
        onShare(project.id);
        handleMenuClose();
    };

    // Generate a random map thumbnail for demo purposes
    // In a real app, you'd use a real thumbnail from the project
    const getMapThumbnail = () => {
        const mapStyles = [
            '/map-thumbnails/street-map.jpg',
            '/map-thumbnails/satellite-map.jpg',
            '/map-thumbnails/terrain-map.jpg',
            '/map-thumbnails/dark-map.jpg',
        ];
        const randomIndex = project.id % mapStyles.length;
        return mapStyles[randomIndex];
    };

    return (
        <ProjectCardStyled elevation={2}>
            <CardMediaStyled
                image={getMapThumbnail()}
                title={project.name}
            >
                <StatusChip
                    label={project.is_active ? 'Active' : 'Inactive'}
                    color={project.is_active ? 'success' : 'default'}
                    size="small"
                    icon={project.is_active ? <PublishedIcon /> : <UnpublishedIcon />}
                />
            </CardMediaStyled>

            <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="div" noWrap>
                    {project.name}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {project.description.length > 100
                        ? `${project.description.substring(0, 100)}...`
                        : project.description}
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                    <Chip
                        label={project.is_public ? 'Public' : 'Private'}
                        size="small"
                        color={project.is_public ? 'info' : 'default'}
                        variant="outlined"
                    />
                    <Chip
                        label={`Zoom: ${project.default_zoom_level}`}
                        size="small"
                        variant="outlined"
                    />
                </Box>

                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    Created: {formatDate(project.created_at)}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                    By: {project.creator_username}
                </Typography>
            </CardContent>

            <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<MapIcon />}
                    onClick={handleView}
                >
                    View Map
                </Button>

                <IconButton
                    aria-label="more options"
                    aria-controls={open ? 'project-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleMenuClick}
                >
                    <MoreVertIcon />
                </IconButton>

                <Menu
                    id="project-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    <MenuItem onClick={handleEdit}>
                        <ListItemIcon>
                            <EditIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Edit</ListItemText>
                    </MenuItem>

                    <MenuItem onClick={handleShare}>
                        <ListItemIcon>
                            <ShareIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Share</ListItemText>
                    </MenuItem>

                    <MenuItem onClick={handleClone}>
                        <ListItemIcon>
                            <CloneIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Clone</ListItemText>
                    </MenuItem>

                    <Divider />

                    <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                        <ListItemIcon>
                            <DeleteIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        <ListItemText>Delete</ListItemText>
                    </MenuItem>
                </Menu>
            </CardActions>
        </ProjectCardStyled>
    );
};

export default ProjectCard;