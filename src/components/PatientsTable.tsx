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
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";

const PatientsTable: React.FC = () => {
	const [tabValue, setTabValue] = useState(0);
  const [open, setOpen] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
				const user = localStorage.getItem("user");
				if (!user) throw new Error("No user data found in localStorage")
        const doctorId = JSON.parse(user).id;

        const response = await axios.get(
          `https://89b3040o74.execute-api.eu-north-1.amazonaws.com/medical-app-staging/get-patients?doctorId=${doctorId}`
        );
        setPatients(response.data);
      } catch (error) {
        console.error("Error fetching patients", error);
      }
    };

    fetchPatients();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    formik.resetForm();
  };

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Невірний формат електронної пошти")
        .required("Це поле є обов'язковим"),
    }),
    onSubmit: async (values) => {
      const token = generateUniqueToken();

      try {
        const user = localStorage.getItem("user");
				if (!user) throw new Error("No user data found in localStorage")
        const doctorId = JSON.parse(user).id;

        await axios.post(
          "https://p6qixdltrb.execute-api.eu-north-1.amazonaws.com/medical-app-staging/send-invite",
          {
            email: values.email,
            token: token,
            doctorId: doctorId,
          }
        );
        setNotification({
          message: "Запрошення надіслано успішно",
          type: "success",
        });
      } catch (error) {
        console.error("Помилка при надсиланні запрошення", error);
        setNotification({
          message: "Помилка при надсиланні запрошення",
          type: "error",
        });
      }

      handleClose();
    },
  });

  const generateUniqueToken = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  const handleArchivePatient = (patientEmail: string) => {
    setSelectedPatient(patientEmail);
  };
  
  const confirmArchive = async () => {
    if (!selectedPatient) return;
  
    const user = localStorage.getItem("user");
    if (!user) throw new Error("No user data found in localStorage")
    const doctorId = JSON.parse(user).id;

    setIsArchiving(true);
  
    try {
      await axios.post(
        "https://6rcb2y40u2.execute-api.eu-north-1.amazonaws.com/archive-patient",
        {
          doctorId: doctorId,
          patientEmail: selectedPatient,
          isArchived: true,
        }
      );
  
      setPatients((prev) =>
        prev.filter((patient) => patient.patientEmail !== selectedPatient)
      );
  
      setNotification({
        message: "Пацієнта успішно архівовано",
        type: "success",
      });
    } catch (error) {
      console.error("Помилка архівування пацієнта", error);
      setNotification({
        message: "Помилка при архівуванні пацієнта. Спробуйте ще раз.",
        type: "error",
      });
    } finally {
      setIsArchiving(false);
      setSelectedPatient(null);
    }
  };

  return (
    <>
      <Container maxWidth="md">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 4,
            mb: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h4">Пацієнти</Typography>
            {tabValue === 0 && (
              <IconButton color="primary" onClick={handleClickOpen}>
                <AddIcon />
              </IconButton>
            )}
          </Box>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="basic tabs example"
          >
            <Tab label="Пацієнти" />
            <Tab label="Архів" />
          </Tabs>
        </Box>
        {tabValue === 0 && (
          <>
            {patients.length === 0 ? (
              <Typography variant="h6" color="textSecondary">
                Тут будуть відображені актуальні пацієнти.
              </Typography>
            ) : (
              <List>
                {patients.map((patient) => (
                  <ListItem
                    key={patient.patientEmail}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <ListItemText primary={patient.patientEmail} />
                    <Box>
                      <Button variant="contained" color="primary" sx={{ mr: 2 }}>
                        Чат
                      </Button>
                      <IconButton
                        edge="end"
                        color="primary"
                        aria-label="archive"
                        onClick={() => handleArchivePatient(patient.patientEmail)}
                      >
                        <ArchiveIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </>
        )}
        {tabValue === 1 && (
          patients.filter(p => p.isArchived).length === 0 ? (
            <Typography variant="h6" color="textSecondary">
              Тут будуть відображені архівовані пацієнти.
            </Typography>
          ) : (
            <List>
              {patients.filter(p => p.isArchived).map((patient) => (
                <ListItem
                  key={patient.patientEmail}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <ListItemText primary={patient.patientEmail} />
                  <Box>
                    <Button variant="contained" color="primary" sx={{ mr: 2 }}>
                      Чат
                    </Button>
                    <IconButton
                      edge="end"
                      color="primary"
                      aria-label="archive"
                      onClick={() => handleArchivePatient(patient.patientEmail)}
                    >
                      <ArchiveIcon />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
          )
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
          <Snackbar
            open={Boolean(notification)}
            autoHideDuration={6000}
            onClose={() => setNotification(null)}
          >
            <Alert
              onClose={() => setNotification(null)}
              severity={notification.type}
              sx={{ width: "100%" }}
            >
              {notification.message}
            </Alert>
          </Snackbar>
        )}
      </Container>
      <Dialog open={Boolean(selectedPatient)} onClose={() => setSelectedPatient(null)}>
        <DialogTitle>Ви впевнені, що хочете архівувати пацієнта?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setSelectedPatient(null)} color="secondary">
            Скасувати
          </Button>
          <Button onClick={confirmArchive} color="primary" disabled={isArchiving}>
            Підтвердити
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default PatientsTable;
