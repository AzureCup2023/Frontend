import { Helmet } from 'react-helmet-async';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Grid, Container, Typography, Box, Divider, useTheme, List, ListItem } from '@mui/material';
import Footer from 'src/components/Footer';
import { ApexOptions } from 'apexcharts';
import Chart from 'react-apexcharts';
import Text from 'src/components/Text';
import {
  Button,
  Card,
  styled,
  Avatar,
  alpha,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import WatchListColumn from './WatchListColumn';

function ApplicationsTransactions() {
  const theme = useTheme();
  const chartOptions: ApexOptions = {
    chart: {
      background: 'transparent',
      stacked: false,
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '60%'
        }
      }
    },
    colors: ["#fd7f6f", "#7eb0d5", "#b2e061", "#beb9db"],
    

    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val + '%';
      },
      style: {
        colors: [theme.colors.alpha.black[100]]
      },
      background: {
        enabled: true,
        foreColor: theme.colors.alpha.trueWhite[100],
        padding: 8,
        borderRadius: 4,
        borderWidth: 0,
        opacity: 0.3,
        dropShadow: {
          enabled: true,
          top: 1,
          left: 1,
          blur: 1,
          color: theme.colors.alpha.black[70],
          opacity: 0.5
        }
      },
      dropShadow: {
        enabled: true,
        top: 1,
        left: 1,
        blur: 1,
        color: theme.colors.alpha.black[50],
        opacity: 0.1
      }
    },
    fill: {
      opacity: 1
    },
    labels: ['Zbytek ČR', 'Brno', 'Ostrava', 'Praha'],
    legend: {
      labels: {
        colors: theme.colors.alpha.black[10]
      },
      show: false
    },
    stroke: {
      width: 0
    },
    theme: {
      mode: theme.palette.mode
    }
  };
  const ListItemAvatarWrapper = styled(ListItemAvatar)(
    ({ theme }) => `
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: ${theme.spacing(1)};
    padding: ${theme.spacing(0.5)};
    border-radius: 60px;
    background: ${
      theme.palette.mode === 'dark'
        ? theme.colors.alpha.trueWhite[30]
        : alpha(theme.colors.alpha.black[100], 0.07)
    };
  
    img {
      background: ${theme.colors.alpha.trueWhite[100]};
      padding: ${theme.spacing(0.5)};
      display: block;
      border-radius: inherit;
      height: ${theme.spacing(4.5)};
      width: ${theme.spacing(4.5)};
    }
  `
  );
  const chartSeries = [6, 14, 23, 57];
  return (
    <>
      <Helmet>
        <title>Statistiky</title>
      </Helmet>
      <PageTitleWrapper>
      <Grid container justifyContent="space-between" alignItems="center">
        <Grid item>
          <Typography variant="h3" component="h3" gutterBottom>
            Statistiky
          </Typography>
        </Grid>
      </Grid>
      </PageTitleWrapper>
      <Container maxWidth="lg">
      <Card>
        <Grid item xs={12}>
            <WatchListColumn />
          </Grid>
        </Card>

        <br></br>
        <Card>
          
        <Grid item xs={12}>
          
            <Grid
            sx={{
              position: 'relative'
            }}
            display="flex"
            alignItems="center"
            item
            xs={12}
            md={6}
          >
            
            <Box
              component="span"
              sx={{
                display: { xs: 'none', md: 'inline-block' }
              }}
            >
              <Divider absolute orientation="vertical" />
            </Box>
            <Box py={4} pr={4} flex={1}>
              <Grid container spacing={0}>
                <Grid
                  xs={12}
                  sm={5}
                  item
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Chart
                    height={250}
                    options={chartOptions}
                    series={chartSeries}
                    type="donut"
                  />
                </Grid>
                <Grid xs={12} sm={7} item display="flex" alignItems="center">
                  <List
                    disablePadding
                    sx={{
                      width: '100%'
                    }}
                  >
                    <ListItem disableGutters>
                      <ListItemAvatarWrapper>
                        PRG
                      </ListItemAvatarWrapper>
                      <ListItemText
                        primary="Praha"
                        primaryTypographyProps={{ variant: 'h5', noWrap: true }}
                        secondaryTypographyProps={{
                          variant: 'subtitle2',
                          noWrap: true
                        }}
                      />
                      <Box>
                        <Typography align="right" variant="h4" noWrap>
                          57%
                        </Typography>
                      </Box>
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemAvatarWrapper>
                        OVA
                      </ListItemAvatarWrapper>
                      <ListItemText
                        primary="Ostrava"
                        primaryTypographyProps={{ variant: 'h5', noWrap: true }}
                        secondaryTypographyProps={{
                          variant: 'subtitle2',
                          noWrap: true
                        }}
                      />
                      <Box>
                        <Typography align="right" variant="h4" noWrap>
                          23%
                        </Typography>
                      </Box>
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemAvatarWrapper>
                        BNO
                      </ListItemAvatarWrapper>
                      <ListItemText
                        primary="Brno"
                        primaryTypographyProps={{ variant: 'h5', noWrap: true }}
                        secondaryTypographyProps={{
                          variant: 'subtitle2',
                          noWrap: true
                        }}
                      />
                      <Box>
                        <Typography align="right" variant="h4" noWrap>
                          14%
                        </Typography>
                      </Box>
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemAvatarWrapper>
                        OTR
                      </ListItemAvatarWrapper>
                      <ListItemText
                        primary="Zbytek ČR"
                        primaryTypographyProps={{ variant: 'h5', noWrap: true }}
                        secondaryTypographyProps={{
                          variant: 'subtitle2',
                          noWrap: true
                        }}
                      />
                      <Box>
                        <Typography align="right" variant="h4" noWrap>
                          6%
                        </Typography>
                      </Box>
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>

        </Card>
      </Container>
      <Footer />
    </>
  );
}

export default ApplicationsTransactions;
