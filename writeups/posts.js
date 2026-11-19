const list = document.getElementById('markdown-posts');
const postBase = new URL('.', document.currentScript.src);
const compactPosts = list.dataset.layout === 'compact';
const validSlug = slug => /^[a-z0-9-]+$/.test(slug);
const icons = {
  date: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
  words: '<path d="m16 3 5 5-12 12-6 1 1-6ZM14 5l5 5M4 15l5 5"/>',
  time: '<path d="M6 3h12M6 21h12M7 3v4l10 10v4M17 3v4L7 17v4"/>'
};
function metadata(kind, text, date) {
  const item = document.createElement('span');
  item.className = 'writeup-meta-item';
  item.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[kind]}</svg>`;
  const label = document.createElement(date ? 'time' : 'span');
  label.textContent = text;
  if (date) label.dateTime = date;
  item.append(label);
  return item;
}
async function addReadingStats(post, meta) {
  try {
    const slugs = Array.isArray(post.parts) ? post.parts.map(part => part.slug) : [post.slug];
    const sources = await Promise.all(slugs.map(async slug => {
      if (!validSlug(slug)) throw new Error('Invalid article name');
      const response = await fetch(new URL(`posts/${slug}.md`, postBase));
      if (!response.ok) throw new Error('Article unavailable');
      return response.text();
    }));
    const text = sources.join('\n')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/<[^>]*>/g, ' ')
      .replace(/```[^\n]*|[#*_`~>|]/g, ' ');
    const words = text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)?.length || 0;
    if (!compactPosts) meta.append(metadata('words', `${words.toLocaleString('en-US')} words`));
    meta.append(metadata('time', `${Math.max(1, Math.ceil(words / 220))} min read`));
  } catch {
    // Keep the article available even when reading statistics cannot be loaded.
  }
}
async function loadPosts() {
  try {
    const response = await fetch(new URL('posts.json', postBase));
    if (!response.ok) throw new Error('List unavailable');
    const posts = await response.json();
    list.replaceChildren();
    posts.forEach(post => {
      if (!validSlug(post.slug)) return;
      const card = document.createElement('article');
      card.className = 'writeup-feature';
      const link = document.createElement('a');
      link.className = 'writeup-feature-link';
      link.href = new URL(`reader.html?post=${encodeURIComponent(post.slug)}`, postBase).href;
      const media = document.createElement('div');
      media.className = 'writeup-cover';
      if (post.coverFit === 'contain') media.classList.add('writeup-cover--contain');
      if (post.coverTheme === 'light') media.classList.add('writeup-cover--light');
      const fallback = document.createElement('span');
      fallback.className = 'writeup-cover-fallback';
      fallback.textContent = post.title;
      media.append(fallback);
      if (post.cover) {
        const url = new URL(post.cover, postBase);
        if (url.origin === location.origin && /\.(svg|png|jpe?g|webp)$/i.test(url.pathname)) {
          const image = document.createElement('img');
          image.src = url.href;
          image.alt = '';
          image.loading = list.children.length ? 'lazy' : 'eager';
          image.width = 660;
          image.height = 420;
          image.addEventListener('error', () => { image.remove(); media.classList.remove('writeup-cover--contain'); });
          media.append(image);
        }
      }
      const body = document.createElement('div');
      body.className = 'writeup-feature-body';
      const meta = document.createElement('div');
      meta.className = 'writeup-meta';
      if (/^\d{4}-\d{2}-\d{2}$/.test(post.date || '')) meta.append(metadata('date', post.date, post.date));
      const title = document.createElement('h2');
      title.textContent = post.title;
      const summary = document.createElement('p');
      summary.className = 'writeup-summary';
      summary.textContent = post.summary;
      if (compactPosts) {
        const author = document.createElement('span');
        author.className = 'post-author';
        const avatar = document.createElement('img');
        avatar.src = new URL('../assets/avatar.jpg', postBase).href;
        avatar.alt = '';
        avatar.width = 20;
        avatar.height = 20;
        author.append(avatar, document.createTextNode('Quoc Thai'));
        meta.prepend(author);
        const tags = document.createElement('div');
        tags.className = 'post-tags';
        (post.category || '').split('\u00b7').map(tag => tag.trim()).filter(Boolean).forEach(tag => {
          const badge = document.createElement('span');
          badge.textContent = tag;
          tags.append(badge);
        });
        body.append(title, summary, meta, tags);
      } else {
        body.append(meta, title, summary);
      }
      link.append(media, body);
      card.append(link);
      list.append(card);
      void addReadingStats(post, meta);
    });
    if (!list.children.length) list.textContent = 'No Markdown posts yet.';
  } catch {
    list.textContent = 'Could not load the post list. Please refresh to try again.';
  }
}
void loadPosts();
