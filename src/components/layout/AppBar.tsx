// src/components/layout/AppBar.tsx
import React, { useState } from 'react';
import {
    AppBar as MuiAppBar,
    Toolbar,
    Typography,
    IconButton,
    Button,
    Menu,
    MenuItem,
    Box,
    Tooltip,
    Avatar,
    styled,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Notifications as NotificationsIcon,
    LightMode as LightModeIcon,
    DarkMode as DarkModeIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AppBarProps {
    title: string;
    onToggleDrawer: () => void;
    drawerWidth: number;
    onToggleThemeMode: () => void;
    themeMode: 'light' | 'dark';
}

const StyledAppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open' && prop !== 'drawerWidth',
})<{ open?: boolean; drawerWidth: number }>(({ theme, open, drawerWidth }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

export const AppBar: React.FC<AppBarProps> = ({
                                                  title,
                                                  onToggleDrawer,
                                                  drawerWidth,
                                                  onToggleThemeMode,
                                                  themeMode
                                              }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        handleMenuClose();
        await logout();
        navigate('/login');
    };

    const handleProfileClick = () => {
        handleMenuClose();
        navigate('/profile');
    };

    return (
        <StyledAppBar position="fixed" drawerWidth={drawerWidth} open={false}>
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={onToggleDrawer}
                    sx={{ marginRight: 2 }}
                >
                    <MenuIcon />
                </IconButton>

                <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                    {title}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Tooltip title={themeMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
                        <IconButton color="inherit" onClick={onToggleThemeMode}>
                            {themeMode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Notifications">
                        <IconButton color="inherit">
                            <NotificationsIcon />
                        </IconButton>
                    </Tooltip>

                    {user ? (
                        <>
                            <Tooltip title="Account settings">
                                <IconButton
                                    onClick={handleProfileMenuOpen}
                                    size="small"
                                    sx={{ ml: 2 }}
                                    aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
                                    aria-haspopup="true"
                                    aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
                                >
                                    <Avatar
                                        sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
                                    >
                                        {user.username.charAt(0).toUpperCase()}
                                    </Avatar>
                                </IconButton>
                            </Tooltip>
                            <Menu
                                id="account-menu"
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                            >
                                <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
                                <MenuItem onClick={handleLogout}>Logout</MenuItem>
                            </Menu>
                        </>
                    ) : (
                        <Button color="inherit" onClick={() => navigate('/login')}>
                            Login
                        </Button>
                    )}
                </Box>
            </Toolbar>
        </StyledAppBar>
    );
};