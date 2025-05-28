import React from "react";
import { Navigate } from "react-router-dom";
import { Backdrop, CircularProgress } from "@mui/material";
import { useAuth } from "./ProtectedRoute";

interface AuthRedirectProps {
  children: JSX.Element;
  redirectPath: string;
}

const AuthRedirect: React.FC<AuthRedirectProps> = ({ children, redirectPath }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated === null) {
    return (
      <Backdrop sx={theme => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })} open={isAuthenticated === null}>
        <CircularProgress />
      </Backdrop>
    );
  }

  return isAuthenticated ? <Navigate to={redirectPath} /> : children;
};

export default AuthRedirect;
