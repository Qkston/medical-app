import React, { useEffect, useRef, useState } from "react";
import { Box, Button } from "@mui/material";

const VideoCall: React.FC = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [isDoctor, setIsDoctor] = useState<boolean>(false);
  const [isCallStarted, setIsCallStarted] = useState<boolean>(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setIsDoctor(user.role === "doctor");

    const ws = new WebSocket(`ws://localhost:8080/?id=${user.id}`);
    setSocket(ws);

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    setPeerConnection(pc);

    // WebSocket events
    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      console.log("Received message:", data);

      if (!peerConnection) return;

      switch (data.type) {
        case "offer":
          if (!isDoctor) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            ws.send(JSON.stringify({ type: "answer", sdp: answer, targetId: data.senderId }));
          }
          break;

        case "answer":
          if (isDoctor) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
          }
          break;

        case "candidate":
          if (data.candidate) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
          }
          break;

        default:
          console.error("Unknown message type:", data.type);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket closed. Attempting to reconnect...");
      setTimeout(() => {
        setSocket(new WebSocket(`ws://localhost:8080/?id=${user.id}`));
      }, 1000);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        ws.send(JSON.stringify({ type: "candidate", candidate: event.candidate, targetId: "patientId" })); // Replace with dynamic target ID
      }
    };

    // Handle remote streams
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    return () => {
      ws.close();
      pc.close();
    };
  }, [isDoctor]);

  const startCall = async () => {
    if (!peerConnection || !socket) return;

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    socket.send(JSON.stringify({ type: "offer", sdp: offer, targetId: "patientId" })); // Replace with dynamic target ID
    setIsCallStarted(true);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between">
        <video ref={localVideoRef} autoPlay muted style={{ width: "45%" }} />
        <video ref={remoteVideoRef} autoPlay style={{ width: "45%" }} />
      </Box>
      <Box display="flex" justifyContent="center" mt={2}>
        {isDoctor && !isCallStarted && <Button onClick={startCall}>Start Call</Button>}
        {isCallStarted && (
          <>
            <Button onClick={() => peerConnection?.getSenders().forEach((sender) => sender.track?.stop())}>Toggle Camera</Button>
            <Button onClick={() => peerConnection?.getSenders().forEach((sender) => (sender.track!.enabled = !sender.track!.enabled))}>
              Toggle Mic
            </Button>
            <Button onClick={() => window.location.reload()}>Leave</Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default VideoCall;
