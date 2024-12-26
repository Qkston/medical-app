import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { signOut } from "aws-amplify/auth";
import { AppBar, Toolbar, Button, Typography, Container, Box, CircularProgress } from "@mui/material";
import AuthComponent from "./components/Auth";
import RegisterPatient from "./components/RegisterPatient";
import ProtectedRoute, { AuthProvider, useAuth } from "./components/ProtectedRoute";
import PatientsTable from "./components/PatientsTable";
import ChatWithDoctor from "./components/ChatWithDoctor";
import SettingsPopup from "./components/SettingsPopup";
import { VideoCall } from "./components/VideoCall/VideoCall";
import { CallWindow } from "./components/VideoCall/CallWindow";
import { CallModal } from "./components/VideoCall/CallModal";

import PeerConnection from "./utils/PeerConnection";
import socket from "./utils/socket";

const App: React.FC = () => {
  const { checkAuth, userRole } = useAuth();

  const [callFrom, setCallFrom] = useState<any>("");
  const [calling, setCalling] = useState<any>(false);

  const [showModal, setShowModal] = useState<any>(false);

  const [localSrc, setLocalSrc] = useState<any>(null);
  const [remoteSrc, setRemoteSrc] = useState<any>(null);

  const [pc, setPc] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    socket.on("request", ({ from }) => {
      setCallFrom(from);
      setShowModal(true);
    });
  }, []);

  useEffect(() => {
    if (!pc) return;

    socket
      .on("call", data => {
        if (data.sdp) {
          pc.setRemoteDescription(data.sdp);

          if (data.sdp.type === "offer") {
            pc.createAnswer();
          }
        } else {
          pc.addIceCandidate(data.candidate);
        }
      })
      .on("end", () => finishCall(false));
  }, [pc]);

  const startCall = async (isCaller: any, remoteId: any, config: any) => {
    setShowModal(false);
    setCalling(true);
    setConfig(config);

    const _pc = new PeerConnection(remoteId)
      .on("localStream", (stream: any) => {
        setLocalSrc(stream);
      })
      .on("remoteStream", (stream: any) => {
        setRemoteSrc(stream);
        setCalling(false);
      })
      .start(isCaller, config);

    setPc(_pc);
  };

  const rejectCall = () => {
    socket.emit("end", { to: callFrom });
    setShowModal(false);
  };

  const finishCall = (isCaller: any) => {
    pc.stop(isCaller);

    setPc(null);
    setConfig(null);

    setCalling(false);
    setShowModal(false);

    setLocalSrc(null);
    setRemoteSrc(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      checkAuth();
      localStorage.removeItem("user");
      window.location.reload();
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const Header = () => {
    const { isAuthenticated } = useAuth();
    const hideAppBar = ["/login", "/register"].includes(window.location.pathname);

    if (!isAuthenticated || hideAppBar) return null;

    const userRecord = localStorage.getItem("user");
    if (!userRecord) return null;

    const user = JSON.parse(userRecord);

    return (
      <>
        <AppBar position="static" sx={{ backgroundColor: "transparent", boxShadow: "none" }}>
          <Toolbar>
            <Typography color="#1976d2" variant="h6" sx={{ flexGrow: 1 }}>
              CareSync - Медичний застосунок
            </Typography>
            <Box sx={{ mr: 2 }}>{user?.role === "doctor" && <SettingsPopup />}</Box>
            <Button variant="outlined" color="primary" onClick={handleSignOut}>
              Вийти
            </Button>
          </Toolbar>
        </AppBar>
        <Box sx={{ width: "100%", height: "4px", backgroundColor: "#e0e0e0" }} />
      </>
    );
  };

  const RoleRedirect = () => {
    if (userRole === "doctor") {
      return <Navigate to="/dashboard" replace />;
    } else if (userRole === "patient") {
      return <Navigate to="/chat" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  };

  return (
    <AuthProvider>
      <Router>
        <Header />
        <Container>
          <Routes>
            <Route path="/login" element={<AuthComponent />} />
            <Route path="/register" element={<RegisterPatient />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <PatientsTable />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <ChatWithDoctor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat/:patientEmail"
              element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <ChatWithDoctor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/video-call/:patientEmail"
              element={
                <ProtectedRoute allowedRoles={["doctor", "patient"]}>
                  <>
                    {!remoteSrc && !calling && !showModal && <VideoCall startCall={startCall} />}
                    {calling && (
                      <Box display="flex" flexDirection="column" rowGap="20px" justifyContent="center" alignItems="center" minHeight="80vh">
                        <Typography>Очікування на лікаря</Typography>
                        <CircularProgress />
                      </Box>
                    )}
                    {showModal && <CallModal callFrom={callFrom} startCall={startCall} />}
                    {remoteSrc && (
                      <CallWindow localSrc={localSrc} remoteSrc={remoteSrc} config={config} mediaDevice={pc?.mediaDevice} finishCall={finishCall} />
                    )}
                  </>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<RoleRedirect />} />
          </Routes>
        </Container>
      </Router>
    </AuthProvider>
  );
};

export default App;
