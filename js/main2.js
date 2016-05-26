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
  var id = 2;
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
    signalingMessageCallback(this.responseText)
  }
  xhr.send(body);
}
/*
function sendMessage(message) {
  var xhr = new XMLHttpRequest();
  var msg = JSON.stringify(message);
  var id = 2;
  var body = 'id=' + id, 'msg=' + encodeURIComponent(msg) + '&flag=' + encodeURIComponent(flag);
  trace('C№ ' + id + '->S: ' + msg);
  xhr.open('POST', 'server.php');
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  //xhr.onreadystatechange = function() {
    //if (this.readyState != 4) return;
    //trace('S->C: ' + this.responseText);
    //alert(this.responseText)
  //}
  xhr.send(body);

}

function getMess(){
  var xhr = new XMLHttpRequest();
  var body = 'msg2=' + null;
  xhr.open('POST', 'server.php');
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function() {
    if (this.readyState != 4) return;
    //var msg = JSON.parse(this.responseText);
    trace('S->C: ' + this.responseText);
    signalingMessageCallback(this.responseText)
  }
  xhr.send(body);
}
*/

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
