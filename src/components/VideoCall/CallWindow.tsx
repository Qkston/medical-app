import { CallEnd, Mic, MicOff, Videocam, VideocamOff } from "@mui/icons-material";
import { Box, IconButton } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const CallWindow = ({ remoteSrc, localSrc, config, mediaDevice, finishCall }: any) => {
  const { patientEmail } = useParams<{ patientEmail: string }>();
  const navigate = useNavigate();

  const remoteVideo = useRef<any>();
  const localVideo = useRef<any>();
  const localVideoSize = useRef<any>();

  const [video, setVideo] = useState<any>(config?.video);
  const [audio, setAudio] = useState<any>(config?.audio);
  const [dragging, setDragging] = useState<any>(false);
  const [coords, setCoords] = useState<any>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const { width, height } = localVideo.current.getBoundingClientRect();
    localVideoSize.current = { width, height };
  }, []);

  useEffect(() => {
    dragging ? localVideo.current.classList.add("dragging") : localVideo.current.classList.remove("dragging");
  }, [dragging]);

  const onMouseMove = (e: any) => {
    if (dragging) {
      setCoords({
        x: e.clientX - localVideoSize.current.width / 2,
        y: e.clientY - localVideoSize.current.height / 2,
      });
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  });

  useEffect(() => {
    if (remoteVideo.current && remoteSrc) {
      remoteVideo.current.srcObject = remoteSrc;
    }
    if (localVideo.current && localSrc) {
      localVideo.current.srcObject = localSrc;
    }
  }, [remoteSrc, localSrc]);

  useEffect(() => {
    if (mediaDevice) {
      mediaDevice.toggle("Video", video);
      mediaDevice.toggle("Audio", audio);
    }
  }, [mediaDevice]);

  const toggleMediaDevice = (deviceType: any) => {
    if (deviceType === "video") {
      setVideo(!video);
      mediaDevice.toggle("Video");
    }
    if (deviceType === "audio") {
      setAudio(!audio);
      mediaDevice.toggle("Audio");
    }
  };

  const handleFinishCall = () => {
    finishCall(true);
    const userRecord = localStorage.getItem("user");
    if (!userRecord) return;

    const user = JSON.parse(userRecord);

    if (user.role === "doctor") {
      navigate(`/chat/${patientEmail}`);
    } else {
      navigate("/chat");
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="center" alignContent="center" gap="20px">
        <video ref={remoteVideo} autoPlay />
        <video
          ref={localVideo}
          autoPlay
          muted
          onClick={() => setDragging(!dragging)}
          style={{
            top: `${coords.y}px`,
            left: `${coords.x}px`,
          }}
        />
      </Box>
      <Box width="100%" mt="20px" display="flex" justifyContent="center" alignContent="center" gap="20px">
        <IconButton onClick={() => toggleMediaDevice("video")}>{video ? <Videocam /> : <VideocamOff />}</IconButton>
        <IconButton onClick={() => toggleMediaDevice("audio")}>{audio ? <Mic /> : <MicOff />}</IconButton>
        <IconButton onClick={handleFinishCall}>
          <CallEnd />
        </IconButton>
      </Box>
    </Box>
  );
};
