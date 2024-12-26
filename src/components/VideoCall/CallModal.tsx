import { Box, Button, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

export const CallModal = ({ callFrom, startCall }: { callFrom: any; startCall: any }) => {
  const { patientEmail } = useParams<{ patientEmail: string }>();

  const acceptWithVideo = (video: any) => {
    const config = { audio: true, video };
    startCall(false, callFrom, config);
  };

  return (
    <Box display="flex" flexDirection="column" rowGap="20px" justifyContent="center" alignItems="center" minHeight="80vh">
			<Typography>Пацієнт ({patientEmail}) під'єднався до виклику</Typography>
			<Button onClick={() => acceptWithVideo(true)}>
				Підключитись до виклику
			</Button>
    </Box>
  );
};
