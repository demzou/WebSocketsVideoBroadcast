//The watcher has pretty much the same functionality. The only difference is 
//that he only opens only one peer connection to the current broadcaster and 
//that he gets the video instead of streaming it.

//We also need to create a configuration for our RTCPeerConnection.

let peerConnection;
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


//We can then create our RTCPeerConnection and get the video stream from the broadcaster.

//Here we create a new RTCPeerConnection using our configuration object as we did above. 
//The only difference is that we call the createAnswer() function to send back a connection 
//answer to the request of the broadcaster.
//After the connection is established we can continue by getting the video stream using the 
//ontrack event listener of the peerConnection object.

socket.on("offer", (id, description) => {
    peerConnection = new RTCPeerConnection(config);
    peerConnection
      .setRemoteDescription(description)
      .then(() => peerConnection.createAnswer())
      .then(sdp => peerConnection.setLocalDescription(sdp))
      .then(() => {
        socket.emit("answer", id, peerConnection.localDescription);
      });
    peerConnection.ontrack = event => {
      video.srcObject = event.streams[0];
    };
    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        socket.emit("candidate", id, event.candidate);
      }
    };
  });


//We also need to implement the other lifecycle functions for our peer-to-peer connection 
//that will help us open and close new connections.

socket.on("candidate", (id, candidate) => {
  peerConnection
    .addIceCandidate(new RTCIceCandidate(candidate))
    .catch(e => console.error(e));
});

socket.on("connect", () => {
  socket.emit("watcher");
});

socket.on("broadcaster", () => {
  socket.emit("watcher");
});

socket.on("disconnectPeer", () => {
  peerConnection.close();
});

window.onunload = window.onbeforeunload = () => {
  socket.close();
};