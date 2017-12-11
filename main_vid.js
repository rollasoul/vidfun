var AMOUNT = 100;
var container, stats;
var camera, scene, renderer;
var videostream, videoImage, videoImageContext, videoTexture;
var video, beat, image, imageContext,
imageReflection, imageReflectionContext, imageReflectionGradient,
texture, textureReflection, textureLeft;
var image2, imageContext2, texture2, video2, texture2;
var image3, imageContext3, texture3, video3, texture3;
var mesh;
var mouseX = 0;
var mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var downloaded1;

//// distortion elements

var video4, texture4, material4, mesh4;

var composer;

var mouseX = 0;
var mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var cube_count,

  meshes = [],
  materials = [],

  xgrid = 40,
  ygrid = 20;
/////// end of distoprtion elements




////////////////////
//rec controls/////
//////////////////
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

//var recordButton = document.querySelector('button#record');
//var playButton = document.querySelector('button#play');
//var downloadButton = document.querySelector('button#download');
//recordButton.onclick = toggleRecording;
//playButton.onclick = play;
//downloadButton.onclick = download;

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
    //stopRecording();
    //recordButton.textContent = 'Start Recording';
    //playButton.disabled = false;
    //downloadButton.disabled = false;
}

function rec_time() {
    setTimeout(function(){
      stopRecording();
      //playButton.disabled = false;
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
  try {
    mediaRecorder = new MediaRecorder(window.stream, options);
  } catch (e) {
    console.error('Exception while creating MediaRecorder: ' + e);
    alert('Exception while creating MediaRecorder: '
      + e + '. mimeType: ' + options.mimeType);
    return;
  }
  console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
  //recordButton.textContent = 'Stop Recording';
  //playButton.disabled = true;
  //downloadButton.disabled = true;
  mediaRecorder.onstop = handleStop;
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start(10); // collect 10ms of data
  console.log('MediaRecorder started', mediaRecorder);
}

function stopRecording() {
  mediaRecorder.stop();
  console.log('Recorded Blobs: ', recordedBlobs);
  recordedVideo.controls = true;
  download_popup();
  // setTimeout(function(){
  //   window.location.href = "index.html";
  // }, 15000);
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
    }, 15000);
    console.log('downloaded recording, going back home');
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

function download() {
  var blob = new Blob(recordedBlobs, {type: 'video/webm'});
  var url = window.URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'test.webm';
  document.body.appendChild(a);
  a.click();
  setTimeout(function() {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
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
  //video = document.getElementById( 'video' );
  video2 = document.getElementById( 'video2' );
  video3 = document.getElementById( 'video3' );
  downloaded1 = document.getElementById( 'downloaded1' );
  if ( downloaded1.readyState === downloaded1.HAVE_ENOUGH_DATA ) {
    console.log('yoyoyo');
    // imageContext2.drawImage( downloaded1, 0, 0, videoImage.width, videoImage.height );
    // texture2.needsUpdate = false;
    // video2.pause();
  }

  ///////////
	// stream from webcam //
	///////////

	videoImage = document.getElementById( 'videoImage' );
  videoImage.width = 480;
  videoImage.height = 204;
	videoImageContext = videoImage.getContext( '2d' );
	// background color if no video present
	//videoImageContext.fillStyle = '#000000';
	//videoImageContext.fillRect( 0, 0, 480, 204 );

	videoTexture = new THREE.Texture( videoImage );
	videoTexture.minFilter = THREE.LinearFilter;
	videoTexture.magFilter = THREE.LinearFilter;

	// var movieMaterial = new THREE.MeshBasicMaterial( { map: videoTexture, overdraw: true, side:THREE.DoubleSide } );
	// // the geometry on which the movie will be displayed;
	// // 		movie image will be scaled to fit these dimensions.
	// var movieGeometry = new THREE.PlaneGeometry( 100, 100, 1, 1 );
	// var movieScreen = new THREE.Mesh( movieGeometry, movieMaterial );
	// movieScreen.position.set(0,0,0);
	// scene.add(movieScreen);
  // camera.position.set(0,150,1000);
	// camera.lookAt(movieScreen.position);


  //Front screen
  image = document.createElement( 'canvas' );
  image.width = 362;
  image.height = 204;
  imageContext = image.getContext( '2d' );
  imageContext.fillStyle = '#000000';
  imageContext.fillRect( 0, 0, 480, 204 );


  //videotexture for the front screen
  texture = new THREE.Texture( videoImage );
  var material = new THREE.MeshBasicMaterial( {map:videoTexture, overdraw: 0.5} );
  var plane = new THREE.PlaneGeometry( 380, 204, 4, 4 );
  mesh = new THREE.Mesh( plane, material );
  mesh.scale.x = mesh.scale.y = mesh.scale.z = 1.5;
  scene.add(mesh);


  //left screen
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

  //right fullScreen
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
  //stats = new Stats();
  //container.appendChild( stats.dom );
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  window.addEventListener( 'resize', onWindowResize, false );

//// distortion bits
var light = new THREE.DirectionalLight( 0xffffff );
light.position.set( 0.5, 1, 1 ).normalize();
scene.add( light );

renderer = new THREE.WebGLRenderer( { antialias: false } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
container.appendChild( renderer.domElement );


video4 = document.getElementById( 'video4' );

texture4 = new THREE.VideoTexture( video4 );
texture4.minFilter = THREE.LinearFilter;
texture4.magFilter = THREE.LinearFilter;
texture4.format = THREE.RGBFormat;
//
var i, j, ux, uy, ox, oy,
  geometry,
  xsize, ysize;

ux = 1 / xgrid;
uy = 1 / ygrid;

xsize = 480 / xgrid;
ysize = 204 / ygrid;

var parameters = { color: 0xffffff, map: texture };

cube_count = 0;

for ( i = 0; i < xgrid; i ++ )
for ( j = 0; j < ygrid; j ++ ) {

  ox = i;
  oy = j;

  geometry = new THREE.BoxGeometry( xsize, ysize, xsize );

  change_uvs( geometry, ux, uy, ox, oy );

  materials[ cube_count ] = new THREE.MeshLambertMaterial( parameters );

  material4 = materials[ cube_count ];

  material4.hue = i/xgrid;
  material4.saturation = 1 - j/ygrid;

  //material.color.setHSL( material.hue, material.saturation, 0.5 );

  mesh4 = new THREE.Mesh( geometry, material4 );

  mesh4.position.x =   ( i - xgrid/2 ) * xsize;
  mesh4.position.y =   ( j - ygrid/2 ) * ysize;
  mesh4.position.z = 0;

  mesh4.scale.x = mesh4.scale.y = mesh4.scale.z = 1;

  scene.add( mesh4 );

  mesh4.dx = 0.001 * ( 0.5 - Math.random() );
  mesh4.dy = 0.001 * ( 0.5 - Math.random() );

  meshes[ cube_count ] = mesh4;

  cube_count += 1;

  renderer.autoClear = false;

  document.addEventListener( 'mousemove', onDocumentMouseMove, false );

  // postprocessing

  var renderModel = new THREE.RenderPass( scene, camera );
  //var effectBloom = new THREE.BloomPass( 1.3 );
  var effectCopy = new THREE.ShaderPass( THREE.CopyShader );

  effectCopy.renderToScreen = true;

  composer = new THREE.EffectComposer( renderer );

  composer.addPass( renderModel );
  //composer.addPass( effectBloom );
  composer.addPass( effectCopy );


 /////// end of distortion bits


}

/// distortion extras

function change_uvs( geometry, unitx, unity, offsetx, offsety ) {

  var faceVertexUvs = geometry.faceVertexUvs[ 0 ];

  for ( var i = 0; i < faceVertexUvs.length; i ++ ) {

    var uvs = faceVertexUvs[ i ];

    for ( var j = 0; j < uvs.length; j ++ ) {

      var uv = uvs[ j ];

      uv.x = ( uv.x + offsetx ) * unitx;
      uv.y = ( uv.y + offsety ) * unity;

    }

  }

}

//// endof distorrtion extras

function onWindowResize() {

  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
  composer.reset();

}

function onDocumentMouseMove( event ) {
  mouseX = ( event.clientX - windowHalfX );
  mouseY = ( event.clientY - windowHalfY ) * 0.01;

}
function animate() {
  requestAnimationFrame( animate );
  render();
  //stats.update();
  //toggleRecording();

}

var h, counter = 1;

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

  //replace video2 with the recorded or downloaded video if it is there
  if ( recordedVideo.readyState === recordedVideo.HAVE_ENOUGH_DATA ) {
    imageContext2.drawImage( recordedVideo, 0, 0, videoImage.width, videoImage.height );
    texture2.needsUpdate = false;
    video2.pause();
    // if ( downloaded1.readyState === downloaded1.HAVE_ENOUGH_DATA ){
    //   downloaded1.pause();
    // }
  }
  if ( downloaded1.readyState === downloaded1.HAVE_ENOUGH_DATA ) {
    //console.log('yoyo');
    imageContext2.drawImage( downloaded1, 0, 0);
    texture2.needsUpdate = true;
    video2.pause();
  }

  if ( video3.readyState === video3.HAVE_ENOUGH_DATA ) {
    imageContext3.drawImage( video3, 0, 0 );
    if ( texture3 ) texture3.needsUpdate = true;
  }
  if ( videostream.readyState === videostream.HAVE_ENOUGH_DATA )
	{
		videoImageContext.drawImage( videostream, 0, 0, videoImage.width, videoImage.height );
		if ( videoTexture )
			videoTexture.needsUpdate = true;
	}

///////distortion bits
for ( var i = 0; i < cube_count; i ++ ) {

  material4 = materials[ i ];

  h = ( 360 * ( material.hue + time ) % 360 ) / 360;
  //material.color.setHSL( h, material.saturation, 0.5 );

}

if ( counter % 1000 > 200 ) {

  for ( var i = 0; i < cube_count; i ++ ) {

    mesh4 = meshes[ i ];

    mesh4.rotation.x += 10 * mesh.dx;
    mesh4.rotation.y += 10 * mesh.dy;

    mesh4.position.x += 200 * mesh.dx;
    mesh4.position.y += 200 * mesh.dy;
    mesh4.position.z += 400 * mesh.dx;

  }

}

if ( counter % 1000 === 0 ) {

  for ( var i = 0; i < cube_count; i ++ ) {

    mesh4 = meshes[ i ];

    mesh4.dx *= -1;
    mesh4.dy *= -1;

  }

}

counter ++;
console.log(counter);
///// end of distortion bits ... and here it gets weird

  //renderer.render( scene, camera );

/// ???? distortion
renderer.clear();
composer.render();
}
