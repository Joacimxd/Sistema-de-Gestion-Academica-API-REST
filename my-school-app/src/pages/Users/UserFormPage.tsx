import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { userService } from "../../api/users"; // Ensure this path is correct

interface UserFormData {
  username: string;
  email: string;
  password?: string; // Password is optional for edit, required for new
  // Add other fields relevant to your User model
}

const UserFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>(); // 'id' will be present for edit mode
  const isEditMode = !!id;

  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && id) {
      const fetchUser = async () => {
        setLoading(true);
        try {
          const response = await userService.getUserById(id);
          // Omit password when fetching for security
          const { username, email } = response.data;
          setFormData({ username, email });
        } catch (err: any) {
          console.error("Error fetching user for edit:", err);
          setError("No se pudo cargar el usuario para editar.");
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [isEditMode, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isEditMode && id) {
        // For edit, only send fields that are present, omit password if not changed
        const dataToSend: Partial<UserFormData> = {
          username: formData.username,
          email: formData.email,
        };
        if (formData.password) {
          // Only send password if it's explicitly set for update
          dataToSend.password = formData.password;
        }
        await userService.updateUser(id, dataToSend);
        setSuccess("Usuario actualizado exitosamente.");
      } else {
        // For new user, password is required
        if (!formData.password) {
          setError("La contraseña es requerida para crear un nuevo usuario.");
          setLoading(false);
          return;
        }
        await userService.createUser(formData);
        setSuccess("Usuario creado exitosamente.");
        setFormData({ username: "", email: "", password: "" }); // Clear form after creation
      }
      // Optionally navigate back to the list after a short delay
      setTimeout(() => {
        navigate("/usuarios");
      }, 1500);
    } catch (err: any) {
      console.error("Form submission error:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Error al guardar el usuario. Inténtalo de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    // Only show loader if we're fetching data for edit
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

  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography component="h1" variant="h5" sx={{ mb: 3 }} align="center">
          {isEditMode ? "Editar Usuario" : "Crear Nuevo Usuario"}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Nombre de Usuario"
            name="username"
            autoComplete="username"
            value={formData.username}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            {...(isEditMode ? {} : { required: true })} // Password is required only for new
            fullWidth
            name="password"
            label={
              isEditMode
                ? "Contraseña (dejar en blanco para no cambiar)"
                : "Contraseña"
            }
            type="password"
            id="password"
            autoComplete={isEditMode ? "new-password" : "current-password"}
            value={formData.password}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
              {success}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : isEditMode ? (
              "Actualizar Usuario"
            ) : (
              "Crear Usuario"
            )}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate("/usuarios")}
            sx={{ mt: 1 }}
          >
            Cancelar
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default UserFormPage;
