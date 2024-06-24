import React from "react";
import VideoPlayer from "./VideoPlayer";

const FourView = ({ camData, handleTogglePlay }) => {
  const calculateDimensions = (width, aspectRatio) => {
    const height = (width / aspectRatio); // Set height to half of the width multiplied by the aspect ratio
    return { width, height };
  };

  // Function to scale coordinates
  const scaleCoordinates = (coordinates, RoiWidth, RoiHeight, Width, Height) => {
    if (!coordinates) {
      return []; // Return an empty array if coordinates are null or undefined
    }
    const scaleX = Width / RoiWidth;
    const scaleY = Height / RoiHeight;
    return coordinates.map(coord => ({
      x: coord.x * scaleX,
      y: coord.y * scaleY
    }));
  };
  //code regarding camera video styles, width, and default image
  const renderCamera = (camera, index) => {
    const aspectRatio = camera.aspect_ratio || 16 / 9; // Default aspect ratio to 16:9 if not provided
    const { width, height } = calculateDimensions(454, aspectRatio); // Assuming a fixed width of 900px for each cell

    const scaledCoordinates = scaleCoordinates(
      camera.coordinates,  //camera.coordinates is done in order to show ROI according to camdata
      960, // Original video width (assumed)
      540,  // Original video height (assumed)
      width,
      height
    );

    //console.log('Scaled_four:',scaleCoordinates);
    return (
      <div
        key={camera.camera_id || index} // Use index as the key if camera_id is not available
        style={{
          flex: "0 0 auto",
          width: "fit-content", // Set width to fit the content inside
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        {camera.isPlaying ? (
          <VideoPlayer
            cameraID={camera.camera_id}
            cameraName={camera.camera_name}
            isPlaying={camera.isPlaying}
            onTogglePlay={() => handleTogglePlay(camera.camera_id)}
            width={`${width}px`}
            height={`${height}px`} // Set height dynamically based on the aspect ratio
            exampleCoordinates={scaledCoordinates} // Pass scaled coordinates to VideoPlayer
            style={{
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
        ) : (
          <div
            className="image-item"
            style={{
              justifyContent: "center",
              border: "1px solid #ccc",
              borderRadius: "10px",
              overflow: "hidden",
              width: `${width}px`, // Set width based on calculated dimensions
              height: `${height}px`, // Set height based on calculated dimensions
            }}
          >
            <img
              src={camera.image_url || "Camera_default.jpg"}
              alt={camera.camera_name || "Default"}
              style={{
                width: "450px",
                height: "247px",
                objectFit: "contain",
                maxWidth: "100%",
                maxHeight: "100%",
              }}
            />
          </div>
        )}
      </div>
    );
  };


  //code to make a grid to display the render camera
  const renderGrid = () => {
    const grid = [];
    for (let i = 0; i < 4; i++) {
      const camera = camData[i];
      grid.push(
        <div
          key={camera ? camera.camera_id : i} // Use index as the key if camera_id is not available
          style={{
            flex: "0 0 auto",
            padding: "6px",
            position: "relative",
            boxSizing: "border-box",
          }}
        >
          {camera ? renderCamera(camera, i) : (
            <div
              className="image-item"
              style={{
                justifyContent: "center",
                border: "1px solid #ccc",
                borderRadius: "10px",
                overflow: "hidden",
                width: "100%",
                height: "100%", // Adjusted to match video player's height
              }}
            >
              <img
                src="Camera_default.jpg"
                alt="Default"
                style={{
                  width: "454px",
                  height: "240.6px",
                  objectFit: "contain",
                  maxWidth: "100%",
                  maxHeight: "100%",
                }}
              />
            </div>
          )}
        </div>
      );
    }
    return grid;
  };

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent:"center",
        width: "950px",
        border: "1px solid #ccc",
        padding:0,
      }}
    >
      {renderGrid()}
    </div>
  );
};

export default FourView;
