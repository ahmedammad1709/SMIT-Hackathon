const qs = s => document.querySelector(s);
const qsa = s => document.querySelectorAll(s);

const toast = msg => { const t = qs('#dashToast'); if (!t) return; t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1600); };

const sidebar = qs('#sidebar');
const menuBtn = qs('#menuBtn');
if (menuBtn && sidebar) menuBtn.addEventListener('click', () => { sidebar.classList.toggle('open'); });

const views = {
  overview: qs('#view-overview'),
  blogs: qs('#view-blogs'),
  create: qs('#view-create'),
  settings: qs('#view-settings')
};

qsa('.side-item').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.getAttribute('data-view');
    if (!key || !views[key]) return;
    qsa('.side-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    Object.values(views).forEach(v => v.classList.remove('active'));
    views[key].classList.add('active');
    if (sidebar && sidebar.classList.contains('open')) sidebar.classList.remove('open');
    if (key === 'overview') animateBars();
  });
});

const dummyBlogs = [
  { title: 'Building a Vanilla JS App', category: 'Technology', likes: 24, comments: 8 },
  { title: 'Science of Everyday Life', category: 'Science', likes: 18, comments: 3 },
  { title: 'Top 10 Indie Movies', category: 'Movies', likes: 33, comments: 12 },
  { title: 'Weekend Sports Recap', category: 'Sports', likes: 12, comments: 6 }
];

const totalBlogsEl = qs('#totalBlogs');
const totalLikesEl = qs('#totalLikes');
const totalCommentsEl = qs('#totalComments');
const barsEl = qs('#bars');

const totals = () => {
  const blogs = dummyBlogs.length;
  const likes = dummyBlogs.reduce((a, b) => a + b.likes, 0);
  const comments = dummyBlogs.reduce((a, b) => a + b.comments, 0);
  totalBlogsEl.textContent = String(blogs);
  totalLikesEl.textContent = String(likes);
  totalCommentsEl.textContent = String(comments);
};

totals();

const chartData = [5, 7, 3, 9, 4, 6, 8];
const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const renderBars = () => {
  if (!barsEl) return;
  barsEl.innerHTML = '';
  chartData.forEach(v => {
    const d = document.createElement('div');
    d.className = 'bar';
    d.style.height = '0px';
    barsEl.appendChild(d);
  });
  const labels = document.createElement('div');
  labels.className = 'bar-labels';
  labels.innerHTML = days.map(d => `<div>${d}</div>`).join('');
  barsEl.parentElement.appendChild(labels);
};

const animateBars = () => {
  const bars = qsa('.bar');
  bars.forEach((bar, i) => {
    const max = Math.max(...chartData);
    const pct = (chartData[i] / max) * 100;
    setTimeout(() => { bar.style.height = `${Math.max(8, Math.round(pct * 1.4))}px`; }, 80 * i);
  });
};

renderBars();
animateBars();

const blogsList = qs('#blogsList');
const renderBlogs = () => {
  if (!blogsList) return;
  blogsList.innerHTML = '';
  dummyBlogs.forEach(b => {
    const item = document.createElement('div');
    item.className = 'list-item';
    const left = document.createElement('div');
    left.innerHTML = `<div>${b.title}</div><div class="list-meta">${b.category}</div>`;
    const actions = document.createElement('div');
    actions.className = 'actions';
    const edit = document.createElement('button');
    edit.className = 'btn small edit';
    edit.textContent = 'Edit';
    const del = document.createElement('button');
    del.className = 'btn small delete';
    del.textContent = 'Delete';
    actions.appendChild(edit); actions.appendChild(del);
    item.appendChild(left); item.appendChild(actions);
    blogsList.appendChild(item);
    edit.addEventListener('click', e => { ripple(e, edit); toast('Edit UI only'); });
    del.addEventListener('click', e => { ripple(e, del); toast('Delete UI only'); });
  });
};

renderBlogs();

const previewTitle = qs('#previewTitle');
const previewDesc = qs('#previewDesc');
const previewCategory = qs('#previewCategory');
const previewImage = qs('#previewImage');
const postTitle = qs('#postTitle');
const postCategory = qs('#postCategory');
const postImage = qs('#postImage');
const postDesc = qs('#postDesc');
const createBtn = qs('#createBtn');

const syncPreview = () => {
  previewTitle.textContent = postTitle.value || 'Blog title';
  previewDesc.textContent = postDesc.value || 'Description will appear here as you type.';
  previewCategory.textContent = postCategory.value || 'Category';
  const url = postImage.value.trim();
  if (url && /^https?:\/\//i.test(url)) previewImage.style.backgroundImage = `url('${url}')`;
  else previewImage.style.backgroundImage = '';
};

['input','change'].forEach(evt => {
  postTitle.addEventListener(evt, syncPreview);
  postCategory.addEventListener(evt, syncPreview);
  postImage.addEventListener(evt, syncPreview);
  postDesc.addEventListener(evt, syncPreview);
});

if (createBtn) createBtn.addEventListener('click', e => { e.preventDefault(); ripple(e, createBtn); toast('Preview only'); });

const setUsername = qs('#setUsername');
const navUser = qs('#navUser');
const avatarInput = qs('#setAvatar');
const avatarPreview = qs('#avatarPreview');
const profileName = qs('#profileName');

if (setUsername) setUsername.addEventListener('input', () => { const v = setUsername.value.trim(); navUser.textContent = v || 'User'; profileName.textContent = v || 'User'; });
if (avatarInput) avatarInput.addEventListener('input', () => { const url = avatarInput.value.trim(); if (url && /^https?:\/\//i.test(url)) avatarPreview.style.backgroundImage = `url('${url}')`; else avatarPreview.style.backgroundImage = ''; });

const logoutBtn = qs('#logoutBtn');
if (logoutBtn) logoutBtn.addEventListener('click', e => { ripple(e, logoutBtn); toast('Logout UI only'); });

const ripple = (e, el) => {
  const span = document.createElement('span');
  span.style.position = 'absolute';
  span.style.pointerEvents = 'none';
  span.style.width = '20px';
  span.style.height = '20px';
  span.style.left = 'var(--x)';
  span.style.top = 'var(--y)';
  span.style.transform = 'translate(-50%, -50%)';
  span.style.background = 'radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.4) 30%, transparent 70%)';
  span.style.borderRadius = '50%';
  span.style.animation = 'boom 600ms ease-out forwards';
  const rect = el.getBoundingClientRect();
  span.style.setProperty('--x', `${e.clientX - rect.left}px`);
  span.style.setProperty('--y', `${e.clientY - rect.top}px`);
  el.appendChild(span);
  span.addEventListener('animationend', () => span.remove());
};