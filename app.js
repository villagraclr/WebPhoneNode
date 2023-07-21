const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const AsteriskAmi = require('asterisk-ami');

require('dotenv').config();

// AMI configuration
const amiConfig = {
  username: process.env.CONFIG_ASTERISK_USER,
  password: process.env.CONFIG_ASTERISK_PASSWORD,
  host: process.env.CONFIG_ASTERISK_HOST,
  port: process.env.CONFIG_ASTERISK_PORT,
  reconnect: true,
};

const amiConnection = new AsteriskAmi(amiConfig);

// Event listener for successful AMI connection
amiConnection.on('connect', () => {
  console.log('Connected to Asterisk AMI');
});

// Event listener for AMI connection failure
amiConnection.on('error', (err) => {
  console.error('AMI connection error:', err);
});

// Connect to Asterisk
amiConnection.connect();

// Serve static files from the 'public' directory
app.use(express.static('public'));

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle the "makeCall" event from the client
  socket.on('makeCall', (phoneNumber) => {
    const originateAction = {
        Action: 'Originate',
        Channel: `PJSIP/${phoneNumber}`,
        Context: process.env.CONFIG_ASTERISK_CONTEXT,
        Exten: process.env.CONFIG_ASTERISK_EXTEN,
        Priority: 1,
        CallerID: process.env.CONFIG_ASTERISK_CALLER_ID
    };

    amiConnection.action(originateAction, (err, response) => {
      if (err) {
        console.error('Failed to initiate call:', err);
        socket.emit('callStatus', 'Call initiation failed');
      } else {
        console.log('Call initiated successfully:', response);
        socket.emit('callStatus', 'Call initiated');
      }
    });
  });

  // Handle the "answerCall" event from the client
  socket.on('answerCall', () => {
    // Implement answer call logic here using AMI actions
    // ...
    socket.emit('callStatus', 'Call answered');
  });

  // Handle the "hangupCall" event from the client
  socket.on('hangupCall', () => {
    // Implement hangup call logic here using AMI actions
    // ...
    socket.emit('callStatus', 'Call hung up');
  });

  // Handle the "toggleMute" event from the client
  socket.on('toggleMute', () => {
    // Implement mute/unmute logic here using AMI actions
    // ...
    socket.emit('callStatus', 'Call muted/unmuted');
  });

  // Handle other events from the client and dispatch corresponding actions
  // ...

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
const port = 3000;
http.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
