import React, { useState, useEffect, useRef } from "react";
import flvjs from "flv.js";
import config from "../config.js";
import { useSnackbar } from "notistack";


const VideoPlayer = ({cameraID,cameraName,isPlaying,width,height,exampleCoordinates }) => {
  console.log('video', width, height);
  const videoRef = useRef(null);
  const [flvPlayer, setFlvPlayer] = useState(null);
  const { enqueueSnackbar } = useSnackbar();


  useEffect(() => {
    const initFlvPlayer = (url, setFlvPlayer) => {
      if (flvjs.isSupported()) {
        const player = flvjs.createPlayer({
          type: "flv",
          url: url,
        });

        player.attachMediaElement(videoRef.current);
        player.load();
        setFlvPlayer(player);
        return () => {
          player.destroy();
        };
      }
    };
    if (cameraID) {
      const cleanup = initFlvPlayer(
        `http://localhost:14${cameraID}/live/C${cameraID}.flv`,
        setFlvPlayer
      );
      return () => {
        cleanup();
      };
    }
  }, [cameraID, cameraName]);

  useEffect(() => {
    if (flvPlayer) {
        flvPlayer.pause();
    }
  }, [isPlaying, flvPlayer]);

  const handleDownloadImage = async () => {
    // Check if there is an image preview available
    if (videoRef.current && videoRef.current.videoWidth && videoRef.current.videoHeight) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg');
  
      try {
        const response = await fetch(`${config.apiBaseUrl}/CamData/saveImage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: imageData, camID:cameraID }),
        });
  
        if (response.ok) {
          console.log('Image data sent successfully.');
          enqueueSnackbar('Image Saved', {variant:'success', autoHideDuration: 2000,   anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'center'
          }})
          // You can add further handling here if needed
        } else {
          console.error('Failed to send image data:', response.status);
          // Handle error response from the server
        }
      } catch (error) {
        console.error('Error sending image data:', error);
        // Handle network errors or other errors
      }
    } else {
      alert("No video available to capture image.");
    }
  };
  
  
  const renderShape = () => {
    console.log('render', width, height);
    return (
      <svg style={{ width: "100%", height: "100%", position: "absolute" }}>
        <polygon
          points={exampleCoordinates
            .map((coord) => `${coord.x},${coord.y}`)
            .join(" ")}
          style={{ fill: "transparent", stroke: "red", strokeWidth: 3 }}
        />
      </svg>
    );
  };

  return (
    <div
      style={{
        marginTop: "1px",
        position: "relative",
        overflow: "hidden",
        width,
        height,
        borderRadius:"15px"
      }}
    >
      <div style={{ width, height, position: "relative", overflow: "hidden" }}>
        {renderShape()}
        <video
          ref={videoRef}
          controls
          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius:"15px" }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            padding: "4px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius:"35px"
          }}
        >
          <button onClick={handleDownloadImage}>Download Image</button>
        </div>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            backgroundColor: "rgba(0, 0, 0)",
            padding: "2px",
            color: "white",
            minWidth: "40%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          C{cameraID}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
