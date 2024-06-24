import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import config from "../config.js";
import HandleCameraEdit from "../components/EditCamera.js";
import OneView from "../components/OneView.js";
import MultiView from "../components/MultiView.js";
import FourView from "../components/FourView.js";
import { Dialog } from "@mui/material";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Card from "@mui/material/Card";
import WindowIcon from "@mui/icons-material/Window";
import AppsIcon from "@mui/icons-material/Apps";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
// import { SimpleTreeView } from "@mui/x-tree-view";
// import { TreeItem } from "@mui/x-tree-view";
import TopBar from "../components/TopBar.js";
import { useSnackbar } from "notistack";
import "./table.css";
import BottomBar from "../components/BottomBar.js";

const drawerWidth = 260;

const MainWindow = () => {
  const navigate = useNavigate();
  const [camData, setCamData] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [camDataNew, setCamDataNew] = useState(null);
  const [selectedView, setSelectedView] = useState("one"); // Default view
  const [addRoiDialogOpen, setAddRoiDialogOpen] = useState(false); // State to control Add ROI dialog
  const [enteredCameraName, setEnteredCameraName] = useState(""); // State to store entered camera name
  const [selectedCameras, setSelectedCameras] = useState([]);
  const [Coordinates, setCoordinates] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // State to store search query
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    // Calculate selected view whenever selectedCameras changes
    if (selectedCameras.length === 1) setSelectedView("one");
    else if (selectedCameras.length > 4) setSelectedView("multi");
    else if (selectedCameras.length >= 2) setSelectedView("four");
  }, [selectedCameras]);

  const fetchCamData = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/CamData/`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setCamData(data);
        console.log("DATA:", data);
        // if (data[1]?.coordinates) {
        //   // Assuming coordinates are always present in the second element
        //   setCoordinates(data[1].coordinates);
        // } else {
        //   console.warn("Coordinates not found in the response data");
        // }
      } else {
        console.error("Server error:", response.status, response.statusText);
        const responseData = await response.json();
        if (response.status === 403) {
          // Unauthorized access, redirect to login page
          enqueueSnackbar("Session Expired, Log in again", {
            variant: "error",
            autoHideDuration: 4000,
            anchorOrigin: {
              vertical: "top",
              horizontal: "center",
            },
          });
          navigate("/");
        } else {
          enqueueSnackbar(responseData.message || "Server error", {
            variant: "error",
            autoHideDuration: 4000,
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "center",
            },
          });
        }
      }
    } catch (err) {
      console.error("Error:", err.message);
      enqueueSnackbar("Error occurred", {
        variant: "error",
        autoHideDuration: 4000,
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "center",
        },
      });
    }
  };

  useEffect(() => {
    fetchCamData();
    // eslint-disable-next-line
  }, []);

  const handleTogglePlay = async (cameraId) => {
    //when checkbox selected
    const updatedCamData = camData.map((camera) =>
      camera.camera_id === cameraId
        ? { ...camera, isPlaying: !camera.isPlaying } //if the camera_id matches, it creates a new object with the same properties as the current camera object (...camera), but with the isPlaying property toggled (i.e., negated !camera.isPlaying).
        : camera
    );
    setCamData(updatedCamData);

    const selectedCamera = updatedCamData.find(
      (camera) => camera.camera_id === cameraId
    );

    if (selectedCamera.isPlaying) {
      setSelectedCameras((prevSelectedCameras) => [
        ...prevSelectedCameras,
        selectedCamera,
      ]);
    } else {
      setSelectedCameras((prevSelectedCameras) =>
        prevSelectedCameras.filter((camera) => camera.camera_id !== cameraId)
      );
      //Clear coordinates when the camera is deselected
      setCoordinates([]);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/CamData/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ camera_name: deleteTarget }),
      });

      if (response.ok) {
        const responseData = await response.text();

        if (responseData === "Camera Removed Successfully!") {
          setCamData(camData.filter((s) => s.camera_name !== deleteTarget));
          console.log(`Camera ${deleteTarget} deleted successfully`);
          enqueueSnackbar(`Camera ${deleteTarget} deleted successfully`, {
            variant: "info",
            autoHideDuration: 2000,
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "center",
            },
          });
        }
      } else {
        enqueueSnackbar(`Camera with name ${deleteTarget} not found`, {
          variant: "error",
          autoHideDuration: 4000,
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "center",
          },
        });
      }
    } catch (err) {
      console.error(err.message);
    }

    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const handleDelete = (cameraName) => {
    setDeleteTarget(cameraName);
    setDeleteDialogOpen(true);
  };

  const handleEdit = () => {
    setEditDialogOpen(false);
    const enteredCameraName = prompt("Enter the camera name to edit:");
    if (enteredCameraName) {
      const foundCamData = camData.find(
        (camera) => camera.camera_name === enteredCameraName
      );
      if (foundCamData) {
        setCamDataNew(foundCamData);
        handleEditDialogOpen();
      } else {
        enqueueSnackbar(`Camera with name ${enteredCameraName} not found`, {
          variant: "error",
          autoHideDuration: 3000,
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "center",
          },
        });
      }
    }
  };

  const handleEditDialogOpen = () => {
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setCamDataNew(null);
    setEditDialogOpen(false);
  };

  const handleEditSubmit = async (formData, id, name) => {
    try {
      formData.id = id;
      formData.name = name;
      //console.log(formData);
      const response = await fetch(`${config.apiBaseUrl}/CamData/edit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      fetchCamData();
      if (response.ok) {
        enqueueSnackbar("Camera details updated successfully", {
          variant: "success",
          autoHideDuration: 2000,
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "center",
          },
        });
        handleEditDialogClose();
      } else {
        const responseData = await response.json();
        enqueueSnackbar(`${responseData.error}`, {
          variant: "error",
          autoHideDuration: 4000,
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "center",
          },
        });
        console.error("Server error:", response.status, response.statusText);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleViewChange = async (view) => {
    try {
      // Calculate the number of cameras to keep based on the selected view
      let numberOfCamerasToKeep = 0;
      switch (view) {
        case "one":
          numberOfCamerasToKeep = Math.min(selectedCameras.length, 1);
          break;
        case "four":
          // console.log('LENGTH:', selectedCameras.length);
          numberOfCamerasToKeep = Math.min(selectedCameras.length, 4);
          break;
        case "multi":
          //  maximum cameras allowed in multi view is 16
          numberOfCamerasToKeep = Math.min(selectedCameras.length, 16);
          break;
        default:
          break;
      }

      // Update selected cameras to keep only the required number
      const selectedCamerasToKeep = selectedCameras.slice(
        0,
        numberOfCamerasToKeep
      );

      // Update the isPlaying status for each camera
      const updatedCamData = camData.map((camera) => ({
        ...camera,
        isPlaying: selectedCamerasToKeep.some(
          (selectedCamera) => selectedCamera.camera_id === camera.camera_id
        ),
      }));
      setCamData(updatedCamData);

      setSelectedView(view); // Move this line outside the switch statement
    } catch (error) {
      console.error(error);
      // Handle error if any
    }
  };

  const handleAddRoi = () => {
    // Open the dialog for adding ROI
    setAddRoiDialogOpen(true);
  };

  const handleAddRoiDialogClose = () => {
    // Close the dialog for adding ROI
    setAddRoiDialogOpen(false);
    // Clear the entered camera name
    setEnteredCameraName("");
  };

  const handleAddRoiSubmit = () => {
    // Find the corresponding camera ID based on the entered camera name
    const foundCamera = camData.find(
      (camera) => camera.camera_name === enteredCameraName
    );
    if (foundCamera) {
      // If camera is found, pass its ID to the AddRoi component
      navigate(`/addRoi`, { state: { Id: foundCamera.id } });
    } else {
      // If camera is not found, show an alert
      enqueueSnackbar(`Camera with name ${enteredCameraName} not found`, {
        variant: "error",
        autoHideDuration: 4000,
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "center",
        },
      });
    }
    // Close the dialog for adding ROI
    setAddRoiDialogOpen(false);
    // Clear the entered camera name
    setEnteredCameraName("");
  };

  return (
    <>
      <TopBar />
      <Box>
        <CssBaseline />
        <Drawer
          sx={{
            flexShrink: 3,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              marginTop: "68px",
              backgroundColor: "#f2f4ff",
              borderTopRightRadius: "15px",
              borderRadius: "15px",
              marginLeft: "10px",
              padding: "10px",
              height: "80.5%",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.9)",
            },
          }}
          variant="permanent"
          anchor="left"
        >
          {" "}
          <Typography
            fontSize="28px"
            noWrap
            component="div"
            style={{ fontFamily: "inherit", marginLeft: "10px" }}
          >
            Filter
          </Typography>
          <Divider style={{ marginBottom: "10px" }} />
          <TextField
            autoFocus
            margin="normal"
            id="search_camera"
            name="search_camera"
            label="Search Camera"
            type="text"
            fullWidth
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          {/* <SimpleTreeView>
            <TreeItem itemId="grid" label="CameraGrp"> */}
          <List>
            {camData
              .filter((camera) =>
                camera.camera_name
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())
              )
              .sort((a, b) => a.camera_name.localeCompare(b.camera_name)) // Sort the array in ascending order
              .map((camera) => (
                <ListItemButton key={camera.camera_id}>
                  <ListItemText primary={camera.camera_name} />
                  <input
                    type="checkbox"
                    checked={camera.isPlaying}
                    onChange={() => handleTogglePlay(camera.camera_id)}
                  />
                </ListItemButton>
              ))}
            {/* If no cameras found, display a message */}
            {camData.length > 0 &&
              camData.filter((camera) =>
                camera.camera_name
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())
              ).length === 0 && (
                <ListItemButton disabled>
                  <ListItemText primary="No cameras found" />
                </ListItemButton>
              )}
          </List>
          {/* </TreeItem>
          </SimpleTreeView> */}
          <Divider />
        </Drawer>

        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: "260px",
              boxSizing: "border-box",
              marginTop: "68px",
              backgroundColor: "#f2f4ff",
              borderTopLeftRadius: "15px",
              borderBottomRightRadius: "15px",
              height: "41%",
              marginRight: "10px",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.9)",
            },
          }}
          variant="permanent"
          anchor="right"
        >
          <Typography
            fontSize="28px"
            noWrap
            component="div"
            style={{ fontFamily: "inherit", marginLeft: "10px" }}
          >
            Camera Manager
          </Typography>
          <Divider sx={{ marginBottom: "10px" }} />
          <List
            sx={{ padding: "0 30px", paddingTop: "10px", paddingBottom: 0 }}
          >
            <Button
              onClick={() => navigate("/add")}
              variant="contained"
              color="warning"
              sx={{
                borderRadius: "5px",
                margin: "5px",
                fontWeight: "bold",
                width: "100%",
              }}
            >
              Add
            </Button>

            <Button
              onClick={handleEdit}
              variant="contained"
              color="success"
              sx={{
                borderRadius: "5px",
                margin: "5px",
                fontWeight: "bold",
                width: "100%",
              }}
            >
              Edit
            </Button>
            <Button
              onClick={handleDelete}
              variant="contained"
              color="error"
              sx={{
                borderRadius: "5px",
                margin: "5px",
                fontWeight: "bold",
                width: "100%",
              }}
            >
              Delete
            </Button>
            <Divider sx={{ marginTop: "15px" }} />
          </List>
          <List
            sx={{ padding: "0 30px", paddingTop: "10px", paddingBottom: 0 }}
          >
            <Button
              onClick={handleAddRoi}
              variant="contained"
              color="info"
              sx={{
                borderRadius: "5px",
                margin: "5px",
                fontWeight: "bold",
                width: "100%",
              }}
            >
              Add ROI
            </Button>
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: "background.default",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            objectFit: "contain",
            paddingBottom: "0px",
            backgroundImage:
              "linear-gradient(to top, rgba(247, 153, 119,0.2), rgba(22,38,79, 0.5))",
          }}
        >
          <div
            style={{
              padding: "2px",
              margin: "6px",
              display: "flex",
              justifyContent: "flex-start",
              backgroundColor: "#F2F4FF",
              borderRadius: "10px",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.6)",
            }}
          >
            <Button
              variant={selectedView === "one" ? "contained" : "text"}
              onClick={() => handleViewChange("one")}
              startIcon={
                <FullscreenIcon
                  style={{ width: "30px", height: "30px", color: "black" }}
                />
              }
              style={{
                borderRadius: "10px",
              }}
            />

            <Button
              variant={selectedView === "four" ? "contained" : "text"}
              onClick={() => handleViewChange("four")}
              startIcon={
                <WindowIcon
                  style={{ width: "30px", height: "30px", color: "black" }}
                />
              }
              style={{
                borderRadius: "10px",
              }}
            />
            <Button
              variant={selectedView === "multi" ? "contained" : "text"}
              onClick={() => handleViewChange("multi")}
              startIcon={
                <AppsIcon
                  style={{ width: "30px", height: "30px", color: "black" }}
                />
              }
              style={{
                borderRadius: "10px",
              }}
            />
          </div>
          <Card
            style={{
              maxWidth: "100%",
              marginBottom: "37px",
              display: "flex",
              borderRadius: "15px",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.9)",
            }}
          >
            {selectedView === "one" && (
              <OneView
                camData={selectedCameras}
                coordinates={Coordinates}
                handleTogglePlay={handleTogglePlay}
              />
            )}
            {selectedView === "multi" && (
              <MultiView
                camData={selectedCameras}
                coordinates={Coordinates}
                handleTogglePlay={handleTogglePlay}
              />
            )}
            {selectedView === "four" && (
              <FourView
                camData={selectedCameras}
                coordinates={Coordinates}
                handleTogglePlay={handleTogglePlay}
              />
            )}
          </Card>
        </Box>
      </Box>
      <HandleCameraEdit
        open={editDialogOpen}
        handleClose={handleEditDialogClose}
        camData={camDataNew}
        handleSubmit={(formData) =>
          handleEditSubmit(formData, camDataNew.id, camDataNew.camera_name)
        }
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Delete Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Enter the camera name to confirm deletion:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="cameraName"
            label="Camera Name"
            type="text"
            fullWidth
            onChange={(e) => setDeleteTarget(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add ROI Dialog */}
      <Dialog
        open={addRoiDialogOpen}
        onClose={handleAddRoiDialogClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Add ROI</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the camera name to add ROI:
          </DialogContentText>
          <TextField
            margin="dense"
            id="cameraName"
            label="Camera Name"
            type="text"
            fullWidth
            value={enteredCameraName}
            onChange={(e) => setEnteredCameraName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddRoiDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddRoiSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      <BottomBar />
    </>
  );
};

export default MainWindow;
