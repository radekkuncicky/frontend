import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{flexGrow:1}}>
          CRM Systém
        </Typography>
        {auth.token ? (
          <Button color="inherit" onClick={handleLogout}>Odhlásit se</Button>
        ) : (
          <Button color="inherit" onClick={() => navigate('/login')}>Přihlásit se</Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
