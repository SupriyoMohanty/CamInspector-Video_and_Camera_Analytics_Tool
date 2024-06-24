const getCam = "SELECT * FROM cameradetails_schema.camera WHERE enable_disable = 'enable'";
const getCamDetails = "SELECT * FROM cameradetails_schema.camera";
const getCamDetailsByName = "SELECT * FROM cameradetails_schema.camera WHERE camera_name = $1";
const addCam = "INSERT INTO cameradetails_schema.camera (camera_id, camera_name, rtsp, location, location_coordinates, enable_disable) VALUES ($1, $2, $3, $4, $5, $6)";
const removeCam = "DELETE FROM cameradetails_schema.camera WHERE camera_name = $1";
const updateCam = "UPDATE cameradetails_schema.camera SET camera_name = $1, location = $2, location_coordinates = $3 WHERE id = $4";
const getCamDetailsById = "SELECT * FROM cameradetails_schema.camera WHERE id = $1";
const saveCoordinatesInDB = "UPDATE cameradetails_schema.camera SET coordinates = $1::jsonb WHERE id = $2";
const updateEnableDisable = "UPDATE cameradetails_schema.camera SET enable_disable = $1 WHERE camera_name = $2"

const getUsers = "SELECT * FROM  cameradetails_schema.usersData" //this is used to fetch usersdata to read user image
const getUsersData = "SELECT * FROM  cameradetails_schema.usersData WHERE username = $1";
const addUsersData = "INSERT INTO  cameradetails_schema.usersData (username, user_password) VALUES ($1, $2)";
const UpdateUsersData = "UPDATE  cameradetails_schema.usersData SET username = $1, user_password = $2 WHERE user_id = $3";
const UsersDataByID = "SELECT * FROM cameradetails_schema.usersData WHERE user_id = $1";


//DASHBOARD QUERIES
const getcam_dashboard = "select * from cam_schema.hierarchy_entity_details";
const getDashboard_data = "select * from cam_schema.detections";
//const filterDashboardTableData =  "SELECT * FROM cam_schema.detections WHERE date_time >= $1 AND date_time <= $2";
const filterPieChart = "SELECT detection, SUM(count) FROM cam_schema.detections WHERE date_time >= $1 AND date_time <= $2 GROUP BY detection";
const filterTotalData = "SELECT detection, SUM(count) FROM cam_schema.detections WHERE date_time >= $1 AND date_time <= $2 GROUP BY detection";
const filterBarChart = "SELECT date_trunc('hour', date_time) AS hour_start, detection, SUM(count) AS total_count FROM cam_schema.detections WHERE date_time >= $1 AND date_time <= $2 GROUP BY date_trunc('hour', date_time), detection ORDER BY hour_start,detection";
const filterDashboardTableData =  "WITH HourlyCounts AS (SELECT detection, DATE_TRUNC('hour', date_time) AS hour_start, SUM(count) AS total_count FROM cam_schema.detections WHERE date_time >= $1 AND date_time <= $2  GROUP BY detection, DATE_TRUNC('hour', date_time)), HourlyPercentageChange AS (SELECT current_data.detection, current_data.hour_start AS current_hour_start, current_data.total_count AS current_count, previous_data.hour_start AS previous_hour_start, previous_data.total_count AS previous_count, CASE WHEN previous_data.total_count <> 0 THEN ((current_data.total_count - previous_data.total_count) * 100.0) / previous_data.total_count ELSE 0 END AS hourly_percentage_change FROM HourlyCounts AS current_data LEFT JOIN HourlyCounts AS previous_data ON current_data.detection = previous_data.detection AND current_data.hour_start = previous_data.hour_start + INTERVAL '1 hour') SELECT detection, current_hour_start, current_count, previous_hour_start, previous_count, hourly_percentage_change FROM HourlyPercentageChange ORDER BY detection, current_hour_start";



module.exports = {
    getCam,
    getCamDetails,
    getCamDetailsByName,
    addCam,
    removeCam,
    updateCam,
    getCamDetailsById,
    getUsers,
    getUsersData,
    addUsersData,
    UpdateUsersData,
    saveCoordinatesInDB,
    UsersDataByID,
    updateEnableDisable,
    getcam_dashboard,
    getDashboard_data,
    filterDashboardTableData,
    filterPieChart,
    filterBarChart,
    filterTotalData
}








