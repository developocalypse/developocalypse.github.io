// In this case, We set width 320, and the height will be computed based on the input stream.
let width = 320;
let height = 0;
// whether streaming video from the camera.
let streaming = false;
let video = document.getElementById("video");
let stream = null;
let vc = null;
function startCamera() {
  if (streaming) return;
  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(function (s) {
      stream = s;
      video.srcObject = s;
      video.play();
    })
    .catch(function (err) {
      console.log("An error occured! " + err);
    });
  video.addEventListener("canplay", function (ev) {
    if (!streaming) {
      height = video.videoHeight / (video.videoWidth / width);
      video.setAttribute("width", width);
      video.setAttribute("height", height);
      streaming = true;
      vc = new cv.VideoCapture(video);
    }
    startVideoProcessing();
  }, false);
}
let src = null;
let dstC1 = null;
let dstC3 = null;
let dstC4 = null;
function startVideoProcessing() {
  if (!streaming) { console.warn("Please startup your webcam"); return; }
  stopVideoProcessing();
  src = new cv.Mat(height, width, cv.CV_8UC4);
  dstC1 = new cv.Mat(height, width, cv.CV_8UC1);
  dstC3 = new cv.Mat(height, width, cv.CV_8UC3);
  dstC4 = new cv.Mat(height, width, cv.CV_8UC4);
  requestAnimationFrame(processVideo);
}
function processVideo() {
  stats.begin();
  vc.read(src);
  cv.cvtColor(src, dstC1, cv.COLOR_RGBA2GRAY);
  cv.Canny(dstC1, dstC1, 150, 300, 3, false);
  let kernel1 = cv.Mat.ones(3, 3, cv.CV_8UC1);
  
  cv.dilate(dstC1, dstC1, kernel1, new cv.Point(-1, -1), iterations = 1)
  let M = cv.Mat.ones(5, 5, cv.CV_8U);
  
  cv.erode(dstC1, dstC1, M, new cv.Point(-1, -1), 1);
  
  cv.imshow("canvasOutput", dstC1);
  stats.end();
  requestAnimationFrame(processVideo);
}
function stopVideoProcessing() {
  if (src != null && !src.isDeleted()) src.delete();
  if (dstC1 != null && !dstC1.isDeleted()) dstC1.delete();
  if (dstC3 != null && !dstC3.isDeleted()) dstC3.delete();
  if (dstC4 != null && !dstC4.isDeleted()) dstC4.delete();
}
function stopCamera() {
  if (!streaming) return;
  stopVideoProcessing();
  document.getElementById("canvasOutput").getContext("2d").clearRect(0, 0, width, height);
  video.pause();
  video.srcObject = null;
  stream.getVideoTracks()[0].stop();
  streaming = false;
}
var stats = null;
function initUI() {
  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.bottom = '0px';
  stats.domElement.style.zIndex = 100;
  stats.showPanel(0);
  document.getElementById('container').appendChild(stats.domElement);
}
function opencvIsReady() {
  console.log('OpenCV.js is ready');
  initUI();
  startCamera();
}