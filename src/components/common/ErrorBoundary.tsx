/* src/components/common/ErrorBoundary.tsx */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { Warning as WarningIcon, Refresh as RefreshIcon } from '@mui/icons-material';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component to catch JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            error,
            errorInfo: null
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // You can also log the error to an error reporting service
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
        this.setState({
            errorInfo
        });
    }

    handleReset = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '100vh',
                        p: 3
                    }}
                >
                    <Paper
                        elevation={3}
                        sx={{
                            p: 4,
                            maxWidth: 600,
                            width: '100%',
                            borderRadius: 2,
                            textAlign: 'center'
                        }}
                    >
                        <WarningIcon color="error" sx={{ fontSize: 64, mb: 2 }} />

                        <Typography variant="h5" component="h2" gutterBottom>
                            Something went wrong
                        </Typography>

                        <Typography variant="body1" color="text.secondary" paragraph>
                            An unexpected error occurred. Please try refreshing the page.
                        </Typography>

                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<RefreshIcon />}
                            onClick={this.handleReset}
                            sx={{ mb: 2 }}
                        >
                            Try Again
                        </Button>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <Box sx={{ mt: 4, textAlign: 'left' }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Error Details (Development Only):
                                </Typography>
                                <Paper
                                    sx={{
                                        p: 2,
                                        bgcolor: 'grey.100',
                                        color: 'error.main',
                                        fontFamily: 'monospace',
                                        fontSize: '0.875rem',
                                        overflow: 'auto',
                                        maxHeight: 200
                                    }}
                                >
                                    <pre>{this.state.error.toString()}</pre>
                                    <pre>{this.state.errorInfo?.componentStack}</pre>
                                </Paper>
                            </Box>
                        )}
                    </Paper>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;