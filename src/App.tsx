import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { signOut } from "aws-amplify/auth";
import { AppBar, Toolbar, Button, Typography, Container, Box } from "@mui/material";
import AuthComponent from "./components/Auth";
import RegisterPatient from "./components/RegisterPatient";
import ProtectedRoute, { AuthProvider, useAuth } from "./components/ProtectedRoute";
import PatientsTable from "./components/PatientsTable";
import ChatWithDoctor from "./components/ChatWithDoctor";

const App: React.FC = () => {
  const { checkAuth, userRole } = useAuth();

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

    return (
      <>
        <AppBar position="static" sx={{ backgroundColor: "transparent", boxShadow: "none" }}>
          <Toolbar>
            <Typography color="#1976d2" variant="h6" sx={{ flexGrow: 1 }}>
              CareSync - Медичний застосунок
            </Typography>
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
            <Route path="*" element={<RoleRedirect />} />
          </Routes>
        </Container>
      </Router>
    </AuthProvider>
  );
};

export default App;
