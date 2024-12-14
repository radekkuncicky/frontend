import React, { useEffect, useState } from 'react';
import { fetchProjects } from '../api/projects';
import { Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    (async ()=> {
      const data = await fetchProjects();
      setProjects(data);
    })();
  }, []);

  return (
    <Paper sx={{mt:2}}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Název</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Typ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {projects.map(p => (
            <TableRow key={p.id}>
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.status}</TableCell>
              <TableCell>{p.type}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default ProjectsPage;
