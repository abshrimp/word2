let answer, judge, pointdiv, keys = [];
let today = new Date();
let nextsec;

let dbName = 'database';
let storeName = 'data';
let db;
let start_count = 0;

window.onload = function () {
    //サービスワーカー登録
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register("service-worker.js")
            .then(function (registration) {
                console.log("serviceWorker_registed.");
            }).catch(function (error) {
                console.warn("serviceWorker_error.", error);
            });
    }

    pointdiv = document.getElementsByClassName("point")[0];
    document.querySelector(".sharebox a").setAttribute('href', "https://twitter.com/intent/tweet?text=〜語%22源%22で学ぶ英%22単%22語〜%0A%0A源単+-Gentan-%0A%0A%23源単%0A&url=" + encodeURIComponent(location.href));

    //DataBaseの起動
    setupDB(pointdiv);

    //目次一枚目作成
    let table = document.getElementById("move1");
    for (let i = 0; i < questions.length; i++) {
        let tr = document.createElement("tr");
        let num = document.createElement("td");
        num.innerText = (i + 1);
        num.className = "li-num";
        tr.appendChild(num);
        let td = document.createElement("td");
        td.innerText = questions[i][0];
        td.className = "li-name";
        tr.appendChild(td);
        table.appendChild(tr);
    }
    show_up_2(1, [])

    //ボタン初期化
    let eventname = ('ontouchstart' in window || navigator.msPointerEnabled) ? 'touchstart' : 'click';
    judge = document.getElementById("judge");
    judge.addEventListener(eventname, function (e) {
        e.preventDefault();
        this.style = "";
    });
    for (let i = 0; i < 3; i++) keys[i] = document.getElementsByClassName("input-btn")[i];
    for (let i = 0; i < 3; i++) {
        document.getElementsByClassName("w-input-btn")[i].addEventListener(eventname, function (e) {
            e.preventDefault();
            check(this);
        });
    }

    //アラート初期化
    let alert = document.getElementById("alert");
    alert.addEventListener('transitionend', (e) => { if (e.target.style.transform === "") e.target.style = "" });

    function loop() {
        setTimeout(function () {
            if (point !== undefined) mapinit3(true);
            else loop();
        }, 100);
    }
    loop();
}

let kana = ['あ', 'い', 'う', 'え', 'お', 'か', 'く', 'け', 'こ', 'さ', 'す', 'せ', 'そ', 'た', 'つ', 'て', 'と', 'な', 'ぬ', 'ね', 'の', 'は', 'ふ', 'へ', 'ほ', 'ま', 'む', 'め', 'も', 'や', 'ゆ', 'よ', 'ら', 'る', 'れ', 'ろ', 'わ', 'が', 'ぐ', 'げ', 'ご', 'ざ', 'ず', 'ぜ', 'ぞ', 'だ', 'ぢ', 'づ', 'で', 'ど', 'ば', 'ぶ', 'べ', 'ぼ', 'ぱ', 'ぷ', 'ぺ', 'ぽ'];
let kana2 = ['き', 'し', 'ち', 'に', 'ひ', 'み', 'り', 'ぎ', 'じ', 'び', 'ぴ']
let mini = ['ゃ', 'ゅ', 'ょ']

let repeat = 0;
let before_repeat = 0;
let random = false;
let before_random = false;
let qList = [];
let autoskip = true;
let allautoskip = "";
let results = {};
let qNum = [];
let question = ["<>", "", "", ["", "", "", "", []]];
let questions_dimension = (GetDimension(questions.concat()) + 1) / 2;
let counter = 0;
let focus = true;
let alert_yet = true;

window.addEventListener('focus', function () { focus = true });
window.addEventListener('blur', function () { focus = false });


//配列が何次元か
function GetDimension(obj) {
    let res = 0;
    while (Object.prototype.toString.call(obj) === '[object Array]') {
        res++;
        obj = obj[1];
    }
    return res;
}



/**
 *  問題作成系関数
 */

function change_question(init = false) {
    //答え表示
    let ans_en = document.getElementById("ans_en");
    ans_en.innerHTML = question[0].match(/<(.*)>/)[1];
    let ans_jp = document.getElementById("ans_jp");
    ans_jp.innerHTML = question[1];
    document.getElementById("ans_en2").innerHTML = question[3][2];
    if (question[0].match(/<(.*)>/)[1] === question[3][2]) ans_en.innerHTML = "";
    document.getElementById("ans_jp2").innerHTML = question[3][3];
    if (question[1] === question[3][3]) ans_jp.innerHTML = "";
    let synonym = document.getElementsByClassName("synonym")[0];
    synonym.innerHTML = "";
    for (let i = 0; i < question[3][4].length; i++) {
        let div = document.createElement("div");
        div.className = "synonym2";
        div.innerHTML = '<div class="synonym3 flex"><span style="font-size: 14px;">' + showedNum(question[3][4][i][0]) + '</span><span style="font-size: 20px; font-weight: bold;">' + question[3][4][i][1]
         + '</span></div><div style="font-size: 16px;">' + question[3][4][i][2] + '</div>';
        synonym.appendChild(div);
    }
    if (question[3][4].length === 0) synonym.style = "visibility: hidden;";
    else synonym.style = "";



    before_num = qNum.concat();
    before_list = qList.concat();
    if (qList.length === 0 || random !== before_random || repeat !== before_repeat) {
        before_random = random;
        updateDb("before_random", String(before_random));
        before_repeat = repeat;
        updateDb("before_repeat", before_repeat);
        set_qList();
        allautoskip = check_allautoskip();
    }
    if (allautoskip === "") allautoskip = check_allautoskip();
    let res;
    while (true) {
        if (!init) qList.shift();
        if (qList.length === 0) {
            set_qList();
            allautoskip = check_allautoskip();
        }
        qNum = qList[0];
        question2 = getq();
        res = get_result(question2[3][1][0]);
        if (!(autoskip && !allautoskip && check_autoskip(res)) || init) {
            question = question2;
            break;
        }
    }
    if (before_num[0] === qNum[0] && before_num[1] === qNum[1]) {
        autoskip = false;
        qList = before_list;
        change_question()
        autoskip = true;
    } else {
        updateDb("qList", JSON.stringify(qList));
        let en = question[0].replace("<", "<span*").replace(">", "</span>").replace("*", ">")
        document.getElementById("en").innerHTML = en;
        document.getElementById("history").innerHTML = res;
        if (autoskip && allautoskip && alert_yet) {
            alert("範囲全ての問題に2連続正解しました");
            let max = 0,
                last = questions.length - 1;
            for (let i = 0; i < qList.length; i++) if (max < qList[i][0]) max = qList[i][0];
            if (max === questions[last][questions[last].length - 1][questions[last][questions[last].length - 1].length - 1][0][0]) go_out_4(0);
            else go_out_4(max + 1);
            alert_yet = false;
        }
    }
}

function getq(num = qNum) {
    for (let i = 0; i < questions.length; i++) {
        for (let j = 1; j < questions[i].length; j++) {
            for (let k = 1; k < questions[i][j].length; k++) {
                if (questions[i][j][k][0][0] === num[0]) {
                    document.getElementsByClassName("ety")[0].innerHTML = '<div class="ety-text">' + (i + 1) + " " + questions[i][0] + '</div><div class="ety-text">' + questions[i][j][0];
                    return questions[i][j][k][num[1]].concat([questions[i][j][k][0]]);
                }
            }
        }
    }
}

function set_qList() {
    let range = [];
    if (repeat === 0) {
        for (let i = 0; i < questions.length; i++) {
            for (let j = 1; j < questions[i].length; j++) {
                for (let k = 1; k < questions[i][j].length; k++) {
                    for (let l = 1; l < questions[i][j][k].length; l++) {
                        range.push([questions[i][j][k][0][0], l]);
                    }
                }
            }
        }
    } else if (repeat === 1) {
        loop: for (let i = 0; i < questions.length; i++) {
            for (let j = 1; j < questions[i].length; j++) {
                for (let k = 1; k < questions[i][j].length; k++) {
                    if (questions[i][j][k][0][0] === qNum[0]) {
                        for (let j = 1; j < questions[i].length; j++) {
                            for (let k = 1; k < questions[i][j].length; k++) {
                                for (let l = 1; l < questions[i][j][k].length; l++) {
                                    range.push([questions[i][j][k][0][0], l]);
                                }
                            }
                        }
                        break loop;
                    }
                }
            }
        }
    } else if (repeat === 2) {
        loop: for (let i = 0; i < questions.length; i++) {
            for (let j = 1; j < questions[i].length; j++) {
                for (let k = 1; k < questions[i][j].length; k++) {
                    if (questions[i][j][k][0][0] === qNum[0]) {
                        for (let k = 1; k < questions[i][j].length; k++) {
                            for (let l = 1; l < questions[i][j][k].length; l++) {
                                range.push([questions[i][j][k][0][0], l]);
                            }
                        }
                        break loop;
                    }
                }
            }
        }
    }
    if (random) {
        for (let i = (range.length - 1); 0 < i; i--) {
            let r = Math.floor(Math.random() * (i + 1));
            let tmp = range[i];
            range[i] = range[r];
            range[r] = tmp;
        }
        if (qList.length !== 0) {
            for (let i = 0; i < range.length; i++) {
                if (range[i][0] === qList[0][0] && range[i][1] === qList[0][1]) {
                    range.splice(i, 1);
                    break;
                }
            }
            range.unshift(qList[0]);
        }
    } else if (qList.length !== 0) {
        for (let i = 0; i < range.length; i++) {
            if (range[i][0] < qList[0][0] || (range[i][0] === qList[0][0] && range[i][1] < qList[0][1])) {
                range.splice(i, 1);
                i--;
            }
        }
    }
    qList = range;
    updateDb("qList", JSON.stringify(range));
}

function get_result(key) {
    if (key in results) {
        return results[key];
    } else {
        results[key] = "";
        return "";
    }
}

function set_result(judge) {
    let cha = judge ? "○" : "×";
    results[question[3][1][0]] += cha;
    updateDb("results", JSON.stringify(results));
}

function check_autoskip(res) {
    let count = 2;
    if (res.length < count) return false;
    for (let i = 0; i < count; i++) {
        if (res[res.length - 1 - i] !== "○") return false;
    }
    alert_yet = true;
    return true;
}

function check_allautoskip() {
    for (let i = 0; i < qList.length; i++) {
        if (!check_autoskip(get_result(getq(qList[i])[3][1][0]))) return false;
    }
    return true;
}

function check(btn) {
    answer.innerText = answer.innerText + btn.children[0].innerText;
    if (question[2][answer.innerText.length - 1] !== btn.children[0].innerText) {
        document.getElementById("judge_svg").innerHTML = '<g stroke="#0000ff"><line x1="-200" y1="-200" x2="200" y2="200" stroke-width="30" /><line x1="200" y1="-200" x2="-200" y2="200" stroke-width="30" /></g>';
        set_result(false);
        show_ans(false);
    } else if (answer.innerText.length <= 2 && answer.innerText.length < question[2].length) {
        change_btn();
    } else {
        document.getElementById("judge_svg").innerHTML = '<g><path style="fill:none;stroke:#ff0000;stroke-width:30;" d="M 195,0 A 195,195 0 0 1 0,195 195,195 0 0 1 -195,0 195,195 0 0 1 0,-195 195,195 0 0 1 195,0 Z" /></g>';
        set_result(true);
        show_ans(true);
    }
}

function pass() {
    document.getElementById("judge_svg").innerHTML = '<g stroke="#0000ff"><line x1="-200" y1="-200" x2="200" y2="200" stroke-width="30" /><line x1="200" y1="-200" x2="-200" y2="200" stroke-width="30" /></g>';
    set_result(false);
    show_ans(false);
}

function show_ans(add) {
    pointdiv.classList.remove("zoom-in");
    judge.style = "visibility: visible;";
    answer.innerText = "";
    if (add) pointdiv.innerText = ((Number(pointdiv.innerText) * 10 + 0.5 * 10) / 10).toFixed(1);
    else pointdiv.innerText = ((Number(pointdiv.innerText) * 10 + 0.1 * 10) / 10).toFixed(1);
    pointdiv.classList.add("zoom-in");
    change_question();
    change_btn();
    if (add) {
        process(0.3);
        process(0.2);
    } else process(0.1);
}

function showedNum(num) {
    if (num >= 10000) {
        num = String(num);
        num = "S" + num.slice(1);
        return String(num);
    } else {
        return String(num).padStart(4, '0');
    }
}

function change_btn() {
    let list = kana.concat(kana2);
    if (answer.innerText.length >= 1) {
        if (answer.innerText[answer.innerText.length - 1] !== 'っ') list.concat(['っ']);
        if (answer.innerText[answer.innerText.length - 1] !== 'ん') list.concat(['ん']);
        if (kana2.includes(answer.innerText[answer.innerText.length - 1])) list.concat(mini);
    }
    let correct = question[2][answer.innerText.length];
    let correctbtn = Math.floor(Math.random() * 3);
    keys[correctbtn].innerText = correct;
    list.splice(list.indexOf(correct), 1)
    for (let i = 0; i < 3; i++) {
        if (i === correctbtn) continue;
        let num = Math.floor(Math.random() * list.length);
        let cha = list[num];
        keys[i].innerText = cha;
        list.splice(num, 1);
    }
}



/**
 *  問題並べる系関数
 */

function sort() {
    let btn = document.getElementById("sort");
    if (random) {
        btn.innerText = "番号順";
        random = false;
        updateDb("random", "false");
    } else {
        btn.innerText = "ランダム";
        random = true;
        updateDb("random", "true");
    }
}

function change_repeat(init = false) {
    let btn = document.getElementById("repeat");
    if ((!init && repeat === 0) || (init && repeat === 1)) {
        btn.innerText = "セクション";
        repeat = 1;
        updateDb("repeat", 1);
    } else if ((!init && repeat === 1) || (init && repeat === 2)) {
        btn.innerText = "語源";
        repeat = 2;
        updateDb("repeat", 2);
    } else {
        btn.innerText = "すべて";
        repeat = 0;
        updateDb("repeat", 0);
    }
}

function skip() {
    let btn = document.getElementById("skip");
    if (autoskip) {
        btn.innerText = "OFF";
        autoskip = false;
        updateDb("skip", "false");
    } else {
        btn.innerText = "ON";
        autoskip = true;
        updateDb("skip", "true");
    }
}



/**
 *  UI系関数
 */

window.onresize = function () {
    let size = document.documentElement.clientWidth + "px";
    document.getElementsByClassName("wrap")[0].style.width = size;
    document.querySelectorAll("table").forEach(item => item.style.width = size);
}

function show_up_1() {
    let divs = document.querySelectorAll(".move1");
    divs.forEach(div => div.style.left = "0%");
}

function show_up_2(number, index) {
    let a = "move" + (number - 1);
    let b = "move" + number;
    let table = document.getElementById(b);
    table.innerHTML = "";
    let questions2 = questions;
    for (let k = 0; k < index.length; k++) {
        questions2 = questions2[index[k]];
    }
    let j = (number === 1) ? 0 : 1;
    for (; j < questions2.length; j++) {
        let index2 = index.concat();
        index2.push(j);
        let tr = document.createElement("tr");
        let num_td = document.createElement("td");
        num_td.className = "li-num";
        tr.appendChild(num_td);
        let td = document.createElement("td");
        td.className = "li-name";
        tr.appendChild(td);
        if (Array.isArray(questions2[j][0])) {
            num_td.innerText = showedNum(questions2[j][0][1][0])
            td.innerText = questions2[j][0][2];
        } else {
            num_td.innerText = (number === 1) ? j + 1 : ""//j;
            td.innerText = questions2[j][0];
        }
        if (number + 1 <= questions_dimension) tr.setAttribute('onclick', "show_up_2(" + (number + 1) + ", [" + String(index2) + "])");
        else tr.setAttribute('onclick', "go_out_4(" + questions2[j][0][0] + ")");
        table.appendChild(tr);
    }

    if (number !== 1) {
        let divs = document.querySelectorAll("." + b);
        divs.forEach(div => div.style.left = "0%");

        divs = document.querySelectorAll("." + a);
        divs.forEach(div => div.style.left = "-100%");
    }
}

function show_up_3() {
    if (document.getElementById("loading") != null) document.getElementById("loading").style.visibility = "visible";
    mapinit();
    let divs = document.querySelectorAll(".move5");
    divs.forEach(div => div.style.top = "0%");
}

function go_out_1() {
    let divs = document.querySelectorAll(".move1");
    divs.forEach(div => div.style.left = "100%");
}

function go_out_2(a, b) {
    let divs = document.querySelectorAll(a);
    divs.forEach(div => div.style.left = "0%");

    divs = document.querySelectorAll(b);
    divs.forEach(div => div.style.left = "100%");
}

function go_out_3() {
    let divs = document.querySelectorAll(".move5");
    divs.forEach(div => div.style.top = "100%");
}

function go_out_4(num) {
    for (let i = 1; i <= questions_dimension; i++) {
        divs = document.querySelectorAll(".move" + i);
        if (i !== questions_dimension) divs.forEach(div => div.style.transitionDuration = "0s");
        divs.forEach(div => div.style.left = "100%");
        remove(divs);
    }
    qList = [[num, 1]];
    updateDb("qList", JSON.stringify(qList));
    qNum = qList[0];
    question = getq();
    res = get_result(question[3][1][0]);
    let en = question[0].replace("<", "<span*").replace(">", "</span>").replace("*", ">")
    document.getElementById("en").innerHTML = en;
    document.getElementById("history").innerHTML = res;
    change_btn();
    function remove(divs) {
        setTimeout(function () {
            divs.forEach(div => div.style.transitionDuration = "");
        }, 1);
    }
}

function info() {
    document.getElementById("info-main").animate(
        [
            { transform: 'scale(0.3, 0.3)' },
            { transform: 'scale(1, 1)' }
        ],
        {
            duration: 200,
            easing: "ease-out",
            fill: "forwards"
        }
    );
    document.getElementById("info").style.visibility = "visible";
}

function setting() {
    document.getElementById("setting-main").animate(
        [
            { transform: 'scale(0.3, 0.3)' },
            { transform: 'scale(1, 1)' }
        ],
        {
            duration: 200,
            easing: "ease-out",
            fill: "forwards"
        }
    );
    document.getElementById("setting").style.visibility = "visible";
}

function close_setting() {
    document.getElementById("setting-main").animate(
        [
            { transform: 'scale(1, 1)' },
            { transform: 'scale(0, 0)' }
        ],
        {
            duration: 200,
            easing: "ease-in",
            fill: "forwards"
        }
    );
    setTimeout(function () {
        document.getElementById("setting").style.visibility = "hidden";
    }, 300)
}

function close_info() {
    document.getElementById("info-main").animate(
        [
            { transform: 'scale(1, 1)' },
            { transform: 'scale(0, 0)' }
        ],
        {
            duration: 200,
            easing: "ease-in",
            fill: "forwards"
        }
    );
    setTimeout(function () {
        document.getElementById("info").style.visibility = "hidden";
    }, 300)
}

function vis_alert(flag) {
    let btn = document.getElementById("vis_alert");
    if (flag === undefined) flag = btn.innerText === "ON"
    if (flag) {
        btn.innerText = "OFF";
        is_vis_alert = false;
        updateDb("alert", "OFF");
    } else {
        btn.innerText = "ON";
        is_vis_alert = true;
        updateDb("alert", "ON");
    }
}

function shareClick(msg) {
    if (msg !== undefined) var msg2 = msg.replaceAll("%0A", " ")
    else var msg2 = '源単 -Gentan-';
    if (navigator.share) {
        navigator.share({
            title: '源単 -Gentan-',
            text: msg2,
            url: location.href,
        });
    } else if (window.clipboardData) {
        window.clipboardData.setData('Text', msg2 + " " + location.href);
        alert("リンクをコピーしました");
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(msg2 + " " + location.href).then(() => {
            alert("リンクをコピーしました");
        });
    } else {
        alert("リンクコピーに対応していません");
    }
}



/**
 *  データベース系関数
 */

/*let request = indexedDB.deleteDatabase(dbName);
request.onsuccess = function (event) { console.log('DBの削除に成功しました'); }
request.onerror = function () { console.log('DBの削除に失敗しました'); }*/

function setupDB(pointdiv) {
    let openReq = indexedDB.open(dbName, '1');

    //DBのバージョン更新(DBの新規作成も含む)時のみ実行
    openReq.onupgradeneeded = function (event) {
        let db = event.target.result;
        const objectStore = db.createObjectStore(storeName, { keyPath: 'id' })
        objectStore.createIndex("id", "id", { unique: true });
        objectStore.createIndex("val", "val", { unique: false });
        console.log('DB更新');
    }

    //onupgradeneededの後に実行。更新がない場合はこれだけ実行
    openReq.onsuccess = function (event) {
        db = event.target.result;
        let trans_g = db.transaction(storeName, 'readonly');
        let store_g = trans_g.objectStore(storeName);

        let datedb = store_g.get("today");
        datedb.onsuccess = function (event) {
            if (typeof event.target.result !== 'undefined') today = new Date(event.target.result.val);
            else updateDb("today", new Date().toDateString());

            let count1 = store_g.get("yesterday_counter");
            count1.onsuccess = function (event2) {
                if (typeof event2.target.result !== 'undefined') {
                    let cnt = event2.target.result.val;
                    document.getElementById("yesterday").innerHTML = Math.floor(cnt / 3600) + "時間 " + Math.floor(cnt % 3600 / 60) + "分 " + cnt % 60 + "秒";
                } else document.getElementById("yesterday").innerHTML = "0時間 0分 0秒";

                let count2 = store_g.get("today_counter");
                count2.onsuccess = function (event3) {
                    if (typeof event3.target.result !== 'undefined') counter = event3.target.result.val;

                    nextsec = Math.floor(new Date() / 1000) * 1000 + 1000;
                    setInterval(function () {
                        if (nextsec <= new Date()) {
                            if (focus) {
                                counter++;
                                updateDb("today_counter", counter);
                                document.getElementById("today").innerHTML = Math.floor(counter / 3600) + "時間 " + Math.floor(counter % 3600 / 60) + "分 " + counter % 60 + "秒";
                                let now = new Date();
                                if (today.getFullYear() !== now.getFullYear() || today.getMonth() !== now.getMonth() || today.getDate() !== now.getDate()) {
                                    let yesterday = new Date();
                                    yesterday.setDate(yesterday.getDate() - 1);
                                    if (today.getFullYear() === yesterday.getFullYear() && today.getMonth() === yesterday.getMonth() && today.getDate() === yesterday.getDate()) {
                                        updateDb("yesterday_counter", counter);
                                        document.getElementById("yesterday").innerHTML = Math.floor(counter / 3600) + "時間 " + Math.floor(counter % 3600 / 60) + "分 " + counter % 60 + "秒";
                                    } else {
                                        updateDb("yesterday_counter", 0);
                                        document.getElementById("yesterday").innerHTML = "0時間 0分 0秒";
                                    }
                                    counter = 0;
                                    today = new Date();
                                    updateDb("today", today.toDateString());
                                }
                            }
                            nextsec = Math.floor(new Date() / 1000) * 1000 + 1000;
                        }
                    }, 10);
                }
            }
        }

        let pointdb = store_g.get("point");
        pointdb.onsuccess = function (event) {
            if (typeof event.target.result === 'undefined') {
                point = 0;
                pointdiv.innerText = (point / 10).toFixed(1);
            } else {
                point = event.target.result.val;
                pointdiv.innerText = (point / 10).toFixed(1);
            }
        }

        let qListdb = store_g.get("qList");
        qListdb.onsuccess = function (event) {
            if (typeof event.target.result !== 'undefined') qList = JSON.parse(event.target.result.val);
            else info();
            let resultsdb = store_g.get("results");
            resultsdb.onsuccess = function (event2) {
                if (typeof event2.target.result !== 'undefined') results = JSON.parse(event2.target.result.val);
                answer = document.getElementsByClassName("input-text")[0];
                change_question(true);
                change_btn(true);
            }
        }

        let sortdb = store_g.get("random");
        sortdb.onsuccess = function (event) {
            let before_db = store_g.get("before_random");
            before_db.onsuccess = function (event2) {
                if (typeof event2.target.result !== 'undefined') before_random = event2.target.result.val === "true";
                if (typeof event.target.result !== 'undefined') {
                    random = event.target.result.val !== "true";
                    sort();
                }
            }
        }

        let repeatdb = store_g.get("repeat");
        repeatdb.onsuccess = function (event) {
            if (typeof event.target.result !== 'undefined') {
                let before_db = store_g.get("before_repeat");
                before_db.onsuccess = function (event2) {
                    if (typeof event2.target.result !== 'undefined') before_repeat = event2.target.result.val;
                    repeat = event.target.result.val;
                    change_repeat(true);
                }
            }
        }

        let skipdb = store_g.get("skip");
        skipdb.onsuccess = function (event) {
            if (typeof event.target.result !== 'undefined') {
                autoskip = event.target.result.val !== "true";
                skip();
            }
        }

        let alertdb = store_g.get("alert");
        alertdb.onsuccess = function (event) {
            if (typeof event.target.result !== 'undefined') vis_alert(event.target.result.val === "OFF")
        }
    }
}

function updateDb(id, val) {
    let trans = db.transaction(storeName, "readwrite");
    let store = trans.objectStore(storeName);
    return store.put({
        id: id,
        val: val
    });
}

