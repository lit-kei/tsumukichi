const links = [{href: "index.html", title: "トップ"},{href: "coin-manage.html", title: "コイン管理システム"}];

  window.onload = function() {
    const title = document.querySelector('meta[name="title"]').getAttribute('content');
    const header = document.getElementsByTagName('header')[0];
    const inner = document.createElement('div');
    const left = `
  <div class="header-left">
    <a href="index.html">
      <img src="assets/images/logo.png" height="70px" class="logo-img" alt="つむ基地！のロゴ">
    </a>
    <h1 class="header-title"">${title}</h1>
  </div>
`;
    inner.classList.add('header-inner');
    inner.innerHTML = left.trim();
    const nav = document.createElement('nav');
    nav.classList.add("header-nav");
    for (let i = 0; i < links.length; i++) {
        const a = document.createElement('a');
        const element = links[i];
        a.href = element.href;
        a.innerText = element.title;
        nav.appendChild(a);
    }
    inner.appendChild(nav);
    header.appendChild(inner);
  };