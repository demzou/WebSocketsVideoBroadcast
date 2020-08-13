//First, we create our configuration objects for the peer connection and camera.

//We use the official google STUN server for our peer-to-peer connection and 
//configure our camera using the media constraints. You can also enable the 
//audio by uncommenting the audio line.


const peerConnections = {};
const config = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302"]
    }
  ]
};

//const socket = io.connect(window.location.origin);
const socket = io.connect("https://broadcast-poc1.herokuapp.com/");
const video = document.querySelector("video");

// Media contrains
const constraints = {
  video: { facingMode: "user" },
  // Uncomment to enable audio
  audio: true
};


//Before we create our peer-to-peer connection we first need to get the 
//video from the camera so we can add it to our connection.

navigator.mediaDevices
  .getUserMedia(constraints)
  .then(stream => {
    video.srcObject = stream;
    socket.emit("broadcaster");
  })
  .catch(error => console.error(error));


//Next, we will create an RTCPeerConnection

//We create a new RTCPeerConnection every time a new client joins and save it in our peerConnections object.
//Then we add the local stream to the connection using the addTrack() method and passing our stream and track data.
//The peerConnection.onicecandidate event is called when we receive an ICE candidate, and we send it to our server.
//After that, we send a connection offer to the client by calling peerConnection.createOffer() and 
//we call peerConnection.setLocalDescription() to configure the connection.

socket.on("watcher", id => {
    const peerConnection = new RTCPeerConnection(config);
    peerConnections[id] = peerConnection;
  
    let stream = video.srcObject;
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
      
    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        socket.emit("candidate", id, event.candidate);
      }
    };
  
    peerConnection
      .createOffer()
      .then(sdp => peerConnection.setLocalDescription(sdp))
      .then(() => {
        socket.emit("offer", id, peerConnection.localDescription);
      });
  });
  
  socket.on("answer", (id, description) => {
    peerConnections[id].setRemoteDescription(description);
  });
  
  socket.on("candidate", (id, candidate) => {
    peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
  });


//Closing the connection when a client disconnects is another vital part of the application
socket.on("disconnectPeer", id => {
    peerConnections[id].close();
    delete peerConnections[id];
  });

//Lastly, we will close the socket connection if the user closes the window.
window.onunload = window.onbeforeunload = () => {
    socket.close();
  };


