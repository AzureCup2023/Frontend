import { Helmet } from 'react-helmet-async';
import { Grid, Container } from '@mui/material';
import Footer from 'src/components/Footer';

import MapWrapper from "src/components/Maps/MapWrapper";

import "src/styles/azure-maps-layer-legend.css";
import "src/styles/mui-override.css";

function ApplicationsTransactions() {
  return (
    <>
      <Helmet>
        <title>Mapa</title>
      </Helmet>
      <Container maxWidth="lg">
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          spacing={3}
        >
          <Grid item xs={12}>
            <MapWrapper />
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </>
  );
}

export default ApplicationsTransactions;
