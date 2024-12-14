

Thought about CRM systém design po dobu několik sekund
Níže uvádím příklad kompletního řešení, které ukazuje základní strukturu frontendu a backendu CRM systému. Jedná se o ukázkový kód, který lze dále rozšiřovat a upravovat podle potřeby. Kód zahrnuje:

Backend (Node.js, Express, PostgreSQL):

Autentizace pomocí JWT tokenů.
REST API pro projekty, faktury, uživatele a historii komunikace.
Použití Sequelize ORM pro komunikaci s PostgreSQL.
Frontend (React, Material-UI):

Přihlášení uživatele.
Dashboard s přehledovými kartami.
Stránky pro správu projektů a faktur.
Komunikační historie u jednotlivých projektů.
Použití React Router pro navigaci.
Použití Material-UI pro UI komponenty.
Prosím berte v potaz, že se jedná o ukázku a před nasazením do produkce je potřeba provést úpravy, bezpečnostní audit, testování, aj.

Backend (Node.js + Express)
Předpoklady:
Nainstalovaný Node.js
Nainstalovaná PostgreSQL databáze
Nainstalovaný Sequelize CLI (volitelně pro migrace)
Struktura backendu (příklad):
lua
Zkopírovat kód
backend/
├─ package.json
├─ server.js
├─ config/
│  └─ config.js
├─ models/
│  ├─ index.js
│  ├─ user.js
│  ├─ project.js
│  ├─ invoice.js
│  └─ communication.js
├─ routes/
│  ├─ auth.js
│  ├─ projects.js
│  ├─ invoices.js
│  ├─ communications.js
│  └─ users.js
└─ middleware/
   ├─ authMiddleware.js
   └─ errorHandler.js
package.json
json
Zkopírovat kód
{
  "name": "crm-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "bcrypt": "^5.1.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0",
    "pg": "^8.10.0",
    "pg-hstore": "^2.3.4",
    "sequelize": "^7.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
config/config.js
js
Zkopírovat kód
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres'
  }
};
models/index.js
js
Zkopírovat kód
const { Sequelize } = require('sequelize');
const config = require('../config/config.js').development;

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect
});

// Načtení modelů
const User = require('./user')(sequelize);
const Project = require('./project')(sequelize);
const Invoice = require('./invoice')(sequelize);
const Communication = require('./communication')(sequelize);

// Relace mezi modely
User.hasMany(Project);
Project.belongsTo(User);

Project.hasMany(Invoice);
Invoice.belongsTo(Project);

Project.hasMany(Communication);
Communication.belongsTo(Project);

module.exports = { sequelize, User, Project, Invoice, Communication };
models/user.js
js
Zkopírovat kód
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'manager', 'user'),
      defaultValue: 'user'
    }
  });
  return User;
};
models/project.js
js
Zkopírovat kód
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Project = sequelize.define('Project', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Aktivní', 'Dokončené', 'Pozastavené'),
      defaultValue: 'Aktivní'
    },
    type: {
      type: DataTypes.STRING, // např. "vzduchotechnika", "klimatizace"
      allowNull: true
    }
  });
  return Project;
};
models/invoice.js
js
Zkopírovat kód
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Invoice = sequelize.define('Invoice', {
    number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Uhrazena', 'Neuhrazena'),
      defaultValue: 'Neuhrazena'
    },
    type: {
      type: DataTypes.ENUM('Prijatá', 'Vydaná'),
      allowNull: false
    }
  });
  return Invoice;
};
models/communication.js
js
Zkopírovat kód
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Communication = sequelize.define('Communication', {
    note: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  });
  return Communication;
};
middleware/authMiddleware.js
js
Zkopírovat kód
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if(!token) return res.status(401).json({error: 'Neautorizovaný přístup'});
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(403).json({error: 'Neplatný token'});
  }
};
middleware/errorHandler.js
js
Zkopírovat kód
module.exports = (err, req, res, next) => {
  console.error(err);
  res.status(500).json({error: 'Interní chyba serveru'});
};
routes/auth.js
js
Zkopírovat kód
const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: {email} });
  if(!user) return res.status(401).json({error: 'Nesprávné přihlašovací údaje'});

  const match = await bcrypt.compare(password, user.passwordHash);
  if(!match) return res.status(401).json({error: 'Nesprávné přihlašovací údaje'});

  const token = jwt.sign({id: user.id, role: user.role}, process.env.JWT_SECRET, {expiresIn: '1d'});
  res.json({token, role: user.role});
});

router.post('/register', async (req, res) => {
  const {email, password, role} = req.body;
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({email, passwordHash: hash, role: role || 'user'});
  res.json(user);
});

module.exports = router;
routes/projects.js
js
Zkopírovat kód
const express = require('express');
const router = express.Router();
const { Project } = require('../models');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, async (req, res) => {
  const projects = await Project.findAll();
  res.json(projects);
});

router.post('/', auth, async (req, res) => {
  const { name, status, type } = req.body;
  const project = await Project.create({ name, status, type, UserId: req.user.id });
  res.json(project);
});

router.put('/:id', auth, async (req, res) => {
  const { name, status, type } = req.body;
  const project = await Project.findByPk(req.params.id);
  if(!project) return res.status(404).json({error: 'Projekt nenalezen'});
  await project.update({ name, status, type });
  res.json(project);
});

router.delete('/:id', auth, async (req, res) => {
  const project = await Project.findByPk(req.params.id);
  if(!project) return res.status(404).json({error: 'Projekt nenalezen'});
  await project.destroy();
  res.json({message: 'Smazáno'});
});

module.exports = router;
routes/invoices.js
js
Zkopírovat kód
const express = require('express');
const router = express.Router();
const { Invoice, Project } = require('../models');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, async (req, res) => {
  const invoices = await Invoice.findAll({ include: Project });
  res.json(invoices);
});

router.post('/', auth, async (req, res) => {
  const { number, amount, status, type, ProjectId } = req.body;
  const invoice = await Invoice.create({ number, amount, status, type, ProjectId });
  res.json(invoice);
});

router.put('/:id', auth, async (req, res) => {
  const { number, amount, status, type } = req.body;
  const invoice = await Invoice.findByPk(req.params.id);
  if(!invoice) return res.status(404).json({error: 'Faktura nenalezena'});
  await invoice.update({ number, amount, status, type });
  res.json(invoice);
});

router.delete('/:id', auth, async (req, res) => {
  const invoice = await Invoice.findByPk(req.params.id);
  if(!invoice) return res.status(404).json({error: 'Faktura nenalezena'});
  await invoice.destroy();
  res.json({message: 'Smazáno'});
});

module.exports = router;
routes/communications.js
js
Zkopírovat kód
const express = require('express');
const router = express.Router();
const { Communication, Project } = require('../models');
const auth = require('../middleware/authMiddleware');

router.get('/:projectId', auth, async (req, res) => {
  const communications = await Communication.findAll({ where: {ProjectId: req.params.projectId} });
  res.json(communications);
});

router.post('/:projectId', auth, async (req, res) => {
  const { note } = req.body;
  const project = await Project.findByPk(req.params.projectId);
  if(!project) return res.status(404).json({error: 'Projekt nenalezen'});
  const communication = await Communication.create({ note, ProjectId: project.id });
  res.json(communication);
});

module.exports = router;
routes/users.js (pro správce)
js
Zkopírovat kód
const express = require('express');
const router = express.Router();
const { User } = require('../models');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, async (req, res) => {
  if(req.user.role !== 'admin') return res.status(403).json({error: 'Nedostatečná práva'});
  const users = await User.findAll();
  res.json(users);
});

module.exports = router;
server.js
js
Zkopírovat kód
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', require('./routes/auth'));
app.use('/projects', require('./routes/projects'));
app.use('/invoices', require('./routes/invoices'));
app.use('/communications', require('./routes/communications'));
app.use('/users', require('./routes/users'));

app.use(errorHandler);

sequelize.sync().then(() => {
  app.listen(process.env.PORT || 3001, () => {
    console.log('Backend běží na portu ' + (process.env.PORT || 3001));
  });
});
Frontend (React + Material-UI)
Předpoklady:
Nainstalovaný Node.js
Vytvoření React aplikace (např. create-react-app frontend)
Struktura frontendu (příklad):
css
Zkopírovat kód
frontend/
├─ package.json
├─ src/
│  ├─ App.js
│  ├─ index.js
│  ├─ api/
│  │  ├─ axiosInstance.js
│  │  ├─ auth.js
│  │  ├─ projects.js
│  │  └─ invoices.js
│  ├─ components/
│  │  ├─ Navbar.js
│  │  └─ ProtectedRoute.js
│  ├─ pages/
│  │  ├─ LoginPage.js
│  │  ├─ DashboardPage.js
│  │  ├─ ProjectsPage.js
│  │  ├─ InvoicesPage.js
│  │  ├─ CommunicationsPage.js
│  │  └─ NotFoundPage.js
│  └─ context/
│     └─ AuthContext.js
└─ ...
package.json (frontend)
json
Zkopírovat kód
{
  "name": "crm-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@emotion/react": "^11.10.5",
    "@emotion/styled": "^11.10.5",
    "@mui/icons-material": "^5.14.0",
    "@mui/material": "^5.14.0",
    "axios": "^1.5.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.14.1"
  },
  "scripts": {
    "start": "react-scripts start"
  }
}
src/api/axiosInstance.js
js
Zkopírovat kód
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:3001', // Změnit dle potřeby
});

instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if(token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
src/api/auth.js
js
Zkopírovat kód
import axios from './axiosInstance';

export const login = async (email, password) => {
  const res = await axios.post('/auth/login', {email, password});
  return res.data;
};
src/api/projects.js
js
Zkopírovat kód
import axios from './axiosInstance';

export const fetchProjects = async () => {
  const res = await axios.get('/projects');
  return res.data;
};
src/api/invoices.js
js
Zkopírovat kód
import axios from './axiosInstance';

export const fetchInvoices = async () => {
  const res = await axios.get('/invoices');
  return res.data;
};
src/context/AuthContext.js
js
Zkopírovat kód
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token') || null,
    role: localStorage.getItem('role') || null
  });

  const login = (token, role) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    setAuth({token, role});
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setAuth({token: null, role: null});
  };

  return (
    <AuthContext.Provider value={{auth, login, logout}}>
      {children}
    </AuthContext.Provider>
  )
};
src/components/Navbar.js
js
Zkopírovat kód
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
src/components/ProtectedRoute.js
