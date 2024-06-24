import React, { useEffect, useState } from "react";
import { PieChart } from "@mui/x-charts";
import config from "../config";
import moment from "moment";

const palette = [
  "#1984c5",
  "#22a7f0",
  "#63bff0",
  "#a7d5ed",
  "#e2e2e2",
  "#e1a692",
  "#de6e56",
  "#e14b31",
  "#c23728",
];

const PieChartComponent = ({ filteredData, mf }) => {
  const [chartData, setChartData] = useState([]);
  if(!mf){
    mf =1;
  }
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


      console.log(formattedDateTo);
      const fetchData = async () => {
        try {
          const response = await fetch(
            `${config.apiBaseUrl}/CamData/filterPieChartData`,
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

            // Filter data based on selected analytics types and transform it
            const formattedData = data.rows
              .filter((item) =>
                filteredData.selectedAnalyticsTypes.includes(
                  item.detection.replace(/^ET_/, "")
                )
              )
              .map((item) => ({
                value: parseInt(item.sum), // Convert sum to integer
                label: item.detection.replace(/^ET_/, ""),
              }));

            setChartData(formattedData);
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

      fetchData();
    }
  }, [filteredData]);
console.log(chartData);
  return (
    <PieChart
      series={[
        {
          outerRadius:90*mf,
          innerRadius:30*mf,
          paddingAngle:1*mf,
          cornerRadius:4*mf,
          data: chartData,
          highlightScope: { faded: "global", highlighted: "item" },
          faded: { innerRadius: 30*mf, additionalRadius: -30*mf, color: "gray" },
        },
      ]}
      colors={palette}
      width={490*mf}
      height={200*mf}
      slotProps={{
        legend: {
          position: {
            vertical: "middle",
            horizontal: "right",
          },
          itemMarkWidth: 20*mf,
          itemMarkHeight: 5*mf,
          markGap: 5*mf,
          itemGap: 2*mf,
          padding: 10*mf,
          labelStyle: {
            fontSize: 12*mf,
          },
        },
      }}
    />

  );
};

export default PieChartComponent;
