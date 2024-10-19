import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export const ProtectedRoutes: React.FC = () =>{
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Outlet /> : <Navigate to='/' />
}