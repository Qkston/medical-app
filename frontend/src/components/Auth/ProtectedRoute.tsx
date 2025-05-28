import { getCurrentUser } from "aws-amplify/auth";
import axios from "axios";
import React, { createContext, useContext, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { getUserRole } from "../../utils/api/awsLinks";
import { Backdrop, CircularProgress } from "@mui/material";

interface AuthContextType {
  isAuthenticated: boolean | null;
  userRole: "doctor" | "patient" | null;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: null,
  userRole: null,
  checkAuth: () => {},
});

export const AuthProvider: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<"doctor" | "patient" | null>(null);

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();

      if (currentUser.signInDetails?.loginId) {
        await fetchUserRole(currentUser.signInDetails.loginId);
        setIsAuthenticated(true);
      } else {
        new Error("Current user doesn't have loginId");
      }
    } catch {
      setIsAuthenticated(false);
      setUserRole(null);
    }
  };

  const fetchUserRole = async (currentUserEmail: string) => {
    try {
      const user = await axios.get(getUserRole(currentUserEmail));
      setUserRole(prevRole => (prevRole !== user.data.user.role ? user.data.user.role : prevRole));

      if (!localStorage.getItem("user")) localStorage.setItem("user", JSON.stringify(user.data.user));
    } catch (error) {
      console.error("Error fetching user role", error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return <AuthContext.Provider value={{ isAuthenticated, userRole, checkAuth }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, userRole } = useAuth();

  if (isAuthenticated === null) {
    return (
      <Backdrop sx={theme => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })} open={isAuthenticated === null}>
        <CircularProgress />
      </Backdrop>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole!)) {
    return <Navigate to={userRole === "doctor" ? "/dashboard" : "/chat"} replace />;
  }

  return children;
};

export default ProtectedRoute;
