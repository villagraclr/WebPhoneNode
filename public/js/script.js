// Establish WebSocket connection with the server
const socket = io();

// DOM elements
const callStatusElement = document.getElementById('callStatus');
const makeCallButton = document.getElementById('makeCallButton');
const answerCallButton = document.getElementById('answerCallButton');
const hangupCallButton = document.getElementById('hangupCallButton');
const toggleMuteButton = document.getElementById('toggleMuteButton');
const toggleHoldButton = document.getElementById('toggleHoldButton');

// Event listeners for call actions
makeCallButton.addEventListener('click', () => {
  // Get the phone number to call from an input field or other source
  const phoneNumber = '7002'; // Replace with the actual phone number to call
  socket.emit('makeCall', phoneNumber);
});

answerCallButton.addEventListener('click', () => {
  socket.emit('answerCall');
});

hangupCallButton.addEventListener('click', () => {
  socket.emit('hangupCall');
});

toggleMuteButton.addEventListener('click', () => {
  socket.emit('toggleMute');
});

toggleHoldButton.addEventListener('click', () => {
  socket.emit('toggleHold');
});

// Listen for call status updates from the server
socket.on('callStatus', (status) => {
  // Update the UI to display the call status
  callStatusElement.innerText = status;
});

// Handle other events from the server and dispatch corresponding actions
// ...
// Handle incoming call event from the server
socket.on('incomingCall', (data) => {
  const { callerId, phoneNumber } = data;
  showIncomingCallModal(callerId, phoneNumber);
});

// Show the modal for incoming call notification
function showIncomingCallModal(callerId, phoneNumber) {
  const incomingCallModal = document.getElementById('incomingCallModal');
  const callerIdSpan = document.getElementById('callerIdSpan');
  const phoneNumberSpan = document.getElementById('phoneNumberSpan');
  const answerIncomingCallButton = document.getElementById('answerIncomingCallButton');
  const declineIncomingCallButton = document.getElementById('declineIncomingCallButton');

  callerIdSpan.innerText = callerId;
  phoneNumberSpan.innerText = phoneNumber;
  incomingCallModal.style.display = 'block';

  // Implement the logic to answer the call when the 'Answer' button is clicked
  answerIncomingCallButton.addEventListener('click', () => {
    socket.emit('answerCall');
    hideIncomingCallModal();
  });

  // Implement the logic to decline the call when the 'Decline' button is clicked
  declineIncomingCallButton.addEventListener('click', () => {
    hideIncomingCallModal();
  });
}

// Hide the incoming call modal
function hideIncomingCallModal() {
  const incomingCallModal = document.getElementById('incomingCallModal');
  incomingCallModal.style.display = 'none';
}

