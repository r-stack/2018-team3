var lastPut = new Date();


const url = "https://192.168.100.114/api/xRQtVO0TCT5yzA5uawrUAFGfiOdOOv4-r7rR06YY/lights/2/state";


function changeColor(prm) {

    const a = 46920 / 0.5;
    let hue = 46920 - a * prm;

    hue = hue < 0 ? 0 : hue;

    // あまり早すぎると動かないので、700msに一度だけ色を更新する
    if (new Date().getTime() - lastPut.getTime() > 700) {
        let data = {
            "on": true,
            "bri": 255,
            "hue": Math.round(hue),
            "sat": 255
        };
        if(0.5 < prm){
            const a2 = 255 / 0.3
            let bri = 255 - (prm - 0.5) * a2
            bri = bri < 0 ? 0 : bri;
            data.bri = Math.round(bri);
        }
        var json = JSON.stringify(data);

        var xhr = new XMLHttpRequest();
        xhr.open("PUT", url, true);
        xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        xhr.send(json);
        lastPut = new Date();
    }
}