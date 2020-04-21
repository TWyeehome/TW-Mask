var app = new Vue({
    el: '#app',
    data: {
        map_ajax: '',
        markers: [],
    },
    created: function() {
        this.map_data();
    },
    methods: {
        map_data: function() {
            let circleMarkerOptions = null;
            let infoStr = '';
            let get_mask = new XMLHttpRequest();
            get_mask.open('GET', 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json?fbclid=IwAR2vd7FqcvO-XHnvXfFLwzb54ulKEEUc1Is0FN3UepRU_Z2Wk49fa50o1C4', true);
            get_mask.send(null);
            get_mask.onload = () => {
                let get_mask_data = JSON.parse(get_mask.responseText);
                this.map_ajax = JSON.parse(get_mask.responseText);

                // 渲染 
                for (var i = 0; i < get_mask_data.features.length; i++) {
                    // 內文
                    infoStr =
                        '<div class="border-bottom">名稱 : ' + get_mask_data.features[i].properties.name + '</div>' +
                        '<div class="border-bottom my-1">電話 : ' + get_mask_data.features[i].properties.phone + '</div>' +
                        '<div class="border-bottom">地址 : ' + get_mask_data.features[i].properties.address + '</div>' +
                        '<div class="border-bottom my-1">成人口罩數量 : ' + get_mask_data.features[i].properties.mask_adult + '</div>' +
                        '<div class="border-bottom">兒童口罩數量 : ' + get_mask_data.features[i].properties.mask_child + '</div>' +
                        '<div class="border-bottom my-1">備註 : ' + get_mask_data.features[i].properties.note + '</div>';

                    // marker 顏色判定
                    if (get_mask_data.features[i].properties.mask_adult + get_mask_data.features[i].properties.mask_child == 0) {
                        circleMarkerOptions = {
                            weight: 1.6,
                            fillColor: "red",
                            color: "black",
                            opacity: 1,
                            fillOpacity: .4
                        };
                        this.markers.push(L.circleMarker(get_random_latlng(), circleMarkerOptions).addTo(map).bindPopup(infoStr));

                    } else if (get_mask_data.features[i].properties.mask_adult + get_mask_data.features[i].properties.mask_child < 100) {
                        circleMarkerOptions = {
                            weight: 1.6,
                            fillColor: "orange",
                            color: "black",
                            opacity: 1,
                            fillOpacity: .4
                        };
                        this.markers.push(L.circleMarker(get_random_latlng(), circleMarkerOptions).addTo(map).bindPopup(infoStr));
                    } else if (get_mask_data.features[i].properties.mask_adult + get_mask_data.features[i].properties.mask_child >= 100 && get_mask_data.features[i].properties.mask_adult + get_mask_data.features[i].properties.mask_child <= 400) {
                        circleMarkerOptions = {
                            weight: 1.6,
                            fillColor: "yellow",
                            color: "black",
                            opacity: 1,
                            fillOpacity: .4
                        };
                        this.markers.push(L.circleMarker(get_random_latlng(), circleMarkerOptions).addTo(map).bindPopup(infoStr));
                    } else if (get_mask_data.features[i].properties.mask_adult + get_mask_data.features[i].properties.mask_child > 400) {
                        circleMarkerOptions = {
                            weight: 1.6,
                            fillColor: "green",
                            color: "black",
                            opacity: 1,
                            fillOpacity: .4
                        };
                        this.markers.push(L.circleMarker(get_random_latlng(), circleMarkerOptions).addTo(map).bindPopup(infoStr));
                    }
                };

                // 取得座標
                function get_random_latlng() {
                    return [
                        get_mask_data.features[i].geometry.coordinates[1], get_mask_data.features[i].geometry.coordinates[0]
                    ];
                };
            };
        },
        map_search: function() {
            let map_search_data = this.map_ajax
            if (document.getElementById('search').value == '') {
                alert('請輸入關鍵字齁!');
                return
            };
            // 地圖回歸中心點
            map.setView([23.817844, 119.990917], 5);

            // 開始搜尋
            let result = '';
            let resultTotal = 0;
            for (let num = 0; num < map_search_data.features.length; num++) {
                if (map_search_data.features[num].properties.name.indexOf(document.getElementById('search').value) != -1) {
                    //console.log(map_search_data.features[num].properties.county);
                    result += '<a href="#" class="result-link d-block border" style="padding:2px 8px; margin:2px 0;" data-info="' + num + '">' + map_search_data.features[num].properties.name + ' - ' + map_search_data.features[num].properties.county + '</a>';
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
                    map.setView([map_search_data.features[document.querySelectorAll('.result-link')[x].dataset.info].geometry.coordinates[1], map_search_data.features[document.querySelectorAll('.result-link')[x].dataset.info].geometry.coordinates[0]], 25);
                    this.markers[document.querySelectorAll('.result-link')[x].dataset.info].openPopup();
                });
            };
        },
    }
});

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
    fullscreenControlOptions: {
        title: '全螢幕',
        titleCancel: '離開全螢幕'
    }
});

let myRenderer = L.canvas({
    padding: 0
});

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