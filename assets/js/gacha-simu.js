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

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
let dbInstance = null;
const tsumuPromise = initSqlJs({
  locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
})  
async function initDatabase() {
  if (dbInstance) return dbInstance;

  const SQL = await tsumuPromise;
  const response = await fetch("assets/db/tsumu.db");
  const buffer = await response.arrayBuffer();
  dbInstance = new SQL.Database(new Uint8Array(buffer));
  return dbInstance;
}
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


const gacha = {
  close: 0,
  opening: 1,
  open: 2
};
const boxes = {
  select: 0,
  pickup: 1,
  user: 2
};
let mode = gacha.close;
const image = document.getElementById('gacha-image');
const tbody = document.getElementById('lineup');

const setMode = num => mode = num; 

// アニメーションを実行する関数
function animateImage() {
  console.log(mode);
  switch (mode) {
    case gacha.close:
      image.style.transform = 'scaleY(0.9)'; // 画像を縦に押しつぶす
      setTimeout(() => {
        image.style.transform = 'scaleY(1.1)'; // 反発するように拡大
      }, 200); // 0.2秒後に反発
      setTimeout(() => {
        image.style.transform = 'scaleY(1)'; // 元のサイズに戻す
      }, 400); // 0.4秒後に元に戻す
      break;
    case gacha.opening:
      image.style.filter = 'brightness(10)';
      break;
    case gacha.open:
      break;
    default:
      break;
  }
}
animateImage();
setInterval(() => {
  animateImage();
}, 1000);
let tsumus = [];
let boxContents = [];
let probabilities = [];

// 現在のURLのクエリパラメータを取得する場合
const params = new URLSearchParams(window.location.search);

// クエリパラメータから特定の値を取得
const kind = boxes[params.get("kind")];
let id = null;
let boxPromise;
switch (kind) {
  case 0:
    document.getElementById('title').textContent = "セレクトボックス";
    boxPromise = getDoc(doc(db, "gacha", "select-box"));
    break;
  case 1:
    boxPromise = getDoc(doc(db, "gacha", "pickup"));
    document.getElementById('title').textContent = "ピックアップガチャ";
    break;
  case 2:
    id = params.get("id");
    boxPromise = getDoc(doc(db, "gacha", "user-box", "user-box", id));
    break;

  default:
    boxPromise = null;
    break;
}

function percent(index) {
  const data = tsumus[index].slice(2, 7);
  let result = ['0.00'];
  for (let i = 0; i < data.length; i++) {
    if (data[i] === null) {
      result.push((i+1).toFixed(2));
      return result;
    }
    for (let j = 0; j < data[i]; j++) {
      let num = i + 1 + Math.floor(100*j / data[i]) / 100;
      result.push(num.toFixed(2));
    }
  }
  result.push('6.00');
  return result;
}
function alignment() {
  probabilities = [];
  const tds = document.querySelectorAll('tr:not(.head)')
  let maxes = [];
  for (let i = 0; i < tds.length; i++) {
    const element = tds[i];
    if (Number(element.getElementsByClassName('now')[0].textContent) == Number(element.getElementsByClassName('max')[0].textContent)) {
      maxes.push(i);
    }
  }
  for (let i = 0; i < tds.length; i++) {
    const element = tds[i].getElementsByClassName('P')[0];
    if (maxes.includes(i)) {
      element.classList.add('skill-max');
      element.textContent = 'スキルMAX';
      probabilities.push(0);
      continue;
    }
    element.classList.remove('skill-max');
    probabilities.push(Math.floor(1000 / (boxContents.length - maxes.length))/1000);
    if (element.textContent != (Math.floor(10000 / (boxContents.length - maxes.length))/100).toFixed(2) + '%') {
      tds[i].getElementsByClassName('P')[0].style.color = '#f60';
      setTimeout(() => element.style.color = '', 300);

      element.textContent = (Math.floor(10000 / (boxContents.length - maxes.length))/100).toFixed(2) + '%';
    }
  }
  console.log(probabilities);
}
runQuery("SELECT * FROM tsumus ORDER BY id ASC;").then(tsumuData => {
  tsumus = tsumuData;
  boxPromise.then(boxData => {
    if (kind == boxes.user) document.getElementById('title').textContent = boxData.data().title;
    boxContents = boxData.data().contents;
    if (kind != boxes.pickup) {
      for (let i = 0; i < boxContents.length; i++) {
        const newRow = tbody.insertRow();
        const idCell = newRow.insertCell(0);
        idCell.textContent = String(i+1);
        const nameCell = newRow.insertCell(1);
        nameCell.textContent = tsumus[boxContents[i]-1][1];
        const skillCell = newRow.insertCell(2);
        const select = document.createElement('select');
        select.value = i;
        percent(boxContents[i]-1).forEach(percentage => {
          const option = document.createElement('option');
          option.textContent = percentage;
          select.appendChild(option);
        });
        skillCell.appendChild(select);
        const currentCell = newRow.insertCell(3);
        currentCell.textContent = '0';
        currentCell.classList.add('now');
        const maxCell = newRow.insertCell(4);
        maxCell.textContent = String(tsumus[boxContents[i]-1][7]);
        maxCell.classList.add('max');
        const probabilityCell = newRow.insertCell(5);
        probabilityCell.classList.add('P');
        probabilityCell.textContent = '0.00%';
        alignment();
        
        select.addEventListener("change", function () {
          currentCell.textContent = String(select.selectedIndex);
          alignment();
        });
      }
    }
  })
});

window.setMode = setMode;