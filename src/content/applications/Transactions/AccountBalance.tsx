import {
  Card,
  Box,
  Grid,
  Typography,
  styled,
  Avatar,
} from '@mui/material';
import TrendingUp from '@mui/icons-material/TrendingUp';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import ChurchIcon from '@mui/icons-material/Church';
import WbTwilightIcon from '@mui/icons-material/WbTwilight';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import NightlifeIcon from '@mui/icons-material/Nightlife';

const AvatarSuccess = styled(Avatar)(
  ({ theme }) => `
      background-color: ${theme.colors.success.main};
      color: ${theme.palette.success.contrastText};
      width: ${theme.spacing(8)};
      height: ${theme.spacing(8)};
      box-shadow: ${theme.colors.shadows.success};
`
);

const AvatarGrey = styled(Avatar)(
  ({ theme }) => `
      background-color: ${theme.colors.secondary};
      color: ${theme.palette.success.contrastText};
      width: ${theme.spacing(8)};
      height: ${theme.spacing(8)};
      box-shadow: ${theme.colors.shadows.primary};
`
);



function AccountBalance() {

  return (
    <Card>
      <Grid spacing={0} container>
        <Grid item xs={12} md={6}>
          <Box p={4}>
            <Typography
              variant="h4"
            >
              Úspěchy
            </Typography>
            <Box>
              <Box
                display="flex"
                sx={{
                  py: 4,
                  pr: 4
                }}
                alignItems="center"
              >
                <AvatarSuccess
                  sx={{
                    mr: 2
                  }}
                  variant="rounded"
                >
                  <TrendingUp fontSize="large" />
                </AvatarSuccess>
                <Box                sx={{
                  pr: 9
                }}>
                  <Typography variant="h4" noWrap>Stabilní progress</Typography>
                  <Typography variant="subtitle2" noWrap>
                    37 dní každý den nový objev
                  </Typography>
                </Box>
                <AvatarGrey
                  sx={{
                    mr: 2
                  }}
                  variant="rounded"
                >
                  <ConnectWithoutContactIcon fontSize="large" />
                </AvatarGrey>
                <Box                sx={{
                  pr: 10
                }}>
                  <Typography variant="h4" noWrap>Ve dvou to táhne líp</Typography>
                  <Typography variant="subtitle2" noWrap>
                    Najdi si parťáka na cesty
                  </Typography>
                </Box>
                <AvatarSuccess
                  sx={{
                    mr: 2
                  }}
                  variant="rounded"
                >
                  <WbTwilightIcon fontSize="large" />
                </AvatarSuccess>
                <Box                sx={{
                  pr: 10
                }}>
                  <Typography variant="h4" noWrap>Ranní ptáče</Typography>
                  <Typography variant="subtitle2" noWrap>
                    Vyjdi objevovat při východu slunce
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box>
              <Box
                display="flex"
                sx={{
                  py: 4,
                  pr: 4
                }}
                alignItems="center"
              >
                <AvatarSuccess
                  sx={{
                    mr: 2
                  }}
                  variant="rounded"
                >
                  <ChurchIcon fontSize="large" />
                </AvatarSuccess>
                <Box                sx={{
                  pr: 10
                }}>
                  <Typography variant="h4" noWrap>Kostelník</Typography>
                  <Typography variant="subtitle2" noWrap>
                    Navštiv alespoň 20 kostelů 
                  </Typography>
                </Box>
                <AvatarSuccess
                  sx={{
                    mr: 2
                  }}
                  variant="rounded"
                >
                  <NightlifeIcon fontSize="large" />
                </AvatarSuccess>
                <Box                sx={{
                  pr: 9
                }}>
                  <Typography variant="h4" noWrap>Správný student</Typography>
                  <Typography variant="subtitle2" noWrap>
                    I noční život má své kouzlo
                  </Typography>
                </Box>
                <AvatarGrey
                  sx={{
                    mr: 2
                  }}
                  variant="rounded"
                >
                  <AgricultureIcon fontSize="large" />
                </AvatarGrey>
                <Box                sx={{
                  pr: 10
                }}>
                  <Typography variant="h4" noWrap>Výlet jako BRNO</Typography>
                  <Typography variant="subtitle2" noWrap>
                    Prozkoumej alespoň 20 vesnic
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Grid>

      </Grid>
    </Card>
  );
}

export default AccountBalance;
