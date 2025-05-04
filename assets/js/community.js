// Firebase SDKのインポート
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
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

// Firebase初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null;

// 認証状態を監視
onAuthStateChanged(auth, user => {
  currentUser = user;
});

// チャットの読み取り（誰でも可能）
const chatQuery = query(collection(db, "chat"), orderBy("timestamp"));
onSnapshot(chatQuery, snapshot => {
  snapshot.docChanges().forEach(change => {
    if (change.type === "added") {
      const data = change.doc.data();
      const msgEl = document.createElement("div");
      msgEl.className = "chat-message";

      const time = data.timestamp?.toDate?.().toLocaleString() || "時刻不明";
      const uid = data.uid || "不明";

      msgEl.innerHTML = `
        <div><strong>${data.name || "名無し"}</strong> (${uid}) ${time}</div>
        <div>${data.message}</div>
      `;

      chatContent.appendChild(msgEl);
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

  const { uid, displayName } = currentUser;
  addDoc(collection(db, "chat"), {
    message: text,
    uid,
    name: displayName || "名無し",
    timestamp: serverTimestamp()
  }).then(() => {
    input.value = "";
  }).catch(err => {
    console.error("送信エラー:", err);
  });
});

// ログイン促しモーダル表示関数
function showLoginPrompt() {
  const modal = document.getElementById("loginModal");
  modal.style.display = "flex";
}
