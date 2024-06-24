import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import CardActions from "@mui/material/CardActions";
import { useNavigate } from "react-router-dom";
import config from "../config.js";
import Button from "@mui/material/Button";

const AddRoiPage = () => {
  const location = useLocation();
  const { Id } = location.state; // Retrieve camera ID from location state
  const [cameraImage, setCameraImage] = useState(null);
  const [coordinates, setCoordinates] = useState([]); // Renamed points to coordinates
  const [closed, setClosed] = useState(false);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCameraImage = async () => {
      try {
        const response = await fetch(
          `${config.apiBaseUrl}/CamData/imageById/${Id}`
        );
        if (response.ok) {
          const imageData = await response.blob(); // Get the image blob
          const imageUrl = URL.createObjectURL(imageData); // Create an object URL for the image blob
          setCameraImage(imageUrl); // Set the object URL as image source
        } else {
          console.error("Server error:", response.status, response.statusText);
        }
      } catch (err) {
        console.error("Error:", err.message);
      }
    };

    fetchCameraImage();
  }, [Id]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (cameraImage) {
      // Load the image onto the canvas when it's available
      const img = new Image();
      img.onload = function () {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawCoordinatesAndLines(ctx); // Draw existing coordinates and lines when the image is loaded
      };
      img.src = cameraImage;

      const drawCoordinatesAndLines = (context) => {
        context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        context.drawImage(img, 0, 0, canvas.width, canvas.height); // Redraw the image

        // Draw red dots at the clicked coordinates
        context.fillStyle = 'red';
        coordinates.forEach(({ x, y }) => {
          context.beginPath();
          context.arc(x, y, 3, 0, Math.PI * 2);
          context.fill();
        });

        // Draw lines between consecutive coordinates
        context.strokeStyle = 'red';
        context.lineWidth = 2;
        for (let i = 0; i < coordinates.length - 1; i++) {
          context.beginPath();
          context.moveTo(coordinates[i].x, coordinates[i].y);
          context.lineTo(coordinates[i + 1].x, coordinates[i + 1].y);
          context.stroke();
        }

        // Draw the closing line if polygon is closed
        if (closed && coordinates.length >= 3) {
          context.beginPath();
          context.moveTo(coordinates[coordinates.length - 1].x, coordinates[coordinates.length - 1].y);
          context.lineTo(coordinates[0].x, coordinates[0].y);
          context.stroke();
        }

        // If polygon is closed, shade the region
        if (closed && coordinates.length >= 3) {
          context.fillStyle = 'rgba(255, 0, 0, 0.3)'; // Semi-transparent red
          context.beginPath();
          context.moveTo(coordinates[0].x, coordinates[0].y);
          for (let i = 1; i < coordinates.length; i++) {
            context.lineTo(coordinates[i].x, coordinates[i].y);
          }
          context.closePath();
          context.fill();
        }
      };

      const handleCanvasClick = (event) => {
        if (closed) return; // Prevent adding coordinates after polygon is closed
        const rect = canvas.getBoundingClientRect(); 
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;
        console.log("Clicked at:", x, y);

        // Check if the clicked point is close to the first point
        if (coordinates.length > 0) {
          const firstPoint = coordinates[0];
          const distance = Math.sqrt((x - firstPoint.x) ** 2 + (y - firstPoint.y) ** 2);
          if (distance < 10) { // Threshold distance to consider it as the same point
            setClosed(true);
            return;
          }
        }

        setCoordinates([...coordinates, { x, y }]);
      };

      drawCoordinatesAndLines(ctx); // Initial drawing of coordinates and lines
      canvas.addEventListener("click", handleCanvasClick);

      // Cleanup: remove event listener when the component unmounts
      return () => {
        canvas.removeEventListener("click", handleCanvasClick);
      };
    }
  }, [cameraImage, closed, coordinates]);

  const handleClose = () => {
    navigate("/home");
  };

  const handleSave = async () => {
    try {
      // Convert points array to JSON string
      const Coordinates = JSON.stringify(coordinates);
      
      const response = await fetch(`${config.apiBaseUrl}/CamData/saveCoordinates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Coordinates, Id }), // Pass coordinates instead of points
      });
      
      if (response.ok) {
        console.log('Coordinates saved successfully');
        setClosed(true);
        window.alert("Coordinates saved successfully")
      } else {
        console.error('Failed to save coordinates:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error saving coordinates:', error.message);
    }
  };
  
  const handleCancel = () => {
    // Clear all the coordinates and reset the closed state
    setCoordinates([]);
    setClosed(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Camera ID: {Id}</h1>
      <canvas ref={canvasRef} width={960} height={540} style={{ maxWidth: '60%', maxHeight: '60%', objectFit: 'contain' }} />
      <CardActions>
        <Button onClick={handleClose} variant="outlined">
          Back
        </Button>
        <Button onClick={handleCancel} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary" disabled={!closed}>
          Save
        </Button>
      </CardActions>
    </div>
  );
};

export default AddRoiPage;
