import React, { useEffect, useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { axisClasses } from "@mui/x-charts";
import config from "../config";
import moment from "moment";
const palette = [
  "#00876c",
  "#5ea57c",
  "#97c391",
  "#f3d598",
  "#e37755",
  "#d43d51",
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

const BarsDataset = ({ filteredData, mf }) => {
  if(!mf){
    mf=1
  }
  const [chartData, setChartData] = useState([]);

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

            // Initialized an object to hold grouped data
            const groupedData = {};

            // Grouped data by time
            data.rows.forEach((item) => {
              const time = formatTime(item.hour_start);

               // checks if groupedData already has an entry for the current time. If not, it initializes an empty object for that time.
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
                  //If groupedData[time] does not already have an entry for the current detection, it initializes it with the total_count from the current item.
                  groupedData[time][detection] = Number(item.total_count);
                } else {
                  //If it already has an entry, it increments the existing count by the total_count from the current item
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

      fetchData();
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
    <BarChart
      dataset={chartData}
      xAxis={[{ scaleType: "band", dataKey: "time" }]}
      series={series}
      slotProps={{
        legend: {
          position: {
            vertical: "bottom",
            horizontal: "centerf",
          },
          itemMarkWidth: 20*mf,
          itemMarkHeight: 5*mf,
          markGap: 5*mf,
          itemGap: 2*mf,
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

export default BarsDataset;
