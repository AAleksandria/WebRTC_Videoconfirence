'use strict';

var localStream;
var pc;
var flag = 0;
var startButton = document.querySelector('button#start');
var peerConnButton = document.querySelector('button#PC');
var offerButton = document.querySelector('button#offer');
var answerButton = document.querySelector('button#answer');
var hangUpButton = document.querySelector('button#hangUp');
var getButton = document.querySelector('button#get');

startButton.disabled = false;
getButton.disabled = false;
peerConnButton.disabled = true;
offerButton.disabled = true;
answerButton.disabled = true;
hangUpButton.disabled = true;

startButton.onclick = start;
peerConnButton.onclick = peerConnections;
getButton.onclick = getMess;
offerButton.onclick = doOffer;
answerButton.onclick = doAnswer;
hangUpButton.onclick = hangUp;

var localVideo = document.querySelector('div#local video#local');
var remoteVideo = document.querySelector('div#local video#remote');
var offer;
// var offerSdpTextarea = document.querySelector('div#offer textarea');
var answer;
// var answerSdpTextarea = document.querySelector('div#answer textarea');

var constraints = { audio : true, video : true };

// offerSdpTextarea.value = '';
// answerSdpTextarea.value = '';


function successCallback(stream){
  window.stream = stream;
  if(window.URL){
    localVideo.src = window.URL.createObjectURL(stream);
    trace('Received local stream');
  } else {
    localVideo.src = stream;
    trace('Received local stream');
  }
  localStream = stream;
  offerButton.disabled = false;
  peerConnButton.disabled = false;
  answerButton.disabled = false;
}

function errorCallback(error){
  console.log('navigator.getUserMedia error: ', error);
}


function start() {
  startButton.disabled = true;
  hangUpButton.disabled = true;

  navigator.getUserMedia =  navigator.getUserMedia ||
                            navigator.webkitGetUserMedia ||
                            navigator.mozGetUserMedia;

  if (localStream) {
    localVideo.src = '';
    localStream.getTracks().forEach(function(track) {
      track.stop();
    });
  }

  trace('Requested local stream');

  navigator.getUserMedia(constraints,successCallback,errorCallback);
}

function peerConnections(){
  startButton.disabled = true;
  peerConnButton.disabled = true;
  answerButton.disabled = false;
  offerButton.disabled = false;
  hangUpButton.disabled = false;

  trace("Starting Call");
  if (navigator.mozGetUserMedia) {
    if (localStream.getVideoTracks().length > 0) {
      trace('Using video device: ' + localStream.getVideoTracks()[0].label);
    }
    if (localStream.getAudioTracks().length > 0) {
      trace('Using audio device: ' + localStream.getAudioTracks()[0].label);
    }
  }

  if (navigator.webkitGetUserMedia) {
    RTCPeerConnection = webkitRTCPeerConnection;
    RTCIceCandidate = window.RTCIceCandidate;
    RTCSessionDescription = window.RTCSessionDescription;
  }
  else if(navigator.mozGetUserMedia){
    RTCPeerConnection = RTCPeerConnection;
    RTCSessionDescription = RTCSessionDescription;
    RTCIceCandidate = RTCIceCandidate;
  }
  // trace("RTCPeerConnection object: " + RTCPeerConnection);


  var servers = null; /*{"iceServers": [
  {urls:'stun:stun.schlund.de'},
  {urls:'stun:stun.l.google.com:19302'},
  {urls:'stun:stun1.l.google.com:19302'}
  ]};*/

  pc = new RTCPeerConnection(servers);
  trace("Created peer connection object pc" );
  pc.onicecandidate = onIceCandidate;
  pc.onaddstream = gotRemoteStream;

  pc.addStream(localStream);
  trace("Added localStream to pc" );

}

function doOffer() {
  trace("Sending offer to peer.");
  pc.createOffer(setLocalAndSendMessage, logError);
}

function doAnswer() {
  trace("Sending answer to peer.");
  pc.createAnswer(setLocalAndSendMessage, logError);
}

function setLocalAndSendMessage(sessionDescription) {
  pc.setLocalDescription(sessionDescription);
  sendMessage(sessionDescription);
  console.log(sessionDescription);
}

function onIceCandidate(event) {
  if (event.candidate) {
    pc.addIceCandidate(new RTCIceCandidate(event.candidate));
    trace('Local ICE candidate: \n' + event.candidate.candidate);
  }
    if (event.candidate) {
      sendMessage({type: 'candidate',
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate});
    } else {
      trace("End of candidates.");
    }
}

function gotRemoteStream(event){
  if (window.URL) {
  remoteVideo.src = window.URL.createObjectURL(event.stream);
  } else {
  remoteVideo.src = event.stream;
  }
  trace("Received remote stream" );
}

function sendMessage(message) {
  var xhr = new XMLHttpRequest();
  var msg = JSON.stringify(message);
  var id = 1;
  flag++;
  var body = 'id=' + encodeURIComponent(id) + '&msg=' + encodeURIComponent(msg)  + '&flag=' + encodeURIComponent(flag);
  trace('C№ '+ id + '->S: ' + msg);
  xhr.open('POST', 'server.php');
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function() {
    if (this.readyState != 4) return;
    trace('S->C: ' + this.responseText);
    //alert(this.responseText)
  }
  xhr.send(body);

}

function getMess(){
  var xhr = new XMLHttpRequest();
  var body = 'msg2=' + null;
  xhr.open('POST', 'server.php');
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function() {
    if (this.readyState != 4) return;
    // var msg = JSON.parse(this.responseText);
    trace('S->C: ' + this.responseText);
     
    signalingMessageCallback(this.responseText);
  }
  xhr.send(body);
}


function signalingMessageCallback(msg) {
    var message = JSON.parse(msg);
    if (message.type === 'offer') {
        trace('Got offer. Sending answer to peer.');
        pc.setRemoteDescription(new RTCSessionDescription(message), function(){}, logError);
        //doAnswer();

    } else if (message.type === 'answer') {
        trace('Got answer.');
        pc.setRemoteDescription(new RTCSessionDescription(message), function(){}, logError);

    } else if (message.type === 'candidate') {
        pc.addIceCandidate(new RTCIceCandidate({candidate: message.candidate}));

    }
}

function logError(err) {
    trace(err.toString(), err);
}

function hangUp() {
  remoteVideo.src = '';
  localVideo.src = '';
  trace('Ending call');
  localStream.getTracks().forEach(function(track) {
    track.stop();
  });
  startButton.disabled = false;
  //callButton.disabled = true;
  hangUpButton.disabled = true;
}

// function onSignalingError(error){
//   trace('Failed to create signaling message : ' + error.name);
// }

// function gotLocalDescription(description){
//   pc1.setLocalDescription(description);
//   trace("Offer from pc1: \n" + description.sdp);
//   sendMessage(description.sdp);
//   pc2.setRemoteDescription(description);
//   pc2.createAnswer(gotRemoteDescription, onSignalingError);
// }

// function gotRemoteDescription(description){
//   pc2.setLocalDescription(description);
//   trace("Answer from pc2: \n" + description.sdp);

//   pc1.setRemoteDescription(description);
// }




// function gotLocalIceCandidate(event){
//   if (event.candidate) {
//   pc2.addIceCandidate(new RTCIceCandidate(event.candidate));
//   trace("Local ICE candidate: \n" + event.candidate.candidate);
//   }
// }

// function gotRemoteIceCandidate(event){
//   if (event.candidate) {
//   pc1.addIceCandidate(new RTCIceCandidate(event.candidate));
//   trace("Remote ICE candidate: \n " + event.candidate.candidate);
//   }
// }
/*
function sendMessage(message){
  var xhr = new XMLHttpRequest();
  var body = 'message=' + encodeURIComponent(message);
  xhr.open('POST', 'server.php');
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function() {
    if (this.readyState != 4) return;
    alert( this.responseText );
  }
  xhr.send(body);
}
*/



/*

var getMediaButton = document.querySelector('button#getMedia');
var createPeerConnectionButton =
    document.querySelector('button#createPeerConnection');
var createOfferButton = document.querySelector('button#createOffer');
var setOfferButton = document.querySelector('button#setOffer');
var createAnswerButton = document.querySelector('button#createAnswer');
var setAnswerButton = document.querySelector('button#setAnswer');
var hangupButton = document.querySelector('button#hangup');
var dataChannelDataReceived;

getMediaButton.onclick = getMedia;
createPeerConnectionButton.onclick = createPeerConnection;
createOfferButton.onclick = createOffer;
setOfferButton.onclick = setOffer;
createAnswerButton.onclick = createAnswer;
setAnswerButton.onclick = setAnswer;
hangupButton.onclick = hangup;

var offer;
var offerSdpTextarea = document.querySelector('div#local textarea');
var answer;
var answerSdpTextarea = document.querySelector('div#remote textarea');

var audioSelect = document.querySelector('select#audioSrc');
var videoSelect = document.querySelector('select#videoSrc');

audioSelect.onchange = videoSelect.onchange = getMedia;

var localVideo = document.querySelector('div#local video');
var remoteVideo = document.querySelector('div#remote video');

var selectSourceDiv = document.querySelector('div#selectSource');

var localPeerConnection;
var remotePeerConnection;
var localStream;
var sendChannel;
var receiveChannel;
var dataChannelOptions = {
  ordered: true
};
var dataChannelCounter = 0;
var sendDataLoop;
var offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1
};

getSources();

function getSources() {
  if (typeof MediaStreamTrack === 'undefined') {
    alert(
      'This browser does not support MediaStreamTrack.\n\nTry Chrome Canary.');
  } else {
    navigator.mediaDevices.enumerateDevices().then(gotSources);
  }
}

function gotSources(sourceInfos) {
  selectSourceDiv.classList.remove('hidden');
  var audioCount = 0;
  var videoCount = 0;
  for (var i = 0; i < sourceInfos.length; i++) {
    var option = document.createElement('option');
    option.value = sourceInfos[i].deviceId;
    option.text = sourceInfos[i].label;
    if (sourceInfos[i].kind === 'audioinput') {
      audioCount++;
      if (option.text === '') {
        option.text = 'Audio ' + audioCount;
      }
      audioSelect.appendChild(option);
    } else if (sourceInfos[i].kind === 'videoinput') {
      videoCount++;
      if (option.text === '') {
        option.text = 'Video ' + videoCount;
      }
      videoSelect.appendChild(option);
    } else {
      console.log('unknown', JSON.stringify(sourceInfos[i]));
    }
  }
}

function getMedia() {
  getMediaButton.disabled = true;
  createPeerConnectionButton.disabled = false;

  if (localStream) {
    localVideo.src = null;
    localStream.getTracks().forEach(function(track) {
      track.stop();
    });
  }
  var audioSource = audioSelect.value;
  trace('Selected audio source: ' + audioSource);
  var videoSource = videoSelect.value;
  trace('Selected video source: ' + videoSource);

  var constraints = {
    audio: {
      optional: [{
        sourceId: audioSource
      }]
    },
    video: {
      optional: [{
        sourceId: videoSource
      }]
    }
  };
  trace('Requested local stream');
  navigator.mediaDevices.getUserMedia(constraints)
  .then(gotStream)
  .catch(function(e) {
    console.log('navigator.getUserMedia error: ', e);
  });
}

function gotStream(stream) {
  trace('Received local stream');
  localVideo.srcObject = stream;
  localStream = stream;
}

function createPeerConnection() {
  createPeerConnectionButton.disabled = true;
  createOfferButton.disabled = false;
  createAnswerButton.disabled = false;
  setOfferButton.disabled = false;
  setAnswerButton.disabled = false;
  hangupButton.disabled = false;
  trace('Starting call');
  var videoTracks = localStream.getVideoTracks();
  var audioTracks = localStream.getAudioTracks();
  if (videoTracks.length > 0) {
    trace('Using video device: ' + videoTracks[0].label);
  }
  if (audioTracks.length > 0) {
    trace('Using audio device: ' + audioTracks[0].label);
  }
  var servers = null;

  localPeerConnection = new RTCPeerConnection(servers);
  trace('Created local peer connection object localPeerConnection');
  sendChannel = localPeerConnection.createDataChannel('sendDataChannel',
      dataChannelOptions);
  localPeerConnection.onicecandidate = iceCallback1;
  sendChannel.onopen = onSendChannelStateChange;
  sendChannel.onclose = onSendChannelStateChange;
  sendChannel.onerror = onSendChannelStateChange;

  remotePeerConnection = new RTCPeerConnection(servers);
  trace('Created remote peer connection object remotePeerConnection');
  remotePeerConnection.onicecandidate = iceCallback2;
  remotePeerConnection.onaddstream = gotRemoteStream;
  remotePeerConnection.ondatachannel = receiveChannelCallback;

  localPeerConnection.addStream(localStream);
  trace('Adding Local Stream to peer connection');
}

function onSetSessionDescriptionSuccess() {
  trace('Set session description success.');
}

function onSetSessionDescriptionError(error) {
  trace('Failed to set session description: ' + error.toString());
}

// Workaround for crbug/322756.
function maybeAddLineBreakToEnd(sdp) {
  var endWithLineBreak = new RegExp(/\n$/);
  if (!endWithLineBreak.test(sdp)) {
    return sdp + '\n';
  }
  return sdp;
}

function createOffer() {
  localPeerConnection.createOffer(gotDescription1,
      onCreateSessionDescriptionError, offerOptions);
}

function onCreateSessionDescriptionError(error) {
  trace('Failed to create session description: ' + error.toString());
}

function setOffer() {
  var sdp = offerSdpTextarea.value;
  sdp = maybeAddLineBreakToEnd(sdp);
  sdp = sdp.replace(/\n/g, '\r\n');
  offer.sdp = sdp;
  localPeerConnection.setLocalDescription(offer,
      onSetSessionDescriptionSuccess,
      onSetSessionDescriptionError);
  trace('Modified Offer from localPeerConnection \n' + sdp);
  remotePeerConnection.setRemoteDescription(offer,
      onSetSessionDescriptionSuccess,
      onSetSessionDescriptionError);
}

function gotDescription1(description) {
  offer = description;
  offerSdpTextarea.disabled = false;
  offerSdpTextarea.value = description.sdp;
}

function createAnswer() {
  // Since the 'remote' side has no media stream we need
  // to pass in the right constraints in order for it to
  // accept the incoming offer of audio and video.
  remotePeerConnection.createAnswer(gotDescription2,
      onCreateSessionDescriptionError);
}

function setAnswer() {
  var sdp = answerSdpTextarea.value;
  sdp = maybeAddLineBreakToEnd(sdp);
  sdp = sdp.replace(/\n/g, '\r\n');
  answer.sdp = sdp;
  remotePeerConnection.setLocalDescription(answer,
      onSetSessionDescriptionSuccess,
      onSetSessionDescriptionError);
  trace('Modified Answer from remotePeerConnection \n' + sdp);
  localPeerConnection.setRemoteDescription(answer,
      onSetSessionDescriptionSuccess,
      onSetSessionDescriptionError);
}

function gotDescription2(description) {
  answer = description;
  answerSdpTextarea.disabled = false;
  answerSdpTextarea.value = description.sdp;
}

function sendData() {
  sendChannel.send(dataChannelCounter);
  trace('DataChannel send counter: ' + dataChannelCounter);
  dataChannelCounter++;
}

function hangup() {
  remoteVideo.src = '';
  trace('Ending call');
  localStream.getTracks().forEach(function(track) {
    track.stop();
  });
  sendChannel.close();
  if (receiveChannel) {
    receiveChannel.close();
  }
  localPeerConnection.close();
  remotePeerConnection.close();
  localPeerConnection = null;
  remotePeerConnection = null;
  offerSdpTextarea.disabled = true;
  answerSdpTextarea.disabled = true;
  getMediaButton.disabled = false;
  createPeerConnectionButton.disabled = true;
  createOfferButton.disabled = true;
  setOfferButton.disabled = true;
  createAnswerButton.disabled = true;
  setAnswerButton.disabled = true;
  hangupButton.disabled = true;
}

function gotRemoteStream(e) {
  remoteVideo.srcObject = e.stream;
  trace('Received remote stream');
}

function iceCallback1(event) {
  if (event.candidate) {
    remotePeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate),
        onAddIceCandidateSuccess, onAddIceCandidateError);
    trace('Local ICE candidate: \n' + event.candidate.candidate);
  }
}

function iceCallback2(event) {
  if (event.candidate) {
    localPeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate),
        onAddIceCandidateSuccess, onAddIceCandidateError);
    trace('Remote ICE candidate: \n ' + event.candidate.candidate);
  }
}

function onAddIceCandidateSuccess() {
  trace('AddIceCandidate success.');
}

function onAddIceCandidateError(error) {
  trace('Failed to add Ice Candidate: ' + error.toString());
}

function receiveChannelCallback(event) {
  trace('Receive Channel Callback');
  receiveChannel = event.channel;
  receiveChannel.onmessage = onReceiveMessageCallback;
  receiveChannel.onopen = onReceiveChannelStateChange;
  receiveChannel.onclose = onReceiveChannelStateChange;
}

function onReceiveMessageCallback(event) {
  dataChannelDataReceived = event.data;
  trace('DataChannel receive counter: ' + dataChannelDataReceived);
}

function onSendChannelStateChange() {
  var readyState = sendChannel.readyState;
  trace('Send channel state is: ' + readyState);
  if (readyState === 'open') {
    sendDataLoop = setInterval(sendData, 1000);
  } else {
    clearInterval(sendDataLoop);
  }
}

function onReceiveChannelStateChange() {
  var readyState = receiveChannel.readyState;
  trace('Receive channel state is: ' + readyState);
}
*/
