//We start with a simple Socket.io server skeleton

const express = require("express");
const app = express();

const http = require("http");

// const url = require('url');
// const path = require('path');
// const fs = require('fs');

const PORT = process.env.PORT || 4000;


// // Callback function to handle requests
// function handleRequest(req, res) {
//     // What did we request?
//     let pathname = req.url;
   
//     // If blank let's ask for index.html
//     if (pathname == "/") {
//       pathname = "/index.html";
//     }

//     if (pathname == "/broadcast") {
//         pathname = "/index.html";
//       }
   
//     // Ok what's our file extension
//     const ext = path.extname(pathname);
   
//     // Map extension to file type
//     const typeExt = {
//       ".html": "text/html",
//       ".js": "text/javascript",
//       ".css": "text/css"
//     };
   
//     // What is it?  Default to plain text
//     const contentType = typeExt[ext] || "text/plain";
   
//     // Read the file from disk
//     fs.readFile(__dirname + pathname,
//       // Callback function for reading
//       function(err, data) {
//         // if there is an error return error report
//         if (err) {
//           res.writeHead(500);
//           return res.end("Error loading " + pathname);
//         }
        
//         // Otherwise, send the data, the contents of the file
//         res.writeHead(200, { "Content-Type": contentType });
//         res.end(data);
//       }
//     );
//   }

const server = http.createServer(app);

app.use(express.static(__dirname + "/Public"));
//app.use(express.static('public'));
app.get('/', function (req, res) {
   //res.sendFile( __dirname + "/Public/" + "index.html" );
   res.sendFile( __dirname + "/" + "index.html" );
   //res.sendFile("/public/" + "index.html" );
})
app.get('/broadcast', function (req, res) {
    //res.sendFile( __dirname + "/Public/" + "broadcast.html" );
    res.sendFile( __dirname + "/" + "broadcast.html" );
    //res.sendFile("/public/" + "broadcast.html" );
 })

 //Socket.io
const io = require("socket.io")(server);

io.sockets.on("error", e => console.log(e));
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));


//Then we need to implement the connection for the clients and broadcaster to the server. 
//The socket id of the broadcaster is saved into a variable so that we later know where 
//the clients need to connect to.

let broadcaster;

io.sockets.on("connection", socket => {
  socket.on("broadcaster", () => {
    broadcaster = socket.id;
    socket.broadcast.emit("broadcaster");
  });
  socket.on("watcher", () => {
    socket.to(broadcaster).emit("watcher", socket.id);
  });
  socket.on("disconnect", () => {
    socket.to(broadcaster).emit("disconnectPeer", socket.id);
  });
  
  //After that, we will implement the socket.io events to initialize a WebRTC connection. 
  //These events will be used by the watchers and broadcaster to instantiate a peer-to-peer connection.
  
  socket.on("offer", (id, message) => {
  socket.to(id).emit("offer", socket.id, message);
  });
  socket.on("answer", (id, message) => {
  socket.to(id).emit("answer", socket.id, message);
  });
  socket.on("candidate", (id, message) => {
  socket.to(id).emit("candidate", socket.id, message);
  });

});


