import {
  Typography,
  Card,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListSubheader,
  ListItemText,
  Avatar,
  useTheme,
  styled,
} from '@mui/material';

const ListWrapper = styled(List)(
  () => `
      .MuiListItem-root {
        border-radius: 0;
        margin: 0;
      }
`
);

function PopularTags() {
  const theme = useTheme();

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title="Skupiny" />
      <Divider />
      <ListWrapper disablePadding>
        <Divider />
        <ListItem button>
          <ListItemAvatar>
            <Avatar
              sx={{
                width: 38,
                height: 38,
                background: `${theme.colors.info.main}`,
                color: `${theme.palette.info.contrastText}`
              }}
            >
              MRP
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primaryTypographyProps={{
              variant: 'h5',
              color: `${theme.colors.alpha.black[100]}`
            }}
            primary="Máme rádi Prahu"
          />
        </ListItem>
        <Divider />
        <ListItem button>
          <ListItemAvatar>
            <Avatar
              sx={{
                width: 38,
                height: 38,
                background: `${theme.colors.alpha.black[100]}`,
                color: `${theme.colors.alpha.white[100]}`
              }}
            >
              P!
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primaryTypographyProps={{
              variant: 'h5',
              color: `${theme.colors.alpha.black[100]}`
            }}
            primary="Pochůzkáři"
          />
        </ListItem>
        <Divider />
        <ListItem button>
          <ListItemAvatar>
            <Avatar
              sx={{
                width: 38,
                height: 38,
                background: `${theme.colors.alpha.black[50]}`,
                color: `${theme.colors.alpha.white[100]}`
              }}
            >
              W&gt;T
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primaryTypographyProps={{
              variant: 'h5',
              color: `${theme.colors.alpha.black[100]}`
            }}
            primary="Less talking, more walking"
          />
        </ListItem>
      </ListWrapper>
    </Card>
  );
}

export default PopularTags;
