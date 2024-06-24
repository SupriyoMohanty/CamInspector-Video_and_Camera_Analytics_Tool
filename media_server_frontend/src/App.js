import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AddCameraPage from './Pages/AddCameraPage.js';
import AddRoiPage from './Pages/AddRoiPage.js';
import LoginPage from './Pages/LoginPage.js';
import Details from './Pages/CameraDetails.js';
import MainWindow from './Pages/MainWindow.js';
import MapView from './Pages/MapView.js';
import Dashboard from './Pages/Dashboard.js';
import Onvif_Camera from './Pages/Onvif_Camera.js';
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<LoginPage/>} />
        <Route exact path="/home" element={<MainWindow />} />
        <Route exact path="/add" element={<AddCameraPage />} />
        <Route exact path='/addRoi' element={<AddRoiPage />} />
        <Route exact path='/cameraDetails' element={<Details />} />
        <Route exact path='/mapView' element={<MapView />} />
        <Route exact path='/dashboard' element={<Dashboard />} />
        <Route exact path='/onVif' element={<Onvif_Camera />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;
