/* src/components/common/ConfirmDialog.tsx */
import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    IconButton,
    Typography,
    Box,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string | React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmColor?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    disableBackdropClick?: boolean;
    disableEscapeKeyDown?: boolean;
    confirmButtonProps?: Record<string, any>;
    cancelButtonProps?: Record<string, any>;
    dialogProps?: Record<string, any>;
    hideCancel?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    contentDividers?: boolean;
}

/**
 * Reusable confirmation dialog component
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
                                                         open,
                                                         title,
                                                         message,
                                                         confirmLabel = 'Confirm',
                                                         cancelLabel = 'Cancel',
                                                         onConfirm,
                                                         onCancel,
                                                         confirmColor = 'primary',
                                                         maxWidth = 'sm',
                                                         disableBackdropClick = false,
                                                         disableEscapeKeyDown = false,
                                                         confirmButtonProps = {},
                                                         cancelButtonProps = {},
                                                         dialogProps = {},
                                                         hideCancel = false,
                                                         loading = false,
                                                         icon,
                                                         contentDividers = false,
                                                     }) => {
    const handleClose = (event: {}, reason: 'backdropClick' | 'escapeKeyDown') => {
        if (disableBackdropClick && reason === 'backdropClick') {
            return;
        }
        if (disableEscapeKeyDown && reason === 'escapeKeyDown') {
            return;
        }
        onCancel();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth={maxWidth}
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
            {...dialogProps}
        >
            <DialogTitle id="confirm-dialog-title" sx={{ pr: 8 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {icon && <Box sx={{ mr: 1.5 }}>{icon}</Box>}
                    <Typography variant="h6" component="span">
                        {title}
                    </Typography>
                </Box>
                <IconButton
                    aria-label="close"
                    onClick={onCancel}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers={contentDividers}>
                {typeof message === 'string' ? (
                    <DialogContentText id="confirm-dialog-description">
                        {message}
                    </DialogContentText>
                ) : (
                    message
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                {!hideCancel && (
                    <Button
                        onClick={onCancel}
                        color="inherit"
                        disabled={loading}
                        {...cancelButtonProps}
                    >
                        {cancelLabel}
                    </Button>
                )}
                <Button
                    onClick={onConfirm}
                    color={confirmColor}
                    variant="contained"
                    autoFocus
                    disabled={loading}
                    {...confirmButtonProps}
                >
                    {confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;