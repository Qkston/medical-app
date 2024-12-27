import { Box, Button, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

const CallModal = ({
  callFrom,
  startCall,
}: {
  callFrom: string;
  startCall: (
    isCaller: boolean,
    remoteId: string,
    config: {
      audio: boolean;
      video: boolean;
    }
  ) => Promise<void>;
}) => {
  const { patientEmail } = useParams<{ patientEmail: string }>();

  const acceptWithVideo = () => {
    const config = { audio: true, video: true };
    startCall(false, callFrom, config);
  };

  return (
    <Box display="flex" flexDirection="column" rowGap="20px" justifyContent="center" alignItems="center" minHeight="80vh">
      <Typography>Пацієнт ({patientEmail}) під'єднався до виклику</Typography>
      <Button onClick={acceptWithVideo}>Підключитись до виклику</Button>
    </Box>
  );
};

export default CallModal;
