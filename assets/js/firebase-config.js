const firebaseConfig = {
    apiKey: "AIzaSyCGLPun0uYBMgCR1eH3lzXcEN4Q1REMyL0",
    authDomain: "tsumukichi-fd6bb.firebaseapp.com",
    projectId: "tsumukichi-fd6bb",
    storageBucket: "tsumukichi-fd6bb.firebasestorage.app",
    messagingSenderId: "862189689025",
    appId: "1:862189689025:web:e9af0ef41ae45a13eb5c40",
    measurementId: "G-0XE4K5F37J"
  };

// アプリがまだ初期化されていなければ初期化
if (!firebase.apps.length) {
    console.log("initialized");
    firebase.initializeApp(firebaseConfig);
} else {
    console.log("uninitialized");
}