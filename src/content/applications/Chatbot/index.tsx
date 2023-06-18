import { Helmet } from 'react-helmet-async';
import SendTwoToneIcon from '@mui/icons-material/SendTwoTone';
import Scrollbar from 'src/components/Scrollbar';

import {
	Box,
	styled,
	Divider,
	useTheme,
	Button,
	InputBase,
	Card,
} from '@mui/material';
import { useState } from 'react';

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.REACT_APP_GPT_KEY,
});
const openai = new OpenAIApi(configuration);

const RootWrapper = styled(Box)(
	({ theme }) => `
			 height: calc(100vh - ${theme.header.height});
			 display: flex;
`
);

const ChatWindow = styled(Box)(
	() => `
				width: 100%;
				height: 100%;
				display: flex;
				flex-direction: column;
				flex: 1;
`
);

const MessageInputWrapper = styled(InputBase)(
({ theme }) => `
	font-size: ${theme.typography.pxToRem(18)};
	padding: ${theme.spacing(1)};
	width: 100%;
`
);

const CardWrapperPrimary = styled(Card)(
	({ theme }) => `
			background: ${theme.colors.primary.main};
			color: ${theme.palette.primary.contrastText};
			padding: ${theme.spacing(2)};
			border-radius: ${theme.general.borderRadiusXl};
			border-top-right-radius: ${theme.general.borderRadius};
			max-width: 380px;
			display: inline-flex;
`
);

const CardWrapperSecondary = styled(Card)(
	({ theme }) => `
			background: ${theme.colors.alpha.black[10]};
			color: ${theme.colors.alpha.black[100]};
			padding: ${theme.spacing(2)};
			border-radius: ${theme.general.borderRadiusXl};
			border-top-left-radius: ${theme.general.borderRadius};
			max-width: 380px;
			display: inline-flex;
`
);


function Block(prop: {text: string, flex: string}) {
	return <Box
			display="flex"
			alignItems={"flex-" + prop.flex}
			justifyContent={"flex-" + prop.flex}
			py={3}
		>
		<Box
			display="flex"
			alignItems={"flex-" + prop.flex}
			flexDirection="column"
			justifyContent={"flex-" + prop.flex}
			mr={2}
		>
			{prop.flex == "end" ? 
			<CardWrapperPrimary>
				{prop.text}
			</CardWrapperPrimary>
			:
			<CardWrapperSecondary>
				{prop.text}
			</CardWrapperSecondary>}
		</Box>
	</Box>
}


function ApplicationsChatBot() {
	const [chatContent, setChatContent] = useState([]);

	async function sendMessage() {
		const elem = (document.getElementById("text-content") as HTMLInputElement);
		if (!elem.value) return;
		chatContent.push({flex: "end", text: elem.value});
		setChatContent([...chatContent]);
		const chatCompletion = await openai.createChatCompletion({
			model: "gpt-3.5-turbo",
			messages: [{role: "user", content: elem.value}],
		});
		chatContent.push({flex: "start", text: chatCompletion.data.choices[0].message.content});
		setChatContent([...chatContent]);
	}

	const theme = useTheme();

	return (
		<>
			<Helmet>
				<title>Chat bot</title>
			</Helmet>
			<RootWrapper className="Mui-FixedWrapper">
				<ChatWindow>
					<Box flex={1}>
						<Scrollbar>
							<Box p={3}>
								{chatContent.map((el, idx) => { 
									return <Block key={idx} flex={el.flex} text={el.text} />
								})}
							</Box>
						</Scrollbar>
					</Box>
					<Divider />
					<Box
						sx={{
							background: theme.colors.alpha.white[50],
							display: 'flex',
							alignItems: 'center',
							p: 2
						}}
					>
						<Box flexGrow={1} display="flex" alignItems="center">
							<MessageInputWrapper
								id="text-content"
								autoFocus
								placeholder="Write your message here..."
								fullWidth
							/>
						</Box>
						<Box>
							<Button onClick={sendMessage} startIcon={<SendTwoToneIcon />} variant="contained">
								Send
							</Button>
						</Box>
					</Box>
				</ChatWindow>
			</RootWrapper>
		</>
	);
}

export default ApplicationsChatBot;
