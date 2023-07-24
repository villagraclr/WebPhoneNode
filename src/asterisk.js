require('dotenv').config();

const ami_port = process.env.AMI_PORT;
const ami_host = process.env.AMI_HOST;
const ami_username = process.env.AMI_USERNAME;
const ami_password = process.env.AMI_PASSWORD;

const ami_context = process.env.AMI_CONTEXT;
const ami_exten = process.env.AMI_EXTEN;
const ami_caller_id = process.env.AMI_CALLER_ID;

const amiConnection = require('asterisk-manager')(
  ami_port,
  ami_host,
  ami_username,
  ami_password, true);

amiConnection.keepConnected();

// Event listeners for successful AMI connection and errors
amiConnection.on('connect', () => {
  console.log('Connected to Asterisk AMI');
});

amiConnection.on('error', (err) => {
  console.error('AMI connection error:', err);
});

// Connect to Asterisk
//amiConnection.connect();

// Functions to interact with Asterisk using AMI

// Function to log in a PJSIP endpoint
function pjsipLogin(endpoint) {
  return new Promise((resolve, reject) => {
    const loginAction = {
      Action: 'PJSIPLogin',
      Endpoint: endpoint,
      Password: 'YOUR_ENDPOINT_PASSWORD', // Replace with the password for the PJSIP endpoint
    };

    amiConnection.send(loginAction, (response) => {
      if (response.response === 'Success') {
        resolve(response);
      } else {
        reject(response);
      }
    });
  });
}
// Functions to interact with Asterisk using AMI
function makeCall(phoneNumber) {
  return new Promise((resolve, reject) => {
    // Build the Originate action
    const originateAction = {
      Action: 'Originate',
      Channel: `PJSIP/${phoneNumber}`,// Replace 'provider' with your SIP trunk or channel name
      Context: ami_context,// Replace with the appropriate context on your Asterisk dial plan
      Exten: ami_exten,// Replace with the extension you want to call
      Priority: 1,
      CallerID: ami_caller_id,// Replace with the outgoing SIP number or caller ID
    };
    amiConnection.action(originateAction, (err, response) => {
      if (err) {
        reject(err);
      }
      resolve(response);
    });
  });
}

function answerCall() {
  return new Promise((resolve, reject) => {
    // Implement answer call logic using AMI actions
    // For example, you can use the 'Redirect' action to answer the call.
    // Replace 'ChannelID' with the channel ID of the incoming call.
    const answerAction = {
      Action: 'Redirect',
      Channel: 'ChannelID',
      Context: 'from-internal', // Replace with the appropriate context on your Asterisk dial plan
      Exten: 'DIAL_EXTEN', // Replace with the extension to transfer the call
      Priority: 1,
    };

    amiConnection.action(answerAction, (err, response) => {
      if (err) {
        reject(err);
      }
      resolve(response);
    });
  });
}

function hangupCall() {
  return new Promise((resolve, reject) => {
    // Implement hangup call logic using AMI actions
    // For example, you can use the 'Hangup' action.
    // Replace 'ChannelID' with the channel ID of the active call to hang up.
    const hangupAction = {
      Action: 'Hangup',
      Channel: 'ChannelID',
    };

    amiConnection.send(hangupAction, (response) => {
      if (response.response === 'Success') {
        resolve(response);
      } else {
        reject(response);
      }
    });
  });
}

function toggleMute() {
  return new Promise((resolve, reject) => {
    // Implement toggle mute logic using AMI actions
    // For example, you can use the 'MuteAudio' action to mute the call.
    // Replace 'ChannelID' with the channel ID of the active call to toggle mute.
    const muteAction = {
      Action: 'MuteAudio',
      Channel: 'ChannelID',
      Direction: 'both', // Options: 'in', 'out', 'both'
    };

    amiConnection.send(muteAction, (response) => {
      if (response.response === 'Success') {
        resolve(response);
      } else {
        reject(response);
      }
    });
  });
}

function toggleHold() {
  return new Promise((resolve, reject) => {
    // Implement toggle hold logic using AMI actions
    // For example, you can use the 'PauseMonitor' and 'UnpauseMonitor' actions to hold/unhold the call.
    // Replace 'ChannelID' with the channel ID of the active call to toggle hold.
    const holdAction = {
      Action: 'PauseMonitor',
      Channel: 'ChannelID',
      File: 'hold', // A unique identifier for the monitor file
      Pause: 'true', // 'true' to hold, 'false' to unhold
    };

    amiConnection.send(holdAction, (response) => {
      if (response.response === 'Success') {
        resolve(response);
      } else {
        reject(response);
      }
    });
  });
}

// Other functions to handle call-related actions
// ...
// Listen for 'peerstatus' event from Asterisk and emit it to the web client
amiConnection.on('peerstatus', (event) => {
  const { peername, peerstatus, calleridname, calleridnum } = event;
  if (peerstatus === 'Registered' && peername === 'your_sip_extension') {
    io.emit('incomingCall', { callerId: calleridname, phoneNumber: calleridnum });
  }
});

// Listen for 'PeerEntry' event from Asterisk and emit 'Registered' event to the web client
amiConnection.on('PeerEntry', (event) => {
  const { peerstatus, objectname, calleridname, calleridnum } = event;
  if (peerstatus === 'Registered' && objectname.startsWith('SIP/')) {
    const peername = objectname.substring(4); // Extract the peer name from 'SIP/peername'
    io.emit('Registered', { peername, callerId: calleridname, phoneNumber: calleridnum });
  }
});
// Export the functions to be used in app.js
module.exports = {
  makeCall,
  answerCall,
  hangupCall,
  toggleMute,
  toggleHold,
  // Other functions...
};
