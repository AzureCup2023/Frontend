import { Helmet } from 'react-helmet-async';
import Footer from 'src/components/Footer';

import { Grid, Container } from '@mui/material';

import ProfileCover from './ProfileCover';
import RecentActivity from './RecentActivity';
import Feed from './Feed';
import PopularTags from './PopularTags';

function ManagementUserProfile() {
  const user = {
    savedCards: 7,
    name: 'Lorem Ipsolon',
    coverImg: '/static/images/placeholders/covers/1.jpg',
    avatar: '/static/images/avatars/4.jpg',
    description:
      "Rád se procházím po Praze. Procházíš se taky rád/a a nechceš být sám? Dej follow a můžeme jít příště spolu :)",
    jobtitle: 'Web Developer',
    location: 'Praha, Česká Republika',
    followers: '37'
  };

  return (
    <>
      <Helmet>
        <title>User Details - Management</title>
      </Helmet>
      <Container sx={{ mt: 3 }} maxWidth="lg">
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          spacing={3}
        >
          <Grid item xs={12} md={8}>
            <ProfileCover user={user} />
          </Grid>
          <Grid item xs={12} md={4}>
            <RecentActivity />
          </Grid>
          <Grid item xs={12} md={8}>
            <Feed />
          </Grid>
          <Grid item xs={12} md={4}>
            <PopularTags />
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </>
  );
}

export default ManagementUserProfile;
