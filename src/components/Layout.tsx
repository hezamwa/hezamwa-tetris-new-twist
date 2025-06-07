import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  ListItemButton
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home,
  SportsEsports,
  Leaderboard,
  Analytics,
  Person,
  Login,
  PersonAdd,
  Logout
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're on the game page
  const isGamePage = location.pathname === '/game';

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavToggle = () => {
    setNavVisible(!navVisible);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const menuItems = [
    { text: 'Home', icon: <Home />, path: '/' },
    { text: 'Play Game', icon: <SportsEsports />, path: '/game' },
    { text: 'Analytics', icon: <Analytics />, path: '/analytics' },
    { text: 'Leaderboard', icon: <Leaderboard />, path: '/leaderboard' },
  ];

  const authMenuItems = currentUser
    ? [
        { text: 'Profile', icon: <Person />, path: '/profile' },
        { text: 'Logout', icon: <Logout />, onClick: handleLogout },
      ]
    : [
        { text: 'Login', icon: <Login />, path: '/login' },
        { text: 'Register', icon: <PersonAdd />, path: '/register' },
      ];

  const drawer = (
    <div>
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              onClick={() => {
                if (isGamePage) setNavVisible(false);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <List>
        {authMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={item.path ? Link : 'button'}
              to={item.path}
              onClick={item.onClick || (() => {
                if (isGamePage) setNavVisible(false);
              })}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  // If we're on the game page, render without the standard navigation
  if (isGamePage) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <CssBaseline />
        
        {/* Navigation drawer for game page - only visible when toggled */}
        <Drawer
          variant="temporary"
          open={navVisible}
          onClose={() => setNavVisible(false)}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>

        {/* Game page content with navigation toggle available */}
        <Box component="main" sx={{ flexGrow: 1, position: 'relative' }}>
          {React.cloneElement(children as React.ReactElement, { 
            onToggleNav: handleNavToggle,
            navVisible: navVisible 
          })}
        </Box>
      </Box>
    );
  }

  // Standard layout for non-game pages
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Tetris Game
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}; 