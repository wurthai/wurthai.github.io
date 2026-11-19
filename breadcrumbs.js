(() => {
  const current = document.querySelector('[data-breadcrumb-current]');
  if (!current) return;
  const filename = location.pathname.split('/').pop();
  if (filename === 'section.html') {
    const view = new URLSearchParams(location.search).get('view');
    current.textContent = ['about', 'projects', 'skills', 'notes'].includes(view) ? view : 'not found';
  } else if (filename === '_template.html') {
    current.textContent = document.querySelector('main h1')?.textContent || 'article';
  }
})();
