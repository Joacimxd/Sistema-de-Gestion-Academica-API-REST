import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { authService } from "../../api/auth";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Book as BookIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  rol: string;
}

const carrerasEjemplo = [
  "Ingeniería en Sistemas",
  "Psicología",
  "Administración",
  "Derecho",
  "Arquitectura",
];

const estatusEjemplo = ["Activo", "Inactivo"];

const generarDatosAcademicos = () => {
  return {
    carrera:
      carrerasEjemplo[Math.floor(Math.random() * carrerasEjemplo.length)],
    semestre: Math.floor(Math.random() * 10) + 1,
    fechaIngreso: dayjs()
      .subtract(Math.floor(Math.random() * 4 + 1), "year")
      .format("YYYY-MM-DD"),
    estatus: estatusEjemplo[Math.floor(Math.random() * estatusEjemplo.length)],
  };
};

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [datosAcademicos, setDatosAcademicos] = useState<{
    carrera: string;
    semestre: number;
    fechaIngreso: string;
    estatus: string;
  } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await authService.getProfile();
        setProfile(response.data);

        if (response.data.rol !== "usuarios") {
          setDatosAcademicos(generarDatosAcademicos());
        }
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError(
          "No se pudo cargar el perfil. Por favor, intenta iniciar sesión de nuevo."
        );
        localStorage.removeItem("authToken");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  const isAdmin = profile?.rol === "admin";

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Button variant="contained" onClick={handleLogout}>
            Volver a Iniciar Sesión
          </Button>
        </Box>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info">No hay datos de perfil disponibles.</Alert>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Button variant="contained" onClick={handleLogout}>
            Volver a Iniciar Sesión
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Mi Perfil
        </Typography>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6">
            <Box component="span" fontWeight="fontWeightBold">
              Usuario:
            </Box>{" "}
            {profile.user.nombre}
          </Typography>
          <Typography variant="h6">
            <Box component="span" fontWeight="fontWeightBold">
              Email:
            </Box>{" "}
            {profile.user.email}
          </Typography>
          <Typography variant="h6">
            <Box component="span" fontWeight="fontWeightBold">
              Rol:
            </Box>{" "}
            {profile.user.rol}
          </Typography>
        </Box>

        {isAdmin && (
          <Box sx={{ mt: 4, borderTop: 1, borderColor: "divider", pt: 3 }}>
            <Typography variant="h5" align="center" gutterBottom>
              Panel de Administración
            </Typography>
            <List>
              <ListItem button onClick={() => navigate("/dashboard")}>
                <ListItemIcon>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItem>
              <ListItem button onClick={() => navigate("/usuarios")}>
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText primary="Gestión de Usuarios" />
              </ListItem>
              <ListItem button onClick={() => navigate("/alumnos")}>
                <ListItemIcon>
                  <SchoolIcon />
                </ListItemIcon>
                <ListItemText primary="Gestión de Alumnos" />
              </ListItem>
              <ListItem button onClick={() => navigate("/profesores")}>
                <ListItemIcon>
                  <SchoolIcon />
                </ListItemIcon>
                <ListItemText primary="Gestión de Profesores" />
              </ListItem>
              <ListItem button onClick={() => navigate("/materias")}>
                <ListItemIcon>
                  <BookIcon />
                </ListItemIcon>
                <ListItemText primary="Gestión de Materias" />
              </ListItem>
            </List>
          </Box>
        )}

        {profile.rol !== "usuarios" && datosAcademicos && (
          <Box sx={{ mt: 4, borderTop: 1, borderColor: "divider", pt: 3 }}>
            <Typography variant="h5" align="center" gutterBottom>
              Información Académica
            </Typography>
            <Typography variant="h6">
              <Box component="span" fontWeight="fontWeightBold">
                Carrera:
              </Box>{" "}
              {datosAcademicos.carrera}
            </Typography>
            <Typography variant="h6">
              <Box component="span" fontWeight="fontWeightBold">
                Semestre:
              </Box>{" "}
              {datosAcademicos.semestre}
            </Typography>
            <Typography variant="h6">
              <Box component="span" fontWeight="fontWeightBold">
                Fecha de Ingreso:
              </Box>{" "}
              {datosAcademicos.fechaIngreso}
            </Typography>
            <Typography variant="h6">
              <Box component="span" fontWeight="fontWeightBold">
                Estatus:
              </Box>{" "}
              {datosAcademicos.estatus}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Button variant="outlined" color="error" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfilePage;
