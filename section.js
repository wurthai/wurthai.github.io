const view = new URLSearchParams(location.search).get('view');
const allowed = new Set(['about', 'skills', 'projects', 'notes']);
const main = document.getElementById('main-content');
if (!allowed.has(view)) {
  main.innerHTML = '<section class="section-padding"><div class="container"><h1>Page not found</h1><a href="index.html">Back to home</a></div></section>';
} else {
  fetch('index.html').then(response => {
    if (!response.ok) throw new Error('Could not load this page.');
    return response.text();
  }).then(html => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const section = doc.getElementById(view);
    if (!section) throw new Error('Section missing.');
    main.append(document.importNode(section, true));
    document.title = `${view[0].toUpperCase() + view.slice(1)} | Quoc Thai`;
    document.querySelector(`.nav-links a[href="section.html?view=${view}"]`)?.setAttribute('aria-current', 'page');
    const script = document.createElement('script'); script.src = 'script.js?v=18'; document.body.append(script);
  }).catch(error => { main.textContent = error.message; });
}
