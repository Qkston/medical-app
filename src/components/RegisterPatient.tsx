import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Button, TextField, Typography, Snackbar, Alert, Box, Container } from "@mui/material";
import axios from "axios";
import { confirmSignUp, signUp } from "aws-amplify/auth";

interface RegisterValues {
  password: string;
  confirmPassword: string;
  code?: string;
}

const RegisterPatient: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = decodeURIComponent(searchParams.get("email") || "");
  const doctorId = searchParams.get("doctorId") || "";
	const [newPatientCognitoId, setNewPatientCognitoId] = useState<string | undefined>();
  const [isConfirming, setIsConfirming] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const validationSchema = isConfirming
    ? Yup.object({
        code: Yup.string().required("Це поле є обов'язковим"),
      })
    : Yup.object({
        password: Yup.string().min(8, "Пароль повинен бути не менше 8 символів").required("Це поле є обов'язковим"),
        confirmPassword: Yup.string()
          .oneOf([Yup.ref("password"), undefined], "Паролі мають співпадати")
          .required("Це поле є обов'язковим"),
      });

  const handleSubmit = async (values: RegisterValues, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    if (isConfirming) {
      try {
        await confirmSignUp({
          username: email,
          confirmationCode: values.code!,
        });
        setNotification({
          message: "Електронну пошту успішно підтверджено. Ви можете увійти в систему.",
          type: "success",
        });

        // Saving information about the patient in the database
        await axios.post("https://fvis7cwi09.execute-api.eu-north-1.amazonaws.com/medical-app-staging/save-patient", {
          doctorId: doctorId,
          patientEmail: email,
          role: "patient",
          cognitoId: newPatientCognitoId,
        });

        setTimeout(() => navigate("/login"), 1000); // Redirect after 1 seconds
      } catch (error) {
        console.error("Error confirming sign up", error);
        setNotification({
          message: "Помилка при підтвердженні електронної пошти. Спробуйте ще раз.",
          type: "error",
        });
      }
      setSubmitting(false);
    } else {
      try {
        const newPatientCognitoData = await signUp({
          username: email,
          password: values.password,
          options: {
            userAttributes: {
              email,
            },
          },
        });
        setIsConfirming(true);
				setNewPatientCognitoId(newPatientCognitoData.userId);
        setNotification({
          message: "Акаунт створено. Будь ласка, введіть код підтвердження з вашої електронної пошти.",
          type: "info",
        });
      } catch (error) {
        console.error("Error signing up", error);
        setNotification({
          message: "Помилка при створенні акаунту. Спробуйте ще раз.",
          type: "error",
        });
      }
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
        <Typography component="h1" variant="h6" gutterBottom>
          {isConfirming ? "Підтвердження електронної пошти" : "Створення акаунту пацієнта"}
        </Typography>
        <Formik initialValues={{ password: "", confirmPassword: "", code: "" }} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ isSubmitting }) => (
            <Form>
              {isConfirming ? (
                <Field name="code" as={TextField} label="Код підтвердження" fullWidth margin="normal" />
              ) : (
                <>
                  <Field name="password" as={TextField} type="password" label="Пароль" fullWidth margin="normal" />
                  <Field name="confirmPassword" as={TextField} type="password" label="Підтвердіть пароль" fullWidth margin="normal" />
                </>
              )}
              <Button type="submit" variant="contained" color="primary" disabled={isSubmitting} fullWidth sx={{ mt: 2 }}>
                {isConfirming ? "Підтвердити" : "Створити акаунт"}
              </Button>
            </Form>
          )}
        </Formik>
        {notification && (
          <Snackbar open={Boolean(notification)} autoHideDuration={6000} onClose={() => setNotification(null)}>
            <Alert onClose={() => setNotification(null)} severity={notification.type} sx={{ width: "100%" }}>
              {notification.message}
            </Alert>
          </Snackbar>
        )}
      </Box>
    </Container>
  );
};

export default RegisterPatient;
