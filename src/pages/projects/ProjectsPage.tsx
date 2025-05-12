// src/pages/projects/ProjectsPage.tsx
import React from 'react';
import { Box } from '@mui/material';
import ProjectList from '../../components/projects/ProjectList';

const ProjectsPage: React.FC = () => {
    return (
        <Box>
            <ProjectList />
        </Box>
    );
};

export default ProjectsPage;