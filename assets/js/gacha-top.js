// Firebase SDKのインポート
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyCGLPun0uYBMgCR1eH3lzXcEN4Q1REMyL0",
  authDomain: "tsumukichi-fd6bb.firebaseapp.com",
  projectId: "tsumukichi-fd6bb",
  storageBucket: "tsumukichi-fd6bb.appspot.com",
  messagingSenderId: "862189689025",
  appId: "1:862189689025:web:e9af0ef41ae45a13eb5c40",
  measurementId: "G-0XE4K5F37J"
};

class Box {
  constructor(contents, limit, divID, div, display) {
    this.contents = contents;
    this.limit = limit;
    this.divID = divID;
    this.div = div;
    this.display = display;
  }
  set() {
    if (!this.display) return;
    const limit = document.getElementById(this.divID).getElementsByClassName('limit')[0];
    const now = new Date();
    const diffMs = this.limit - now;
    if (diffMs < 0) {
      limit.textContent = 'すでに終了しています。';
      return;
    } else {
      const diffMin = Math.floor(diffMs / 60000) % 60;
      const diffH = Math.floor(diffMs / 3600000) % 24;
      if (diffMs < 86400 * 1000) {
        const diffS = Math.floor(diffMs / 1000) % 60;
        limit.textContent = `残り${String(diffH).padStart(2, '0')}:${String(diffMin).padStart(2, '0')}:${String(diffS).padStart(2, '0')}`;
      } else {
        const diffDay = Math.floor(diffMs / (86400 * 1000));
        limit.textContent = `残り${diffDay}日${String(diffH).padStart(2, '0')}:${String(diffMin).padStart(2, '0')}`;
      }
    }
  }
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null;

// 認証状態を監視
onAuthStateChanged(auth, user => {
  currentUser = user;
});

let tsumus = [];
let userBoxes = [];
const selectBox = new Box([], "", "select-box", document.getElementById('select-box'), false);
const pickup = new Box([], "", "pickup", document.getElementById('pickup'), false);
const main = document.getElementById('main');
const input = document.getElementById('input');

// select-boxドキュメント取得
const selectBoxPromise = getDoc(doc(db, "gacha", "select-box"));

// pickupドキュメント取得
const pickupPromise = getDoc(doc(db, "gacha", "pickup"));

let dbInstance = null; // 一度作ったdbを保持


// SQLiteデータベースからtsumus取得
const tsumuPromise = initSqlJs({
  locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
})  
// 初回だけDBを読み込む
async function initDatabase() {
  if (dbInstance) return dbInstance;

  const SQL = await tsumuPromise;
  const response = await fetch("assets/db/tsumu.db");
  const buffer = await response.arrayBuffer();
  dbInstance = new SQL.Database(new Uint8Array(buffer));
  return dbInstance;
}

// 任意のクエリを実行する
async function runQuery(sql, params = []) {
  const db = await initDatabase();
  const stmt = db.prepare(sql);
  stmt.bind(params);

  const result = [];
  while (stmt.step()) {
    result.push(stmt.get());
  }

  stmt.free();
  return result;
}

setInterval(() => {
  selectBox.set();
  pickup.set();
}, 1000); // 1秒ごとにチェック




runQuery("SELECT * FROM tsumus ORDER BY id ASC;").then(tsumusData => {
   tsumus = tsumusData;
   // --- select-box処理 ---
   selectBoxPromise.then(selectDocSnap => {
    if (selectDocSnap.exists()) {
      selectBox.div.style.display = 'block';
      selectBox.display = selectDocSnap.data().display;
      if (selectDocSnap.data().display) {
        selectBox.limit = selectDocSnap.data().limit.toDate();
        selectBox.div.getElementsByClassName('NA')[0].style.display = 'none';
        selectBox.contents = selectDocSnap.data().contents;
        selectBox.div.style.cursor = 'pointer';
        selectBox.div.addEventListener('click', () => window.location.href = "gacha-simu.html?kind=select");
        selectBox.set();
        insertRows(selectBox.contents, 'select-box');
      } else {
        selectBox.div.getElementsByClassName('NA')[0].style.display = 'block';
        selectBox.contents = [];
        selectBox.div.style.cursor = 'default';
      }
    } else {
      console.error("select-boxドキュメントが存在しません");
    }
  });
   // --- pickup処理 ---
   pickupPromise.then(pickupDocSnap => {
    if (pickupDocSnap.exists()) {
      pickup.div.style.display = 'block';
      pickup.display = pickupDocSnap.data().display;
      if (pickupDocSnap.data().display) {
        pickup.limit = pickupDocSnap.data().limit.toDate();
        pickup.div.getElementsByClassName('NA')[0].style.display = 'none';
        pickup.contents = pickupDocSnap.data().contents;
        pickup.div.style.cursor = 'pointer';
        console.log(pickupContents.map(id => tsumus[id - 1][1]));
        pickup.div.addEventListener('click', () => window.location.href = "gacha-simu.html?kind=pickup");
        pickup.set();
        insertRows(selectContents, 'pickup');
      } else {
        pickup.div.getElementsByClassName('NA')[0].style.display = 'block';
        pickup.contents = [];
        pickup.div.style.cursor = 'default';
      }
    } else {
      console.error("pickupドキュメントが存在しません");
    }
  });

   const parentDocRef = doc(db, "gacha", "user-box");
   const subColRef = collection(parentDocRef, "user-box");

   getDocs(subColRef).then((querySnapshot) => {
     querySnapshot.forEach((docSnap) => {
       userBoxes.push({id: docSnap.id, contents: docSnap.data().contents, title: docSnap.data().title});
       createContainer(docSnap.data(), docSnap.id);
     });
   }).catch((error) => {
     console.error("データ取得エラー:", error);
   });
  })
 .catch(err => {
   console.error("Promise.all内でエラー:", err);
});

function insertRows(contents, targetID) {
  const target = document.getElementById(targetID);
  const tbody = target.getElementsByTagName('tbody')[0];
  const length = contents.length > 5 ? 5 : contents.length;
  for (let i = 0; i < length; i++) {
    const newRow = tbody.insertRow();
    const cell = newRow.insertCell(0);
    cell.textContent = tsumus[contents[i] - 1][1];
    if (i == length - 1 && length < contents.length) {
      cell.classList.add('last');
    }
  }
  target.getElementsByClassName('total')[0].innerText = `全${contents.length}種`;
  target.getElementsByClassName('total')[0].style.display = 'block';
  target.classList.add('available');
  resizeFontToFit();
}
function createContainer(docSnap, id) {
  const container = document.createElement('div');
  container.id = id;
  container.classList.add('container');
  container.addEventListener('click', () => window.location.href = `gacha-simu.html?kind=user&id=${id}`);
  const title = document.createElement('h2');
  title.classList.add('title');
  if (docSnap.title.length > 14) {
    title.innerText = docSnap.title.slice(0, 14);
    title.classList.add('long');
  } else {
    title.innerText = docSnap.title;
  }
  container.appendChild(title);
  const table = document.createElement('table');
  table.classList.add('contents');
  table.appendChild(document.createElement('tbody'));
  container.appendChild(table);
  const total = document.createElement('p');
  total.classList.add('total');
  container.appendChild(total);
  const identifier = document.createElement('p');
  identifier.textContent = '#' + id;
  identifier.classList.add('id');
  container.appendChild(identifier);

  main.appendChild(container);

  if (title.scrollHeight > title.clientHeight) {
    resizeFontToFit(`#${id} .title`);
  }
  
  insertRows(docSnap.contents, id);
}

function resizeFontToFit(selector = 'td') {
  const cells = document.querySelectorAll(selector);
  cells.forEach(cell => {
    const maxWidth = cell.clientWidth; // td の幅
    let fontSize = 16; // 初期フォントサイズ
    cell.style.fontSize = fontSize + 'px';
    cell.style.whiteSpace = 'nowrap';         // 改行を防ぐ
    cell.style.overflow = 'hidden';           // 溢れた文字を隠す
    cell.style.textOverflow = 'ellipsis';     // 省略記号にする（任意）

    // 実際に1行に収まるまで縮小
    while (cell.scrollWidth > maxWidth && fontSize > 5) {
      fontSize--; // フォントサイズを小さく
      cell.style.fontSize = fontSize + 'px';
    }
  });
}

function setContainers(users = false) {
  const unfixedContainers = document.querySelectorAll('div.container:not(.fixed)');
  let displayed = [];
  for (const d of unfixedContainers) {
    if (users !== false && users.includes(d.id))  {
      displayed.push(d.id);
      continue;
    }
    main.removeChild(d);
  }

  if (users === false) {
    for (const element of userBoxes) {
      //usersがfalseのときは、全削除からの全追加
      createContainer(element, element.id);
    }
  } else {
    for (const element of users) {
      if (displayed.includes(element)) continue;
      const createBox = userBoxes.filter((box) => box.id == element)[0];
      createContainer(createBox, createBox.id);
    }
  }
}

input.addEventListener('input', async () => {
  const value = input.value;
  if (value[0] == '#') {
    if (value.length == 1) return;
    const id = value.slice(1, value.length);
    setContainers([id]);
  } else if (value.length) {
    // valueにデータがある
    // titleから検索
    const titleHit = userBoxes
      .filter(box => box.title.toLowerCase().includes(value.toLowerCase()))
      .map(box => box.id);
    // ツム名から検索
    const query = `SELECT * FROM tsumus WHERE name LIKE ?;`;
    const tsumu = (await runQuery(query, [`%${value}%`])).map(tsumu => tsumu[0]);
    const tsumuHit = [...new Set(
      userBoxes
        .filter(box => tsumu.some(id => box.contents.includes(id)))
        .map(box => box.id)
    )];
    const hit = [...new Set(tsumuHit.concat(titleHit))];
    setContainers(hit);
  } else {
    setContainers();
  }
});

function makeGacha() {
  if (currentUser) {
    window.location.href = 'gacha-make.html';
  } else {
    const modal = document.getElementById("loginModal");
    modal.style.display = "flex";
  }
}

window.makeGacha = makeGacha;
window.addEventListener('resize', resizeFontToFit()); // ウィンドウサイズ変更にも対応