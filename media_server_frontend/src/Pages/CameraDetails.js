import * as React from "react";
import TopBar from "../components/TopBar";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import Link from "@mui/material/Link";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { visuallyHidden } from "@mui/utils";
import { Sheet } from "@mui/joy";
import "./table.css";
import BottomBar from "../components/BottomBar";
import Button from "@mui/material/Button";
import config from "../config";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";

const RegisteredCamerasCard = ({ totalCameras }) => (
  <Box
    sx={{
      bgcolor: "#f0f0f0",
      borderRadius: "20px",
      padding: "20px",
      marginBottom: "10px",
      width: "200px",
      alignContent: "center",
      marginRight: "10px",
    }}
  >
    <h3>Registered Cameras</h3>
    <p>Total Cameras: {totalCameras}</p>
  </Box>
);

const EnabledCamerasCard = ({ enabledCameras }) => (
  <Box
    sx={{
      bgcolor: "#d9f6dc",
      borderRadius: "20px",
      padding: "20px",
      marginBottom: "10px",
      width: "200px",
      alignContent: "center",
      marginRight: "10px",
    }}
  >
    <h3>Enabled Cameras</h3>
    <p>Total Enabled Cameras: {enabledCameras}</p>
  </Box>
);

const DisabledCamerasCard = ({ disabledCameras }) => (
  <Box
    sx={{
      bgcolor: "#f9cfd1",
      borderRadius: "20px",
      padding: "20px",
      marginBottom: "10px",
      width: "200px",
      alignContent: "center",
      marginRight: "10px",
    }}
  >
    <h3>Disabled Cameras</h3>
    <p>Total Disabled Cameras: {disabledCameras}</p>
  </Box>
);

const Details = () => {
  const [rows, setRows] = React.useState([]);
  const [totalCameras, setTotalCameras] = React.useState(0);
  const [enabledCameras, setEnabledCameras] = React.useState(0);
  const [disabledCameras, setDisabledCameras] = React.useState(0);
  const navigate = useNavigate();
  const fetchCamData = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/CamData/cameraDetails`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        const filteredData = data.map((item) => ({
          cameraName: item.camera_name,
          cameraID: "C" + item.camera_id,
          Location: item.location,
          Ip: item.rtsp.substring(
            item.rtsp.indexOf("@") + 1,
            item.rtsp.indexOf(":554")
          ),
          Status: item.enable_disable,
        }));
        setRows(filteredData);
        let total = 0;
        let enabled = 0;
        let disabled = 0;

        filteredData.forEach((item) => {
          total++;
          if (item.Status === "enable") {
            enabled++;
          } else if (item.Status === "disable") {
            disabled++;
          }
        });

        setTotalCameras(total);
        setEnabledCameras(enabled);
        setDisabledCameras(disabled);
      } else {
        console.error("Server error:", response.status, response.statusText);
      }
    } catch (err) {
      console.error("Error:", err.message);
    }
  };

  React.useEffect(() => {
    fetchCamData();
  }, []); // Empty dependency array ensures the effect runs only once after mount

  const handleEnableCamera = async (cameraName) => {
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/CamData/enableCamera`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cameraName }),
        }
      );
      if (response.ok) {
        console.log(`Enabled camera ${cameraName}`);
        // Call fetchCamData after enabling camera
        fetchCamData();
      } else {
        console.error(
          "Failed to enable camera:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  const handleDisableCamera = async (cameraName) => {
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/CamData/disableCamera`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cameraName }),
        }
      );
      if (response.ok) {
        console.log(`Disabled camera ${cameraName}`);
        // Call fetchCamData after disabling camera
        fetchCamData();
      } else {
        console.error(
          "Failed to disable camera:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }

  function getComparator(order, orderBy) {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) {
        return order;
      }
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }

  const headCells = [
    {
      id: "cameraName",
      numeric: false,
      disablePadding: true,
      label: "Camera Name",
    },
    {
      id: "cameraID",
      numeric: true,
      disablePadding: false,
      label: "Camera ID",
    },
    {
      id: "Location",
      numeric: true,
      disablePadding: false,
      label: "Location",
    },
    {
      id: "Ip",
      numeric: true,
      disablePadding: false,
      label: "IP",
    },
    {
      id: "Status",
      numeric: true,
      disablePadding: false,
      label: "Status",
    },
    {
      id: "Actions",
      numeric: false,
      disablePadding: false,
      label: "Actions",
    },
  ];

  function EnhancedTableHead(props) {
    const { order, orderBy, onRequestSort } = props;
    const createSortHandler = (property) => (event) => {
      onRequestSort(event, property);
    };

    return (
      <thead>
        <tr>
          {headCells.map((headCell) => {
            return (
              <th key={headCell.id}>
                <Link underline="none" onClick={createSortHandler(headCell.id)}>
                  {headCell.label}
                  {orderBy === headCell.id && (
                    <>
                      {order === "asc" ? (
                        <ArrowDownwardIcon sx={{ fontSize: "small" }} />
                      ) : (
                        <ArrowUpwardIcon sx={{ fontSize: "small" }} />
                      )}
                    </>
                  )}
                  {orderBy === headCell.id ? (
                    <Box component="span" sx={visuallyHidden}>
                      {order === "desc"
                        ? "sorted descending"
                        : "sorted ascending"}
                    </Box>
                  ) : null}
                </Link>
              </th>
            );
          })}
        </tr>
      </thead>
    );
  }

  EnhancedTableHead.propTypes = {
    onRequestSort: PropTypes.func.isRequired,
    order: PropTypes.oneOf(["asc", "desc"]).isRequired,
    orderBy: PropTypes.string.isRequired,
  };

  const TableSortAndSelection = () => {
    const [order, setOrder] = React.useState("asc");
    const [orderBy, setOrderBy] = React.useState("cameraID");

    const handleRequestSort = (event, property) => {
      const isAsc = orderBy === property && order === "asc";
      setOrder(isAsc ? "desc" : "asc");
      setOrderBy(property);
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
            flexDirection: "column",
            alignItems: "center",
            objectFit: "contain",
            height:"85vh",
            backgroundImage:"linear-gradient(to top, rgba(247, 153, 119,0.2), rgba(22,38,79, 0.5))",
          }}
        >
          {/* Cards */}
          <Button
          sx={{ position: 'absolute', top: '62px', right: '0px'}}
          onClick={() => {
            navigate("/home");
          }}
          startIcon={<HomeIcon style={{ width: "30px", height: "30px", color: "black", background:"white", borderRadius:"100%", padding:"2px" }}/>}
        />
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "left",
              width: "75%",
            }}
          >
            <RegisteredCamerasCard totalCameras={totalCameras} />
            <EnabledCamerasCard enabledCameras={enabledCameras} />
            <DisabledCamerasCard disabledCameras={disabledCameras} />
          </Box>
          <Sheet
            variant="outlined"
            sx={{
              width: "75%",
              boxShadow: "sm",
              borderRadius: "sm",
              padding: "10px",
            }}
          >
            <Table aria-labelledby="tableTitle"  className="table">
              <EnhancedTableHead
                onRequestSort={handleRequestSort}
                order={order}
                orderBy={orderBy}
              />
              <tbody>
                {stableSort(rows, getComparator(order, orderBy)).map(
                  (row, index) => {
                    const labelId = `enhanced-table-checkbox-${index}`;
                    return (
                      <tr key={row.cameraName}>
                        <th id={labelId} scope="row">
                          {row.cameraName}
                        </th>
                        <td>{row.cameraID}</td>
                        <td>{row.Location}</td>
                        <td>{row.Ip}</td>
                        <td>
                          {row.Status === "enable" ? (
                            <>
                              <span
                                style={{ color: "green", marginRight: "5px" }}
                              >
                                ●
                              </span>
                              <span style={{ color: "green" }}>Enabled</span>
                            </>
                          ) : (
                            <>
                              <span
                                style={{ color: "red", marginRight: "5px" }}
                              >
                                ●
                              </span>
                              <span style={{ color: "red" }}>Disabled</span>
                            </>
                          )}
                        </td>
                        <td>
                          <div
                            style={{ display: "flex", position: "relative" }}
                          >
                            <Button
                              variant="contained"
                              color="success"
                              onClick={() => handleEnableCamera(row.cameraName)}
                            >
                              Enable
                            </Button>
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() =>
                                handleDisableCamera(row.cameraName)
                              }
                              style={{ marginLeft: "5px" }}
                            >
                              Disable
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </Table>
          </Sheet>
        </Box>
        <BottomBar />
      </>
    );
  };

  return <TableSortAndSelection />;
};

export default Details;
