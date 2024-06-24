import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client"; // used to establish WebSocket connections.
import axios from "axios";
import HomeIcon from "@mui/icons-material/Home";
import { Button,Box, IconButton, Stack, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useNavigate } from "react-router-dom";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import Header from "../components/TopBar";
import BottomBar from "../components/BottomBar";
import config from "../config";

const socket = io.connect(`${config.apiBaseUrl2}`);

function OnvifCamera() {
  const canvasRef = useRef(null);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [zoom, setZoom] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // this function sets up a listener for data events from the server. When data is received, the callback function is executed.
    socket.on("data", (data) => {
      const img = new Image(); //new Image object is created to hold the incoming data.
      const url = URL.createObjectURL(
        new Blob([new Uint8Array(data)], { type: "application/octet-binary" }) // incoming data, which is a binary stream, is converted into a Blob. Uint8Array wraps the binary data, and Blob creates an object representing a blob of binary data. The MIME type application/octet-binary indicates generic binary data.
      );
      img.onload = () => {
        URL.revokeObjectURL(url); //When the image is loaded (img.onload), the object URL is revoked to free up memory using URL.revokeObjectURL(url).
        ctx.drawImage(img, 0, 0); //drawImage(image, dx, dy) dx and dy coordinates from top-left corner
      };
      console.log(url);
      img.src = url; //starts loading the image from the blob URL
    });

    return () => {
      socket.off("data"); //Removes the data event listener when the component unmounts.
    };
  }, []);

  //Adjusts x and y state values by the specified deltas (deltaX and deltaY), ensuring they stay within -180 to 180 range.
  const handleMove = (deltaX, deltaY) => {
    const newX = Math.max(-180, Math.min(180, x + deltaX));
    const newY = Math.max(-180, Math.min(180, y + deltaY));

    setX(newX);
    setY(newY);

    //Normalization to convert x and y to a -1 to 1 range.
    const normalizedX = newX / 180;
    const normalizedY = newY / 180;

    axios
      .post(`${config.apiBaseUrl2}newServer/move`, {
        x: normalizedX,
        y: normalizedY,
        zoom: zoom / 100,
      })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error("There was an error moving the camera!", error);
      });
  };

  const handleZoom = (deltaZoom) => {
    //Adjusts zoom state by the specified delta (deltaZoom), ensuring it stays within 0 to 100 range.
    const newZoom = Math.max(0, Math.min(100, zoom + deltaZoom));

    setZoom(newZoom);

    axios
      .post(`${config.apiBaseUrl2}newServer/move`, {
        x: x / 180,
        y: y / 180,
        zoom: newZoom / 100,
      })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error("There was an error zooming the camera!", error);
      });
  };
  const navigate = useNavigate();

  
  return (
    <>
      <Header />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          p: 2,
          display: "flex",
          flexDirection: "column",
          objectFit: "contain",
          paddingBottom: "40px",
          backgroundImage:
            "linear-gradient(to top, rgba(247, 153, 119,0.2), rgba(22,38,79, 0.5))",
          position: "relative",
        }}
      >
        <Button
          sx={{ position: "absolute", top: "0px", right: "0px" }}
          onClick={() => {
            navigate("/home");
          }}
          startIcon={
            <HomeIcon
              style={{
                width: "30px",
                height: "30px",
                color: "black",
                background: "white",
                borderRadius: "100%",
                padding: "2px",
                zIndex: 1,
              }}
            />
          }
        />
        <Box>      
        </Box>
        <Box>
          <Stack direction="row" alignItems="center" spacing={10} mt={2}>
            <canvas
              ref={canvasRef}
              width="960"
              height="540"
              style={{ border: "1px solid #ccc", borderRadius:20 }}
            />
            <Stack direction="column" alignItems="center" spacing={2} mt={2} style={{ background:"rgb(255,255,255,0.4)", padding:20, borderRadius:20}}>
            <Typography style={{fontSize:25}}>Camera Controller</Typography>
              <div style={{ position: "relative", width: "200px", height: "200px"}}>
                <div style={{ background: "white", borderRadius: "100%", width: "200px", height: "200px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <IconButton
                    onClick={() => handleMove(0, -10)}
                    color="primary"
                    style={{
                      width: "60px",
                      height: "50px",
                      background: "white",
                      borderRadius: "100%",
                      zIndex: 1,
                      position: "absolute",
                      top: "10px",
                    }}
                  >
                    <ExpandLessIcon style={{ fontSize: 70 }} />
                  </IconButton>
                  <Stack direction="row" alignItems="center" spacing={10} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)" }}>
                    <IconButton
                      onClick={() => handleMove(-10, 0)}
                      color="primary"
                      style={{
                        width: "60px",
                        height: "60px",
                        background: "white",
                        borderRadius: "100%",
                        zIndex: 1,
                      }}
                    >
                      <ChevronLeftIcon style={{ fontSize: 70 }} />
                    </IconButton>
                    <IconButton
                      onClick={() => handleMove(10, 0)}
                      color="primary"
                      style={{
                        width: "60px",
                        height: "60px",
                        background: "white",
                        borderRadius: "100%",
                        zIndex: 1,
                      }}
                    >
                      <ChevronRightIcon style={{ fontSize: 70 }} />
                    </IconButton>
                  </Stack>
                  <IconButton
                    onClick={() => handleMove(0, 10)}
                    color="primary"
                    style={{
                      width: "60px",
                      height: "50px",
                      background: "white",
                      borderRadius: "100%",
                      zIndex: 1,
                      position: "absolute",
                      bottom: "10px",
                    }}
                  >
                    <ExpandMoreIcon style={{ fontSize: 70 }} />
                  </IconButton>
                </div>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "80px", height: "80px", background: "lightgray", borderRadius: "50%" }} />
              </div>
              <Stack direction={"row"} spacing={1}>
                <IconButton
                  onClick={() => handleZoom(10)}
                  color="error"
                  style={{
                    width: "65px",
                    height: "50px",
                    background: "white",
                    borderRadius: "20%",
                    zIndex: 1,
                  }}
                >
                  <ZoomInIcon style={{ fontSize: 50 }} />
                </IconButton>
                <IconButton
                  onClick={() => handleZoom(-10)}
                  color="error"
                  style={{
                    width: "65px",
                    height: "50px",
                    background: "white",
                    borderRadius: "20%",
                    zIndex: 1,
                  }}
                >
                  <ZoomOutIcon style={{ fontSize: 50 }} />
                </IconButton>
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </Box>
      <BottomBar />
    </>
  );
}

export default OnvifCamera;