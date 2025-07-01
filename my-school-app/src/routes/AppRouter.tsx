import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "../pages/Auth/LoginPage";
import ProfilePage from "../pages/Auth/ProfilePage";
import UserListPage from "../pages/Users/UserListPage";
import UserFormPage from "../pages/Users/UserFormPage";

// ... importa todas tus páginas

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("authToken"); // Simple chequeo, idealmente usar un AuthContext
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Rutas de Autenticación */}
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <PrivateRoute>
              <UserListPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/usuarios/new"
          element={
            <PrivateRoute>
              <UserFormPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/usuarios/edit/:id"
          element={
            <PrivateRoute>
              <UserFormPage />
            </PrivateRoute>
          }
        />
        {/* Repite para Alumnos, Profesores, Materias, Grupos, Inscripciones */}
        {/* Ruta por defecto */}
        <Route path="/" element={<Navigate to="/profile" />} />
        {/* Manejo de 404 si es necesario */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
