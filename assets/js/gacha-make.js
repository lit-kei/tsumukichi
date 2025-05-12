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

let currentUser = null;

// 認証状態を監視
onAuthStateChanged(auth, user => {
  currentUser = user;
  if (currentUser === null) {
    alert('認証情報が確認されませんでした。');
    window.location.href = 'gacha-top.html';
  }
});
