import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyCGLPun0uYBMgCR1eH3lzXcEN4Q1REMyL0",
  authDomain: "tsumukichi-fd6bb.firebaseapp.com",
  projectId: "tsumukichi-fd6bb",
  storageBucket: "tsumukichi-fd6bb.firebasestorage.app",
  messagingSenderId: "862189689025",
  appId: "1:862189689025:web:e9af0ef41ae45a13eb5c40",
  measurementId: "G-0XE4K5F37J"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const links = [
  { href: "index.html", title: "トップ" },
  { href: "coin-manage.html", title: "コイン管理システム" },
  { href: "community.html", title: "コミュニティ" },
  { href: "gacha-top.html", title: "ガチャシミュレーター"}
];

window.onload = function () {
  const title = document.querySelector('meta[name="title"]').getAttribute('content');
  const header = document.getElementsByTagName('header')[0];
  const inner = document.createElement('div');
  inner.classList.add('header-inner');

  // 左側：ロゴとタイトル
  inner.innerHTML = `
    <div class="header-left">
      <img src="assets/images/logo.png" class="logo-img" alt="つむ基地！のロゴ" onclick="window.location.href = 'index.html'" style="cursor: pointer;">
      <h1 class="header-title">${title}</h1>
    </div>
  `.trim();

  // ナビゲーション
  const nav = document.createElement('nav');
  nav.classList.add("header-nav");
  links.forEach(({ href, title }) => {
    const a = document.createElement('a');
    a.href = href;
    a.innerText = title;
    nav.appendChild(a);
  });
  inner.appendChild(nav);


  // 右上ログイン情報表示
  const right = document.createElement('div');
  right.classList.add("header-right");
  inner.appendChild(right);

  onAuthStateChanged(auth, (user) => {
    right.innerHTML = "";

    if (user) {
      // プロフィール画像
      const img = document.createElement('img');
      img.src = user.photoURL;
      img.alt = "プロフィール画像";
      img.classList.add("profile-icon");

      // ドロップダウン
      const dropdown = document.createElement('div');
      dropdown.classList.add("dropdown");
      dropdown.innerHTML = `<button id="logout-btn">ログアウト</button>`;
      dropdown.style.display = "none";

      img.addEventListener("click", () => {
        dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
      });
      window.addEventListener("click", (e) => {
        if (!img.contains(e.target)) dropdown.style.display = "none";
      });

      // ログアウト処理
      dropdown.querySelector("#logout-btn").addEventListener("click", () => {
        signOut(auth);
      });

      right.appendChild(img);
      right.appendChild(dropdown);

      // Firestore にユーザー登録（初回のみ）
      const uid = user.uid;
      const userRef = doc(collection(db, "users"), uid);
      getDoc(userRef).then((docSnap) => {
        if (!docSnap.exists()) {
          setDoc(userRef, {
            coinHistory: [],
            name: user.displayName || "名無し"
          }).then(() => {
            console.log("ユーザー情報が保存されました！");
          }).catch((error) => {
            console.error("保存失敗:", error);
          });
        }
      });

    } else {
      const btn = document.createElement("button");
      btn.innerText = "Googleでログイン";
      btn.classList.add("login-button");
      btn.addEventListener("click", () => {
        signInWithPopup(auth, provider).catch((err) => {
          console.error("ログイン失敗:", err);
        });
      });
      right.appendChild(btn);
    }
  });
  header.appendChild(inner);
};
