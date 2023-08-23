let map,
    data = [],   //geojson
    stations,
    data4,  //途中までの道のり（赤）
    point,  //最初に入る 整数
    sum,    //片道
    sum2,   //片端から手前の駅まで
    index,  //geojson index
    index2, //stations index
    marker, //現在地
    alertstr,   //information
    timeoutid = "",
    is_vis_alert = true,
    sharestr = ""


async function mapinit() {
    if (map === undefined) {
        await fetch("all.geojson")
            .then(response => response.json())
            .then(d => {
                data = d.features;
                mapinit2();
            });
    }
}

function distance(a, b) {
    let e = 100000;
    return Math.sqrt((Math.floor(a[0] * e) - Math.floor(b[0] * e)) ** 2
        + (Math.floor(a[1] * e) - Math.floor(b[1] * e)) ** 2);
}

function mapinit2() {
    mapboxgl.accessToken = 'pk.eyJ1IjoidGVtcGxhdGUtbWFwIiwiYSI6ImNsYm5kcnNsNjA4Z20zd3FobjQ2NGxoZ3kifQ.rZwMCSor7Scsih_oXSxizg';
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/template-map/clbndt1fc000014ozs624l6fa',
        center: [139.767, 35.681],
        zoom: 12
    });
    map.on('load', function () {
        let data2 = [], //駅（青）
            data3 = [], //駅間（緑）
            type = "FeatureCollection";
        for (let i in data) {
            if (!("name" in data[i].properties)) data2.push(data[i]);
            else data3.push(data[i]);
        }
        data2 = {
            "type": type,
            "features": data2
        };
        data3 = {
            "type": type,
            "features": data3
        };
        data4 = {
            "type": type,
            "features": []
        }
        map.addSource('data2', { type: 'geojson', data: data2 });
        map.addLayer({
            id: 'data2',
            type: 'line',
            source: 'data2',
            paint: {
                'line-color': 'green',
                'line-width': 3,
            }
        });
        map.addSource('data3', { type: 'geojson', data: data3 });
        map.addLayer({
            id: 'data3',
            type: 'line',
            source: 'data3',
            paint: {
                'line-color': 'blue',
                'line-width': 6,
            }
        });
        map.addSource('data4', { type: 'geojson', data: data4 });
        map.addLayer({
            id: 'data4',
            type: 'line',
            source: 'data4',
            paint: {
                'line-color': 'red',
                'line-width': 3,
            }
        });

        marker = new mapboxgl.Marker()
            .setLngLat([0, 0])
            .addTo(map);

        mapinit3(true);
        document.getElementById("loading").remove();
    });

    const nav = new mapboxgl.NavigationControl({
        visualizePitch: true,
        showZoom: false
    });
    map.addControl(nav, 'bottom-right');
}


function mapinit3(init) {
    if (init) {
        sum = 0;
        stations = JSON.parse(JSON.stringify(stations_orig));
        stations.forEach(e => sum += e[1] * 10);
    } else {
        if (map !== undefined) data4.features = [];
    }
    let sum3 = point % sum; //端から現在地まで
    if ((Math.floor(point / sum) % 2 === 1 && init) || !init) {
        data.forEach(e => e.geometry.coordinates.reverse());
        data.reverse();
        stations.reverse();
        for (let i = 0; i < stations.length - 1; i++) {
            stations[i][1] = stations[i + 1][1];
            stations[i][3] = stations[i + 1][3];
        }
        stations[stations.length - 1][1] = 0;
    }
    sum2 = 0;
    for (let i in stations) {
        let sum2_2 = sum2 + stations[i][1] * 10;
        if (sum3 < sum2_2) {
            index2 = Number(i);
            if (map === undefined) {
                if (!init) arrive(stations[0][0], true);
                break;
            }
            update();
            let st = stations[index2], line;
            for (let ii = data.length - 1; ii >= 0; ii--) {
                if ("name" in data[ii].properties) {
                    if (data[ii].properties.name === st[0]) {
                        index = ii + 1;
                        line = data[index].geometry.coordinates;
                        for (let j = 0; j < index; j++) if (!("name" in data[j].properties)) data4.features.push(data[j]);
                        break;
                    }
                }
            }
            let sum4 = 0, sum5;    //駅間, 直前の駅から現在地 (どちらも座標上)
            if (!init) {
                line = data[index - 1].geometry.coordinates;    //駅の中央
                for (let ii = 0; ii < line.length - 1; ii++) sum4 += distance(line[ii + 1], line[ii]);
                sum5 = sum4 / 2;
                map.getSource('data4').setData(data4);
                arrive(stations[0][0], true);
            } else {
                for (let ii = 0; ii < line.length - 1; ii++) sum4 += distance(line[ii + 1], line[ii]);
                sum5 = sum4 * ((sum3 - sum2) / (st[1] * 10));
            }
            let data5 = {
                "properties": {},
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": []
                }
            }
            data4.features.push(data5);
            let sum4_2 = 0;
            for (let ii = 0; ii < line.length - 1; ii++) {
                if (init) data5.geometry.coordinates.push(line[ii]);
                let sum4_3 = sum4_2 + distance(line[ii + 1], line[ii]);
                if (sum5 < sum4_3 || ii + 2 === line.length) {
                    let per1 = (sum5 - sum4_2) / (sum4_3 - sum4_2),
                        per2 = 1 - per1,
                        x = per1 * line[ii + 1][0] + per2 * line[ii][0],
                        y = per1 * line[ii + 1][1] + per2 * line[ii][1];
                    let now = [x, y];
                    if (init) data5.geometry.coordinates.push(now);
                    map.getSource('data4').setData(data4);
                    marker.setLngLat(now);
                    map.jumpTo({ center: now });
                    break;
                } else sum4_2 = sum4_3;
            }
            break;
        } else sum2 = sum2_2;
    }
}

function process(add) {
    point += add * 10;
    updateDb("point", point);
    if (Math.floor((point - add * 10) / sum) !== Math.floor(point / sum)) {
        mapinit3(false);
        return;
    }
    let d2 = stations[index2][1] * 10,
        nextst = stations[index2 + 1],
        d3 = nextst[1] * 10,
        sum3 = point % sum,
        line, sum5, flag = true, sum4 = 0;
    if (sum3 - sum2 >= d2) {
        index2++;
        sum2 += d2;
        d2 = d3;
        if (map === undefined) {
            update();
            arrive(nextst[0])
            return;
        }
        for (let i = data.length - 1; i >= 0; i--) {
            if ("name" in data[i].properties) {
                if (data[i].properties.name === nextst[0]) {
                    data4.features[data4.features.length - 1] = data[index];
                    map.getSource('data4').setData(data4);
                    index = i + 1;
                    line = data[i].geometry.coordinates;
                    for (let ii = 0; ii < line.length - 1; ii++) sum4 += distance(line[ii + 1], line[ii]);
                    sum5 = sum4 / 2;
                    data4.features.push({
                        "properties": {},
                        "type": "Feature",
                        "geometry": { "type": "LineString", "coordinates": [] }
                    });
                    update();
                    flag = false;
                    arrive(nextst[0])
                    break;
                }
            }
        }
    } else {
        if (map === undefined) return;
        line = data[index].geometry.coordinates;
        for (let ii = 0; ii < line.length - 1; ii++) sum4 += distance(line[ii + 1], line[ii]);
        sum5 = sum4 * ((sum3 - sum2) / d2);
    }
    let sum4_2 = 0;
    data4.features[data4.features.length - 1].geometry.coordinates = [];
    for (let i = 0; i < line.length - 1; i++) {
        data4.features[data4.features.length - 1].geometry.coordinates.push(line[i]);
        let sum4_3 = sum4_2 + distance(line[i + 1], line[i]);
        if (sum5 < sum4_3 || i + 2 === line.length) {
            let per1 = (sum5 - sum4_2) / (sum4_3 - sum4_2),
                per2 = 1 - per1,
                x = per1 * line[i + 1][0] + per2 * line[i][0],
                y = per1 * line[i + 1][1] + per2 * line[i][1];
            let now = [x, y];
            data4.features[data4.features.length - 1].geometry.coordinates.push(now);
            if (flag) {
                map.getSource('data4').setData(data4);
                document.getElementById("fromst").innerText = "スタートから" + (point / 10).toFixed(1) + "km";
                document.getElementById("between").innerText = "次の駅まで\nあと" + ((stations[index2][1] * 10 + sum2 - sum3) / 10).toFixed(1) + "km";
            }
            marker.setLngLat(now);
            map.flyTo({ center: now });
            break;
        } else sum4_2 = sum4_3;
    }
}

function update() {
    let i = index2,
        startst = stations[0][0].replace("2", ""),
        alert1 = stations[i][0].replace("2", "") + "\n" + stations[i][2] + "\n" + stations[i][4] + "\n\n"
            + startst + "から" + (sum2 / 10).toFixed(1) + "km地点\n" + startst + "から数えて" + i + "駅目",
        alert2 = stations[i + 1][0].replace("2", "") + "\n" + stations[i + 1][2] + "\n" + stations[i + 1][4] + "\n\n"
            + startst + "から" + (sum2 / 10 + stations[i][1]).toFixed(1) + "km地点\n" + startst + "から数えて" + (i + 1) + "駅目";
    alertstr = [alert1, alert2]
    sharestr = "源単 -Gentan- で" + stations[i][0].replace("2", "") + "(" + stations[i][4] + ")" + "に到着！%0Aスタートから" + (point / 10) + "km進んでるよ！%0A%0A";
    document.querySelector(".alert a").setAttribute('href', "https://twitter.com/intent/tweet?text=" + sharestr + "%23源単%0A&url=" + encodeURIComponent(location.href));
    document.getElementById("fromst").innerText = "スタートから" + (point / 10).toFixed(1) + "km";
    document.getElementById("st1").innerText = stations[i][0].replace("2", "");
    document.getElementById("st1kana").innerText = stations[i][2];
    document.getElementById("st2").innerText = stations[i + 1][0].replace("2", "");
    document.getElementById("st2kana").innerText = stations[i + 1][2];
    document.getElementById("wayname").innerText = stations[i][3];
    document.getElementById("between").innerText = "次の駅まで\nあと" + ((stations[i][1] * 10 + sum2 - (point % sum)) / 10).toFixed(1) + "km";
}

function arrive(st, goal = false) {
    console.log(st.replace("2", "") + "に到着しました");
    if (goal) setTimeout(function () { alert(st.replace("2", "") + "に到着しました！\nゴールです！") }, 100);
    let pop = document.getElementById('alert');
    pop.children[0].innerText = st.replace("2", "") + "に着きました";
    if (is_vis_alert) {
        pop.style = 'transform: translateY(0); visibility: visible;';
        clearTimeout(timeoutid);
        if (!goal) timeoutid = setTimeout(function () { document.getElementById('alert').style = "visibility: visible;" }, 5000);
    }
}
