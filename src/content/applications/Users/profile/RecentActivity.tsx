import {
  Box,
  Typography,
  Card,
  CardHeader,
  Divider,
  Avatar,
  useTheme,
  styled,
} from '@mui/material';

import DirectionsWalk from '@mui/icons-material/DirectionsWalk';
import TravelExplore from '@mui/icons-material/TravelExplore';
import StarTwoToneIcon from '@mui/icons-material/StarTwoTone';

const AvatarPrimary = styled(Avatar)(
  ({ theme }) => `
      background: ${theme.colors.primary.lighter};
      color: ${theme.colors.primary.main};
      width: ${theme.spacing(7)};
      height: ${theme.spacing(7)};
`
);

function RecentActivity() {
  const theme = useTheme();

  return (
    <Card>
      <CardHeader title="Aktivita" />
      <Divider />
      <Box px={2} py={4} display="flex" alignItems="flex-start">
        <AvatarPrimary>
          <DirectionsWalk />
        </AvatarPrimary>
        <Box pl={2} flex={1}>
          <Typography variant="h3">Nachozené kilometry</Typography>

          <Box pt={2} display="flex">
            <Box pr={8}>
              <Typography
                gutterBottom
                variant="caption"
                sx={{ fontSize: `${theme.typography.pxToRem(14)}` }}
              >
                Tento týden
              </Typography>
              <Typography variant="h2">25</Typography>
            </Box>
            <Box>
              <Typography
                gutterBottom
                variant="caption"
                sx={{ fontSize: `${theme.typography.pxToRem(14)}` }}
              >
                Celkem
              </Typography>
              <Typography variant="h2">327</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      <Divider />
      <Box px={2} py={4} display="flex" alignItems="flex-start">
        <AvatarPrimary>
          <TravelExplore />
        </AvatarPrimary>
        <Box pl={2} flex={1}>
          <Typography variant="h3">Objevené památky</Typography>

          <Box pt={2} display="flex">
            <Box pr={8}>
              <Typography
                gutterBottom
                variant="caption"
                sx={{ fontSize: `${theme.typography.pxToRem(16)}` }}
              >
                Tento týden
              </Typography>
              <Typography variant="h2">3</Typography>
            </Box>
            <Box>
              <Typography
                gutterBottom
                variant="caption"
                sx={{ fontSize: `${theme.typography.pxToRem(16)}` }}
              >
                Celkem
              </Typography>
              <Typography variant="h2">47</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      <Divider />
      <Box px={2} py={4} display="flex" alignItems="flex-start">
        <AvatarPrimary>
          <StarTwoToneIcon />
        </AvatarPrimary>
        <Box pl={2} flex={1}>
          <Typography variant="h3">Prozkoumané území</Typography>

          <Box pt={2} display="flex">
            <Box pr={8}>
              <Typography
                gutterBottom
                variant="caption"
                sx={{ fontSize: `${theme.typography.pxToRem(16)}` }}
              >
                Celkem
              </Typography>
              <Typography variant="h2">51%</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}

export default RecentActivity;
