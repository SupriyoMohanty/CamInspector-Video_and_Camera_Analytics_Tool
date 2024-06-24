import React, { useEffect, useState } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import { axisClasses } from "@mui/x-charts";
import config from "../config"; // Assuming your data is in config.js
import moment from "moment";
const palette = [
  "#3d9c73",
  "#ef8250",
  "#df8879",
  "#c86558",
  "#b04238",
  "#991f17",
];

const chartSetting = {
  yAxis: [{}],
  width: 800,
  height: 400,
  sx: {
    [`.${axisClasses.left} .${axisClasses.label}`]: {
      transform: "translate(-20px, 0)",
    },
  },
};

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
};

const LineDataset = ({ filteredData, mf }) => {
  if(!mf){
    mf=1;
  }
  const [chartData, setChartData] = useState([]);
  console.log(filteredData);
  useEffect(() => {
    if (
      filteredData &&
      filteredData.selectedDateTimeFrom &&
      filteredData.selectedDateTimeTo
    ) {
      const dateFrom = new Date(filteredData.selectedDateTimeFrom);
      const formattedDateFrom1 = moment(
        dateFrom,
        "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ (z)"
      );
      const formattedDateFrom = formattedDateFrom1.format(
        "YYYY-MM-DDTHH:mm:ss"
      );
      const dateTo = new Date(filteredData.selectedDateTimeTo);
      const formattedDateTo1 = moment(
        dateTo,
        "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ (z)"
      );
      const formattedDateTo = formattedDateTo1.format("YYYY-MM-DDTHH:mm:ss");

      const fetchData = async () => {
        try {
          const response = await fetch(
            `${config.apiBaseUrl}/CamData/filterBarChartData`,
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
            console.log("BarData:", data);

            // Initialize an object to hold grouped data
            const groupedData = {};

            // Group data by time
            data.rows.forEach((item) => {
              const time = formatTime(item.hour_start);
              if (!groupedData[time]) {
                groupedData[time] = {};
              }

              // Group data by detection within each time
              const detection = item.detection;
              if (
                filteredData.selectedAnalyticsTypes.includes(
                  detection.replace(/^ET_/, "")
                )
              ) {
                if (!groupedData[time][detection]) {
                  groupedData[time][detection] = Number(item.total_count);
                } else {
                  groupedData[time][detection] += Number(item.total_count);
                }
              }
            });

            // Convert the grouped data into the format required for the bar chart
            const formattedData = Object.entries(groupedData).map(
              ([time, detections]) => ({
                time,
                ...detections,
              })
            );

            setChartData(formattedData);
            console.log("Filtered data received for Bar Chart:", formattedData);
          } else {
            console.error(
              "Failed to fetch filtered data for Bar Chart:",
              response.status,
              response.statusText
            );
          }
        } catch (error) {
          console.error(
            "Fetching filtered data for Bar Chart error:",
            error.message
          );
        }
      };

      if (
        filteredData &&
        filteredData.selectedDateTimeFrom &&
        filteredData.selectedDateTimeTo
      ) {
        fetchData();
      }
    }
  }, [filteredData]);

  // Dynamically generate series based on available detections
  const series =
    chartData.length > 0
      ? Object.keys(chartData[0])
          .filter((key) => key !== "time")
          .map((detection) => ({
            dataKey: detection,
            label: detection.replace(/^ET_/, ""),
          }))
      : [];

  return (
    <LineChart
      dataset={chartData}
      xAxis={[{ scaleType: "band", dataKey: "time" }]}
      series={series}
      slotProps={{
        legend: {
          position: {
            vertical: "bottom",
            horizontal: "center",
          },
          itemMarkWidth: 20*mf,
          itemMarkHeight: 5*mf,
          markGap: 5*mf,
          itemGap: 4*mf,
          padding: 10*mf,
          labelStyle: {
            fontSize: 11*mf,
          },
        },
      }}
      {...chartSetting}
      width={580*mf}
      height={210*mf}
      margin={{ left: 55*mf, right: 30*mf, top: 10*mf, bottom: 50*mf }}
      grid={{ vertical: true, horizontal: true }}
      colors={palette}
    />
  );
};

export default LineDataset;
