const { Router } = require('express');
const Controller = require('../controllers/controllers.js');
const verifyCookieAndJWT= require('../middlewares/auth.middleware.js');

const router = Router();

router.get('/imageById/:id', Controller.getCamImage); 
router.post('/enableCamera', Controller.updateEnableCamData);
router.post('/disableCamera', Controller.updateDisableCamData)
router.get('/',verifyCookieAndJWT, Controller.getCamData);
router.get('/camData_dashboard', Controller.getCamData_dashboard);
router.get('/cameraDetails',verifyCookieAndJWT, Controller.getCamDetailsData);
router.delete('/delete', Controller.removeCameraDetails);
router.put('/edit', Controller.updateCamera);
router.post('/user/login', Controller.login)
router.post('/user/logout',verifyCookieAndJWT, Controller.logout); 
router.post('/user/register', Controller.register);
router.get('/user/image', Controller.UserImage); 
router.put('/userProfile/:username', Controller.updateUsersData);
router.post('/userProfile/Authenticate',  Controller.UserProfileAuthenticate);
router.post('/addCam', Controller.AddCameraDetails);
router.post('/saveCoordinates', Controller.saveCoordinates);
router.post('/saveImage', Controller.saveImage);


router.post('/filterDashboardTableData', Controller.filterDashboardTableData);
router.get('/dashboardData', Controller.getDashboard_data);
router.post('/filterPieChartData', Controller.filterPieChartData);
router.post('/filterBarChartData', Controller.filterBarChartData);
router.post('/filterTotalData', Controller.filterTotalData);

// router.post('/move', Controller.move); // Endpoint for moving the camera




module.exports = router;
