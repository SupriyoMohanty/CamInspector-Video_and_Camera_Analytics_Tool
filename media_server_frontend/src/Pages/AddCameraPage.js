import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import config from "../config";
import { Box } from "@mui/system";
import TopBar from "../components/TopBar";
import BottomBar from "../components/BottomBar";

const AddCameraPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    camera_id: "",
    camera_name: "",
    rtsp: "",
    location: "",
    location_coordinates:"",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleClose = () => {
    navigate("/home");
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${config.apiBaseUrl}/CamData/addCam`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log("Camera added successfully");
        navigate("/home");
      } else {
        console.error("Server error:", response.statusText);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <>
      <TopBar />
      <Box
          component="main"
          sx={{
            lexGrow: 1,
            bgcolor: "background.default",
            p: 2,
            display: "flex",
            flexDirection: "column", // Set to column for elements to stack vertically
            alignItems: "center",
            objectFit: "contain",
            paddingBottom: "90px",
            backgroundImage: "linear-gradient(to top, rgba(247, 153, 119,0.2), rgba(22,38,79, 0.5))",
    
          }}
        >
      <Grid
        container
        spacing={3}
        justifyContent="center"
        style={{ marginTop: "1px" }}
      >
        <Grid item xs={12} sm={8} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Add Camera
              </Typography>
              <form onSubmit={handleFormSubmit}>
                <TextField
                  autoFocus
                  required
                  margin="dense"
                  id="camera_id"
                  name="camera_id"
                  label="Camera ID"
                  placeholder="e.g. 002"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.camera_id}
                  onChange={handleChange}
                />
                <TextField
                  required
                  margin="dense"
                  id="camera_name"
                  name="camera_name"
                  label="Camera Name"
                  placeholder="e.g. Office_Camera_1"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.camera_name}
                  onChange={handleChange}
                />
                <TextField
                  required
                  margin="dense"
                  id="rtsp"
                  name="rtsp"
                  label="RTSP"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.rtsp}
                  onChange={handleChange}
                />
                <TextField
                  required
                  margin="dense"
                  id="location"
                  name="location"
                  label="Location"
                  placeholder="e.g. Office Name"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.location}
                  onChange={handleChange}
                />
                <TextField
                  required
                  margin="dense"
                  id="location_coordinates"
                  name="location_coordinates"
                  label="Coordinates"
                  helperText="Select location, right click and copy its coordinates from Google Maps"
                  placeholder="e.g. 25.94293729130858, 80.71874114258996"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.location_coordinates}
                  onChange={handleChange}
                />
                <a href="https://www.google.com/maps/" style={{marginLeft:"80%"}}>Google Maps</a>
                <CardActions>
                  <Button onClick={handleClose} variant="outlined">
                    Back
                  </Button>
                  <Button type="submit" variant="contained" color="primary">
                    Add
                  </Button>
                </CardActions>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      </Box>
      <BottomBar />
    </>
  );
};

export default AddCameraPage;
