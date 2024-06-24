import React, { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import config from "../config";
import HandleUserProfile from "./UserProfile";
import { useNavigate } from "react-router-dom";

const settings = ["User Profile", "Logout"];

function TopBar() {
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const navigate = useNavigate();

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleUserProfileSubmit = async (formData) => {
    // Handle form submission logic here
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/CamData/userProfile/${formData.username}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      fetchUserImageUrl(); //called here so that image gets refreshed when user profile updated
      if (response.ok) {
        // Display a success alert
        alert("User Details updated successfully");
      } else {
        // Display an alert for server error
        const responseData = await response.json();
        alert(responseData.error);
        console.error("Server error:", response.status, response.statusText);
      }
    } catch (err) {
      console.error(err.message);
    }

    console.log("Form submitted with data:", formData);

    setIsUserProfileOpen(false); // Close the UserProfile dialog after submission
  };

  const handleCameraButtonClick = () => {
    console.log('Button clicked!');
    navigate('/cameraDetails')
  };

  const handleOnvifButtonClick = () => {
    console.log('Button clicked!');
    navigate('/onVif')
  };

  const handleMapViewClick= ()=>{
    navigate('/mapView')
  }
  const handleDashboardClick=()=>{
    navigate('/dashboard')
  }

  const handleItemClick = (itemName) => async () => {
    console.log(`${itemName} clicked`);

    if (itemName === "User Profile") {
      setIsUserProfileOpen(true);
    }

    if (itemName === "Logout") {
      handleCloseUserMenu();
      await handleLogout();
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/CamData/user/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      window.location = "/";
      console.log("Logout successful");
    } catch (error) {
      console.error("Error during logout:", error.message);
    }
  };

  // Fetch user image URL when the user profile is opened

  const fetchUserImageUrl = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/CamData/user/image`);
      console.log(response);
      if (response.ok) {
        const data = await response.json();
        console.log("data:", data);
          setProfileImageUrl(data[0].image); // Update the profile image URL state      } else {

      }
    } catch (err) {
      console.error("Error:", err.message);
    }
  };
  
  useEffect(() => {
    fetchUserImageUrl();
  }, []);

  return (
    <AppBar
      position="static"
      sx={{ background: "rgba(22,38,79, 0.9)", height: "62px" }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <div style={{ marginTop: "4px" }}>
            <img
              src="./2-caminspector-high-resolution-logo-transparent.png"
              height="40%"
              width="25%"
              alt="CamInspector"
            />
          </div>
          <div
            style={{
              marginRight: "30px",
              display: "flex",
              flexDirection: "row",
            }}
          > <div style={{ marginRight: "10px", marginTop: "2px", marginBottom: "2px" }}>
              <button
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  borderRadius: "8px",
                  padding: "8px",
                  cursor: "pointer",
                  whiteSpace: "nowrap"
                }}
                onClick={handleDashboardClick}
              >
                <Typography>Dashboard</Typography>
              </button>
            </div>
            <div style={{ marginRight: "10px", marginTop: "2px", marginBottom: "2px" }}>
              <button
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  borderRadius: "8px",
                  padding: "8px",
                  cursor: "pointer",
                  whiteSpace: "nowrap"
                }}
                onClick={handleMapViewClick}
              >
                <Typography>Map View</Typography>
              </button>
            </div>
            <div style={{ marginRight: "10px", marginTop: "2px", marginBottom: "2px" }}>
              <button
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  borderRadius: "8px",
                  padding: "8px",
                  cursor: "pointer",
                  whiteSpace: "nowrap"
                }}
                onClick={handleCameraButtonClick}
              >
                <Typography>Camera Details</Typography>
              </button>
            </div>
            <div style={{ marginRight: "10px", marginTop: "2px", marginBottom: "2px" }}>
              <button
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  borderRadius: "8px",
                  padding: "8px",
                  cursor: "pointer",
                  whiteSpace: "nowrap"
                }}
                onClick={handleOnvifButtonClick}
              >
                <Typography>Onvif Camera</Typography>
              </button>
            </div>
          </div>
          
          

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar
                  alt="aa"
                  src={`data:image/jpeg;base64,${profileImageUrl}`}
                  style={{ width: "50px", height: "50px" }}
                />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={handleItemClick(setting)}>
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <HandleUserProfile
            open={isUserProfileOpen}
            handleClose={() => setIsUserProfileOpen(false)}
            handleSubmit={handleUserProfileSubmit}
          />
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default TopBar;
