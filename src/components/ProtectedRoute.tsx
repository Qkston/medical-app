import { getCurrentUser } from "aws-amplify/auth";
import axios from "axios";
import React, { createContext, useContext, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

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
      setIsAuthenticated(true);
			currentUser.signInDetails?.loginId ? fetchUserRole(currentUser.signInDetails.loginId) : new Error("Current user doesn't have loginId");
    } catch {
      setIsAuthenticated(false);
			setUserRole(null);
    }
  };

	const fetchUserRole = async (currentUserEmail: string) => {
		try {
			const role = await axios.get(`https://5cbbxrp1m3.execute-api.eu-north-1.amazonaws.com/medical-app-staging/get-user-role?email=${currentUserEmail}`);
			setUserRole(role.data.role);
		} catch (error) {
			console.error("Error fetching user role", error);
		}
	};

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
