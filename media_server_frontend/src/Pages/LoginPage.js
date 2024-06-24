import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomBar from "../components/BottomBar.js";
import {
  Button,
  TextField,
  Container,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
} from "@mui/material";

import config from "../config.js";

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [user_password, setPassword] = useState("");
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [openNewUserDialog, setOpenNewUserDialog] = useState(false);
  const [newUserUsername, setNewUserUsername] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [userExists, setUserExists] = useState(false);
  const [openUserRegistrationSnackbar, setOpenUserRegistrationSnackbar] =
    useState(false);

  const handleLogin = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/CamData/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, user_password }),
        credentials: "include",
      });

      if (response.ok) {
        console.log("Login successful");
        setOpenSuccessSnackbar(true);
        setTimeout(async () => {
          setOpenSuccessSnackbar(false);
          // await login(); // Make sure to await the login method
          navigate("/home", { state: { fromLogin: true } });
        }, 1000);
      } else {
        console.error("Login failed");
        setOpenErrorSnackbar(true);
      }
    } catch (error) {
      console.error("Error during login:", error.message);
      setOpenErrorSnackbar(true);
    }
  };
  const handleUserRegistrationSnackbar = () => {
    setOpenUserRegistrationSnackbar(true);
    setTimeout(() => {
      setOpenUserRegistrationSnackbar(false);
    }, 1000);
  };

  const handleNewUser = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/CamData/user/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: newUserUsername,
            user_password: newUserPassword,
          }),
        }
      );

      if (response.ok) {
        setNewUserUsername("");
        setNewUserPassword("");
        setOpenNewUserDialog(false);
        setOpenSuccessSnackbar(true);
        handleUserRegistrationSnackbar();
      } else {
        const data = await response.json();
        if (data.error && data.error.code === "23505") {
          //this code checks for a specific error condition related to a unique constraint violation with code 23505.
          setUserExists(true);
          setOpenErrorSnackbar(true);
        } else {
          setOpenErrorSnackbar(true);
        }
      }
    } catch (error) {
      console.error("Failed to create new user:", error.message);
      setOpenErrorSnackbar(true);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      //" meaning the user clicked away from the Snackbar instead of actively closing it.
      return;
    }
    setOpenErrorSnackbar(false);
    setOpenSuccessSnackbar(false);
  };

  return (
    <Container
      component="main"
      maxWidth="xl"
      style={{
        backgroundImage:
          "linear-gradient(to top, rgba(247, 153, 119, 0.3), rgba(22,38,79, 0.5))",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          margin: "auto",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          width: "850px",
          height: "500px",
          opacity: "1",
          borderRadius: "20px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "50%",
            position: "relative",
            margin: "auto",
            marginTop: "20px",
          }}
        >
          <div style={{ margin: "auto", textAlign: "center" }}>
            <img
              src="./caminspector-high-resolution-logo-transparent.png"
              height="85%"
              width="70%"
              alt="CamInspector"
            />
          </div>

          <form
            style={{
              marginTop: "10px",
              width: "70%",
              margin: "auto",
            }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="user_password"
              label="Password"
              type="password"
              id="user_password"
              autoComplete="current-password"
              value={user_password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="button"
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleLogin}
              style={{ margin: "16px 0" }}
            >
              Login
            </Button>
            <Button
              type="button"
              fullWidth
              variant="outlined"
              color="primary"
              onClick={() => setOpenNewUserDialog(true)}
            >
              New User
            </Button>
          </form>
        </div>
        <div style={{ width: "50%", height: "100%", overflow: "hidden" }}>
          <img
            src="./LoginCamera.jpg"
            height="100%"
            width="100%"
            alt="Cameras"
          />
        </div>
      </Paper>
      <Dialog
        open={openNewUserDialog}
        onClose={() => setOpenNewUserDialog(false)}
      >
        <DialogTitle>New User Registration</DialogTitle>
        <DialogContent>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={newUserUsername}
            onChange={(e) => setNewUserUsername(e.target.value)}
            error={userExists}
            helperText={userExists ? "User already exists." : ""}
          />
          <TextField
            label="Password"
            type="user_password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={newUserPassword}
            onChange={(e) => setNewUserPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewUserDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleNewUser} color="primary">
            Register
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openErrorSnackbar}
        autoHideDuration={1000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          sx={{
            width: "100%",
            borderRadius: "8px",
            backgroundColor: "rgba(255, 0, 0, 0.8)",
            color: "#fff",
            fontSize: "18px",
          }}
        >
          {userExists
            ? "User already exists."
            : "Invalid credentials. Please try again."}
        </Alert>
      </Snackbar>

      <Snackbar
        open={openSuccessSnackbar}
        autoHideDuration={1000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{
            width: "100%",
            borderRadius: "8px",
            backgroundColor: "rgba(0, 128, 0, 0.8)",
            color: "#fff",
            fontSize: "18px",
          }}
        >
          {openNewUserDialog
            ? "New user created successfully!"
            : "Login successful!"}
        </Alert>
      </Snackbar>

      <Snackbar
        open={openUserRegistrationSnackbar}
        autoHideDuration={1000}
        onClose={() => setOpenUserRegistrationSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setOpenUserRegistrationSnackbar(false)}
          severity="success"
          sx={{
            width: "100%",
            borderRadius: "8px",
            backgroundColor: "rgba(0, 128, 0, 0.8)",
            color: "#fff",
            fontSize: "18px",
          }}
        >
          New user created successfully!
        </Alert>
      </Snackbar>
      <BottomBar />
    </Container>
  );
};

export default LoginPage;
