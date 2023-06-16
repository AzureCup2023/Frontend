import { Box, Button, Container, Grid, TextField, Typography } from '@mui/material';

import { Link as RouterLink } from 'react-router-dom';

import { styled } from '@mui/material/styles';

const TypographyH1 = styled(Typography)(
	({ theme }) => `
		font-size: ${theme.typography.pxToRem(50)};
`
);


const LabelWrapper = styled(Box)(
	({ theme }) => `
		background-color: gray;
		color: ${theme.palette.success.contrastText};
		font-weight: bold;
		border-radius: 30px;
		text-transform: uppercase;
		display: inline-block;
		font-size: ${theme.typography.pxToRem(11)};
		padding: ${theme.spacing(0.5)} ${theme.spacing(1.5)};
		margin-bottom: ${theme.spacing(2)};
`
);


function Login() {
	return (
		<Container maxWidth="lg" sx={{ textAlign: 'center' }}>
			<Grid
				spacing={{ xs: 6, md: 10 }}
				justifyContent="center"
				alignItems="center"
				container
			>
				<Grid item md={10} lg={8} mx="auto">
					<TypographyH1 sx={{ mb: 2 }} variant="h1">
						Foxplore
					</TypographyH1>
					<TextField
						id="outlined-required"
						label="Username"
					/>
					<div style={{ margin: "1rem" }}>
						<TextField
							id="outlined-password-input"
							label="Password"
							type="password"
							autoComplete="current-password"
						/>
					</div>
					<Button
						component={RouterLink}
						to="/dashboards"
						size="large"
						variant="contained"
						color='secondary'
					>
						Login
					</Button>
				</Grid>
			</Grid>
			<LabelWrapper mt={5} style={{ "marginBottom": "-1rem" }} color="success">Version 1.0.0</LabelWrapper>
		</Container>
	);
}

export default Login;
