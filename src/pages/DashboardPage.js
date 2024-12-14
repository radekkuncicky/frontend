import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import { fetchProjects } from '../api/projects';
import { fetchInvoices } from '../api/invoices';

const DashboardPage = () => {
  const [projectCount, setProjectCount] = useState(0);
  const [invoiceCount, setInvoiceCount] = useState(0);

  useEffect(() => {
    (async () => {
      const projects = await fetchProjects();
      const invoices = await fetchInvoices();
      setProjectCount(projects.length);
      setInvoiceCount(invoices.length);
    })();
  }, []);

  return (
    <Grid container spacing={2} sx={{mt:2}}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h5">Počet projektů: {projectCount}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h5">Počet faktur: {invoiceCount}</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default DashboardPage;
