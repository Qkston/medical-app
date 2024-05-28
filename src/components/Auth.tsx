import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Link,
  Alert,
  Snackbar,
} from "@mui/material";
import { confirmSignUp, signIn, signUp } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./ProtectedRoute";

interface AuthValues {
  email: string;
  password: string;
  confirmPassword?: string;
  confirmationCode?: string;
}

const AuthComponent: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [email, setEmail] = useState("");
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const handleSignUp = async (
    values: AuthValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      await signUp({
        username: values.email,
        password: values.password,
        options: {
          userAttributes: {
            email: values.email,
          },
        },
      });
      setEmail(values.email);
      setIsConfirming(true);
      setNotification({
        message:
          "Акаунт створено. Будь ласка, перевірте вашу електронну пошту для отримання коду підтвердження.",
        type: "success",
      });
    } catch (error) {
      setNotification({ message: "Помилка при реєстрації", type: "error" });
      console.error("Помилка при реєстрації", error);
    }
    setSubmitting(false);
  };

  const handleConfirmSignUp = async (
    values: AuthValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      await confirmSignUp({
        username: email,
        confirmationCode: values.confirmationCode!,
      });
      setNotification({
        message: "Акаунт підтверджено. Тепер ви можете увійти.",
        type: "success",
      });
      setIsConfirming(false);
      setIsSignUp(false);
    } catch (error) {
      setNotification({ message: "Помилка при підтвердженні", type: "error" });
      console.error("Помилка при підтвердженні", error);
    }
    setSubmitting(false);
  };

  const handleSignIn = async (
    values: AuthValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      await signIn({ username: values.email, password: values.password });
      setNotification({ message: "Вхід виконано", type: "success" });
      checkAuth();
      navigate("/main");
    } catch (error) {
      setNotification({ message: "Помилка при вході", type: "error" });
      console.error("Помилка при вході", error);
    }
    setSubmitting(false);
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Невірний формат електронної пошти")
      .required("Це поле є обов'язковим"),
    password: Yup.string()
      .min(8, "Пароль повинен містити мінімум 8 символів")
      .required("Це поле є обов'язковим"),
    confirmPassword: isSignUp
      ? Yup.string()
          .oneOf([Yup.ref("password"), undefined], "Паролі не співпадають")
          .required("Це поле є обов'язковим")
      : Yup.string().notRequired(),
    confirmationCode: isConfirming
      ? Yup.string().required("Це поле є обов'язковим")
      : Yup.string().notRequired(),
  });

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          {isConfirming
            ? "Підтвердження коду"
            : isSignUp
            ? "Реєстрація"
            : "Вхід"}
        </Typography>
        {isSignUp && !isConfirming && (
          <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
            Увага! Ви будете зареєстровані як лікар. Якщо ви є пацієнтом,
            отримайте запрошення від вашого лікаря.
          </Alert>
        )}
        <Formik
          initialValues={{
            email: "",
            password: "",
            confirmPassword: "",
            confirmationCode: "",
          }}
          validationSchema={validationSchema}
          onSubmit={
            isConfirming
              ? handleConfirmSignUp
              : isSignUp
              ? handleSignUp
              : handleSignIn
          }
        >
          {({ isSubmitting }) => (
            <Form>
              {!isConfirming && (
                <>
                  <Field
                    name="email"
                    as={TextField}
                    label="Електронна пошта"
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    helperText={<ErrorMessage name="email" />}
                  />
                  <Field
                    name="password"
                    as={TextField}
                    type="password"
                    label="Пароль"
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    helperText={<ErrorMessage name="password" />}
                  />
                  {isSignUp && (
                    <Field
                      name="confirmPassword"
                      as={TextField}
                      type="password"
                      label="Підтвердити пароль"
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      helperText={<ErrorMessage name="confirmPassword" />}
                    />
                  )}
                </>
              )}
              {isConfirming && (
                <Field
                  name="confirmationCode"
                  as={TextField}
                  label="Код підтвердження"
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  helperText={<ErrorMessage name="confirmationCode" />}
                />
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                sx={{ mt: 3, mb: 2 }}
              >
                {isConfirming
                  ? "Підтвердити"
                  : isSignUp
                  ? "Зареєструватись"
                  : "Увійти"}
              </Button>
            </Form>
          )}
        </Formik>
        {!isConfirming && (
          <Link href="#" variant="body2" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp
              ? "Вже маєте акаунт? Увійти"
              : "Не маєте акаунта? Зареєструватись"}
          </Link>
        )}
      </Box>
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
  );
};

export default AuthComponent;
