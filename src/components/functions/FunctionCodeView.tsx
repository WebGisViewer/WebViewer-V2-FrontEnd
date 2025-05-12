// src/components/functions/FunctionCodeView.tsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Alert,
    CircularProgress,
    Divider,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import MonacoEditor from 'react-monaco-editor';
import { getFunction, getFunctionCode } from '../../services/functionService';

const FunctionCodeView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [functionData, setFunctionData] = useState<{
        name: string;
        description: string;
        function_type: string;
        function_code: string;
    }>({
        name: '',
        description: '',
        function_type: '',
        function_code: '',
    });

    useEffect(() => {
        if (id) {
            loadFunction(parseInt(id));
        }
    }, [id]);

    const loadFunction = async (functionId: number) => {
        setLoading(true);
        setError(null);

        try {
            // Get function details
            const func = await getFunction(functionId);

            // Get function code (separate API call)
            const codeResponse = await getFunctionCode(functionId);

            setFunctionData({
                name: func.name,
                description: func.description,
                function_type: func.function_type,
                function_code: codeResponse.function_code,
            });
        } catch (err) {
            setError('Failed to load function code. Please try again.');
            console.error('Error loading function code:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/components/functions');
    };

    const handleEdit = () => {
        if (id) {
            navigate(`/components/functions/${id}/edit`);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

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
                    {functionData.name} - Code View
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={handleBack}
                    >
                        Back to Functions
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<EditIcon />}
                        onClick={handleEdit}
                    >
                        Edit Function
                    </Button>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Paper elevation={1} sx={{ mb: 3, p: 3, borderRadius: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                    Function Description
                </Typography>
                <Typography variant="body2" paragraph>
                    {functionData.description || "No description available."}
                </Typography>

                <Typography variant="body2">
                    <strong>Type:</strong> {functionData.function_type}
                </Typography>
            </Paper>

            <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ p: 2, bgcolor: 'grey.100', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1">
                        Function Code
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Read-only view
                    </Typography>
                </Box>

                <Divider />

                <Box sx={{ height: 600 }}>
                    <MonacoEditor
                        language="javascript"
                        theme="vs-light"
                        value={functionData.function_code}
                        options={{
                            readOnly: true,
                            selectOnLineNumbers: true,
                            minimap: { enabled: true },
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            lineNumbers: 'on',
                            folding: true,
                            showFoldingControls: 'always',
                        }}
                    />
                </Box>
            </Paper>
        </Box>
    );
};

export default FunctionCodeView;