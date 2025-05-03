const auth = firebase.auth();
const db = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

// ログインボタン
document.getElementById("login").addEventListener("click", () => {
  auth.signInWithRedirect(provider);
});

// リダイレクト後の結果を処理する
auth.getRedirectResult().then((result) => {
  if (result.user) {
    const user = result.user;
    const uid = user.uid;

    // ユーザーのコイン履歴の保存
    db.collection("users").doc(uid).set({
      coinHistory: [0]
    })
    .then(() => {
      console.log("配列を保存しました！");
    })
    .catch((error) => {
      console.error("保存に失敗しました: ", error);
    });
  } else {
    console.log("リダイレクト後の認証結果なし");
  }
});

// ログイン状態を監視する
auth.onAuthStateChanged((user) => {
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
  firebase.auth().signOut().then(() => {
    console.log("ユーザーがサインアウトしました");
    // ログインページの表示や、ログインボタンの再表示などを行う
    const loginDiv = document.getElementById("login");
    loginDiv.style.display = "flex"; // ログインボタンを再表示
  }).catch((error) => {
    console.error("サインアウトに失敗しました: ", error);
  });
});
