//height comes from input stream.
let width = 320;
let height = 0;

let streaming = false;
let video = document.getElementById("video");
let stream = null;
let videoCapture = null;

function startCamera() {
    if (streaming) return;
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(function(s) {
            stream = s;
            video.srcObject = s;
            video.play();
        })
        .catch(function(err) {
            console.log("An error occured! " + err);
        });
    video.addEventListener("canplay", function(ev) {
        if (!streaming) {
            height = video.videoHeight / (video.videoWidth / width);
            video.setAttribute("width", width);
            video.setAttribute("height", height);
            streaming = true;
            videoCapture = new cv.VideoCapture(video);
        }
        startVideoProcessing();
    }, false);
}
let source = null;
let destination = null;

function startVideoProcessing() {
    if (!streaming) { console.warn("Please startup your webcam"); return; }
    stopVideoProcessing();
    source = new cv.Mat(height, width, cv.CV_8UC4);
    destination = new cv.Mat(height, width, cv.CV_8UC1);
    requestAnimationFrame(processVideo);
}

function processVideo() {
    stats.begin();
    videoCapture.read(source);
    cv.cvtColor(source, destination, cv.COLOR_RGBA2GRAY);
    cv.Canny(destination, destination, 150, 300, 3, false);
    let ones3 = cv.Mat.ones(3, 3, cv.CV_8UC1);
    cv.dilate(destination, destination, ones3, new cv.Point(-1, -1), iterations = 1)
    let ones5 = cv.Mat.ones(5, 5, cv.CV_8U);
    cv.erode(destination, destination, ones5, new cv.Point(-1, -1), 1);
    cv.imshow("canvasOutput", destination);
    stats.end();
    requestAnimationFrame(processVideo);
}

function stopVideoProcessing() {
    if (source != null && !source.isDeleted()) source.delete();
    if (destination != null && !destination.isDeleted()) destination.delete();
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
    stats.domElement.style.bottom = '10px';
    stats.domElement.style.zIndex = 100;
    stats.showPanel(0);
    document.getElementById('container').appendChild(stats.domElement);
}

function opencvIsReady() {
    console.log('OpenCV.js is ready');
    initUI();
    startCamera();
}