// Firebase SDKのインポート
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
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

let currentUser = null;

// 認証状態を監視
onAuthStateChanged(auth, user => {
  currentUser = user;
});
// 表示用にテキストをHTMLへ変換（改行対応）
function escapeAndFormat(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
}

// チャットの読み取り（誰でも可能）
const chatQuery = query(collection(db, "chat"), orderBy("timestamp"));
onSnapshot(chatQuery, snapshot => {
  const chatContent = document.getElementById("chatContent");

  snapshot.docChanges().forEach(change => {
    const doc = change.doc;
    const data = doc.data();

    // IDで既に表示されている要素があれば更新、なければ作成
    let msgEl = document.getElementById(`msg-${doc.id}`);
    const ts = data.timestamp?.toDate?.();
    const time = ts ? ts.toLocaleString() : "送信中...";
    const uid = data.uid || "不明";
    const name = data.name || "名無し";

    if (!msgEl) {
      // 新規作成
      msgEl = document.createElement("div");
      msgEl.id = `msg-${doc.id}`;
      msgEl.className = "chat-message";
      chatContent.appendChild(msgEl);
    }

    msgEl.innerHTML = `
  <div><strong>${name}</strong> (${uid}) ${time}</div>
  <div>${escapeAndFormat(data.message)}</div>
`;

    // スクロール追従（新規追加時のみ）
    if (change.type === "added") {
      chatContent.scrollTop = chatContent.scrollHeight;
    }
  });
});

// メッセージ送信処理
document.getElementById("sendMessage").addEventListener("click", () => {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();
  
  if (!text) return;

  if (!currentUser) {
    showLoginPrompt();
    return;
  }
  input.value = "";

  const { uid, displayName } = currentUser;
  addDoc(collection(db, "chat"), {
    message: text,
    uid,
    name: displayName || "名無し",
    timestamp: serverTimestamp()
  }).catch(err => {
    console.error("送信エラー:", err);
  });
});

// ログイン促しモーダル表示関数
function showLoginPrompt() {
  const modal = document.getElementById("loginModal");
  modal.style.display = "flex";
}
