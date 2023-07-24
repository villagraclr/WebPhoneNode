const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const asterisk = require('./asterisk');
const path = require('path');
const bodyParser = require('body-parser');

const port = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle incoming call events
  asterisk.on('newchannel', (event) => {
    // Emit an event to the connected socket when a new incoming call is received
    socket.emit('incomingCall', event);
  });
  // Handle make call event from the client
  socket.on('makeCall', (phoneNumber) => {
    asterisk.makeCall(phoneNumber)
      .then((response) => {
        console.log('Call initiated:', response);
        socket.emit('callStatus', 'Call initiated');
      })
      .catch((error) => {
        console.error('Failed to initiate call:', error);
        socket.emit('callStatus', 'Call initiation failed');
      });
  });

  // Handle answer call event from the client
  socket.on('answerCall', () => {
    asterisk.answerCall()
      .then((response) => {
        console.log('Call answered:', response);
        socket.emit('callStatus', 'Call answered');
      })
      .catch((error) => {
        console.error('Failed to answer call:', error);
        socket.emit('callStatus', 'Failed to answer call');
      });
  });

  // Handle hangup call event from the client
  socket.on('hangupCall', () => {
    asterisk.hangupCall()
      .then((response) => {
        console.log('Call hung up:', response);
        socket.emit('callStatus', 'Call hung up');
      })
      .catch((error) => {
        console.error('Failed to hang up call:', error);
        socket.emit('callStatus', 'Failed to hang up call');
      });
  });

  // Handle toggle mute event from the client
  socket.on('toggleMute', () => {
    asterisk.toggleMute()
      .then((response) => {
        console.log('Call mute status toggled:', response);
        socket.emit('callStatus', 'Call mute status toggled');
      })
      .catch((error) => {
        console.error('Failed to toggle call mute status:', error);
        socket.emit('callStatus', 'Failed to toggle call mute status');
      });
  });

  // Handle hold/unhold event from the client
  socket.on('toggleHold', () => {
    asterisk.toggleHold()
      .then((response) => {
        console.log('Call hold status toggled:', response);
        socket.emit('callStatus', 'Call hold status toggled');
      })
      .catch((error) => {
        console.error('Failed to toggle call hold status:', error);
        socket.emit('callStatus', 'Failed to toggle call hold status');
      });
  });

  // Handle other events from the client and dispatch corresponding actions
  // ...

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});
//*/
// Start the server
http.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
