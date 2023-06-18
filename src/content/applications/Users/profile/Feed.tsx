import {
  Box,
  Typography,
  Card,
  CardHeader,
  Divider,
  Avatar,
  Grid,
  Button
} from '@mui/material';

import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';

function Feed() {
  const feed = [
    {
      name: 'Megan Lorem',
      jobtitle: 'Účetní',
      company: 'Průzkumník',
      avatar: '/static/images/avatars/1.jpg'
    },
    {
      name: 'Kamila Nováková',
      jobtitle: 'Učitelka',
      company: 'Objevitel',
      avatar: '/static/images/avatars/2.jpg'
    },
    {
      name: 'John Cabbage',
      jobtitle: 'Lékárník',
      company: 'Průzkumník',
      avatar: '/static/images/avatars/3.jpg'
    },
    {
      name: 'Edward Jonson',
      jobtitle: 'Svářeč',
      company: 'Milovník vesnic',
      avatar: '/static/images/avatars/6.jpg'
    },
    {
      name: 'Ludmila Uličná',
      jobtitle: 'Sociální pracovnice',
      company: 'Cestovatel',
      avatar: '/static/images/avatars/5.jpg'
    },
    {
      name: 'Roman Romanov',
      jobtitle: 'Výzkumný pracovník',
      company: 'Rookie',
      avatar: '/static/images/avatars/6.jpg'
    }
  ];

  return (
    <Card>
      <CardHeader title="Podobné trasy" />
      <Divider />
      <Box p={2}>
        <Grid container spacing={0}>
          {feed.map((_feed) => (
            <Grid key={_feed.name} item xs={12} sm={6} lg={4}>
              <Box p={3} display="flex" alignItems="flex-start">
                <Avatar src={_feed.avatar} />
                <Box pl={2}>
                  <Typography gutterBottom variant="subtitle2">
                    {_feed.company}
                  </Typography>
                  <Typography variant="h4" gutterBottom>
                    {_feed.name}
                  </Typography>
                  <Typography color="text.primary" sx={{ pb: 2 }}>
                    {_feed.jobtitle}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddTwoToneIcon />}
                  >
                    Sledovat
                  </Button>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Card>
  );
}

export default Feed;
