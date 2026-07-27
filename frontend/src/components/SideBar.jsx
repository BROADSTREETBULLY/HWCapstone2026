import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { getUser, logout, isLoggedIn } from '../data/auth';

const NAV_ITEMS_TOP = [
  { label: 'Home', path: '/' },
  { label: 'Dashboard', path: '/dashboard' },
];

const NAV_ITEMS_MAIN = [
  { label: 'Org Library', path: '/dashboard/library' },
  { label: 'My Libraries', path: '/dashboard/libraries' },
];

export default function SideBar({ open, onClose }) {
  const navigate = useNavigate();
  const user = getUser();

  const renderItems = (items) =>
    items.map((item) => (
      <ListItem key={item.path} disablePadding>
        <ListItemButton onClick={() => navigate(item.path)}>
          <ListItemText primary={item.label} />
        </ListItemButton>
      </ListItem>
    ));

  return (
    <div>
      <Drawer anchor={'right'} open={open} onClose={onClose}>
        <Box sx={{ width: 250 }} role="presentation" onClick={onClose}>
          <List>{renderItems(NAV_ITEMS_TOP)}</List>
          <Divider />
          <List>{renderItems(NAV_ITEMS_MAIN)}</List>
          {isLoggedIn() && (
            <>
              <Divider />
              <List>
                <ListItem disablePadding>
                  <ListItemButton disabled sx={{ opacity: '1 !important' }}>
                    <ListItemIcon><AccountCircle /></ListItemIcon>
                    <ListItemText
                      primary={user?.username ?? 'Account'}
                      secondary={[user?.firstName, user?.lastName].filter(Boolean).join(' ')}
                    />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => logout()}>
                    <ListItemIcon><LogoutIcon /></ListItemIcon>
                    <ListItemText primary="Logout" />
                  </ListItemButton>
                </ListItem>
              </List>
            </>
          )}
        </Box>
      </Drawer>
    </div>
  );
}
