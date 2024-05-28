import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./ProtectedRoute";

interface AuthRedirectProps {
  children: JSX.Element;
  redirectPath: string;
}

const AuthRedirect: React.FC<AuthRedirectProps> = ({
  children,
  redirectPath,
}) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Navigate to={redirectPath} /> : children;
};

export default AuthRedirect;
