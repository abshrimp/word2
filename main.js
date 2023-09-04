let answer, judge, pointdiv, keys = [];
let today = new Date();
let nextsec;

let dbName = 'database';
let storeName = 'data';
let db;

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
    document.querySelector(".sharebox a").setAttribute('href', "https://twitter.com/intent/tweet?text=〜語%27源%27で学ぶ英%27単%27語〜%0A%0A源単+-Gentan-%0A%0A%23源単%0A&url=" + encodeURIComponent(location.href));

    //DataBaseの起動
    setupDB(pointdiv);

    //目次作成
    show_up_2(1, [])

    //ボタン初期化
    let eventname = ('ontouchstart' in window || navigator.msPointerEnabled) ? 'touchstart' : 'click';
    judge = document.getElementById("judge");
    judge.addEventListener(eventname, function (e) {
        if (!e.target.closest('.synonym')) judge.style = "";
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

    document.getElementById("tutorial_cover").addEventListener(eventname, function (e) {
        e.preventDefault();
        set_tutorial();
    });
    let img1 = document.createElement('img');
    img1.src = 'tutorial.png';
    let img2 = document.createElement('img');
    img2.src = 'tutorial2.png';
}

let tutorial_counter = -1;
function set_tutorial() {
    tutorial_counter++;
    let num = tutorial_counter % 5;

    let tutorial = document.getElementById("tutorial"),
        cover = document.getElementById("tutorial_cover"),
        balloon = document.getElementsByClassName("balloon")[0],
        height = 0,
        { clientWidth, clientHeight } = document.getElementById('tutorial'),
        coverPath = `M 0 0 v ${clientHeight} h ${clientWidth} v -${clientHeight} z`;

    if (num == 0) {
        cover.style = "visibility: visible;";
        balloon.classList.remove("balloon1");
        balloon.classList.remove("balloon2");
        balloon.innerHTML = '<p>ホーム画面に追加するのがおすすめです</p><p><img class="tutorial_png" src="tutorial.png"></p><p>PCの場合は</p><p><img class="tutorial_png" src="tutorial2.png"></p><p>どこかをタップして次へ</p>';
        let load = 0;
        document.getElementsByClassName("tutorial_png")[0].addEventListener('load', (e)=> { loadimg() });
        document.getElementsByClassName("tutorial_png")[1].addEventListener('load', (e)=> { loadimg() });
        function loadimg() {
            load++;
            if(load == 2) {
                balloon.style.top = (clientHeight / 2 - balloon.clientHeight / 2) + "px";
                tutorial.style = "visibility: visible;";
            }
        }
    }
    else if (num == 1) {
        tutorial.style = "visibility: visible;";
        cover.style = "visibility: visible;";
        let wrap = document.getElementsByClassName("wrap")[0].children,
            answer = document.getElementById("answer"),
            q_text = document.getElementById("en");
        balloon.classList.remove("balloon2");
        balloon.classList.add("balloon1");
        balloon.innerHTML = "<p>単語の意味を答えよう</p><p>3文字目で正誤判定します</p>";
        for (let i = 0; i < wrap.length; i++) height += wrap[i].clientHeight;
        height -= (answer.clientHeight + balloon.clientHeight + q_text.clientHeight + 15);
        balloon.style.top = height + "px";
    
        let a = answer.getBoundingClientRect(),
            b = q_text.getBoundingClientRect(),
            path = `M ${a.left} ${b.top} h ${a.width} v ${a.height + b.height} h -${a.width} z`;
        tutorial.style.clipPath = `path('${path} ${coverPath}')`;
    }
    else if (num == 2) {
        tutorial.style = "visibility: visible;";
        cover.style = "visibility: visible;";
        let ety = document.getElementsByClassName("ety")[0],
            head = document.getElementsByClassName("head")[0];
        balloon.classList.remove("balloon1");
        balloon.classList.add("balloon2");
        balloon.innerHTML = "<p>タップして好きな単語に飛んでみよう</p>";
        balloon.style.top = (head.clientHeight + ety.clientHeight + 25) + "px";

        let a = ety.getBoundingClientRect();
            path = `M ${a.left + 30} ${a.top - 10} h ${a.width - 60} v ${a.height + 20} h -${a.width - 60} z`;
        tutorial.style.clipPath = `path('${path} ${coverPath}')`;
    }
    else if (num == 3) {
        tutorial.style = "visibility: visible;";
        cover.style = "visibility: visible;";
        let head = document.getElementsByClassName("head")[0];
        balloon.classList.remove("balloon1");
        balloon.classList.add("balloon2");
        balloon.innerHTML = "<p>JRで日本縦断の旅に出よう！</p>";
        balloon.style.top = (head.clientHeight + 15) + "px";

        let a = head.getBoundingClientRect();
            path = `M ${a.width / 2 - 80} ${a.top} h ${160} v ${a.height} h -${160} z`;
        tutorial.style.clipPath = `path('${path} ${coverPath}')`;
    }
    else if (num == 4) {
        tutorial.style = "visibility: hidden;";
        cover.style = "visibility: hidden;";
    }
}



let kana = ['あ', 'い', 'う', 'え', 'お', 'か', 'く', 'け', 'こ', 'さ', 'す', 'せ', 'そ', 'た', 'つ', 'て', 'と', 'な', 'ぬ', 'ね', 'の', 'は', 'ふ', 'へ', 'ほ', 'ま', 'む', 'め', 'も', 'や', 'ゆ', 'よ', 'ら', 'る', 'れ', 'ろ', 'わ', 'が', 'ぐ', 'げ', 'ご', 'ざ', 'ず', 'ぜ', 'ぞ', 'だ', 'ぢ', 'づ', 'で', 'ど', 'ば', 'ぶ', 'べ', 'ぼ', 'ぱ', 'ぷ', 'ぺ', 'ぽ'];
let kana2 = ['き', 'し', 'ち', 'に', 'ひ', 'み', 'り', 'ぎ', 'じ', 'び', 'ぴ']
let mini = ['ゃ', 'ゅ', 'ょ']

let repeat = 0;
let random = false;
let autoskip = true;
let results = {};
let word = "";
let ety_index = [0, 0];
let counter = 0;

window.addEventListener('focus', function () { focus = true });
window.addEventListener('blur', function () { focus = false });

function arrayShuffle(array) {
    for (let i = array.length - 1; 0 < i; i--) {
      let r = Math.floor(Math.random() * (i + 1));
      let tmp = array[i];
      array[i] = array[r];
      array[r] = tmp;
    }
    return array;
}



/**
 *  問題作成系関数
 */

let divide = "───────────";

function change_question() {
    while (true) {
        if (qList.length == 1) {
            set_qList(qList[0], true);
            break;
        }
        qList.shift();
        if (qList[0] == divide) qList.shift();
        if (!is_skip(qList[0])) {
            updateDb("qList", JSON.stringify(qList));
            word = qList[0];
            set_screen();
            break;
        }
    }
}

let historyList = [];

function set_screen() {
    //問題表示 is_skip灰色
    get_result(word)
    document.getElementById("en").innerText = word;
    let cor_num = 7;
    document.getElementById("en2").innerHTML = "";
    historyList.unshift(word + "  :  " + jp[word][0])
    for (let i = cor_num; i > 0; i--) {
        let addhtml = "";
        if (i - historyList.length >= 0) addhtml = "<p></p>";
        else if (is_skip(historyList[i])) addhtml = '<p class="cross" style="text-decoration-color: rgba(0,0,0,' + (0.4 / cor_num * (cor_num - i + 1)) + ')">' + historyList[i] + "</p>";
        else addhtml = '<p>' + historyList[i] + "</p>";
        document.getElementById("en2").innerHTML += addhtml;
    }
    document.getElementById("history").innerText = get_result(word);
    
    //ety表示
    loop: for (let i = (repeat == 0) ? 0 : ety_index[0]; i < etylist.length; i++) {
        for (let j = (i == ety_index[0] && repeat == 2) ? ety_index[1] : 0; j < etylist[i][1].length; j++) {
            let qList2 = parse_etylist(etylist[i][1][j]);
            if (qList2.includes(word)) {
                ety_index = [i, j];
                document.getElementsByClassName("ety")[0].innerHTML = '<div class="ety-text">' + (i + 1) + " " + etylist[i][0] + '</div><div class="ety-text">' + etylist[i][1][j][0];
                break loop;
            }
        }
    }
}

function parse_etylist(list) {
    //全てstrだったら返す
    let allstr = true;
    for (let i = 0; i < list.length; i++) if (typeof list[i] !== 'string') allstr = false;
    if (allstr) return list;

    //list型だったら中身たどる 語源間は空白で区切る
    let out = []
    for (let i = 0; i < list.length; i++) {
        if (Array.isArray(list[i])) {
            out = out.concat(parse_etylist(list[i]));
            if (out[out.length - 1] != divide) out.push(divide);
        }
    }
    out.pop();
    return out;
}

function set_qList(startword, loop = false, next = false) {
    qList = [];
    //全て
    if (repeat === 0) qList = parse_etylist(etylist);

    //セクション
    else if (repeat === 1) {
        for (let i = ety_index[0]; i < etylist.length; i++) {
            let qList2 = parse_etylist(etylist[i]);
            if (qList2.includes(startword)) {
                if (next) qList = parse_etylist(etylist[(i + 1) % etylist.length]);
                else qList = qList2;
                break;
            }
        }

    //語源
    } else if (repeat === 2) {
        loop: for (let i = ety_index[0]; i < etylist.length; i++) { //ループしない？
            for (let j = ety_index[1]; j < etylist[i][1].length; j++) {
                let qList2 = parse_etylist(etylist[i][1][j]);
                if (qList2.includes(startword)) {
                    if (next) {
                        if (j + 1 < etylist[i][1].length) qList = parse_etylist(etylist[i][1][j + 1]);
                        else qList = parse_etylist(etylist[(i + 1) % etylist.length][1][0]);
                    }
                    else qList = qList2;
                    break loop;
                }
            }
        }
    }
    
    if (loop) {
        if (random) qList = arrayShuffle(qList.filter(i => i !== divide))
    }
    else if (random) qList = [startword].concat(arrayShuffle(qList.filter(i => i !== divide && i !== startword)));
    else qList = qList.slice(qList.indexOf(startword));
    if (!next) {
        while (is_skip(qList[0])) {
            qList.shift();
            if (qList.length == 0) {
                alert("範囲全ての問題に2連続正解しました");
                set_qList(startword, true, true);
                return;
            }
        }
    }

    updateDb("qList", JSON.stringify(qList));
    word = qList[0];
    set_screen();
}

function is_skip(w) {
    if (!autoskip) return false;
    let res = get_result(w);
    if (res.length < 2) return false;
    else if (res.slice(-2) != "○○") return false;
    return true;
}

function get_result(w) {
    if (w in results) {
        return results[w];
    } else {
        results[w] = "";
        return "";
    }
}

function set_result(judge) {
    let cha = judge ? "○" : "×";
    results[word] += cha;
    updateDb("results", JSON.stringify(results));
}

let judge_word_length = 1;

function check(btn) {
    answer.innerText = answer.innerText + btn.children[0].innerText;
    let corrects = jp[word][1];
        continue_flag = false;
    for (let i = 0; i < corrects.length; i++) {
        if (answer.innerText == corrects[i].slice(0, judge_word_length)) {
            document.getElementById("judge_svg").innerHTML = '<g><path style="fill:none;stroke:#ff0000;stroke-width:30;" d="M 195,0 A 195,195 0 0 1 0,195 195,195 0 0 1 -195,0 195,195 0 0 1 0,-195 195,195 0 0 1 195,0 Z" /></g>';
            set_result(true);
            showans_andnext(true);
            return;
        }
        if (answer.innerText == corrects[i].slice(0, answer.innerText.length)) continue_flag = true;
    }
    if (continue_flag) change_btn();
    else {
        document.getElementById("judge_svg").innerHTML = '<g stroke="#0000ff"><line x1="-200" y1="-200" x2="200" y2="200" stroke-width="30" /><line x1="200" y1="-200" x2="-200" y2="200" stroke-width="30" /></g>';
        set_result(false);
        showans_andnext(false);
    }
}

function pass() {
    document.getElementById("judge_svg").innerHTML = '<g stroke="#0000ff"><line x1="-200" y1="-200" x2="200" y2="200" stroke-width="30" /><line x1="200" y1="-200" x2="-200" y2="200" stroke-width="30" /></g>';
    set_result(false);
    showans_andnext(false);
}

function showans_andnext(add) {
    document.getElementById("ans_en").innerHTML = word;
    document.getElementById("ans_jp").innerHTML = jp[word][0];
    let ans_ori = document.getElementById("ans_ori");
    if (word in origin) {
        ans_ori.style = "";
        ans_ori.innerHTML = origin[word];
    } else ans_ori.style = "display: none;";
    let table = document.getElementById("table"),
        synonym = document.getElementsByClassName("synonym")[0];
    synonym.style = "";
    table.innerHTML = "";
    if (relative[word][0].length > 0) table.innerHTML += '<tr><th colspan="2">＜類義語＞</tr>';
    for (let i = 0; i < relative[word][0].length; i++) table.innerHTML += '<tr><td class="syn-en">' + relative[word][0][i] + '</td><td class="syn-jp">' + jp[relative[word][0][i]][0] + '</td><tr>';
    if (relative[word][1].length > 0) table.innerHTML += '<tr><th colspan="2">＜対義語＞</tr>';
    for (let i = 0; i < relative[word][1].length; i++) table.innerHTML += '<tr><td class="syn-en">' + relative[word][1][i] + '</td><td class="syn-jp">' + jp[relative[word][1][i]][0] + '</td><tr>';
    if (table.innerHTML == "") synonym.style = "display: none;";
    else synonym.scrollTop = 0;


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

function change_btn() {
    let corrects = jp[word][1],
        btn_chas = [];
    
    for (let i = 0; i < corrects.length; i++) {
        if (corrects[i].length > answer.innerText.length && answer.innerText == corrects[i].slice(0, answer.innerText.length)) {
            let cha = corrects[i][answer.innerText.length];
            if (!btn_chas.includes(cha)) btn_chas.push(cha);
        }
    }

    let chas = kana.concat(kana2);
    if (answer.innerText.length >= 1) {
        if (answer.innerText[answer.innerText.length - 1] !== 'っ') chas.concat(['っ']);
        if (answer.innerText[answer.innerText.length - 1] !== 'ん') chas.concat(['ん']);
        if (kana2.includes(answer.innerText[answer.innerText.length - 1])) chas.concat(mini);
    }
    chas = arrayShuffle(chas.filter(i => btn_chas.indexOf(i) == -1));

    while (btn_chas.length < 3) {
        btn_chas.push(chas[0]);
        chas.shift();
    }
    
    btn_chas = arrayShuffle(btn_chas);
    for (let i = 0; i < 3; i++) keys[i].innerText = btn_chas[i];
}



/**
 *  問題並べる系関数
 */

function sort(init = false) {
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
    if (!init) set_qList(word);
}

function change_repeat(init = false) {
    let btn = document.getElementById("repeat");
    if (repeat === 0) {
        btn.innerText = "セクション";
        repeat = 1;
        updateDb("repeat", 1);
    } else if (repeat === 1) {
        btn.innerText = "語源";
        repeat = 2;
        updateDb("repeat", 2);
    } else {
        btn.innerText = "すべて";
        repeat = 0;
        updateDb("repeat", 0);
    }
    if (!init) set_qList(word);
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
    set_screen();
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
    let etylist2 = etylist;
    for (let k = 0; k < index.length; k++) {
        etylist2 = etylist2[index[k]][1];
    }
    for (let j = 0; j < etylist2.length; j++) {
        let index2 = index.concat();
        index2.push(j);
        let tr = document.createElement("tr");
        let num_td = document.createElement("td");
        num_td.className = "li-num";
        tr.appendChild(num_td);
        let td = document.createElement("td");
        td.className = "li-name";
        tr.appendChild(td);
        if (Array.isArray(etylist2[j])) {
            num_td.innerText = (number === 1) ? j + 1 : ""
            td.innerText = etylist2[j][0];
            tr.setAttribute('onclick', "show_up_2(" + (number + 1) + ", [" + String(index2) + "])");
        } else {
            td.innerText = etylist2[j];
            tr.setAttribute('onclick', 'go_out_4("' + etylist2[j] + '", [' + String(index2) + '])');
        }
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

function go_out_4(w, index) {
    for (let i = 1; i <= 3; i++) {
        divs = document.querySelectorAll(".move" + i);
        if (i !== 3) divs.forEach(div => div.style.transitionDuration = "0s");
        divs.forEach(div => div.style.left = "100%");
        remove(divs);
    }
    answer.innerText = "";
    word = w;
    ety_index = index;
    set_qList(w);
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

function close_info(flag) {
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
        if (flag) set_tutorial();
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
            if (typeof event.target.result !== 'undefined') {
                qList = JSON.parse(event.target.result.val);
                if (typeof qList[0] !== 'string') {
                    set_qList(etylist[0][1][0][1][0]);
                    info();
                }
                if (qList[0] == divide) {
                    qList.shift();
                    updateDb("qList", JSON.stringify(qList));
                }
                word = qList[0];
            }
            else {
                set_qList(etylist[0][1][0][1][0]);
                info();
            }
            let resultsdb = store_g.get("results");
            resultsdb.onsuccess = function (event2) {
                if (typeof event2.target.result !== 'undefined') results = JSON.parse(event2.target.result.val);
                answer = document.getElementsByClassName("input-text")[0];
                let skipdb = store_g.get("skip");
                skipdb.onsuccess = function (event3) {
                    if (typeof event3.target.result !== 'undefined') {
                        autoskip = event3.target.result.val !== "true";
                    }
                    skip(); //set_screen含む
                    change_btn();
                }
            }
        }

        let sortdb = store_g.get("random");
        sortdb.onsuccess = function (event) {
            if (typeof event.target.result !== 'undefined') {
                random = event.target.result.val !== "true";
                sort(true);
            }
        }

        let repeatdb = store_g.get("repeat");
        repeatdb.onsuccess = function (event) {
            if (typeof event.target.result !== 'undefined') {
                repeat = (event.target.result.val + 2) % 3;
                change_repeat(true);
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

