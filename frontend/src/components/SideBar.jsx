import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import NavBar from './NavBar';
import { useNavigate } from 'react-router-dom';

export default function SideBar({ open, onClose }) {
    const navigate = useNavigate();

    const handleNav = (path) => {
        navigate(path);
    }

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={onClose}>
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNav('/')}>
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>
                <ListItem disablePadding>
          <ListItemButton onClick={() => handleNav('/dashboard')}>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
            <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNav('/projects-page')}>
            <ListItemText primary="Projects Page" />
          </ListItemButton>
        </ListItem>
                <ListItem disablePadding>
          <ListItemButton onClick={() => handleNav('/dashboard/library')}>
            <ListItemText primary="Library" />
          </ListItemButton>
        </ListItem>
      </List>

     
      
    </Box>
  );

  return (
    <div>
        <Drawer anchor={'right'} open={open} onClose={onClose}>
            {DrawerList}
        </Drawer>
    </div>
  );
}
