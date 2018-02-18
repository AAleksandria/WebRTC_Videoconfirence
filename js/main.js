'use strict';

var localStream;
var pc;
var flag = 0;

var callButton = document.querySelector('button#call');
// var answerButton = document.querySelector('button#answer');
var hangUpButton = document.querySelector('button#hangUp');
var id = document.querySelector('p#user1').innerHTML;
var id2;
var delButton = document.querySelector('button#del');
id2 = document.querySelector('input#user2').value;

delButton.disabled = false;
callButton.disabled = false;
// answerButton.disabled = false;
hangUpButton.disabled = true;

delButton.onclick = del;
callButton.onclick = doOffer;
// answerButton.onclick = doAnswer;
hangUpButton.onclick = hangUp;

var localVideo = document.querySelector('div#video video#local');
var remoteVideo = document.querySelector('div#video video#remote');
var offer;
var answer;

var constraints = { audio : true, video : true };


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
  hangUpButton.disabled = false;

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

}

function errorCallback(error){
  console.log('navigator.getUserMedia error: ', error);
}

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

function doOffer() {
  id2 = document.querySelector('input#user2').value;
  trace("Sending offer to peer.");
  pc.createOffer(setLocalAndSendMessage, logError);
}

function doAnswer() {
  // id2 = document.querySelector('input#user2');
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
    sendMessage({type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate});
    } 
    else {
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
  flag++;
  var body = 'id=' + encodeURIComponent(id) + '&id2=' + encodeURIComponent(id2) +'&msg=' + encodeURIComponent(msg)  + '&flag=' + encodeURIComponent(flag);
  trace('C№ '+ id +' ->S: ' + msg);
  xhr.open('POST', 'server.php');
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function() {
    if (this.readyState != 4) return;
    // trace('S->C: ' + this.responseText);
  }
  xhr.send(body);

}

function del(){
  var xhr = new XMLHttpRequest();
  var body = 'del=' + null;
  xhr.open('POST', 'server.php');
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function() {
    if (this.readyState != 4) return;
    trace('БД очищена');
  }
  xhr.send(body);
}

function delMess(){
  var xhr = new XMLHttpRequest();
  var body = 'delMess=' + null + '&id2=' + encodeURIComponent(id2);
  xhr.open('POST', 'server.php');
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function() {
    if (this.readyState != 4) return;
    trace('Поле очищенно');
  }
  xhr.send(body);
}

setInterval(function getMess(){
  var xhr = new XMLHttpRequest();
  var body = 'msg2=' + null;
  xhr.open('POST', 'server.php');
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function() {
    if (this.readyState != 4) return;
    if (this.responseText == 'false' || 
        this.responseText == null || 
        this.responseText == '0' || 
        this.responseText == 0 || 
        this.responseText == false) 
      return;
    else {
        // console.log(this.responseText);
        var text = JSON.parse(this.responseText);
        // console.log(this.responseText);
        trace('S->C : ' + text['message']);
        signalingMessageCallback(text['message']);
        id2 = text['id'];
        delMess();
      }
    }
  
  xhr.send(body);
},1000);



function signalingMessageCallback(msg) {
    var message = JSON.parse(msg);
    if (message.type === 'offer') {
        trace('Got remote offer.');
        // document.getElementById("modal-1").setAttribute("aria-hidden","false");
        // document.getElementById("modal-1").setAttribute("style","display: block;");
        $("#modal-1").modal("show");

        console.log("jquery");
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
  // pc.close();
  localVideo.src = '';
  trace('Ending call');
  localStream.getTracks().forEach(function(track) {
    track.stop();
  });
  callButton.disabled = false;
  hangUpButton.disabled = true;
}

