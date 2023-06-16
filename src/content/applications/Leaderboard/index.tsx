import { Helmet } from 'react-helmet-async';

import {
	Box,
	Container,
	Grid,
	Typography,
	styled,
} from '@mui/material';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import Footer from 'src/components/Footer';

export default function Leaderboard() {
	return (
		<>
			<Helmet>
				<title>Žebříček</title>
			</Helmet>
			<PageTitleWrapper>
				<Grid container justifyContent="space-between" alignItems="center">
					<Grid item>
					<Typography variant="h3" component="h3" gutterBottom>
						Žebříček
					</Typography>
					</Grid>
				</Grid>
			</PageTitleWrapper>
			<Container maxWidth="lg">
				<Grid
				container
				direction="row"
				justifyContent="center"
				alignItems="stretch"
				spacing={3}
				>
				<Grid item xs={12}>
					TODO
				</Grid>
				</Grid>
			</Container>
			<Footer />
		</>
	);
}
