const dbHandler = require("../db/dbHandler.js");
const dbHandler_dashboard = require("../db/dbHandler.js")
const queries = require("../utils/queries.js");
const config = require("../configFile.js");
const fs = require("fs");
const path = require("path");
const configFile = require("../configFile.js");
const auth = require("../models/authentication.js")
const bcrypt = require("bcrypt");
const onvif = require('node-onvif');
const { getCamInstance } = require('../app2.js');

const generateAccess = async (userId, username) => {
  try {
    const accessToken = auth.generateAccessToken(userId, username);
    return { accessToken};
  } catch (error) {
    console.log(
      "Something went wrong whle generating access token"
    );
  }
};

let ans = "" //made so that username from login can be send to userimage body
const login = async (req, res) => {
  try {
    const { username, user_password } = req.body; //data got from frontend
    ans = username
    console.log("username:", username, "user_password:", user_password);

    //check from usersData table if username and user_password match
    const results = await dbHandler.fetchDataParameterized(
      queries.getUsersData,
      [username]
    );
    console.log(results);
    const user = results.rows[0];

    if (!user || !(await bcrypt.compare(user_password, user.user_password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    //console.log("UserID:", user.user_id);

    const { accessToken } = await generateAccess(
      user.user_id,
      username
    );

    const options = {
      httpOnly: true, 
      //httpOnly flag prevents the cookie from being accessed by JavaScript. This can help to protect the cookie from being stolen by malicious scripts.
      secure: true,
      //The secure flag tells the browser to only send the cookie over HTTPS connections. This can help to prevent the cookie from being intercepted by attackers.
      expires: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours in milliseconds
    };

    // Set cookies and send the final response
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .json({
        status: 200,
        data: {
          user: {
            user_id: user.user_id,
            username: username,
          },
          accessToken,
        },
        message: "User logged In Successfully",
      });
  } catch (error) {
    console.error("Error executing login query:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const logout = async (req, res) => {
  try {
    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .clearCookie("accessToken", options)
      .json({ status: 200, message: "User logged Out" });
  } catch (error) {
    console.error("Error executing logout query:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const register = async (req, res) => {
  try {
    const { username, user_password } = req.body;
    const hashedPassword = await auth.hashPassword(user_password);

    await dbHandler.fetchDataParameterized(queries.addUsersData, [
      username,
      hashedPassword,
    ]);

    console.log("New user created successfully");
    res.status(200).json({ message: "New user created successfully" });
  } catch (error) {
    console.error("Error creating a new user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateUsersData = async(req,res)=>{
  try {
    const { user_id ,username, user_password, image_url_update } = req.body;
    update_user_id = parseInt(user_id);

    // console.log('updateUsersDataID:', update_user_id);

    // Fetch Users data from the database
    const existingUserResult = await dbHandler.fetchDataParameterized(
      queries.UsersDataByID,
      [user_id]
    );

    // Get existing image file path based on fetched data
    const existingImagePath = path.join(configFile.UserImageFolder,`${existingUserResult.rows[0].username}.jpg`);
    const newFilePath = path.join(configFile.UserImageFolder,`${username}.jpg`);
    
    // console.log("ExistingUserImagePath:", existingImagePath);
    // console.log("UserImage Path:", newFilePath);

    const hashedPassword = await auth.hashPassword(user_password);

    await dbHandler.fetchDataParameterized(
      queries.UpdateUsersData,
      [
        username,
        hashedPassword,
        update_user_id,
      ],
    )

    if (!fs.existsSync(configFile.UserImageFolder)) {
      // If it doesn't exist, create the directory
      fs.mkdirSync(configFile.UserImageFolder);
    }

    if (!image_url_update && !fs.existsSync(existingImagePath)) {
      const errorMessage = 'User is updated but there is no image of user';
      console.log(errorMessage);
      res.status(400).json({ error: errorMessage, addImage: true });
      return;
    }

    if (image_url_update) {
      const base64Data = image_url_update.replace(/^data:image\/\jpeg+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const imageNameUpdate = newFilePath;

      // Remove the existing image file if it exists
      if (fs.existsSync(existingImagePath)) {
        fs.unlinkSync(existingImagePath);
      }

      // Write the contents of the buffer object to the file specified by the imageNameUpdate variable
      fs.writeFileSync(imageNameUpdate, buffer);
    } else {
      // Rename the existing image file if it exists

      if (existingImagePath) {
        fs.rename(existingImagePath ,newFilePath, function (err) {
          if (err) throw err;
          console.log('The file has been renamed!');
        });
      }
    }

    res.status(200).json({ message: "User Updated Successfully!" });

  } catch (error) {
    console.error("Error updating a User:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }

}

const UserProfileAuthenticate = async(req,res)=>{
  try {
    
    const { username, user_password } = req.body;

    // Validate if username and user_password are provided
    if (!username || !user_password) {
      return res.status(400).json({ message: 'username and user_password not provided' });
    }

    // Retrieve user information from the database based on the username
    const result = await dbHandler.fetchDataParameterized(queries.getUsersData, [username]);
    const user = result.rows[0];
    const { user_id } = user;
    console.log(user_id);

    // Check if the user exists
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if the provided user_password matches the stored user_password
    const passwordMatch = await bcrypt.compare(user_password, user.user_password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.status(200).json({ message: 'Authentication valid for userProfle change', user_id }); //sent user_id so that when change the username and userpassword then can update the db using user_id
  } catch (error) {
    console.error('Error in UserProfileAuthenticate:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }

};

const UserImage = async (req, res) => {
  console.log('Helloa');
  try {
    const results = await dbHandler.fetchData(queries.getUsers);
    if (!fs.existsSync(configFile.UserImageFolder)) {
      // If it doesn't exist, create the directory
      fs.mkdirSync(configFile.UserImageFolder);
    }

    const UsersWithImages = await Promise.all(
      results.rows.map(async (user) => {
        const imagePath = path.join(configFile.UserImageFolder, `${ans}.jpg`);
        try {
          const image = fs.readFileSync(imagePath, 'base64'); //base64 encoding
          const username = user.username;
          console.log("Username:", username); // Add this line for debugging
          return { username, image }; // Include both username and image in the returned object
        } catch (error) {
          console.error(`Error reading image file ${imagePath}`, error);
          return { username: user.username, image: null }; // Return an object with username and null image in case of error
        }
      })
    );

    res.status(200).json(UsersWithImages);
  } catch (error) {
    console.error('Error in executing userImage', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getCamData = async (req, res) => {
  try {
    const results = await dbHandler.fetchData(queries.getCam);
    res.status(200).json(results.rows);
    
  } catch (error) {
    console.error("Error in executing getCamData", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getCamDetailsData = async (req, res) => {
  try {
    const results = await dbHandler.fetchData(queries.getCamDetails);
    res.status(200).json(results.rows);
    
  } catch (error) {
    console.error("Error in executing getCamData", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const AddCameraDetails = async (req, res) => {
  try {
    const { camera_id, camera_name, rtsp, location, location_coordinates } = req.body;
    const enable_disable = 'enable';
    const params = [camera_id, camera_name, rtsp, location, location_coordinates, enable_disable];

    await dbHandler.fetchDataParameterized(queries.addCam, params);

    res
      .status(201)
      .json({ message: "Camera added successfully in the database!" });
  } catch (error) {
    console.error("Error in adding a camera to the database", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const removeCameraDetails = async (req, res) => {
  try {
    const { camera_name } = req.body;

    // CHECKING CAMERA EXISTENCE
    const existingCameraResult = await dbHandler.fetchDataParameterized(
      queries.getCamDetailsByName,
      [camera_name]
    );

    // Check if camera exists
    if (existingCameraResult.rows.length === 0) {
      // Camera not found, send an error response
      return res.status(404).send("Camera not found in the database");
    }

    // DELETE Query
    await dbHandler.fetchDataParameterized(queries.removeCam, [camera_name]);
    res.status(200).send("Camera Removed Successfully!");
  } catch (error) {
    console.error("Error removing a camera:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateCamera = async (req, res) => {
  try {
    const { camera_name, location, location_coordinates, id, name } = req.body;

    const existingCameraResult = await dbHandler.fetchDataParameterized(
      queries.getCamDetailsByName,
      [name]
    );

    // console.log(existingCameraResult);

    // Check if camera exists
    if (existingCameraResult.rows.length === 0) {
      // Camera not found, send an error response
      return res.status(404).send("Camera not found in the database");
    }

    await dbHandler.fetchDataParameterized(queries.updateCam, [
      camera_name,
      location,
      location_coordinates,
      id,
    ]);
    res.status(200).json({ message: "Camera Updated Successfully!" });
  } catch (error) {
    console.error("Error updating a Camera:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateEnableCamData = async(req, res)=>{
  try{
  const { cameraName } = req.body;
  console.log('Enable:', cameraName);
  const status = 'enable'
    await dbHandler.fetchDataParameterized(queries.updateEnableDisable, [
      status,
      cameraName,
    ]);
    res.status(200).json({ message: "Camera enabled Successfully!" });
  } catch (error) {
    console.error("Error updating a camera:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateDisableCamData = async(req, res)=>{
  try{
  const { cameraName } = req.body;
  console.log('Disable:', cameraName);
  const status = 'disable'
    await dbHandler.fetchDataParameterized(queries.updateEnableDisable, [
      status,
      cameraName,
    ]);
    res.status(200).json({ message: "Camera disabled Successfully!" });
  } catch (error) {
    console.error("Error updating a camera:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getCamImage = async (req, res) => {
  const id = req.params.id;
  const existingCameraResult = await dbHandler.fetchDataParameterized(
    queries.getCamDetailsById,
    [id]
  );
  
  if (existingCameraResult.rows.length === 0) {
    return res.status(404).send("Camera not found in the database");
  }
  
  const imagePath = path.join(config.CamImagefolder, `C${existingCameraResult.rows[0].camera_id}.jpg`);

  try {
    const image = fs.readFileSync(imagePath);
    return res.send(image); // Send the image data as response
  } catch (error) {
    console.error(`Error reading image file ${imagePath}`, error);
    return res.status(500).send(`Error reading image file ${imagePath}: ${error.message}`);
  }
};

const saveCoordinates = async (req, res) => {
  const { Coordinates, Id } = req.body; // Changed from points to coordinates
  try {
    const existingCameraResult = await dbHandler.fetchDataParameterized(
      queries.getCamDetailsById,
      [Id]
    );
    
    if (existingCameraResult.rows.length === 0) {
      return res.status(404).send("Camera not found in the database");
    }

    console.log(Id, Coordinates);
    await dbHandler.fetchDataParameterized(queries.saveCoordinatesInDB, [
      Coordinates,
      Id,
    ]);

    res.status(200).send('Coordinates saved successfully');
  } catch (error) {
    console.error('Error saving coordinates:', error);
    res.status(500).send('Error saving coordinates');
  }
};

const saveImage = async(req,res)=>{

  const camID = req.body.camID
  const imageData = req.body.image;
  const base64Data = imageData.replace(/^data:image\/jpeg;base64,/, ''); // Remove header
  const imageBuffer = Buffer.from(base64Data, 'base64');

  if (!fs.existsSync(configFile.CamImagefolder)) {
    // If it doesn't exist, create the directory
    fs.mkdirSync(configFile.CamImagefolder);
  }

  const fileName = `C${camID}.jpg`;
  const filePath = path.join(config.CamImagefolder, fileName);

  // Write the image data to the file
  fs.writeFile(filePath, imageBuffer, (err) => {
    if (err) {
      console.error('Error saving image:', err);
      res.status(500).json({ message: 'Error saving image.' });
    } else {
      console.log('Image saved successfully.');
      res.status(200).json({ message: 'Image saved successfully.', imagePath: filePath });
    }
  });
};

const getCamData_dashboard = async (req, res) => {
  try {
    const results = await dbHandler.fetchData(queries.getcam_dashboard);
    const data = results.rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      parent: row.master_id === 'NULL' ? null : row.master_id,
      child: [] // Assuming child data is available in the same format as parent data
    }));

    // Function to recursively build the hierarchy
    const buildHierarchy = (parent_id, data) => {
      return data.filter(item => item.parent === parent_id)
                 .map(item => ({ ...item, child: buildHierarchy(item.id, data) }));
    };

    // Function to organize data into desired format
    const organizeData = data => {
      const top_level_entities = data.filter(item => item.parent === null);
      return top_level_entities.map(entity => ({
        ...entity,
        child: buildHierarchy(entity.id, data)
      }));
    };

    const organizedData = organizeData(data);
    res.status(200).json(organizedData);
    
  } catch (error) {
    console.error("Error in executing getCamData", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getDashboard_data = async(req, res)=>{
  try {
    const results = await dbHandler.fetchData(queries.getDashboard_data);
    res.status(200).json(results.rows);
    
  } catch (error) {
    console.error("Error in executing getCamData", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const filterDashboardTableData = async (req, res) => {
  try {
    const { selectedDateTimeFrom, selectedDateTimeTo } = req.body;
    
    // Format Date objects to 'YYYY-MM-DD HH:MM:SS' format
    const formattedFromDate = selectedDateTimeFrom
    const formattedToDate = selectedDateTimeTo
    
    // Assuming you have a function fetchDataWithFilters to handle fetching data with filters
    const filteredData = await dbHandler.fetchDataParameterized(queries.filterDashboardTableData, [
      formattedFromDate, formattedToDate,
    ]);

    res.status(200).json(filteredData);
  } catch (error) {
    console.error('Error filtering dashboard pie chart data:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const filterPieChartData = async (req, res) => {
  try {
    const { selectedDateTimeFrom, selectedDateTimeTo } = req.body;
    
    
    // Format Date objects to 'YYYY-MM-DD HH:MM:SS' format
    const formattedFromDate = selectedDateTimeFrom
    const formattedToDate = selectedDateTimeTo
    
    
    // Assuming you have a function fetchDataWithFilters to handle fetching data with filters
    const filteredData = await dbHandler.fetchDataParameterized(queries.filterPieChart, [
      formattedFromDate, formattedToDate,
    ]);

    res.status(200).json(filteredData);
  } catch (error) {
    console.error('Error filtering pie chart data:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


const filterTotalData = async (req, res) => {
  try {
    const { selectedDateTimeFrom, selectedDateTimeTo } = req.body;
    
    
    // Format Date objects to 'YYYY-MM-DD HH:MM:SS' format
    const formattedFromDate = selectedDateTimeFrom
    const formattedToDate = selectedDateTimeTo
    
    
    // Assuming you have a function fetchDataWithFilters to handle fetching data with filters
    const filteredData = await dbHandler.fetchDataParameterized(queries.filterTotalData, [
      formattedFromDate, formattedToDate,
    ]);
    res.status(200).json(filteredData);
    //console.log(res);
  } catch (error) {
    console.error('Error filtering dashboard table data:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const filterBarChartData = async (req, res) => {
  try {
    const { selectedDateTimeFrom, selectedDateTimeTo } = req.body;

   
    // Format Date objects to 'YYYY-MM-DD HH:MM:SS' format
    const formattedFromDate = selectedDateTimeFrom
    const formattedToDate = selectedDateTimeTo
    
    console.log(formattedFromDate);
    console.log(formattedToDate);
    
    // Assuming you have a function fetchDataWithFilters to handle fetching data with filters
    const filteredData = await dbHandler.fetchDataParameterized(queries.filterBarChart, [
      formattedFromDate, formattedToDate
    ]);

    res.status(200).json(filteredData);
  } catch (error) {
    console.error('Error filtering dashboard bar chart data:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// const move = async (req, res) => {
//   const { x, y, zoom } = req.body;
//   const camInstance = getCamInstance;
//   console.log(camInstance);
//   // Check if camera is connected
//   if (!camInstance) {
//     return res.status(500).send('Camera not connected');
//   }

//   // Validate parameters
//   if (x < -1 || x > 1 || y < -1 || y > 1 || zoom < 0 || zoom > 1) {
//     return res.status(400).send('Invalid move parameters');
//   }
  
//   try {
//     // Perform absolute movement
//     await camInstance.absoluteMove({ x, y, zoom });
//     res.send('Camera moved');
//   } catch (error) {
//     console.error('Error moving camera:', error.message);
//     res.status(500).send('Error moving camera: ' + error.message);
//   }
// };



module.exports = {
  getCamData,
  AddCameraDetails,
  removeCameraDetails,
  updateCamera,
  getCamImage,
  saveCoordinates,
  saveImage,
  login,
  logout,
  register,
  updateUsersData,
  UserProfileAuthenticate,
  UserImage,
  updateEnableCamData,
  updateDisableCamData,
  getCamDetailsData,
  getCamData_dashboard,
  getDashboard_data,
  filterDashboardTableData,
  filterPieChartData,
  filterBarChartData,
  filterTotalData,
  // move
};
