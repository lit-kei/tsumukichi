// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

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
const db = getFirestore(app); // Firestoreのインスタンスを取得
const auth = getAuth(app);

// Googleでログイン (ポップアップ方式)
function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      const uid = user.uid;

      // ユーザーの情報をFirestoreに保存
      const userRef = doc(collection(db, "users"), uid); // Firestoreのユーザー参照を取得

      // 既存のドキュメントがあるかチェック
      getDoc(userRef)
        .then((docSnap) => {
          if (!docSnap.exists()) {
            // ドキュメントが存在しない場合のみデータを保存
            setDoc(userRef, {
              coinHistory: [],
              name: user.displayName || "名無し" // ユーザー名、表示名がない場合は"名無し"を設定
            })
            .then(() => {
              console.log("ユーザー情報が保存されました！");
            })
            .catch((error) => {
              console.error("ユーザー情報の保存に失敗しました: ", error);
            });
          } else {
            console.log("既にユーザー情報が存在します。データの上書きはしません。");
          }
        })
        .catch((error) => {
          console.error("ユーザードキュメントの取得に失敗しました: ", error);
        });
    })
    .catch((error) => {
      console.error("ログインに失敗しました: ", error);
    });
}

// ログインボタン
document.getElementById("login").addEventListener("click", () => {
  loginWithGoogle();
});

// ログイン状態を監視する
onAuthStateChanged(auth, (user) => {
  console.log("認証状態変更:", user);
  const loginDiv = document.getElementById("login");
  const logoutButton = document.getElementById("logout");

  if (user) {
    // ログイン済み
    console.log("ユーザーがログインしています");
    loginDiv.style.display = "none"; // ログインしたらボタンを非表示
    logoutButton.style.display = "block"; // ログアウトボタンを表示
  } else {
    // 未ログイン
    console.log("ユーザーがログインしていません");
    loginDiv.style.display = "flex"; // 未ログインならボタンを表示
    logoutButton.style.display = "none"; // ログアウトボタンを非表示
  }
});

// サインアウトボタンがクリックされたときにサインアウトする
document.getElementById("logout").addEventListener("click", () => {
  auth.signOut().then(() => {
    console.log("ユーザーがサインアウトしました");
    // ログインページの表示や、ログインボタンの再表示などを行う
    const loginDiv = document.getElementById("login");
    loginDiv.style.display = "flex"; // ログインボタンを再表示
  }).catch((error) => {
    console.error("サインアウトに失敗しました: ", error);
  });
});
