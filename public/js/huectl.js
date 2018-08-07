var lastPut = new Date();


const url = "https://192.168.0.7/api/xRQtVO0TCT5yzA5uawrUAFGfiOdOOv4-r7rR06YY/lights/2/state";


function changeColor(prm) {
    // あまり早すぎると動かないので、700msに一度だけ色を更新する
    if (new Date().getTime() - lastPut.getTime() > 700) {
        var data = {
            "on": true,
            "bri": 255,
            "hue": Math.round(prm),
            "sat": 255
        };
        var json = JSON.stringify(data);

        var xhr = new XMLHttpRequest();
        xhr.open("PUT", url, true);
        xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        xhr.send(json);
        lastPut = new Date();
    }
}