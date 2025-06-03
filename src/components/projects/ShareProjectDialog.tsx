// src/components/projects/ShareProjectDialog.tsx
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    IconButton,
    Alert,
    CircularProgress,
    Tooltip,
    Chip
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { clientService } from '../../services';

interface ShareProjectDialogProps {
    open: boolean;
    onClose: () => void;
    projectId: number;
    projectName: string;
}

const ShareProjectDialog: React.FC<ShareProjectDialogProps> = ({
                                                                   open,
                                                                   onClose,
                                                                   projectId,
                                                                   projectName
                                                               }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [shareLinks, setShareLinks] = useState<any[]>([]);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (open) {
            loadShareLinks();
        }
    }, [open, projectId]);

    const loadShareLinks = async () => {
        setLoading(true);
        setError(null);
        try {
            // Get all client project associations
            const response = await clientService.getClientProjectAssociations({
                project_id: projectId
            });
            setShareLinks(response.results);
        } catch (err) {
            console.error('Error loading share links:', err);
            setError('Failed to load share links');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (link: string) => {
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getFullUrl = (uniqueLink: string) => {
        const baseUrl = window.location.origin;
        // For development, use project ID directly
        // TODO: Change back to /viewer/${uniqueLink} for production
        return `${baseUrl}/viewer/${projectId}`;
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                Share Project: {projectName}
            </DialogTitle>
            <DialogContent>
                {loading && (
                    <Box display="flex" justifyContent="center" py={3}>
                        <CircularProgress />
                    </Box>
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {!loading && shareLinks.length === 0 && (
                    <Alert severity="info">
                        No share links have been created for this project yet.
                        Please assign this project to clients to generate shareable links.
                    </Alert>
                )}

                {!loading && shareLinks.length > 0 && (
                    <Box>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Share these links with clients to provide view-only access to the project:
                        </Typography>

                        {shareLinks.map((shareLink) => (
                            <Box key={shareLink.id} mb={2} p={2} bgcolor="grey.50" borderRadius={1}>
                                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                                    <Typography variant="subtitle2">
                                        Client: {shareLink.client_name || 'Unknown'}
                                    </Typography>
                                    <Chip
                                        label={shareLink.is_active ? 'Active' : 'Inactive'}
                                        color={shareLink.is_active ? 'success' : 'default'}
                                        size="small"
                                    />
                                </Box>

                                <TextField
                                    fullWidth
                                    value={getFullUrl(shareLink.unique_link)}
                                    InputProps={{
                                        readOnly: true,
                                        endAdornment: (
                                            <>
                                                <Tooltip title="Copy link">
                                                    <IconButton
                                                        onClick={() => copyToClipboard(getFullUrl(shareLink.unique_link))}
                                                        size="small"
                                                    >
                                                        <ContentCopyIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Open in new tab">
                                                    <IconButton
                                                        onClick={() => window.open(getFullUrl(shareLink.unique_link), '_blank')}
                                                        size="small"
                                                    >
                                                        <OpenInNewIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        ),
                                    }}
                                    size="small"
                                />

                                {shareLink.last_accessed && (
                                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                                        Last accessed: {new Date(shareLink.last_accessed).toLocaleString()}
                                    </Typography>
                                )}
                            </Box>
                        ))}

                        {copied && (
                            <Alert severity="success" sx={{ mt: 2 }}>
                                Link copied to clipboard!
                            </Alert>
                        )}
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ShareProjectDialog;