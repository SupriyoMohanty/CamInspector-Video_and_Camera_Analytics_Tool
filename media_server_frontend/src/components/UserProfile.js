import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Avatar from "@mui/material/Avatar";
import config from "../config";

const HandleUserProfile = ({ open, handleClose, userData, handleSubmit }) => {

  const [imagePreview, setImagePreview] = useState(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [user_id, setUserId] = useState(null); // State to store user_id

  const [formData, setFormData] = useState({
    username: "",
    user_password: "",
    image_url_update: null,
  });

  useEffect(() => {
    if (open) {
      // If the user profile is opened, show the authentication dialog
      setShowAuthDialog(true);
    }
  }, [open]);

  const handleAuthSubmit = async () => {
    try {
      // Make a request to your backend API for authentication
      const response = await fetch(`${config.apiBaseUrl}/CamData/userProfile/Authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          user_password: formData.user_password,
        }),
      });
  
      
    if (response.ok) {
      const responseData = await response.json();
      const { user_id , username} = responseData; // Access user_id from the response

      // Now you can use user_id as needed in your frontend code
      console.log('User ID:', user_id, username);
      
      setUserId(user_id); // Store user_id in state
      
      // Close the authentication dialog or perform other actions
      setShowAuthDialog(false);
    } else {
      throw new Error('Authentication failed');
    }
         
      // If authentication is successful, close the authentication dialog
      setShowAuthDialog(false);
    } catch (error) {
      // Handle the error or show an alert
      console.error('Authentication error:', error.message);
      // You can customize this part based on your application's requirements
      alert('Authentication failed. Please check your credentials and try again.');
    }
  };

  const handleChange = (e) => {
    const inputValue = e.target.value;

    if (e.target.type === "file") {
      const file = e.target.files[0];

      if (file) {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setFormData({
              ...formData,
              [e.target.name]: reader.result,
              user_id: user_id, // Include user_id in formData
            });
            setImagePreview(reader.result);
          };
          reader.readAsDataURL(file);
        } else {
          alert("Invalid file type. Please choose an image file.");
          e.target.value = null;
          return;
        }
      }
    } else {
      setFormData({
        ...formData,
        [e.target.name]: inputValue,
         user_id: user_id, // Include user_id in formData
      });
    }
  };

  const handleCloseDialog = () => {
    setShowAuthDialog(false);
    setFormData({
      username: "",
      user_password: "",
      image_url_update: null,
    });
    setImagePreview(null);
    handleClose();
  };

  return (
    <>
      {showAuthDialog && (
        <Dialog open={true} onClose={handleCloseDialog}>
          <DialogTitle>Authentication</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please enter your current username and password:
            </DialogContentText>
            <TextField
              autoFocus
              required
              margin="dense"
              id="username"
              name="username"
              label="Username"
              type="text"
              fullWidth
              variant="standard"
              value={formData.username || ""}
              onChange={handleChange}
            />

            <TextField
              required
              margin="dense"
              id="user_password"
              name="user_password"
              label="Password"
              type="password"
              fullWidth
              variant="standard"
              value={formData.user_password || ""}
              onChange={handleChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleAuthSubmit}>Submit</Button>
          </DialogActions>
        </Dialog>
      )}

      {!showAuthDialog && (
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
          <DialogTitle>User Profile</DialogTitle>
          <DialogContent>
            <DialogContentText>Edit user details:</DialogContentText>
            <TextField
              autoFocus
              required
              margin="dense"
              id="username"
              name="username"
              label="Username"
              type="text"
              fullWidth
              variant="standard"
              value={formData.username || ""}
              onChange={handleChange}
            />

            <TextField
              required
              margin="dense"
              id="user_password"
              name="user_password"
              label="User Password"
              type="password"
              fullWidth
              variant="standard"
              value={formData.user_password || ""}
              onChange={handleChange}
            />

            <input
              margin="dense"
              id="image_url_update"
              name="image_url_update"
              label="Image URL"
              type="file"
              variant="standard"
              onChange={handleChange}
            />

            {userData?.image_url && (
              <Avatar
                alt={userData.username}
                src={userData.image_url}
                style={{ marginTop: "10px", width: "100px", height: "100px" }}
              />
            )}

            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                style={{ marginTop: "10px", maxWidth: "50%" }}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit">Save</Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default HandleUserProfile;
