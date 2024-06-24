import React, { useState, useEffect, useMemo } from "react";
import TopBar from "../components/TopBar";
import BottomBar from "../components/BottomBar";
import { Button } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { Box } from "@mui/system";
import { useNavigate } from "react-router-dom";
import CheckboxTree from "react-checkbox-tree"; // Import CheckboxTree directly
import "react-checkbox-tree/lib/react-checkbox-tree.css";
import config from "../config";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers";
import PieChartComponent from "../components/PieChart";
import BarChartComponent from "../components/BarChart";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseIcon from "@mui/icons-material/Close";
import LineChartComponent from "../components/LineChart";
import DashboardTable from "../components/DashboardTable";
import { format } from "date-fns";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import dayjs from "dayjs";
import Slider from "react-slick";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faCamera } from "@fortawesome/free-solid-svg-icons";
import { faMap } from "@fortawesome/free-regular-svg-icons";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useRef } from "react";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
} from "@mui/material";

const fetchDataFromBackend = async () => {
  // Implement code to fetch data from your backend endpoint
  const response = await fetch(
    `${config.apiBaseUrl}/CamData/camData_dashboard`
  );
  const data = await response.json();
  return data;
};

// Function to filter tree data based on search query
//The filterTreeData function filters a tree structure based on a search query. It recursively traverses the tree, including nodes that match the query directly or have children that match the query. If the query is empty, it returns the original tree. 
const filterTreeData = (nodes, query) => {
  const filterNodes = (nodes) => {
    if (!query.trim()) {
      return nodes; // Return the original nodes if query is empty
    }
    return nodes
      .map((node) => {
        if (node.label.toLowerCase().includes(query.toLowerCase())) {
          return node;
        }
        if (node.children) {
          const filteredChildren = filterNodes(node.children);
          if (filteredChildren.length > 0) {
            return { ...node, children: filteredChildren };
          }
        }
        return null;
      })
      .filter(Boolean);
  };

  return filterNodes(nodes);
};

const CamerasCard = ({ name, count, totalCount }) => {
  // Calculate the percentage only if totalCount is not 0 and name is not "Total Detections"
  const percentage =
    totalCount !== 0 && name !== "Total Detections"
      ? ((count / totalCount) * 100).toFixed(1)
      : null;
  const numberFormatOptions = {
    compactDisplay: "short",
    style: "decimal",
    maximumFractionDigits: 2, // Adjust as needed
  };
  return (
    <Box
      sx={{
        bgcolor: "#e1e7f0",
        borderRadius: "20px",
        padding: "8px",
        // marginTop: "0px",
        marginBottom: "5px",
        width: "240px",
        height: "80px",
        alignContent: "center",
        marginRight: "10px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "2px 2px 2px rgba(0, 0, 0, 0.9)",
      }}
    >
      <div style={{ paddingLeft: 4 }}>
        <Typography sx={{ fontSize: 18 }}>{name}</Typography>
        <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
          {count.toLocaleString("en-IN", numberFormatOptions)}
        </Typography>
        {percentage !== null && (
          <Typography sx={{ fontSize: 16 }}>{percentage}%</Typography>
        )}
      </div>
    </Box>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [dashboardData, setDashboardData] = useState([]);
  const [checked, setChecked] = useState([]);
  const [totalCounts, setTotalCounts] = useState(0);
  const [cardCounts, setCardCounts] = useState({});
  const [showBigCard, setShowBigCard] = useState(false);
  const [activeChart, setActiveChart] = useState(null);
  const [selectedOption, setSelectedOption] = useState("Day");
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [filteredTreeData, setFilteredTreeData] = useState([]); // State for filtered tree data
  const [expandedBySearch, setExpandedBySearch] = useState([]);
  const [expandedManually, setExpandedManually] = useState([]);
  const [expandAll, setExpandAll] = useState(false);
  const[analyticsTypes, setAnalyticsTypes] = useState([]);
  const sliderRef = useRef();

  const [selectedAnalyticsTypes, setSelectedAnalyticsTypes] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState("Today");
  const [selectedDateTimeFrom, setSelectedDateTimeFrom] = useState(
    dayjs("2024-01-01T08:00")
  );
  const [selectedDateTimeTo, setSelectedDateTimeTo] = useState(
    dayjs("2024-01-02T17:00")
  );
  const [selectedDashboardDateFrom, setSelectedDashboardDateFrom] = useState(
    dayjs("2024-01-01T08:00")
  );
  const [selectedDashboardDateTo, setSelectedDashboardDateTo] = useState(
    dayjs("2024-01-02T17:00")
  );
  const [filteredData, setFilteredData] = useState({
    selectedTimeRange: "Today",
    selectedDateTimeFrom: dayjs("2024-01-01T08:00"),
    selectedDateTimeTo: dayjs("2024-01-02T17:00"),
    selectedAnalyticsTypes: [], // Initially empty
  });
  
  const handleCloseBigCard = () => {
    setShowBigCard(false);
  };
  const handleShowFullView = (chartComponent) => {
    setActiveChart(chartComponent);
    setShowBigCard(true);
  };
  const fetchDashboardData = async () => {
    const response = await fetch(`${config.apiBaseUrl}/CamData/dashboardData`);
    const data2 = await response.json();

    // Extract unique detections from data2
    const uniqueDetections = Array.from(new Set(data2.map(item => item.detection.replace(/^ET_/, ""))));

    // Create the analyticsTypes array dynamically
    const analyticsTypes = uniqueDetections.map(detection => ({
      dataKey: detection,
      label: detection,
    }));

    // Get the first three unique detections
    const firstThreeDetections = uniqueDetections.slice(0, 3);

    setDashboardData(data2);
    setAnalyticsTypes(analyticsTypes);
    setSelectedAnalyticsTypes(firstThreeDetections);

    // Update the filteredData state with the first three detections
    setFilteredData(prevState => ({
      ...prevState,
      selectedAnalyticsTypes: firstThreeDetections
    }));

    console.log(firstThreeDetections); // This will log the selected analytics types
  };

  useEffect(() => {
    fetchDataFromBackend()
      .then((data) => {
        if (Array.isArray(data)) {
          setData(data);

        } else {
          console.error("Data received from backend is not an array:", data);
        }
      })
      .catch((error) => {
        console.error("Error fetching data from backend:", error);
      });
  }, []);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    let total = 0;
    const counts = {};

    dashboardData.forEach(({ detection, count }) => {
      total += count;
      counts[detection] = (counts[detection] || 0) + count;
    });

    setTotalCounts(total);
    setCardCounts(counts);
    // eslint-disable-next-line
  }, [data]);

  // Correctly generate cards based on cardCounts state object
  const cards = [
    <CamerasCard key="total" name="Total Detections" count={totalCounts} />,
    ...Object.entries(cardCounts).map(([detection, count]) => (
      <CamerasCard
        key={detection}
        name={detection.replace(/^ET_/, "")}
        count={count}
        totalCount={totalCounts}
      />
    )),
  ];

  const settings = {
    dots: false,
    infinite: false,
    arrows: false,
    speed: 400,
    slidesToShow: 4,
    slidesToScroll: 1,
  };

  // Extract names from the received data with unique identifiers
  const extractNames = (data) => {
    let nodeId = 1;

    const generateNodeId = () => {
      return `node_${nodeId++}`;
    };

    const mapCity = (city) => {
      return {
        value: generateNodeId(),
        label: city.name,
        children: city.child.map(mapSite),
      };
    };

    const mapSite = (site) => {
      return {
        value: generateNodeId(),
        label: site.name,
        children: site.child.map(mapCamera),
      };
    };

    const mapCamera = (camera) => {
      return {
        value: generateNodeId(),
        label: camera.name,
      };
    };

    return data.map(mapCity);
  };

  const memoizedTreeData = useMemo(() => extractNames(data), [data]); //By memoizing treeData using useMemo, ensured that it only updates when data changes, preventing the dependency loop and resolving the continuous re-rendering issue.

  const expandNodesForSearch = (nodes, query) => {
    const expandNodes = (nodes, parentExpanded) => {
      return nodes.reduce((acc, node) => {
        if (node.label.toLowerCase().includes(query.toLowerCase())) {
          acc.push(node.value);
          parentExpanded = true;
        }
        if (parentExpanded && node.children) {
          acc.push(node.value);
          acc = acc.concat(expandNodes(node.children, true));
        }
        return acc;
      }, []);
    };

    return expandNodes(nodes, false);
  };

  const icons = {
    parentClose: (
      <FontAwesomeIcon icon={faLocationDot} style={{ color: "#e65000" }} />
    ),
    parentOpen: <FontAwesomeIcon icon={faMap} style={{ color: "#01da4d" }} />,
    leaf: <FontAwesomeIcon icon={faCamera} style={{ color: "#006fe6" }} />,
  };

  useEffect(() => {
    const filteredData = filterTreeData(memoizedTreeData, searchQuery);
    setFilteredTreeData(filteredData);
    if (searchQuery) {
      const expandedNodes = expandNodesForSearch(memoizedTreeData, searchQuery);
      setExpandedBySearch(expandedNodes);
    } else {
      setExpandedBySearch([]);
    }
  }, [searchQuery, memoizedTreeData]);

  const handleNodeToggle = (expanded) => {
    setExpandedManually(expanded);
  };

  const handleForward = () => {
    sliderRef.current.slickNext(); // Go to next slide
  };
  const handleBackward = () => {
    sliderRef.current.slickPrev(); // Go to previous slide
  };

  const handleSelectAll = () => {
    if (selectedAnalyticsTypes.length === analyticsTypes.length) {
      setSelectedAnalyticsTypes([]);
    } else {
      const allAnalyticsTypes = analyticsTypes.map((type) => type.dataKey);
      setSelectedAnalyticsTypes(allAnalyticsTypes);
    }
  };

  useEffect(() => {
    switch (selectedTimeRange) {
      case "Today":
        setSelectedDateTimeTo(dayjs("2024-01-02T17:00")); // Fixed time point for "Today"
        break;
      case "Last 6 Hours":
        setSelectedDateTimeTo(dayjs("2024-01-02T11:00")); // Subtract 6 hours from 17:00
        break;
      case "Last 12 Hours":
        setSelectedDateTimeTo(dayjs("2024-01-02T05:00")); // Subtract 12 hours from 17:00
        break;
      case "Last 24 Hours":
        setSelectedDateTimeTo(dayjs("2024-01-01T17:00")); // Subtract 1 day from 17:00
        break;
      default:
        setSelectedDateTimeTo(dayjs("2024-01-02T17:00")); // Default value
    }
  }, [selectedTimeRange]);

  const handleFilterApply = () => {
    // Filter the data based on selected filters
    // You can implement your filtering logic here

    const filteredData = {
      selectedTimeRange,
      selectedDateTimeFrom,
      selectedDateTimeTo,
      selectedAnalyticsTypes,
    };
    // filterDashboardTableData(selectedDateTimeFrom, selectedDateTimeTo);
    setFilteredData(filteredData);
    console.log("hello:", filteredData);
  };

  const getAllNodeIds = (nodes) => {
    let ids = [];
    nodes.forEach(node => {
      ids.push(node.value);
      if (node.children) {
        ids = ids.concat(getAllNodeIds(node.children));
      }
    });
    return ids;
  };
  const allNodeIds = getAllNodeIds(filteredTreeData);
  const [checkedData, setCheckedData] = useState(allNodeIds);

  const handleExpandCollapseAll = () => {
    setExpandedManually(expandAll ? [] : getAllNodeIds(filteredTreeData));
    setExpandAll(!expandAll);
  };

  const handleSelectAllData = () => {
    const allIds = getAllNodeIds(memoizedTreeData);
    if (checked.length === allIds.length) {
      setChecked([]);
    } else {
      setChecked(allIds);
    }
  };

  console.log("filter", filteredData);
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
          paddingBottom: "20px",
          backgroundImage:
            "linear-gradient(to top, rgba(247, 153, 119,0.2), rgba(22,38,79, 0.5))",
          position: "relative", // Add position relative to allow absolute positioning of the button
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
        <Drawer
          sx={{
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: "250px",
              marginTop: "70px",
              backgroundColor: "#f2f4ff",
              borderTopRightRadius: "15px",
              borderRadius: "15px",
              paddingTop: "1px",
              paddingRight: "10px",
              paddingLeft: "10px",
              paddingBottom: "10px",
              // Adjust the height to accommodate additional components
              height: "585px",
              // Increase zIndex to ensure visibility over other elements
              zIndex: 1,
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.9)",
              overflowX: "hidden", // Hide horizontal overflow
              marginLeft: "10px",
            },
          }}
          variant="permanent"
          anchor="left"
        >
          {/* Typography with the text "Filter" */}
          <Typography
            fontSize="28px"
            noWrap
            component="div"
            style={{
              fontFamily: "inherit",
              marginLeft: "10px",
              marginBottom: "1px",
            }}
          >
            Filter
          </Typography>
          {/* Divider */}
          <Divider style={{ marginTop: "1px", marginBottom: "1px" }} />
          {/* LocalizationProvider wrapping the DatePickers */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            {/* DatePicker for Date */}
            <FormControl
              sx={{ marginTop: 1, marginBottom: 2, width: "100%" }}
              variant="filled"
            >
              <InputLabel id="time-range-label">Select Time Range</InputLabel>
              <Select
                labelId="time-range-label"
                id="time-range"
                value={selectedTimeRange}
                onChange={(event) => setSelectedTimeRange(event.target.value)}
              >
                <MenuItem value="Today">Today</MenuItem>
                <MenuItem value="Last 6 Hours">Last 6 Hours</MenuItem>
                <MenuItem value="Last 12 Hours">Last 12 Hours</MenuItem>
                <MenuItem value="Last 24 Hours">Last 24 Hours</MenuItem>
              </Select>
            </FormControl>

            {/* DateTimePicker for Date and Time From */}
            <DateTimePicker
              label="Date and Time From"
              sx={{ paddingTop: 0, paddingBottom: 1, marginBottom: "4px" }}
              value={selectedDateTimeFrom}
              onChange={(date) => {
                setSelectedDashboardDateFrom(date);
                setSelectedDateTimeFrom(date);
              }}
            />
            {/* DateTimePicker for Date and Time To */}
            <DateTimePicker
              label="Date and Time To"
              sx={{ paddingTop: 0, paddingBottom: 0, marginBottom: "4px" }}
              value={selectedDateTimeTo}
              onChange={(date) => {
                setSelectedDashboardDateTo(date);
                setSelectedDateTimeTo(date);
              }}
            />
            <FormControl
              sx={{ marginTop: 1, marginBottom: 2, width: "100%" }}
              variant="filled"
            >
              <InputLabel id="analytics-types-label">
                Select Analytics Types
              </InputLabel>
              <Select
                labelId="analytics-types-label"
                id="analytics-types"
                multiple
                value={selectedAnalyticsTypes}
                onChange={(event) =>
                  setSelectedAnalyticsTypes(event.target.value)
                }
                renderValue={(selected) => selected.join(", ")}
              >
                <MenuItem value="Select All">
                  <Checkbox
                    checked={
                      selectedAnalyticsTypes.length === analyticsTypes.length
                    }
                    onChange={handleSelectAll}
                  />
                  <ListItemText primary="Select All" />
                </MenuItem>
                {analyticsTypes.map((type) => (
                  <MenuItem key={type.dataKey} value={type.dataKey}>
                    <Checkbox
                      checked={selectedAnalyticsTypes.includes(type.dataKey)}
                    />
                    <ListItemText primary={type.label} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </LocalizationProvider>
          <TextField
            autoFocus
            sx={{ marginBottom: 1, height: "50px" }}
            id="search_camera"
            name="search_camera"
            label="Search Camera"
            type="search"
            fullWidth
            variant="filled"
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
          {/* CheckboxTree */}
          <div>
            {/* Button to expand all nodes */}
            <div style={{ display: "flex", alignItems: "center", padding: 0 }}>
              <Button
                onClick={handleSelectAllData}
                variant="text"
                color="primary"
                style={{
                  textTransform: "capitalize",
                  marginLeft: "10px",
                  padding: 0,
                }}
              >
                {checked.length === getAllNodeIds(memoizedTreeData).length ? "Unselect All" : "Select All"}
              </Button>
              <Button
                variant="text"
                color="primary"
                onClick={handleExpandCollapseAll}
                style={{
                  textTransform: "capitalize",
                  marginLeft: "80px",
                  padding: 0,
                }}
              >
                {expandAll ? "Collapse All" : "Expand All"}
              </Button>
              
            </div>
          </div>
          <div
            style={{
              overflowY: "auto",
              maxHeight: "124px",
              marginBottom: "1px",
            }}
          >
            <CheckboxTree
              nodes={filteredTreeData}
              checked={[...checkedData, ...checked]}
              expanded={[...expandedManually, ...expandedBySearch]} // Update the expanded prop
              onCheck={setChecked}
              onExpand={handleNodeToggle}
              icons={icons} // Use the custom icons defined earlier
            />
          </div>
          <Box
            sx={{
              display: "flex",
              width: "90%",
              height: "6%",
              marginTop: "10px",
              marginBottom: 0,
              marginLeft: 1,
            }}
          >
            <Button
              variant="outlined"
              sx={{ marginLeft: 2, padding: 1 }}
              href="/dashboard"
            >
              Reset
            </Button>
            <Button
              variant="contained"
              sx={{ marginLeft: 2, padding: 1 }}
              onClick={handleFilterApply}
            >
              Apply Filter
            </Button>
          </Box>
          {/* Divider */}
        </Drawer>

        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "left",
            width: "80%",
            marginLeft: "18%",
          }}
        >
          <Button
            onClick={handleBackward}
            startIcon={
              <ArrowBackIosNewIcon
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
          <Slider
            ref={sliderRef}
            {...settings}
            style={{ width: "90%", margin: "5px 0", position: "relative" }}
          >
            {cards.map((card, index) => (
              <div key={index} style={{ width: "100%" }}>
                {card}
              </div>
            ))}
          </Slider>

          <Button
            onClick={handleForward}
            startIcon={
              <ArrowForwardIosIcon
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
        </Box>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "10px",
            marginLeft: "18%",
          }}
        >
          <div
            style={{
              //background: 'radial-gradient(circle,  #f7f5f0 10%,#c9c7c1 50%,  #7d7a73 90%)',
              background: "white",
              borderRadius: 10,
              width: "570px",
              height: "235px",
              boxShadow: "2px 2px 2px rgba(0, 0, 0, 0.9)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography
                sx={{ marginLeft: 2, fontSize: 16, fontWeight: "bold" }}
              >
                Analytic Wise Distribution
              </Typography>
              <OpenInFullIcon
                onClick={() => handleShowFullView("PieChart")}
                sx={{
                  marginTop: "2px",
                  width: "22px",
                  marginRight: "5px",
                  color: "grey",
                  "&:hover": {
                    color: "black", // Change this to the desired hover color
                  },
                }}
              />
            </div>

            <PieChartComponent filteredData={filteredData} />
          </div>
          <div
            style={{
              background: "white",
              borderRadius: 10,
              width: "570px",
              height: "235px",
              boxShadow: "2px 2px 2px rgba(0, 0, 0, 0.9)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography
                sx={{ marginLeft: 2, fontSize: 16, fontWeight: "bold" }}
              >
                Analytic Detection vs Time
              </Typography>
              <OpenInFullIcon
                onClick={() => handleShowFullView("BarChart")}
                sx={{
                  marginTop: "2px",
                  width: "22px",
                  marginRight: "5px",
                  color: "grey",
                  "&:hover": {
                    color: "black", // Change this to the desired hover color
                  },
                }}
              />
            </div>
            <BarChartComponent filteredData={filteredData} />
          </div>

          <div
            style={{
              backgroundColor: "white",
              borderRadius: 10,
              width: "570px",
              height: "235px",
              boxShadow: "2px 2px 2px rgba(0, 0, 0, 0.9)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography
                sx={{ marginLeft: 2, fontSize: 16, fontWeight: "bold" }}
              >
                Analytic Detection vs Time
              </Typography>
              <OpenInFullIcon
                onClick={() => handleShowFullView("LineChart")}
                sx={{
                  marginTop: "2px",
                  width: "22px",
                  marginRight: "5px",
                  color: "grey",
                  "&:hover": {
                    color: "black", // Change this to the desired hover color
                  },
                }}
              />
            </div>
            <LineChartComponent filteredData={filteredData} />
          </div>
          <div
            style={{
              backgroundColor: "white",
              borderRadius: 10,
              width: "570px",
              height: "235px",
              boxShadow: "2px 2px 2px rgba(0, 0, 0, 0.9)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: "30px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <CalendarMonthIcon
                  sx={{ marginLeft: "3px", marginTop: "1px" }}
                />
                <Typography
                  sx={{
                    marginTop: "2px",
                    marginLeft: "4px",
                    fontSize: 15.5,
                    fontWeight: "bold",
                  }}
                >
                  {format(new Date(selectedDashboardDateFrom), "yyyy-MM-dd")} --{" "}
                  {format(new Date(selectedDashboardDateTo), "yyyy-MM-dd")}
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  value={selectedOption}
                  onChange={(event, newValue) => setSelectedOption(newValue)}
                  sx={{
                    height: "10px",
                    paddingBottom: "18px",
                    paddingTop: "6px",
                    marginLeft: "45px", // Adjust the left margin as needed
                    
                  }}
                >
                  <ToggleButton
                    value="Hour"
                    aria-label="Hour"
                    sx={{ fontWeight: "bold", width:"55px", fontSize:13.5}}
                  >
                    Hour
                  </ToggleButton>
                  <ToggleButton
                    value="Day"
                    aria-label="Day"
                    sx={{ fontWeight: "bold", width:"55px", fontSize:13.5}}
                  >
                    Day
                  </ToggleButton>
                  <ToggleButton
                    value="Week"
                    aria-label="Week"
                    sx={{ fontWeight: "bold", width:"55px", fontSize:13.5, paddingLeft:1, paddingRight:1 }}
                  >
                    Week
                  </ToggleButton>
                  <ToggleButton
                    value="Month"
                    aria-label="Month"
                    sx={{ fontWeight: "bold", width:"55px", fontSize:13.5, paddingLeft:4, paddingRight:4 }}
                  >
                    Month
                  </ToggleButton>
                  <ToggleButton
                    value="Year"
                    aria-label="Year"
                    sx={{ fontWeight: "bold", width:"55px", fontSize:13.5, paddingLeft:1, paddingRight:1 }}
                  >
                    Year
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>
              <OpenInFullIcon
                onClick={() => handleShowFullView("DashboardTable")}
                sx={{
                  marginTop: "1px",
                  width: "22px",
                  marginRight: "5px",
                  color: "grey",
                  "&:hover": {
                    color: "black", // Change this to the desired hover color
                  },
                }}
              />
            </div>

            <DashboardTable
              filteredData={filteredData}
              option={selectedOption}
            />
          </div>
        </div>
      </Box>
      {showBigCard && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)" /* Semi-transparent white */,
            zIndex: 999 /* Ensure it appears above other content */,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              width: "70%" /* Adjust as needed */,
              height: "60%" /* Adjust as needed */,
              paddingTop: "50px",
              borderRadius: "20px",
              boxShadow:
                "0 0 10px rgba(0, 0, 0, 0.9)" /* Add shadow for depth */,
              position: "relative",
            }}
          >
            {activeChart === "PieChart" && (
              <>
                <Typography
                  sx={{ marginLeft: 12, fontSize: 20, fontWeight: "bold" }}
                >
                  Analytic Detection v/s Distribution
                </Typography>
                <PieChartComponent filteredData={filteredData} mf={2} />
              </>
            )}
            {activeChart === "BarChart" && (
              <>
                <Typography
                  sx={{ marginLeft: 12, fontSize: 20, fontWeight: "bold" }}
                >
                  Analytic Detection v/s Time
                </Typography>
                <BarChartComponent filteredData={filteredData} mf={1.85} />
              </>
            )}
            {activeChart === "LineChart" && (
              <>
                <Typography
                  sx={{ marginLeft: 14, fontSize: 20, fontWeight: "bold" }}
                >
                  Analytic Detection v/s Time
                </Typography>
                <LineChartComponent filteredData={filteredData} mf={1.85} />
              </>
            )}
            {activeChart === "DashboardTable" && (
              <>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <CalendarMonthIcon
                    sx={{ marginLeft: "2.4%", marginTop: "1px" }}
                  />
                  <Typography
                    sx={{
                      marginTop: "6px",
                      marginLeft: "3px",
                      fontSize: 16,
                      fontWeight: "bold",
                    }}
                  >
                    {format(new Date(selectedDashboardDateFrom), "yyyy-MM-dd")}{" "}
                    -- {format(new Date(selectedDashboardDateTo), "yyyy-MM-dd")}
                  </Typography>
                  <ToggleButtonGroup
                    exclusive
                    value={selectedOption}
                    onChange={(event, newValue) => setSelectedOption(newValue)}
                    sx={{
                      height: "12px",
                      paddingBottom: "18px",
                      paddingTop: "6px",
                      marginLeft: "45%", // Adjust the left margin as needed
                    }}
                  >
                    <ToggleButton
                    value="Hour"
                    aria-label="Hour"
                    sx={{ fontWeight: "bold"}}
                  >
                    Hour
                  </ToggleButton>
                  <ToggleButton
                    value="Day"
                    aria-label="Day"
                    sx={{ fontWeight: "bold"}}
                  >
                    Day
                  </ToggleButton>
                  <ToggleButton
                    value="Week"
                    aria-label="Week"
                    sx={{ fontWeight: "bold" }}
                  >
                    Week
                  </ToggleButton>
                  <ToggleButton
                    value="Month"
                    aria-label="Month"
                    sx={{ fontWeight: "bold"}}
                  >
                    Month
                  </ToggleButton>
                  <ToggleButton
                    value="Year"
                    aria-label="Year"
                    sx={{ fontWeight: "bold"}}
                  >
                    Year
                  </ToggleButton>
                  </ToggleButtonGroup>
                </div>
                <DashboardTable
                  filteredData={filteredData}
                  mf={1.85}
                  paddingTableLeft={20}
                  option={selectedOption}
                />
              </>
            )}
            <CloseIcon
              sx={{
                position: "absolute",
                top: "10px",
                right: "10px",
                width: 40,
                height: 30,
                padding: 0,
                paddingRight: 0,
                color: "grey",
                ":hover": { color: "rgba(213, 9, 9, 0.8)" },
              }}
              onClick={handleCloseBigCard}
            />

            {/* Content of the big white card goes here */}
          </div>
        </div>
      )}
      <BottomBar />
    </>
  );
};

export default Dashboard;