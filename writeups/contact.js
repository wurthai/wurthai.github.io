fetch('../index.html').then(response => {
  if (!response.ok) throw new Error('Contact section unavailable');
  return response.text();
}).then(html => {
  const source = new DOMParser().parseFromString(html, 'text/html').getElementById('contact');
  const footer = document.querySelector('.site-footer');
  if (source && footer) footer.before(document.importNode(source, true));
}).catch(() => {});
