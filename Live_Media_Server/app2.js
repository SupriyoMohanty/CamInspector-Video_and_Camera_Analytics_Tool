const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const configFile = require('./configFile.js');
const { Discovery, Cam } = require('onvif/promises');
const socketIo = require('socket.io');
const rtsp = require('rtsp-ffmpeg');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',  // Allows all origins. Change this to specific domains as needed.
    methods: ["GET", "POST"]
  }
});

let camInstance;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(bodyParser.json());

// Endpoint for moving the camera
app.post('/newServer/move', async (req, res) => {
  const { x, y, zoom } = req.body;
  
  // Check if camera is connected
  if (!camInstance) {
    return res.status(500).send('Camera not connected');
  }

  // Validate parameters
  if (x < -1 || x > 1 || y < -1 || y > 1 || zoom < 0 || zoom > 1) {
    return res.status(400).send('Invalid move parameters');
  }
  
  try {
    // Perform absolute movement
    await camInstance.absoluteMove({ x, y, zoom });
    res.send('Camera moved');
  } catch (error) {
    console.error('Error moving camera:', error.message);
    res.status(500).send('Error moving camera: ' + error.message);
  }
});

// Function to connect to camera and start streaming
async function connectToCamera() {
  try {
    // Replace with your camera IP, username, and password
    const CAMERA_IP = '10.33.1.106';
    const USERNAME = 'admin';
    const PASSWORD = 'admin1234';

    // Discover and connect to the camera
    Discovery.on('device', async (cam) => {
      if (cam.hostname !== CAMERA_IP) {
        console.log(`Ignoring camera: ${cam.hostname}`);
        return;
      }

      cam.username = USERNAME;
      cam.password = PASSWORD;
      
      try {
        await cam.connect();
        camInstance = cam;

        // Get RTSP stream URI and setup RTSP streaming
        const { uri } = await cam.getStreamUri({ protocol: 'RTSP' });
        const input = uri.replace('rtsp://', `rtsp://${cam.username}:${cam.password}@`);
        const stream = new rtsp.FFMpeg({ input, resolution: '960x1080' });

        // WebSocket connection for streaming
        io.on('connection', (socket) => {
          const pipeStream = socket.emit.bind(socket, 'data');
          stream.on('data', pipeStream);
          socket.on('disconnect', () => {
            stream.removeListener('data', pipeStream);
            console.log('Client disconnected');
          });
        });

        console.log(`Connected to camera: ${cam.hostname}`);
      } catch (error) {
        console.error('Failed to connect to the camera:', error);
      }
    });

    Discovery.on('error', (err) => {
      console.error('Discovery error:', err);
    });

    console.log('Probing for cameras...');
    Discovery.probe();
  } catch (error) {
    console.error('Error during camera connection:', error);
  }
}

// Start the server and connect to the camera
async function startServer() {
  try {
    await connectToCamera();
    
    server.listen(configFile.serverport2, () => {
      console.log(`Server listening on port ${configFile.serverport2}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

// Start the server
startServer();
