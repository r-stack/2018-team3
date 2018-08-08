var vid = document.getElementById('videoel');
var vid_width = vid.width;
var vid_height = vid.height;
var overlay = document.getElementById('overlay');
var overlayCC = overlay.getContext('2d');

/********** check and set up video/webcam **********/

function adjustVideoProportions() {
    // resize overlay and video if proportions are different
    // keep same height, just change width
    var proportion = vid.videoWidth / vid.videoHeight;
    vid_width = Math.round(vid_height * proportion);
    vid.width = vid_width;
    overlay.width = vid_width;
}

function gumSuccess(stream) {
    // add camera stream if getUserMedia succeeded
    if ("srcObject" in vid) {
        vid.srcObject = stream;
    } else {
        vid.src = (window.URL && window.URL.createObjectURL(stream));
    }
    vid.onloadedmetadata = function () {
        adjustVideoProportions();
        vid.play();
    }
    vid.onresize = function () {
        adjustVideoProportions();
        if (trackingStarted) {
            ctrack.stop();
            ctrack.reset();
            ctrack.start(vid);
        }
    }
}

function gumFail() {
    alert("There was some problem trying to fetch video from your webcam. If you have a webcam, please make sure to accept when the browser asks for access to your webcam.");
}

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;

// check for camerasupport
if (navigator.mediaDevices) {
    navigator.mediaDevices.getUserMedia({ video: true }).then(gumSuccess).catch(gumFail);
} else if (navigator.getUserMedia) {
    navigator.getUserMedia({ video: true }, gumSuccess, gumFail);
} else {
    alert("This demo depends on getUserMedia, which your browser does not seem to support. :(");
}

/*********** setup of emotion detection *************/

// set eigenvector 9 and 11 to not be regularized. This is to better detect motion of the eyebrows
pModel.shapeModel.nonRegularizedVectors.push(9);
pModel.shapeModel.nonRegularizedVectors.push(11);

var ctrack = new clm.tracker({ useWebGL: true });
ctrack.init(pModel);
var trackingStarted = false;

function drawLoop() {
    requestAnimFrame(drawLoop);
    overlayCC.clearRect(0, 0, vid_width, vid_height);
    //psrElement.innerHTML = "score :" + ctrack.getScore().toFixed(4);
    const pos = ctrack.getCurrentPosition();
    if (pos) {
        ctrack.draw(overlay);
        console.log(pos[0][0] + ', ' + pos[0][1] + ', ' + pos[13][0] + ', ' + pos[13][1])

        // 傾き検知処理
        const param = BiasScore(pos);

        // Update debug display
        updateData([{ "emotion": '疲れた', "value": param }]);
        // Do HUE control
        changeColor(param);
    }

}

// 面倒だったらこの下全部削っても動く

var emotionData = [{ "emotion": '疲れた', "value": 0.0 }];

/************ d3 code for barchart *****************/

var margin = { top: 20, right: 20, bottom: 10, left: 40 },
    width = 400 - margin.left - margin.right,
    height = 45 - margin.top - margin.bottom;

var barWidth = 30;

var formatPercent = d3.format(".0%");

var y = d3.scale.linear()
    .domain([0, 1]).range([margin.left, width + margin.left]);

var x = d3.scale.linear()
    .domain([0, 1]).range([0, height]);

var svg = d3.select("#emotion_chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)

svg.selectAll("rect").
    data(emotionData).
    enter().
    append("svg:rect").
    attr("x", function (datum, index) { return 80; }).
    attr("y", function (datum) { return 15; }).
    attr("height", barWidth).
    attr("width", function (datum) { return x(datum.value); }).
    attr("fill", "#2d578b");

svg.selectAll("text.labels").
    data(emotionData).
    enter().
    append("svg:text").
    attr("x", function (datum, index) { return x(index) + barWidth; }).
    attr("y", 43).
    attr("text-anchor", "middle").
    text(function (datum) { return datum.value; }).
    attr("fill", "white").
    attr("class", "labels");

svg.selectAll("text.yAxis").
    data(emotionData).
    enter().append("svg:text").
    attr("x", 50).
    attr("y", 10).
    attr("dx", -barWidth / 2).
    attr("text-anchor", "middle").
    attr("style", "font-size: 12").
    text(function (datum) { return datum.emotion; }).
    attr("transform", "translate(0, 18)").
    attr("fill", "white").
    attr("class", "yAxis");

function updateData(data) {
    // update
    var rects = svg.selectAll("rect")
        .data(data)
        .attr("x", function (datum) { return 80; })
        .attr("width", function (datum) { return x(datum.value); });
    var texts = svg.selectAll("text.labels")
        .data(data)
        .text(function (datum) { return datum.value.toFixed(1); });

    // enter
    rects.enter().append("svg:rect");
    texts.enter().append("svg:text");

    // exit
    rects.exit().remove();
    texts.exit().remove();
}


// この下は必要

// start video
vid.play();
// start tracking
ctrack.start(vid);
trackingStarted = true;
// start loop to draw face
drawLoop();