
// 必要: <script type="module" src="header.js"></script>
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const links = [
  { href: "index.html", title: "トップ" },
  { href: "coin-manage.html", title: "コイン管理システム" },
  { href: "community.html", title: "コミュニティ" }
];

window.onload = function () {
  const title = document.querySelector('meta[name="title"]').getAttribute('content');
  const header = document.getElementsByTagName('header')[0];
  const inner = document.createElement('div');
  inner.classList.add('header-inner');

  // 左側：ロゴとタイトル
  const left = `
    <div class="header-left">
      <a href="index.html">
        <img src="assets/images/logo.png" height="70px" class="logo-img" alt="つむ基地！のロゴ">
      </a>
      <h1 class="header-title">${title}</h1>
    </div>
  `;
  inner.innerHTML = left.trim();

  // 中央：ナビゲーションリンク
  const nav = document.createElement('nav');
  nav.classList.add("header-nav");
  links.forEach(({ href, title }) => {
    const a = document.createElement('a');
    a.href = href;
    a.innerText = title;
    nav.appendChild(a);
  });
  inner.appendChild(nav);

  // 右側：ログイン状態表示（空のdivとして追加 → onAuthStateChangedで中身を入れる）
  const right = document.createElement('div');
  right.classList.add("header-right");
  right.style.position = "relative";
  inner.appendChild(right);

  header.appendChild(inner);

  // 認証状態監視
  onAuthStateChanged(auth, (user) => {
    right.innerHTML = ""; // 初期化
    if (user) {
      // ログイン済み：プロフィールアイコンとドロップダウン
      const img = document.createElement('img');
      img.src = user.photoURL;
      img.alt = "profile";
      img.style = "width:40px; height:40px; border-radius:50%; cursor:pointer;";
      img.id = "profile-icon";

      const dropdown = document.createElement('div');
      dropdown.id = "dropdown";
      dropdown.style = "display:none; position:absolute; right:0; top:50px; background:white; color:black; border-radius:4px; box-shadow:0 2px 5px rgba(0,0,0,0.3); z-index:100;";
      dropdown.innerHTML = `<button id="logout-btn" style="padding:10px 20px; width:100%; border:none; background:none; cursor:pointer;">ログアウト</button>`;

      right.appendChild(img);
      right.appendChild(dropdown);

      img.addEventListener("click", () => {
        dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
      });

      document.getElementById("logout-btn").addEventListener("click", () => {
        signOut(auth);
      });

      window.addEventListener("click", (e) => {
        if (!img.contains(e.target)) dropdown.style.display = "none";
      });
    } else {
      // 未ログイン：ログインボタン
      const btn = document.createElement("button");
      btn.innerText = "Googleでログイン";
      btn.style = "padding:8px 16px; background:#4285f4; color:white; border:none; border-radius:4px; cursor:pointer;";
      btn.addEventListener("click", () => signInWithPopup(auth, provider).catch(console.error));
      right.appendChild(btn);
    }
  });
};
  