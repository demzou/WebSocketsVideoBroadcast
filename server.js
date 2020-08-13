//We start with a simple Socket.io server skeleton

const express = require("express");
const app = express();

const PORT = process.env.PORT || 4000;

const http = require("http");
const server = http.createServer(app);

const io = require("socket.io")(server);

app.use(express.static(__dirname + "/public"));
//app.use(express.static('public'));
app.get('/', function (req, res) {
   res.sendFile( __dirname + "/public/" + "index.html" );
})
app.get('/broadcast', function (req, res) {
    res.sendFile( __dirname + "/public/" + "broadcast.html" );
 })


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


