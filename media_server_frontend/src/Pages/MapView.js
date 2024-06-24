import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";
import TopBar from "../components/TopBar";
import { Box } from "@mui/system";
import BottomBar from "../components/BottomBar";
import config from "../config";
import { Sheet } from "@mui/joy";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import { Button } from "@mui/material";
import { Table } from "@mui/material";

const MapView = () => {
  const [positions, setPositions] = useState([]);
  const [rows, setRows] = useState([]);
  const [hoveredName, setHoveredName] = useState(null);
  const mapRef = useRef(null);
  const navigate = useNavigate();

  // Fetch positions from backend when the component mounts
  const fetchData = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/CamData/cameraDetails`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        const filteredData = data
          .filter((item) => item.location_coordinates && item.location)
          .map((item) => {
            const { camera_name, camera_id, location, enable_disable } = item;
            if (item.location_coordinates) {
              const [latitude, longitude] = item.location_coordinates.split(",").map((coord) => parseFloat(coord.trim()));
              setPositions((prevPositions) => [...prevPositions, { latitude, longitude, location }]);
              return {
                cameraName: camera_name,
                cameraID: "C" + camera_id,
                Location: location,
                Status: enable_disable,
                latitude,
                longitude,
              };
            }
            return null;
          });
        setRows(filteredData.filter(Boolean));
      } else {
        console.error("Server error:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error fetching positions:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (positions.length > 0 && mapRef.current) {
      const bounds = positions
        .reduce((acc, position) => acc.extend([position.latitude, position.longitude]), new window.L.LatLngBounds())
        .pad(0.2);
      mapRef.current.fitBounds(bounds);
    }

    // Sort the rows array based on cameraID in increasing order
    setRows((prevRows) =>
      prevRows.slice().sort((a, b) => {
        const idA = parseInt(a.cameraID.substring(1));
        const idB = parseInt(b.cameraID.substring(1));
        return idA - idB;
      })
    );
  }, [positions]);

  const headCells = [
    { id: "cameraName", numeric: false, label: "Camera Name" },
    { id: "cameraID", numeric: true, label: "Camera ID" },
    { id: "Location", numeric: true,  label: "Location" },
    { id: "Status", numeric: true,  label: "Status" },
  ];

  function EnhancedTableHead() {
    return (
      <thead>
        <tr>
          {headCells.map((headCell) => (
            <th key={headCell.id}>{headCell.label}</th>
          ))}
        </tr>
      </thead>
    );
  }

  // Define custom red icon
  const redIcon = new Icon({
    iconUrl: "./marker-icon-2x-red.png",
    iconSize: [30, 50],
    iconAnchor: [12, 41],
  });

  const handleMouseOver = (name) => {
    setHoveredName(name);
  };

  const handleMouseOut = () => {
    setHoveredName(null);
  };

  return (
    <>
      <TopBar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          p: 2,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          objectFit: "contain",
          paddingBottom: "7%",
          backgroundImage: "linear-gradient(to top, rgba(247, 153, 119,0.2), rgba(22,38,79, 0.5))",
        }}
      >
        <Button
          sx={{ position: "absolute", top: "62px", right: "0px" }}
          onClick={() => {
            navigate("/home");
          }}
          startIcon={<HomeIcon style={{ width: "30px", height: "30px", color: "black", background:"white", borderRadius:"100%", padding:"2px" }} />}
        />
        <div
          style={{
            width: "80%",
            objectFit: "contain",
            boxShadow: "0 0 20px rgba(0, 0, 0, 0.5)",
            borderRadius: "10px",
            marginTop: "30px",
          }}
        >
          <MapContainer
            ref={mapRef}
            center={[0, 0]}
            zoom={3}
            style={{ height: "480px", width: "100%", borderRadius: "10px" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Render markers for each position */}
            {positions.map((position, index) => (
              <Marker
                key={index}
                position={[position.latitude, position.longitude]}
                icon={redIcon}
                eventHandlers={{
                  mouseover: () => handleMouseOver(position.location),
                  mouseout: handleMouseOut,
                }}
              >
                <Popup>{position.location}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {hoveredName && (
          <div
            style={{
              position: "absolute",
              top: "620px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(22,38,79, 0.9)",
              padding: "10px 15px",
              borderRadius: "5px",
              zIndex: 999,
              color: "white",
            }}
          >
            {hoveredName}
          </div>
        )}
        <Sheet
          variant="outlined"
          sx={{
            width: "80%",
            boxShadow: "sm",
            borderRadius: "sm",
            padding: "10px",
            marginLeft: "20px",
          }}
        >
          <Table aria-labelledby="tableTitle" className="table" style={{ marginTop: "10px" }}>
            {EnhancedTableHead()}
            <tbody>
              {rows.map((row) => (
                <tr key={row.cameraName} style={{ background: row.Location === hoveredName ? "lightblue" : "white" }}>
                  <th id={row.cameraName} scope="row">
                    {row.cameraName}
                  </th>
                  <td>{row.cameraID}</td>
                  <td>{row.Location}</td>
                  <td>
                    {row.Status === "enable" ? (
                      <>
                        <span style={{ color: "green", marginRight: "5px" }}>●</span>
                        <span style={{ color: "green" }}>Enabled</span>
                      </>
                    ) : (
                      <>
                        <span style={{ color: "red", marginRight: "5px" }}>●</span>
                        <span style={{ color: "red" }}>Disabled</span>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Sheet>
      </Box>
      <BottomBar />
    </>
  );
};

export default MapView;
