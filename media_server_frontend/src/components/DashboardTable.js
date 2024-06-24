import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import Link from "@mui/material/Link";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import { visuallyHidden } from "@mui/utils";
import { Sheet } from "@mui/joy";
import "../../src/Pages/table.css";
import config from "../config";
import moment from "moment";

const DashboardTable = ({ filteredData, mf, paddingTableLeft, option }) => {
//if multiplication factor not provided then take it as 1
  if (!mf) {
    mf = 1;
  }

  const [data, setData] = useState([]);
  const [selectedOption, setSelectedOption] = useState("Day");
  const [formattedDateFrom, setSelectedDateTimeFrom] = useState(
    "2024-01-01T08:00:00"
  );
  const [formattedDateTo, setSelectedDateTimeTo] = useState(
    "2024-02-01T17:00:00"
  );
  const [totalData, setTotalData] = useState([]);

  useEffect(() => {
    setSelectedOption(option);
    if (
      filteredData &&
      filteredData.selectedDateTimeFrom &&
      filteredData.selectedDateTimeTo
    ) {
      const dateFrom = new Date(filteredData.selectedDateTimeFrom);
      setSelectedDateTimeFrom(moment(dateFrom).format("YYYY-MM-DDTHH:mm:ss"));

      const dateTo = new Date(filteredData.selectedDateTimeTo);
      setSelectedDateTimeTo(moment(dateTo).format("YYYY-MM-DDTHH:mm:ss"));

      const fetchData = async () => {
        try {
          const response = await fetch(
            `${config.apiBaseUrl}/CamData/filterDashboardTableData`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                selectedDateTimeFrom: formattedDateFrom,
                selectedDateTimeTo: formattedDateTo,
              }),
            }
          );

          if (response.ok) {
            const responseData = await response.json();
            const processedData = responseData.rows.map((row) => ({
              ...row,
              hourly_percentage_change: parseFloat(
                row.hourly_percentage_change
              ),
              date: moment(row.current_hour_start).format("YYYY-MM-DD"),
              year: moment(row.current_hour_start).format("YYYY"),
              total_count: parseInt(row.current_count),
            }));

            //used the reduce method to transform  array of data (processedData) into an object (groupedData) where the keys are combinations of detection types and dates.
            const groupedData = processedData.reduce((acc, curr) => {
              const key = `${curr.detection}-${curr.date}`;
              if (!acc[key]) {
                acc[key] = {
                  detection: curr.detection,
                  date: curr.date,
                  hourly_changes: [curr.hourly_percentage_change],
                  total_count: curr.total_count,
                };
              } else {
                acc[key].hourly_changes.push(curr.hourly_percentage_change);
                acc[key].total_count += curr.total_count;
              }
              return acc;
            }, {});
            console.log('grp', groupedData);
            
            const detectionCounts = {};
            const averagedData = Object.values(groupedData).map((item) => {
              const avgChange =
                item.hourly_changes.reduce((a, b) => a + b, 0) /
                item.hourly_changes.length;

              if (!detectionCounts[item.detection]) {
                detectionCounts[item.detection] = item.total_count;
              } else {
                detectionCounts[item.detection] += item.total_count;
              }

              return {
                ...item,
                avg_hourly_percentage_change: avgChange.toFixed(2),
                total_count: item.total_count,
                week_change: "0.00",
                month_change: "0.00",
                year_change: "0.00",
              };
            });

            const detectionAverages = averagedData.reduce((acc, curr) => {
              if (!acc[curr.detection]) {
                acc[curr.detection] = {
                  total: parseFloat(curr.avg_hourly_percentage_change),
                  count: 1,
                  year_changes: [{ year: curr.year, total_count: parseFloat(curr.total_count) }],
                  month_changes: [parseFloat(curr.month_change)],
                  week_changes: [parseFloat(curr.week_change)],
                };
              } else {
                acc[curr.detection].total += parseFloat(curr.avg_hourly_percentage_change);
                acc[curr.detection].count++;
                
                // Check if year_changes already exists for the current year
                const existingYearIndex = acc[curr.detection].year_changes.findIndex(yearData => yearData.year === curr.year);
                if (existingYearIndex !== -1) {
                  // If year already exists, update the total_count
                  acc[curr.detection].year_changes[existingYearIndex].total_count += parseFloat(curr.total_count);
                } else {
                  // If year doesn't exist, add it to year_changes
                  acc[curr.detection].year_changes.push({ year: curr.year, total_count: parseFloat(curr.total_count) });
                }
                
                acc[curr.detection].month_changes.push(parseFloat(curr.month_change));
                acc[curr.detection].week_changes.push(parseFloat(curr.week_change));
              }
              return acc;
            }, {});
            console.log('detect', detectionAverages);
            // Calculate averages
            Object.keys(detectionAverages).forEach((detection) => {
              const avg =
                detectionAverages[detection].total /
                detectionAverages[detection].count;
              detectionAverages[detection].average = avg.toFixed(2);
            
              const avgYearChange = detectionAverages[detection].year_changes.reduce((acc, yearData) => acc + parseFloat(yearData.total_count), 0) / detectionAverages[detection].year_changes.length;
              detectionAverages[detection].avg_year_count = avgYearChange.toFixed(2);
            
              const avgMonthChange = detectionAverages[detection].month_changes.reduce((a, b) => a + b, 0) / detectionAverages[detection].month_changes.length;
              detectionAverages[detection].avg_month_change = avgMonthChange.toFixed(2);
            
              const avgWeekChange = detectionAverages[detection].week_changes.reduce((a, b) => a + b, 0) / detectionAverages[detection].week_changes.length;
              detectionAverages[detection].avg_week_change = avgWeekChange.toFixed(2);
            });
            console.log('avg', averagedData);
            // Update averagedData with calculated values
            averagedData.forEach((item) => {
              item.day_change = detectionAverages[item.detection].average;
              item.year_count = detectionAverages[item.detection].avg_year_count;
              item.month_change = detectionAverages[item.detection].avg_month_change;
              item.week_change = detectionAverages[item.detection].avg_week_change;
            
              item.week_change = isNaN(parseFloat(item.week_change))
                ? "0.00"
                : item.week_change;
              item.month_change = isNaN(parseFloat(item.month_change))
                ? "0.00"
                : item.month_change;
              item.year_count = isNaN(parseFloat(item.year_count))
                ? "0.00"
                : item.year_count;
            });
            
            setData(averagedData);
            console.log(averagedData);
          } else {
            console.error(
              "Failed to fetch filterData for Dashboard Table:",
              response.status,
              response.statusText
            );
          }
        } catch (error) {
          console.error("FilterDashboardTableDataError", error.message);
        }
      };

      fetchData();

      const fetchDataTotal = async () => {
        try {
          const response = await fetch(
            `${config.apiBaseUrl}/CamData/filterTotalData`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                selectedDateTimeFrom: formattedDateFrom,
                selectedDateTimeTo: formattedDateTo,
              }),
            }
          );
          if (response.ok) {
            const data = await response.json();

            const formattedData = data.rows.map((item) => ({
              detection: item.detection.replace(/^ET_/, ""),
              total_count: parseInt(item.sum),
            }));

            setTotalData(formattedData);
            console.log("Filtered data received for Pie Chart:", formattedData);
          } else {
            console.error(
              "Failed to fetch filtered data for Pie Chart:",
              response.status,
              response.statusText
            );
          }
        } catch (error) {
          console.error(
            "Fetching filtered data for Pie Chart error:",
            error.message
          );
        }
      };

      fetchDataTotal();
    }
  }, [filteredData, formattedDateTo, formattedDateFrom, option]);

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
      id: "detection",
      numeric: true,
      disablePadding: false,
      label: "Analytics Type",
    },
    {
      id: "total_count",
      numeric: true,
      disablePadding: false,
      label: "Total Count",
    },
    {
      id: "avg_hourly_percentage_change",
      numeric: true,
      disablePadding: false,
      label: "Change",
    },
  ];

  const aggregatedData = data.reduce((acc, curr, index) => {
    const existingDetectionIndex = acc.findIndex(
      (item) => item.detection === curr.detection
    );
    if (existingDetectionIndex !== -1) {
      acc[existingDetectionIndex].total_count += curr.total_count;
      if (index !== 0) {
        const prevCount = data[index - 1].total_count;
        const percentageChange =
          ((curr.total_count - prevCount) / prevCount) * 100;
        acc[existingDetectionIndex].percentage_change =
          percentageChange.toFixed(2);
      }
    } else {
      const percentageChange = index !== 0 ? "N/A" : 0;
      acc.push({ ...curr, percentage_change: percentageChange });
    }
    return acc;
  }, []);

  function EnhancedTableHead(props) {
    const { order, orderBy, onRequestSort } = props;
    const createSortHandler = (property) => (event) => {
      onRequestSort(event, property);
    };

    return (
      <thead style={{ position: "sticky", top: 0 }}>
        <tr>
          {headCells.map((headCell) => (
            <th key={headCell.id}>
              <Link underline="none" onClick={createSortHandler(headCell.id)}>
                {headCell.label}
                {orderBy === headCell.id && (
                  <>
                    {order === "asc" ? (
                      <ArrowDropDownIcon sx={{ fontSize: "small" }} />
                    ) : (
                      <ArrowDropUpIcon sx={{ fontSize: "small" }} />
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
          ))}
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
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("detection");

    const handleRequestSort = (event, property) => {
      const isAsc = orderBy === property && order === "asc";
      setOrder(isAsc ? "desc" : "asc");
      setOrderBy(property);
    };
    const numberFormatOptions = {
      compactDisplay: "short",
      style: "decimal",
      maximumFractionDigits: 2,
    };
    console.log(aggregatedData);
    return (
      <Box>
        <Table aria-labelledby="tableTitle" className="table">
          <EnhancedTableHead
            onRequestSort={handleRequestSort}
            order={order}
            orderBy={orderBy}
          />
          <tbody>
            {stableSort(aggregatedData, getComparator(order, orderBy)).map(
              (row, index) => (
                <tr key={index}>
                  <td>{row.detection.replace(/^ET_/, "")}</td>
                  <td>
                    {totalData
                      .find(
                        (item) =>
                          item.detection === row.detection.replace(/^ET_/, "")
                      )
                      ?.total_count.toLocaleString(
                        "en-IN",
                        numberFormatOptions
                      ) || 0}
                  </td>
                  <td>
                  <div style={{ display: "flex", alignItems: "center" }}>
                  <span
                    style={{
                      color:
                        selectedOption === "Day"
                          ? parseFloat(row.day_change) === 0.0
                            ? "grey"
                            : parseInt(row.day_change) < 0
                            ? "red"
                            : "green"
                          : selectedOption === "Hour"
                          ? parseFloat(row.avg_hourly_percentage_change) === 0.0
                            ? "grey"
                            : parseFloat(row.avg_hourly_percentage_change) < 0
                            ? "red"
                            : "green"
                          : selectedOption === "Week"
                          ? parseFloat(row.week_change) === 0.0
                            ? "grey"
                            : parseFloat(row.week_change) < 0
                            ? "red"
                            : "green"
                          : selectedOption === "Month"
                          ? parseFloat(row.month_change) === 0.0
                            ? "grey"
                            : parseFloat(row.month_change) < 0
                            ? "red"
                            : "green"
                          : parseFloat(row.year_change) === 0.0
                          ? "grey"
                          : parseFloat(row.year_change) < 0
                          ? "red"
                          : "green",
                    }}
                  >
                    {selectedOption === "Day"
                      ? `${row.day_change}%`
                      : selectedOption === "Hour"
                      ? `${row.avg_hourly_percentage_change}%`
                      : selectedOption === "Week"
                      ? `${row.week_change}%`
                      : selectedOption === "Month"
                      ? `${row.month_change}%`
                      : `${row.year_change}%`}
                      </span>
                    {selectedOption === "Day" &&
                    parseFloat(row.day_change) === 0 ? (
                      <HorizontalRuleIcon style={{ color: "grey" }} />
                    ) : selectedOption === "Hour" &&
                      parseFloat(row.avg_hourly_percentage_change) === 0 ? (
                        <HorizontalRuleIcon style={{ color: "grey" }} />
                    ) : selectedOption === "Week" &&
                      parseFloat(row.week_change) === 0 ? (
                        <HorizontalRuleIcon style={{ color: "grey" }} />
                    ) : selectedOption === "Month" &&
                      parseFloat(row.month_change) === 0 ? (
                        <HorizontalRuleIcon style={{ color: "grey" }} />
                    ) : selectedOption === "Year" &&
                      parseFloat(row.year_change) === 0 ? (
                        <HorizontalRuleIcon style={{ color: "grey" }} />
                    ) : selectedOption === "Day" &&
                      parseFloat(row.day_change) < 0 ? (
                      <ArrowDropDownIcon style={{ color: "red" }} />
                    ) : selectedOption === "Hour" &&
                      parseFloat(row.avg_hourly_percentage_change) < 0 ? (
                      <ArrowDropDownIcon style={{ color: "red" }} />
                    ) : selectedOption === "Week" &&
                      parseFloat(row.week_change) < 0 ? (
                      <ArrowDropDownIcon style={{ color: "red" }} />
                    ) : selectedOption === "Month" &&
                      parseFloat(row.month_change) < 0 ? (
                      <ArrowDropDownIcon style={{ color: "red" }} />
                    ) : selectedOption === "Year" &&
                      parseFloat(row.year_change) < 0 ? (
                      <ArrowDropDownIcon style={{ color: "red" }} />
                    ) : (
                      <ArrowDropUpIcon style={{ color: "green" }} />
                    )}
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </Table>
      </Box>
    );
  };

  return (
    <Box
      style={{
        backgroundColor: "white",
        borderRadius: 10 * mf,
        width: 570 * mf,
        height: 205 * mf,
        overflow: "auto",
        paddingLeft: paddingTableLeft || 0,
        paddingTop: 0,
      }}
    >
      <Sheet
        variant="outlined"
        sx={{
          width: `${555 * mf}px`,
          margin: "4px",
          marginTop: "1px",
          boxShadow: "sm",
          borderRadius: "sm",
        }}
      >
        <TableSortAndSelection />
      </Sheet>
    </Box>
  );
};

export default DashboardTable;
