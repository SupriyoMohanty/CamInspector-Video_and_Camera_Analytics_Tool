const express = require('express');
const configFile = require('./configFile.js');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const router = require('./routes/routes.js');
const NodeMediaServer = require('node-media-server');

const Camdata = require(process.env.npm_config_media);  //here media value we send in command that we send json data of camera and specify the port and rtport
const app = express();

app.use(cors({
    origin: `http://localhost:${configFile.clientport}`, // Allow requests from this origin
    credentials: true, // Allow credentials (cookies, etc.)
}));
app.use(express.json({ limit: '1000mb' })); // Increase limit for JSON data
app.use(express.urlencoded({ limit: '1000mb', extended: true }));
app.use('/api/v1/CamData', router);
app.use(express.static("public")); // code is used to serve static files such as images, CSS files, and JavaScript files in an Express app

app.use(cookieParser()) //so that we can access cookie in program....like .cookie...like req.cookie, res.cookie

app.listen(configFile.serverport||6000, ()=>{
    console.log(`app listining on server port ${configFile.serverport}`);
})


const config = {
  logType: 3,  //used to specify type of logging
  rtmp: {
      port: process.env.npm_config_rtport,
      chunk_size: 60000, //size of data chunks in RTMP streaming
      gop_cache: true, //Group Of Pictures...caching done to inc. efficiency
      ping: 60, //intervals after which ping msg. send to user
      ping_timeout: 30 //timeout duration for ping response ...if client fails to respond in given timeout...server may consider connection lost
  },
  http: {
      port: process.env.npm_config_port,
      allow_origin: '*'
  },
  relay: {
      ffmpeg: '/opt/ffmpeg_4.4/bin/ffmpeg', //location where ffmpeg stored....multimedia framework for handling audio,video files 
      tasks: Camdata.data //fetches json data given in data array
  },

};

var nms = new NodeMediaServer(config)
nms.run();




// npm start --media=/home/supriyom/Desktop/Projects/Live_Camera_Streaming/Live_Media_Server/nodeMediaServer_C001.json --port=14053 --rtport=15053
// npm start --media=/home/supriyom/Desktop/Projects/Live_Camera_Streaming/Live_Media_Server/nodeMediaServer_C002.json --port=14002 --rtport=15002



//whenever we want to export any library....then we have to go in bashrc and write like..... export LD_LIBRARY_PATH=/opt/ffmpeg_4.4/lib:$LD_LIBRARY_PATH ...otherwise if not do this then have to  run this command first and then run the file in which want to use the library


//http://localhost:14002/admin/streams

// example rtsp
// rtsp://rtspstream:c80f98dbf3a2ae75aefe2ce661bb563f@zephyr.rtsp.stream/movie

