let otherVideo = document.getElementById("otherVideo");
otherVideo.addEventListener('click', swapVideos);

let selfVideo = document.getElementById("selfVideo");
selfVideo.addEventListener('click', swapVideos);

let smallVideo = 'self';

const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'},
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }]}
const peerConnection = new RTCPeerConnection(configuration);

function swapVideos() {
	if (smallVideo == 'self') {
		selfVideo.className = 'bigVideo';
		otherVideo.className = 'smallVideo';
		smallVideo = 'other';
	}
	else {
		selfVideo.className = 'smallVideo';
		otherVideo.className = 'bigVideo';
		smallVideo = 'self';
	}
}

let hostRadio = document.getElementById('host');
hostRadio.addEventListener('click', displayOfferBox);

let joinRadio = document.getElementById('join');
joinRadio.addEventListener('click', displayAnswerBox);

let offerBox = document.getElementById('offerBox');
let answerBox = document.getElementById('answerBox');

function displayOfferBox() {
	offerBox.style.display = 'block';
	answerBox.style.display = 'none';
}

function displayAnswerBox() {
	answerBox.style.display = 'block';
	offerBox.style.display = 'none';
}

let start = document.getElementById("start");
start.addEventListener('click', startStream);

let stop = document.getElementById("stop");
stop.addEventListener('click', stopStream);

function startStream(){
	if (navigator.mediaDevices.getUserMedia) {
	  	navigator.mediaDevices.getUserMedia({ video: true })
		.then(function (stream) {
	      selfVideo.srcObject = stream;
	    })
	    .catch(function (error) {
	      console.log("Oops! Something went wrong!");
	    });
	}
	addTracksToConnection()
}

function stopStream(){
	var localStream = selfVideo.srcObject;
	var tracks = localStream.getTracks();

	for (var i = 0; i < tracks.length; i++) {
	var track = tracks[i];
	track.stop();
	 }

	selfVideo.srcObject = null;

	const senders = peerConnection.getSenders();
	senders.forEach((sender) => peerConnection.removeTrack(sender));
}

let generateCodeButton = document.getElementById('generateCode');
generateCodeButton.addEventListener('click', generateCode);

let copyCodeButton = document.getElementById('copyCode');
copyCodeButton.addEventListener('click', copyCode);

let connectButton = document.getElementById('connectButton');
connectButton.addEventListener('click', connect);

const offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1
};

async function addTracksToConnection() {
	// send media stream
	const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
	
	for ( const track of stream.getTracks()) {
		peerConnection.addTrack(track, stream);
	}

}

peerConnection.oniceconnectionstatechange = function(event) {
	let connStatus = document.getElementById('connStatus');
	if (peerConnection.iceConnectionState == 'connected') {
    	connStatus.style.color = '#4c8';
	}
	else {
		connStatus.style.color = '#555';
	}
}

peerConnection.ontrack = function(event) {
	//recieve media stream from host
	otherVideo.srcObject = event.streams[0];
};



async function generateCode() {
	channel = peerConnection.createDataChannel('messageChannel');

    let offerCode = document.getElementById('offerCode');
    
	peerConnection.onicecandidate = function(candidate) {
		if(!candidate.candidate) {
			offerCode.innerText = JSON.stringify(peerConnection.localDescription);
		};
	};

	const offer = await peerConnection.createOffer(offerOptions);
	await peerConnection.setLocalDescription(offer);
}

function copyCode() {
	let offerCode = document.getElementById('offerCode');
	navigator.clipboard.writeText(offerCode.value);
}

async function connect() {
	let answer = JSON.parse(document.getElementById('answerRecieved').value);
	const remoteDesc = new RTCSessionDescription(answer);
    await peerConnection.setRemoteDescription(remoteDesc);

}


let generateAnswerButton = document.getElementById('generateAnswer');
generateAnswerButton.addEventListener('click', generateAnswer);

let copyAnswerButton = document.getElementById('copyAnswer');
copyAnswerButton.addEventListener('click', copyAnswer);


async function generateAnswer() {
	let offer = JSON.parse(document.getElementById('offerRecieved').value);

	peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

	let answerCode = document.getElementById('answerCode');

	peerConnection.onicecandidate = function(candidate) {
		if(!candidate.candidate) {
			answerCode.innerText = JSON.stringify(peerConnection.localDescription);
		};
	};

	const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
}

function copyAnswer() {
	let answerCode = document.getElementById('answerCode');
	navigator.clipboard.writeText(answerCode.value);
}

