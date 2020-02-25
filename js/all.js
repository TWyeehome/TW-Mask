// 地圖設定
let base = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom: 7,
    maxZoom: 18
});

let map = L.map("map", {
    layers: [base],
    center: new L.LatLng(23.817844, 119.990917),
    zoom: 5,
    fullscreenControl: true,
    fullscreenControlOptions: { // optional
        title: '全螢幕',
        titleCancel: '離開全螢幕'
    },
    dragging: L.Browser.mobile
});

let myRenderer = L.canvas({
    padding: 0
});

let circleMarkerOptions = null;
let infoStr = '';
let getMask = new XMLHttpRequest();
getMask.open('GET', 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json?fbclid=IwAR2vd7FqcvO-XHnvXfFLwzb54ulKEEUc1Is0FN3UepRU_Z2Wk49fa50o1C4', true);
getMask.send(null);
getMask.onload = () => {
    let getMaskData = JSON.parse(getMask.responseText);
    //console.log(getMaskData.features);

    // 搜尋藥局 function
    function search() {
        if (document.getElementById('search').value == '') {
            alert('請輸入關鍵字齁!');
            return
        };
        // 地圖回歸中心點
        map.setView([23.817844, 119.990917], 5);

        // 開始搜尋
        let result = '';
        let resultTotal = 0;
        for (let num = 0; num < getMaskData.features.length; num++) {
            if (getMaskData.features[num].properties.name.indexOf(document.getElementById('search').value) != -1) {
                //console.log(getMaskData.features[num].properties.name);
                result += '<a href="#" class="result-link d-block border" style="padding:2px 8px; margin:2px 0;" data-info="' + num + '">' + getMaskData.features[num].properties.name + '</a>';
                resultTotal += 1;
            };
        };

        document.getElementById('search-result').innerHTML = '<div class="text-center" style="margin:16px 0 14px 0;">得到筆數 : ' + resultTotal + '</div>' + result;

        for (let x = 0; x < document.querySelectorAll('.result-link').length; x++) {
            document.querySelectorAll('.result-link')[x].addEventListener('click', () => {
                //console.log(document.querySelectorAll('.result-link')[x].dataset.loa);
                //console.log(document.querySelectorAll('.result-link')[x].dataset.geo);
                //console.log(document.querySelectorAll('.result-link')[x].dataset.info);

                // 彈跳 info window
                map.setView([getMaskData.features[document.querySelectorAll('.result-link')[x].dataset.info].geometry.coordinates[1], getMaskData.features[document.querySelectorAll('.result-link')[x].dataset.info].geometry.coordinates[0]], 25);
                markers[document.querySelectorAll('.result-link')[x].dataset.info].openPopup();
            });
        };
    };

    // 搜尋藥局
    document.getElementById('btn-search').addEventListener('click', () => {
        search();
    });

    // 渲染
    let markers = [];
    for (var i = 0; i < getMaskData.features.length; i++) {
        // 內文
        infoStr =
            '<div class="border-bottom">名稱 : ' + getMaskData.features[i].properties.name + '</div>' +
            '<div class="border-bottom my-1">電話 : ' + getMaskData.features[i].properties.phone + '</div>' +
            '<div class="border-bottom">地址 : ' + getMaskData.features[i].properties.address + '</div>' +
            '<div class="border-bottom my-1">成人口罩數量 : ' + getMaskData.features[i].properties.mask_adult + '</div>' +
            '<div class="border-bottom">兒童口罩數量 : ' + getMaskData.features[i].properties.mask_child + '</div>' +
            '<div class="border-bottom my-1">備註 : ' + getMaskData.features[i].properties.note + '</div>';

        // marker 顏色判定
        if (getMaskData.features[i].properties.mask_adult + getMaskData.features[i].properties.mask_child == 0) {
            circleMarkerOptions = {
                weight: 1.6,
                fillColor: "red",
                color: "black",
                opacity: 1,
                fillOpacity: .4
            };
            markers.push(L.circleMarker(getRandomLatLng(), circleMarkerOptions).addTo(map).bindPopup(infoStr));

        } else if (getMaskData.features[i].properties.mask_adult + getMaskData.features[i].properties.mask_child < 100) {
            circleMarkerOptions = {
                weight: 1.6,
                fillColor: "orange",
                color: "black",
                opacity: 1,
                fillOpacity: .4
            };
            markers.push(L.circleMarker(getRandomLatLng(), circleMarkerOptions).addTo(map).bindPopup(infoStr));
        } else if (getMaskData.features[i].properties.mask_adult + getMaskData.features[i].properties.mask_child >= 100 && getMaskData.features[i].properties.mask_adult + getMaskData.features[i].properties.mask_child <= 400) {
            circleMarkerOptions = {
                weight: 1.6,
                fillColor: "yellow",
                color: "black",
                opacity: 1,
                fillOpacity: .4
            };
            markers.push(L.circleMarker(getRandomLatLng(), circleMarkerOptions).addTo(map).bindPopup(infoStr));
        } else if (getMaskData.features[i].properties.mask_adult + getMaskData.features[i].properties.mask_child > 400) {
            circleMarkerOptions = {
                weight: 1.6,
                fillColor: "green",
                color: "black",
                opacity: 1,
                fillOpacity: .4
            };
            markers.push(L.circleMarker(getRandomLatLng(), circleMarkerOptions).addTo(map).bindPopup(infoStr));
        }
    };

    // 取得座標
    function getRandomLatLng() {
        return [
            getMaskData.features[i].geometry.coordinates[1], getMaskData.features[i].geometry.coordinates[0]
        ];
    };
};

// 圖例
L.Control.Watermark = L.Control.extend({
    onAdd: function(map) {
        let layer = L.DomUtil.create('div');
        layer.innerHTML =
            '<section class="bg-white rounded p-1" style="opacity:0.95;">' +
            '<div>紅標 : 口罩數為 0</div>' +
            '<div>橙標 : 口罩數為 <100</div>' +
            '<div>黃標 : 口罩數為 100~400</div>' +
            '<div>綠標 : 口罩數為 >400</div>' +
            '</section>';
        return layer;
    },
    onRemove: function(map) {
        // Nothing to do here
    }
});

L.control.watermark = function(opts) {
    return new L.Control.Watermark(opts);
};
L.control.watermark({
    position: 'bottomleft'
}).addTo(map);

// 定位
lc = L.control.locate({
    strings: {
        title: "定位"
    }
}).addTo(map);

var results = new L.LayerGroup().addTo(map);

// 找地點 
let searchControl = new L.esri.Controls.Geosearch().addTo(map);