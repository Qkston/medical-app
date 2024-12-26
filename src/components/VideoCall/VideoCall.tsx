import { useEffect, useState } from "react";
import { Alert, Box, Button, CircularProgress, Snackbar, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import socket from "../../utils/socket";
import axios from "axios";

export const VideoCall = ({ startCall }: { startCall: any }) => {
  const { patientEmail } = useParams<{ patientEmail: string }>();

  const [localId, setLocalId] = useState("");
  const [user, setUser] = useState<any>();
  const [isCallLinkSent, setIsCallLinkSentStatus] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  useEffect(() => {
    socket.on("init", ({ id }) => setLocalId(id)).emit("init");
  }, []);

  useEffect(() => {
    const userRecord = localStorage.getItem("user");
    if (!userRecord) return;

    const user = JSON.parse(userRecord);
    setUser(user);
  }, [localId]);

  const sendCallLink = async (id: string) => {
    const callLink = `${window.location.origin}/video-call/${id}`;
    try {
      await axios.post("https://k0ieme2qx9.execute-api.eu-north-1.amazonaws.com/medical-app-staging/send-videocall-invite", {
        patientEmail,
        callLink,
      });
      console.log("Посилання на відеодзвінок надіслано");
      setIsCallLinkSentStatus(true);
      setNotification({ message: "Посилання на відеодзвінок надіслано пацієнту. Очікуйте на з'єднання.", type: "success" });
    } catch (error) {
      console.error("Помилка надсилання посилання:", error);
      setNotification({ message: "Помилка надсилання посилання.", type: "error" });
    }
  };

  if (user?.role === "doctor") {
    return !isCallLinkSent ? (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Button onClick={() => sendCallLink(localId)}>Надіслати запрошення пацієнту</Button>
      </Box>
    ) : (
      <>
        <Box display="flex" flexDirection="column" rowGap="20px" justifyContent="center" alignItems="center" minHeight="80vh">
          <Typography>Очікування на пацієнта</Typography>
          <CircularProgress />
        </Box>
        {notification && (
          <Snackbar open={Boolean(notification)} autoHideDuration={6000} onClose={() => setNotification(null)}>
            <Alert onClose={() => setNotification(null)} severity={notification.type} sx={{ width: "100%" }}>
              {notification.message}
            </Alert>
          </Snackbar>
        )}
      </>
    );
  } else
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Button onClick={() => startCall(true, patientEmail, { audio: true, video: true })}>Підключитись до дзвінка</Button>
      </Box>
    );
};
