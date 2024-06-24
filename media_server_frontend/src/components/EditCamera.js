import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

const HandleCameraEdit = ({ open, handleClose, camData, handleSubmit }) => {
  //...useState to set form data...initially fildes set empty
  const [formData, setFormData] = useState({
    camera_name: "",
    location: "",
    location_coordinates: "",
  });

  //...sets the fields with pre-existing camera details
  useEffect(() => {
    if (camData) {
      setFormData({
        camera_name: camData.camera_name || "",
        location: camData.location || "",
        location_coordinates: camData.location_coordinates || "",
      });
    }
  }, [camData]);

  //...this is to set value to each form field
  const handleChange = (e) => {
    const inputValue = e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: inputValue,
    });
  };

  //...sets formDate empty and calls handleClose()
  const handleCloseDialog = () => {
    setFormData({
      camera_name: "",
      location: "",
      location_coordinates: "",
    });
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseDialog}
      PaperProps={{
        component: "form",
        onSubmit: (event) => {
          event.preventDefault();
          handleSubmit(formData);
          handleCloseDialog();
        },
      }}
    >
      <DialogTitle>Edit Camera</DialogTitle>
      <DialogContent>
        <DialogContentText>Edit the Camera details:</DialogContentText>
        <TextField
          required
          margin="dense"
          id="camera_name"
          name="camera_name"
          label="Camera Name"
          type="text"
          fullWidth
          variant="standard"
          value={formData.camera_name || ""}
          onChange={handleChange}
        />
        <TextField
          required
          margin="dense"
          id="location"
          name="location"
          label="Location"
          type="text"
          fullWidth
          variant="standard"
          value={formData.location || ""}
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
          variant="standard"
          value={formData.location_coordinates || ""}
          onChange={handleChange}
        />
        <a href="https://www.google.com/maps/" style={{ marginLeft: "80%" }}>
          Google Maps
        </a>

      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog}>Cancel</Button>
        <Button type="submit">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default HandleCameraEdit;
