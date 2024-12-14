import React, { useState, useContext } from 'react';
import { login } from '../api/auth';
import { AuthContext } from '../context/AuthContext';
import { Box, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const { login: authLogin } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const data = await login(email, password);
      authLogin(data.token, data.role);
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Přihlášení selhalo');
    }
  };

  return (
    <Box sx={{display:'flex', flexDirection:'column', alignItems:'center', mt:5}}>
      <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} sx={{mb:2}}/>
      <TextField label="Heslo" type="password" value={password} onChange={(e) => setPassword(e.target.value)} sx={{mb:2}}/>
      <Button variant="contained" onClick={handleSubmit}>Přihlásit</Button>
    </Box>
  );
};

export default LoginPage;
