import { signOut } from "aws-amplify/auth";
import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import AuthComponent from "./components/Auth";
import RegisterPatient from "./components/RegisterPatient";
import ProtectedRoute, {
  AuthProvider,
  useAuth,
} from "./components/ProtectedRoute";
import AuthRedirect from "./components/AuthRedirect";
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Container,
  Box,
} from "@mui/material";
import PatientsTable from "./components/PatientsTable";
import ChatWithDoctor from "./components/ChatWithDoctor";

const App: React.FC = () => {
  const { checkAuth, userRole } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      checkAuth();
      window.location.reload();
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const Header = () => {
    const location = useLocation();
    const hideAppBar =
      location.pathname === "/login" || location.pathname === "/register";

    return !hideAppBar ? (
      <>
        <AppBar
          position="static"
          sx={{ backgroundColor: "transparent", boxShadow: "none" }}
        >
          <Toolbar>
            <Typography color="#1976d2" variant="h6" sx={{ flexGrow: 1 }}>
              CareSync - Медичний застосунок
            </Typography>
            <Button variant="outlined" color="primary" onClick={handleSignOut}>
              Вийти
            </Button>
          </Toolbar>
        </AppBar>
        <Box
          sx={{ width: "100%", height: "4px", backgroundColor: "#e0e0e0" }}
        />
      </>
    ) : null;
  };

  return (
    <AuthProvider>
      <Router>
        <Header />
        <Container>
          <Routes>
            <Route
              path="/login"
              element={
                <AuthRedirect redirectPath={userRole === "doctor" ? "/dashboard" : userRole === "patient" ? "/chat" : "/login"}>
                  <AuthComponent />
                </AuthRedirect>
              }
            />
						<Route path="/register" element={<RegisterPatient />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <PatientsTable />
                </ProtectedRoute>
              }
            />
						<Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatWithDoctor />
                </ProtectedRoute>
              }
            />
            <Route
              path="*"
              element={
                <ProtectedRoute>
                  <Navigate to={userRole === "doctor" ? "/dashboard" : userRole === "patient" ? "/chat" : "/"} />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Container>
      </Router>
    </AuthProvider>
  );
};

export default App;
