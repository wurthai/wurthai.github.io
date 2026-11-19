const article = document.getElementById('article');
document.getElementById('current-year').textContent = new Date().getFullYear();
const slug = new URLSearchParams(location.search).get('post');
const themeButton = document.querySelector('.theme-toggle');
const savedTheme = localStorage.getItem('hqt-portfolio-theme');
document.documentElement.dataset.theme = savedTheme === 'light' ? 'light' : 'dark';
themeButton.setAttribute('aria-checked', String(document.documentElement.dataset.theme === 'light'));
themeButton.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('hqt-portfolio-theme', next);
  themeButton.setAttribute('aria-checked', String(next === 'light'));
});
async function loadPost() {
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) throw new Error('Invalid article.');
  const manifest = await fetch('posts.json').then(r => { if (!r.ok) throw new Error('Could not load the article list.'); return r.json(); });
  const entry = manifest.find(item => item.slug === slug);
  if (!entry) throw new Error('Article not found.');
  if (!window.marked || !window.DOMPurify) throw new Error('Could not load the Markdown reader.');
  async function getMarkdown(postSlug) {
    if (!/^[a-z0-9-]+$/.test(postSlug)) throw new Error('Invalid article name.');
    const response = await fetch(`posts/${postSlug}.md`);
    if (!response.ok) throw new Error('Could not load the Markdown file.');
    return response.text();
  }
  function nestHeadings(source) {
    let inCode = false;
    return source.split('\n').map(line => {
      if (/^\s*```/.test(line)) { inCode = !inCode; return line; }
      if (inCode) return line;
      if (/^# /.test(line)) return '';
      return line.replace(/^(#{2,5}) /, (_, hashes) => `${'#'.repeat(hashes.length + 1)} `);
    }).join('\n');
  }
  const markdown = Array.isArray(entry.parts)
    ? (await Promise.all(entry.parts.map(async part => `## ${part.title}\n\n${nestHeadings(await getMarkdown(part.slug))}`))).join('\n\n---\n\n')
    : await getMarkdown(slug);
  document.title = `${entry.title} | Quoc Thai`;
  const breadcrumb = document.querySelector('[data-breadcrumb-current]');
  if (breadcrumb) breadcrumb.textContent = entry.title;
  article.innerHTML = `<p class="eyebrow"></p><h1></h1><p class="article-lead"></p><div class="article-markdown"></div>`;
  article.querySelector('.eyebrow').textContent = entry.category;
  article.querySelector('h1').textContent = entry.title;
  article.querySelector('.article-lead').textContent = entry.summary;
  const body = article.querySelector('.article-markdown');
  body.innerHTML = DOMPurify.sanitize(marked.parse(markdown));
  const headings = [...body.querySelectorAll('h2, h3')];
  if (headings.length) {
    const toc = document.createElement('details');
    toc.className = 'article-tree';
    toc.setAttribute('aria-label', 'Table of contents');
    const label = document.createElement('summary'); label.textContent = 'Table of contents'; toc.append(label);
    const links = document.createElement('nav'); links.setAttribute('aria-label', 'Article sections'); toc.append(links);
    headings.forEach((heading, index) => {
      heading.id = `section-${index + 1}`;
      const link = document.createElement('a');
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent;
      if (heading.tagName === 'H3') link.className = 'article-tree-child';
      links.append(link);
    });
    article.insertBefore(toc, body);
  }
  body.querySelectorAll('img').forEach(img => {
    const url = new URL(img.getAttribute('src'), new URL('posts/', location.href));
    if (url.origin !== location.origin || !url.pathname.includes('/writeups/posts/')) { img.remove(); return; }
    img.src = url.href; img.loading = 'lazy';
  });
  body.querySelectorAll('a[href]').forEach(a => { if (/^https?:/.test(a.href)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; } });
  body.querySelectorAll('pre').forEach((pre) => {
    const code = pre.querySelector('code');
    const source = code?.textContent || '';
    const languageClass = [...(code?.classList || [])].find(name => name.startsWith('language-'));
    const requestedLanguage = languageClass?.slice(9);
    const language = requestedLanguage === 'py' ? 'python' : requestedLanguage === 'js' ? 'javascript' : requestedLanguage === 'sh' ? 'bash' : requestedLanguage;
    const lines = source.replace(/\n$/, '').split('\n');
    const isLong = lines.length >= 100;
    const wrapper = document.createElement(isLong ? 'details' : 'div');
    wrapper.className = `article-code${isLong ? ' article-code-collapsible' : ' article-code-inline'}`;
    const toggle = isLong ? document.createElement('summary') : null;
    if (toggle) toggle.textContent = 'Code';
    if (code) {
      code.replaceChildren(...lines.map((line, index) => {
        const row = document.createElement('span'); row.className = 'code-line';
        row.dataset.line = String(index + 1);
        if (line && window.hljs && language && hljs.getLanguage(language)) {
          row.innerHTML = hljs.highlight(line, { language, ignoreIllegals: true }).value;
        } else {
          row.textContent = line || ' ';
        }
        return row;
      }));
    }
    pre.replaceWith(wrapper);
    if (toggle) wrapper.append(toggle);
    wrapper.append(pre);
  });
}
loadPost().catch(error => { article.textContent = error.message; });
