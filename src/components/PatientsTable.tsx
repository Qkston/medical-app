import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tab,
  Tabs,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";

interface Patient {
  patientEmail: string;
  isArchived: boolean;
}

const PatientsTable: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [open, setOpen] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Fetch patients on component mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const user = localStorage.getItem("user");
        if (!user) throw new Error("No user data found in localStorage");
        const doctorId = JSON.parse(user).id;

        const response = await axios.get(
          `https://89b3040o74.execute-api.eu-north-1.amazonaws.com/medical-app-staging/get-patients?doctorId=${doctorId}`
        );
        setPatients(response.data);
      } catch (error) {
        console.error("Error fetching patients:", error);
        setNotification({
          message: "Помилка завантаження пацієнтів",
          type: "error",
        });
      }
    };

    fetchPatients();
  }, []);

  // Handle tab switching
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Open and close dialog for inviting a new patient
  const handleClickOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    formik.resetForm();
  };

  // Formik setup for inviting new patients
  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Невірний формат електронної пошти").required("Це поле є обов'язковим"),
    }),
    onSubmit: async values => {
      const token = generateUniqueToken();

      try {
        const user = localStorage.getItem("user");
        if (!user) throw new Error("No user data found in localStorage");
        const doctorId = JSON.parse(user).id;

        await axios.post("https://p6qixdltrb.execute-api.eu-north-1.amazonaws.com/medical-app-staging/send-invite", {
          email: values.email,
          token,
          doctorId,
        });
        setNotification({
          message: "Запрошення надіслано успішно",
          type: "success",
        });
      } catch (error) {
        console.error("Помилка при надсиланні запрошення:", error);
        setNotification({
          message: "Помилка при надсиланні запрошення",
          type: "error",
        });
      }

      handleClose();
    },
  });

  const generateUniqueToken = () => Math.random().toString(36).substr(2, 9);

  const handleArchiveToggle = async (patientEmail: string, isArchived: boolean) => {
    const user = localStorage.getItem("user");
    if (!user) {
      setNotification({
        message: "Помилка: дані користувача не знайдені",
        type: "error",
      });
      return;
    }
    const doctorId = JSON.parse(user).id;

    try {
      const response = await axios.post("https://6rcb2y40u2.execute-api.eu-north-1.amazonaws.com/medical-app-staging/archive-patient", {
        doctorId,
        patientEmail,
        isArchived: !isArchived, // Тепер змінюємо статус
      });

      if (response.data.statusCode === 200) {
        setPatients(prevPatients =>
          prevPatients.map(patient => (patient.patientEmail === patientEmail ? { ...patient, isArchived: !isArchived } : patient))
        );
        setNotification({
          message: isArchived ? "Пацієнт успішно розархівований" : "Пацієнт успішно архівований",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Помилка оновлення статусу пацієнта:", error);
      setNotification({
        message: "Помилка при оновленні статусу пацієнта. Спробуйте ще раз.",
        type: "error",
      });
    }
  };

  const filteredPatients = patients.filter(p => (tabValue === 0 ? !p.isArchived : p.isArchived));

  return (
    <Container maxWidth="md">
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 4, mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="h4">Пацієнти</Typography>
          {tabValue === 0 && (
            <IconButton color="primary" onClick={handleClickOpen}>
              <AddIcon />
            </IconButton>
          )}
        </Box>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="patient tabs">
          <Tab label="Пацієнти" />
          <Tab label="Архів" />
        </Tabs>
      </Box>

      {filteredPatients.length === 0 ? (
        <Typography variant="h6" color="textSecondary">
          {tabValue === 0 ? "Тут будуть відображені актуальні пацієнти." : "Тут будуть відображені архівовані пацієнти."}
        </Typography>
      ) : (
        <List>
          {filteredPatients.map(patient => (
            <ListItem key={patient.patientEmail} sx={{ display: "flex", justifyContent: "space-between" }}>
              <ListItemText primary={patient.patientEmail} />
              <Box>
                <Button variant="contained" color="primary" sx={{ mr: 2 }}>
                  Чат
                </Button>
                <IconButton edge="end" color="primary" onClick={() => handleArchiveToggle(patient.patientEmail, patient.isArchived)}>
                  {patient.isArchived ? <UnarchiveOutlinedIcon /> : <ArchiveIcon />}
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Запросити пацієнта</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="email"
            label="Електронна пошта"
            type="email"
            fullWidth
            variant="standard"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Скасувати
          </Button>
          <Button onClick={() => formik.handleSubmit()} color="primary">
            Запросити
          </Button>
        </DialogActions>
      </Dialog>

      {notification && (
        <Snackbar open={Boolean(notification)} autoHideDuration={6000} onClose={() => setNotification(null)}>
          <Alert onClose={() => setNotification(null)} severity={notification.type} sx={{ width: "100%" }}>
            {notification.message}
          </Alert>
        </Snackbar>
      )}
    </Container>
  );
};

export default PatientsTable;
