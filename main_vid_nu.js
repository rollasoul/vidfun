// run 'python3 -m http-server'
// edit 'move_files.py', replace folder names with local folder structure
// run 'move_files.py' in background to move around recorded video bits (use sudo if needed)
// (move_files.py circumvents data loss when reloading pages between users by storing values in move_vids.txt file)
// script uses quite a bit of webRTC, stream from webcam might initialise too slow - reload page if needed
// still a few bugs with loading the video files - it takes sometimes a few seconds to load in new videos

//source-code:
// recording from webRCT - code based on https://github.com/webrtc/samples/tree/gh-pages/src/content/getusermedia/record
// video screen - code based on https://github.com/mrdoob/three.js/blob/dev/examples/canvas_materials_video.html

var AMOUNT = 100;
var container, stats;
var counter = 0;
var camera, scene, renderer;
var videostream, videoImage, videoImageContext, videoTexture;
var video, beat, image, imageContext,
imageReflection, imageReflectionContext, imageReflectionGradient,
texture, textureReflection, textureLeft;
var image2, imageContext2, texture2, video2, texture2;
var image3, imageContext3, texture3, video3, texture3, repl_left, repl_right;
var mesh;
var mouseX = 0;
var mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

///////////////////////////
//webRTC rec controls/////
/////////////////////////

var mediaSource = new MediaSource();
mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
var mediaRecorder;
var recordedBlobs;
var sourceBuffer;

var mediaSource = new MediaSource();
mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
var mediaRecorder;
var recordedBlobs;
var sourceBuffer;

var gumVideo = document.querySelector('video#gum');
var recordedVideo = document.querySelector('video#recorded');


// window.isSecureContext could be used for Chrome
var isSecureOrigin = location.protocol === 'https:' ||
location.hostname === 'localhost';
if (!isSecureOrigin) {
  alert('getUserMedia() must be run from a secure origin: HTTPS or localhost.' +
    '\n\nChanging protocol to HTTPS');
  location.protocol = 'HTTPS';
}

var constraints = {
  audio: true,
  video: true
};

function handleSuccess(stream) {
  //recordButton.disabled = false;
  console.log('getUserMedia() got stream: ', stream);
  window.stream = stream;
  gumVideo.srcObject = stream;
}

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

navigator.mediaDevices.getUserMedia(constraints).
    then(handleSuccess).catch(handleError);

function handleSourceOpen(event) {
  console.log('MediaSource opened');
  sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
  console.log('Source buffer: ', sourceBuffer);
}

recordedVideo.addEventListener('error', function(ev) {
  console.error('MediaRecording.recordedMedia.error()');
  alert('Your browser can not play\n\n' + recordedVideo.src
    + '\n\n media clip. event: ' + JSON.stringify(ev));
}, true);

function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

function handleStop(event) {
  console.log('Recorder stopped: ', event);
}

function toggleRecording() {
    console.log('yo');
    startRecording();
    rec_time();
}

function rec_time() {
    setTimeout(function(){
      stopRecording();
      play();
    }, 40000);
    console.log('stopped recording');
}

function startRecording() {
  recordedBlobs = [];
  var options = {mimeType: 'video/webm;codecs=vp9'};
  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    console.log(options.mimeType + ' is not Supported');
    options = {mimeType: 'video/webm;codecs=vp8'};
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.log(options.mimeType + ' is not Supported');
      options = {mimeType: 'video/webm'};
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.log(options.mimeType + ' is not Supported');
        options = {mimeType: ''};
      }
    }
  }
  setTimeout(function(){
    try {
        mediaRecorder = new MediaRecorder(window.stream, options);
    } catch (e) {
      console.error('Exception while creating MediaRecorder: ' + e);
      alert('Exception while creating MediaRecorder: '
        + e + '. mimeType: ' + options.mimeType);
      return;
    }
    console.log('Created MediaRecorder', mediaRecorder, 'with options', options);

    mediaRecorder.onstop = handleStop;
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start(10); // collect 10ms of data
    console.log('MediaRecorder started', mediaRecorder);
  },1000);
}

function stopRecording() {
  mediaRecorder.stop();
  console.log('Recorded Blobs: ', recordedBlobs);
  recordedVideo.controls = true;
  download_popup();
}

function download_popup() {
    setTimeout(function(){
      var txt;
      if (confirm("I am aware that I was recorded. I want to confuse other people with my own recording now.") == true) {
          txt = "Thank you for your cooperation. Good-bye";
          download();
          window.location.href = "index.html";
      } else {
          txt = "Thank you for your non-cooperation.Good-bye";
          window.location.href = "index.html";
      }
      document.getElementById("demo").innerHTML = txt;
    }, 25000);
    console.log('  recording, going back home');
}

function play() {
  var superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
  recordedVideo.src = window.URL.createObjectURL(superBuffer);
  // workaround for non-seekable video taken from
  // https://bugs.chromium.org/p/chromium/issues/detail?id=642012#c23
  recordedVideo.addEventListener('loadedmetadata', function() {
    if (recordedVideo.duration === Infinity) {
      recordedVideo.currentTime = 1e101;
      recordedVideo.ontimeupdate = function() {
        recordedVideo.currentTime = 0;
        recordedVideo.ontimeupdate = function() {
          delete recordedVideo.ontimeupdate;
          recordedVideo.play();
        };
      };
    }
  });
}

// read move_vids.txt that stores the name of the last downloaded video
// this dynamically renames the downloads alternating between left and right channel
function readTextFile(file)
{
    return new Promise(function(resolve, reject) {
      var rawFile = new XMLHttpRequest();
      rawFile.open("GET", file, false);
      rawFile.onreadystatechange = function ()
      {
          if(rawFile.readyState === 4)
          {
              if(rawFile.status === 200 || rawFile.status == 0)
              {
                  var allText = rawFile.responseText;
                  resolve(allText);
                  //alert(allText);
              }
          }
          // reject();
      }
      rawFile.send(null);
    });
}

function download() {
  var blob = new Blob(recordedBlobs, {type: 'video/webm'});
  var url = window.URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  readTextFile("move_vids.txt").then(function(vid_indicator) {
    console.log (vid_indicator);
    if ( vid_indicator === "file left" ){
      a.download = 'repl_right_nu.webm';
    }
    else {
      a.download = 'repl_left_nu.webm';
    }
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  });
}


/////////////////////////
//end of rec controls///
///////////////////////

init();
animate();
setTimeout(function(){
  toggleRecording()
}, 1000)

function init() {
  container = document.createElement( 'div' );

  document.body.appendChild( container );
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 9000 );
  camera.position.z = 1400;
  camera.position.y = 0;
  scene = new THREE.Scene();
  toggleRecording;

  // here we grab the videos from their html elements:
  videostream = document.getElementById('monitor')
  video2 = document.getElementById( 'video2' );
  video3 = document.getElementById( 'video3' );
  console.log(video3);
  repl_left = document.getElementById( 'repl_left' );
  repl_right = document.getElementById( 'repl_right' );

    ////////////////////////
	 // stream from webcam //
	////////////////////////

	videoImage = document.getElementById( 'videoImage' );
  videoImage.width = 480;
  videoImage.height = 204;
	videoImageContext = videoImage.getContext( '2d' );

	videoTexture = new THREE.Texture( videoImage );
	videoTexture.minFilter = THREE.LinearFilter;
	videoTexture.magFilter = THREE.LinearFilter;

  //videotexture for the front screen
  image = document.createElement( 'canvas' );
  image.width = 362;
  image.height = 204;
  imageContext = image.getContext( '2d' );
  imageContext.fillStyle = '#000000';
  imageContext.fillRect( 0, 0, 480, 204 );
  texture = new THREE.Texture( videoImage );
  var material = new THREE.MeshBasicMaterial( {map:videoTexture, overdraw: 0.5} );
  var plane = new THREE.PlaneGeometry( 380, 204, 4, 4 );
  mesh = new THREE.Mesh( plane, material );
  mesh.scale.x = mesh.scale.y = mesh.scale.z = 1.5;
  scene.add(mesh);


  //videotexture for the left screen
  image2 = document.createElement( 'canvas' );
  image2.width = 480;
  image2.height = 204;
  imageContext2 = image2.getContext( '2d' );
  imageContext2.fillStyle = '#000000';
  imageContext2.fillRect( 0, 0, 480, 204 );
  texture2 = new THREE.Texture( image2 );
  var material = new THREE.MeshBasicMaterial( {map: texture2, overdraw: 0.5} );
  let mesh2 = new THREE.Mesh( plane, material);
  mesh2.position.x = -620;
  mesh2.position.y = 5;
  mesh2.position.z = 350;
  mesh2.rotation.y = -43;
  mesh2.scale.x = mesh.scale.y = mesh.scale.z = 1.6;
  scene.add(mesh2);

  //videotexture for the right screen
  image3 = document.createElement( 'canvas' );
  image3.width = 362;
  image3.height = 204;
  imageContext3 = image3.getContext( '2d' );
  imageContext3.fillStyle = '#000000';
  imageContext3.fillRect( 0, 0, 480, 204 );
  texture3 = new THREE.Texture( image3 );
  var material = new THREE.MeshBasicMaterial( {map: texture3, overdraw: 0.5} );
  mesh3 = new THREE.Mesh( plane, material);
  mesh3.position.x = 620;
  mesh3.position.y = 5;
  mesh3.position.z = 350;
  mesh3.rotation.y = 43;
  mesh3.scale.x = mesh.scale.y = mesh.scale.z = 1.6;
  scene.add(mesh3);

  //dot floor
  var separation = 150;
  var amountx = 10;
  var amounty = 10;
  var PI2 = Math.PI * 2;
  var material = new THREE.SpriteCanvasMaterial( {
    color: 0x0808080,
    program: function ( context ) {
      context.beginPath();
      context.arc( 0, 0, 0.5, 0, PI2, true );
      context.fill();
    }
  } );
  for ( var ix = 0; ix < amountx; ix++ ) {
    for ( var iy = 0; iy < amounty; iy++ ) {
      var sprite = new THREE.Sprite( material );
      sprite.position.x = ix * separation - ( ( amountx * separation ) / 2 );
      sprite.position.y = -153;
      sprite.position.z = iy * separation - ( ( amounty * separation ) / 2 );
      sprite.scale.setScalar( 2 );
      scene.add( sprite );
    }
  }
  renderer = new THREE.CanvasRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  window.addEventListener( 'resize', onWindowResize, false );

}
function onWindowResize() {

  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {
  mouseX = ( event.clientX - windowHalfX );
  mouseY = ( event.clientY - windowHalfY ) * 0.01;

}
function animate() {
  requestAnimationFrame( animate );
  render();
}

var h;

function render() {

  var time = Date.now() * 0.00005;

  camera.position.x += ( mouseX - camera.position.x ) * 0.05;
  camera.position.y += ( - mouseY - camera.position.y ) ;
  camera.lookAt( scene.position );


  if ( videostream.readyState === videostream.HAVE_ENOUGH_DATA ) {
    videoImageContext.drawImage( videostream, 0, 0 );
    if ( texture ) texture.needsUpdate = true;
    if (texture2) texture.needsUpdate = false;
  }
  if ( video2.readyState === video2.HAVE_ENOUGH_DATA ) {
    imageContext2.drawImage( video2, 0, 0 );
    texture.needsUpdate = false
    if ( texture2 ) texture2.needsUpdate = true;
  }

  //replace video2 and 3 with the fresh recorded videos if they are there, otherwise play pre-recorded vids
  if ( repl_left.readyState === repl_left.HAVE_ENOUGH_DATA ) {
      imageContext2.drawImage( repl_left, 0, 0, videoImage.width, videoImage.height );
      texture2.needsUpdate = false;
      video2.pause();
    }
  if ( recordedVideo.readyState === recordedVideo.HAVE_ENOUGH_DATA ) {
    imageContext2.drawImage( recordedVideo, 0, 0, videoImage.width, videoImage.height );
    texture2.needsUpdate = false;
    video2.pause();
    repl_left.pause();
  }

  if ( video3.readyState === video3.HAVE_ENOUGH_DATA ) {
    imageContext3.drawImage( video3, 0, 0 );
    if ( texture3 ) texture3.needsUpdate = true;
  }
  if ( repl_right.readyState === repl_right.HAVE_ENOUGH_DATA ) {
      imageContext3.drawImage( repl_right, 0, 0, videoImage.width, videoImage.height );
      texture3.needsUpdate = false;
      video3.pause();
  }

  if ( videostream.readyState === videostream.HAVE_ENOUGH_DATA )
	{
		videoImageContext.drawImage( videostream, 0, 0, videoImage.width, videoImage.height );
		if ( videoTexture )
			videoTexture.needsUpdate = true;
	}


  renderer.render( scene, camera );
}
