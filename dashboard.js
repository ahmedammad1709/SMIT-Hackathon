const qs = s => document.querySelector(s);
const qsa = s => Array.from(document.querySelectorAll(s));

const toast = qs('#toast');
const menuToggle = qs('#menuToggle');
const sidebarOverlay = qs('#sidebarOverlay');
const sides = qsa('.side-item');
const views = {
  overview: qs('#view-overview'),
  blogs: qs('#view-blogs'),
  create: qs('#view-create'),
  settings: qs('#view-settings')
};

function initViewFromHash() {
  const h = (window.location.hash || '').replace('#','');
  const v = views[h];
  if (!v) return;
  Object.values(views).forEach(x => x.classList.remove('active'));
  v.classList.add('active');
  sides.forEach(b => b.classList.remove('active'));
  const tab = sides.find(b => b.dataset.view === h);
  if (tab) tab.classList.add('active');
  if (h === 'blogs') renderBlogs();
  if (h === 'overview') { computeStats(); updateChart(); }
}

const showToast = (msg) => { if (!toast) return; toast.textContent = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 1400); };

function getUsers() { try { return JSON.parse(localStorage.getItem('users') || '[]'); } catch { return []; } }
function setUsersLS(users) { localStorage.setItem('users', JSON.stringify(users)); }
function getCurrentUser() { try { return JSON.parse(localStorage.getItem('currentUser') || 'null'); } catch { return null; } }
function setCurrentUser(cu) { localStorage.setItem('currentUser', JSON.stringify(cu)); }
function computeStats() {
  const sb = qs('#statBlogs');
  const sl = qs('#statLikes');
  const sc = qs('#statComments');
  const cu = getCurrentUser();
  const all = getBlogs();
  const my = cu && cu.email ? all.filter(b => String(b.userEmail).toLowerCase() === String(cu.email).toLowerCase()) : [];
  const blogsCount = my.length;
  const likes = my.reduce((acc, b) => acc + (Array.isArray(b.likedBy) ? b.likedBy.length : (b.likes || 0)), 0);
  const comments = my.reduce((acc, b) => acc + (Array.isArray(b.comments) ? b.comments.length : 0), 0);
  if (sb) sb.textContent = String(blogsCount);
  if (sl) sl.textContent = String(likes);
  if (sc) sc.textContent = String(comments);
}

const formatDT = (ts) => { if (!ts) return ''; try { return new Date(ts).toLocaleDateString(); } catch { return ''; } };

const setFilled = el => { const f = el && el.closest('.field'); if (!f) return; const v = (el.tagName === 'SELECT') ? el.value : (el.value || '').trim(); if (v) f.classList.add('filled'); else f.classList.remove('filled'); };
qsa('.field input, .field textarea, .field select').forEach(el => { setFilled(el); ['input','change','blur'].forEach(ev => el.addEventListener(ev, () => setFilled(el))); });

sides.forEach(btn => {
  btn.addEventListener('click', () => {
    sides.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    Object.values(views).forEach(v => v.classList.remove('active'));
    const key = btn.dataset.view;
    const v = views[key];
    if (key === 'explore') { window.location.href = 'exploreBlogs.html'; return; }
    if (key === 'create') { window.location.hash = 'create'; window.location.reload(); return; }
    if (v) v.classList.add('active');
    if (key === 'blogs') renderBlogs();
    if (key === 'overview') { computeStats(); updateChart(); }
    if (document.body.clientWidth <= 992) {
      const sidebar = qs('.sidebar');
      if (sidebar) sidebar.classList.remove('open');
      if (sidebarOverlay) sidebarOverlay.classList.remove('show');
    }
  });
});

const newBlogBtn = qs('#newBlogBtn');
if (newBlogBtn) {
  newBlogBtn.addEventListener('click', () => {
    Object.values(views).forEach(v => v.classList.remove('active'));
    const v = views['create']; if (v) v.classList.add('active');
    sides.forEach(btn => btn.classList.remove('active'));
    const tab = sides.find(btn => btn.dataset.view === 'create'); if (tab) tab.classList.add('active');
    window.location.hash = 'create';
  });
}

const barsWrap = qs('.bars');
const labelsWrap = qs('.bar-labels');
function updateChart() {
  const cu = getCurrentUser();
  const all = getBlogs();
  const my = cu && cu.email ? all.filter(b => String(b.userEmail).toLowerCase() === String(cu.email).toLowerCase()) : [];
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setHours(0,0,0,0);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const counts = days.map(d => my.filter(b => {
    const t = new Date(b.createdAt || 0); t.setHours(0,0,0,0);
    return t.getTime() === d.getTime();
  }).length);
  const labels = days.map(d => d.toLocaleDateString(undefined, { weekday: 'short' }));
  if (labelsWrap) labelsWrap.innerHTML = labels.map(l => `<div>${l}</div>`).join('');
  if (!barsWrap) return;
  const existing = qsa('.bar');
  if (existing.length !== 7) barsWrap.innerHTML = Array.from({ length: 7 }, () => '<div class="bar" style="height:0"></div>').join('');
  const barsNow = qsa('.bar');
  const max = Math.max(1, ...counts);
  const maxH = 200;
  counts.forEach((c, i) => {
    const h = Math.max(8, Math.round((c / max) * maxH));
    const bar = barsNow[i];
    if (bar) requestAnimationFrame(() => { bar.style.height = h + 'px'; });
  });
}

const blogsList = qs('#blogsList');
const getBlogs = () => { try { return JSON.parse(localStorage.getItem('blogs') || '[]'); } catch { return []; } };
const setBlogs = (arr) => { localStorage.setItem('blogs', JSON.stringify(arr)); };
function syncLikesFromLikedBy() { const arr = getBlogs(); const upd = arr.map(b => { const lb = Array.isArray(b.likedBy) ? b.likedBy : []; const norm = Array.from(new Set(lb.map(e => String(e).toLowerCase()))); return { ...b, likedBy: norm, likes: norm.length }; }); setBlogs(upd); }
let editingId = null;
const renderBlogs = () => {
  if (!blogsList) return;
  const cu = getCurrentUser();
  const all = getBlogs();
  const my = cu && cu.email ? all.filter(b => String(b.userEmail).toLowerCase() === String(cu.email).toLowerCase()) : all;
  if (!my.length) {
    blogsList.innerHTML = `<article class="card list-item"><div><strong>No blogs yet</strong></div><div class="list-meta">Create one in the Create Post tab</div></article>`;
    return;
  }
  blogsList.innerHTML = my.map(b => `
    <article class="card list-item">
      <div>
        <div><strong>${b.name}</strong></div>
        <div class="list-meta list-meta-row"><span class="pill">${b.category}</span><span class="meta-item">${formatDT(b.createdAt)}</span></div>
        <div class="list-meta list-meta-row"><span class="meta-item">Likes: ${Array.isArray(b.likedBy) ? b.likedBy.length : (b.likes || 0)}</span><span class="meta-item">Comments: ${Array.isArray(b.comments) ? b.comments.length : 0}</span></div>
      </div>
      <div class="actions">
        <button class="btn small edit" data-id="${b.id}">Edit</button>
        <button class="btn small delete" data-id="${b.id}">Delete</button>
      </div>
    </article>
  `).join('');
  qsa('.btn.edit').forEach(el => el.addEventListener('click', (e) => {
    const id = e.currentTarget.getAttribute('data-id');
    const allBlogs = getBlogs();
    const b = allBlogs.find(x => String(x.id) === String(id));
    if (!b) return;
    editingId = b.id;
    if (blogName) blogName.value = b.name || '';
    if (category) category.value = b.category || '';
    if (imageUrl) imageUrl.value = b.image || '';
    if (description) description.value = b.description || '';
    [blogName, category, imageUrl, description].forEach(el2 => el2 && el2.dispatchEvent(new Event('input')));
    Object.values(views).forEach(v => v.classList.remove('active'));
    const v = views['create']; if (v) v.classList.add('active');
    sides.forEach(btn => btn.classList.remove('active'));
    const tab = sides.find(btn => btn.dataset.view === 'create'); if (tab) tab.classList.add('active');
    if (createBtn) createBtn.textContent = 'Update Post';
  }));
  qsa('.btn.delete').forEach(el => el.addEventListener('click', (e) => {
    const id = e.currentTarget.getAttribute('data-id');
    const ok = window.confirm('Delete this blog?');
    if (!ok) return;
    const arr = getBlogs().filter(b => String(b.id) !== String(id));
    setBlogs(arr);
    renderBlogs();
    showToast('Deleted');
    computeStats();
    updateChart();
  }));
};
syncLikesFromLikedBy();
renderBlogs();

const blogName = qs('#blogName');
const category = qs('#category');
const imageUrl = qs('#imageUrl');
const description = qs('#description');
const previewTitle = qs('#previewTitle');
const previewDesc = qs('#previewDesc');
const previewImage = qs('#previewImage');
const createBtn = qs('#createBtn');

const setPreview = () => {
  if (previewTitle) previewTitle.textContent = blogName && blogName.value.trim() ? blogName.value.trim() : 'Your post title';
  if (previewDesc) previewDesc.textContent = description && description.value.trim() ? description.value.trim() : 'Start typing to see live preview.';
  if (previewImage) {
    const url = imageUrl && imageUrl.value.trim();
    if (url && /^https?:\/\//i.test(url)) previewImage.style.backgroundImage = `url('${url}')`;
    else previewImage.style.backgroundImage = '';
  }
};
[blogName, description, imageUrl].forEach(el => el && el.addEventListener('input', setPreview));

const isValidUrl = (u) => /^https?:\/\//i.test(u);
if (createBtn) {
  createBtn.addEventListener('click', (e) => {
    const rect = createBtn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.setProperty('--x', x + 'px');
    ripple.style.setProperty('--y', y + 'px');
    createBtn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);

    const ax = rect.left + x;
    const ay = rect.top + y;

    const cu = getCurrentUser();
    if (!cu || !cu.email) { window.location.href = 'login.html'; return; }
    const name = blogName && blogName.value.trim();
    const cat = category && category.value.trim();
    const img = imageUrl && imageUrl.value.trim();
    const desc = description && description.value.trim();
    if (!name || !cat || !img || !desc) { showToast('Please fill all fields'); return; }
    if (!isValidUrl(img)) { showToast('Invalid image URL'); return; }
    const arr = getBlogs();
    if (editingId) {
      const idx = arr.findIndex(b => String(b.id) === String(editingId));
      if (idx >= 0) {
        arr[idx] = { ...arr[idx], name, category: cat, image: img, description: desc };
        setBlogs(arr);
        editingId = null;
        if (createBtn) createBtn.textContent = 'Create Post';
        if (blogName) blogName.value = '';
        if (category) category.value = '';
        if (imageUrl) imageUrl.value = '';
        if (description) description.value = '';
        [blogName, category, imageUrl, description].forEach(el => el && el.dispatchEvent(new Event('input')));
        showToast('Blog updated');
        Object.values(views).forEach(v => v.classList.remove('active'));
        const v2 = views['blogs']; if (v2) v2.classList.add('active');
        sides.forEach(b => b.classList.remove('active'));
        const tab = sides.find(b => b.dataset.view === 'blogs'); if (tab) tab.classList.add('active');
        renderBlogs();
        computeStats();
        updateChart();
        return;
      }
    }
    const newBlog = { id: Date.now(), userEmail: cu.email, name, category: cat, image: img, description: desc, likes: 0, likedBy: [], comments: [], createdAt: Date.now() };
    arr.push(newBlog);
    setBlogs(arr);
    if (blogName) blogName.value = '';
    if (category) category.value = '';
    if (imageUrl) imageUrl.value = '';
    if (description) description.value = '';
    [blogName, category, imageUrl, description].forEach(el => el && el.dispatchEvent(new Event('input')));
    showToast('Blog created');

    const root = getComputedStyle(document.documentElement);
    const c1 = (root.getPropertyValue('--primary') || '#7c3aed').trim();
    const c2 = (root.getPropertyValue('--secondary') || '#ec4899').trim();
    const c3 = '#cfc7ff';
    const c4 = '#ffd1ec';
    const c5 = '#c7f5ff';
    const colors = [c1, c2, c3, c4, c5];
    Array.from({ length: 32 }, () => 0).forEach(() => {
      const el = document.createElement('span');
      el.className = 'sprinkle';
      const ang = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 90;
      const dx = Math.round(Math.cos(ang) * dist);
      const dy = Math.round(Math.sin(ang) * dist);
      const size = 4 + Math.round(Math.random() * 6);
      const color = colors[Math.floor(Math.random() * colors.length)] || '#fff';
      el.style.setProperty('--x', ax + 'px');
      el.style.setProperty('--y', ay + 'px');
      el.style.setProperty('--dx', dx + 'px');
      el.style.setProperty('--dy', dy + 'px');
      el.style.setProperty('--size', size + 'px');
      el.style.setProperty('--color', color);
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 900);
    });
    Object.values(views).forEach(v => v.classList.remove('active'));
    const v = views['blogs']; if (v) v.classList.add('active');
    sides.forEach(b => b.classList.remove('active'));
    const tab = sides.find(b => b.dataset.view === 'blogs'); if (tab) tab.classList.add('active');
    renderBlogs();
    computeStats();
    updateChart();
  });
}

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    const sidebar = qs('.sidebar');
    if (sidebar) sidebar.classList.toggle('open');
    if (document.body.clientWidth <= 992 && sidebarOverlay) sidebarOverlay.classList.toggle('show');
  });
}

if (sidebarOverlay) {
  sidebarOverlay.addEventListener('click', () => {
    const sidebar = qs('.sidebar');
    if (sidebar) sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('show');
  });
}

const setUsername = qs('#setUsername');
const navUser = qs('#navUser');
const avatarInput = qs('#setAvatar');
const avatarPreview = qs('#avatarPreview');
const profileName = qs('#profileName');
const setFullName = qs('#setFullName');
const setEmail = qs('#setEmail');
const setBio = qs('#setBio');
const saveSettingsBtn = qs('#saveSettingsBtn');

let cuBoot = null; try { cuBoot = JSON.parse(localStorage.getItem('currentUser') || 'null'); } catch {}
if (cuBoot) {
  if (navUser) navUser.textContent = cuBoot.username || cuBoot.name || 'User';
  if (setUsername) setUsername.value = cuBoot.username || '';
  if (setFullName) setFullName.value = cuBoot.name || '';
  if (setEmail) setEmail.value = cuBoot.email || '';
  if (profileName) profileName.textContent = cuBoot.username || 'User';
}

if (setUsername) setUsername.addEventListener('input', () => { const v = setUsername.value.trim(); if (navUser) navUser.textContent = v || 'User'; if (profileName) profileName.textContent = v || 'User'; });
if (avatarInput) avatarInput.addEventListener('input', () => { const url = avatarInput.value.trim(); if (url && /^https?:\/\//i.test(url)) avatarPreview.style.backgroundImage = `url('${url}')`; else avatarPreview.style.backgroundImage = ''; });


const initCurrent = () => {
  const cu = getCurrentUser();
  if (!cu) { window.location.href = 'login.html'; return; }
  const users = getUsers();
  const full = users.find(u => String(u.email).toLowerCase() === String(cu.email).toLowerCase()) || cu;
  if (navUser) navUser.textContent = full.username || full.name || 'User';
  if (setUsername) setUsername.value = full.username || '';
  if (setFullName) setFullName.value = full.name || '';
  if (setEmail) setEmail.value = full.email || '';
  if (setBio) setBio.value = full.bio || '';
  if (profileName) profileName.textContent = full.username || 'User';
  const a = full.avatar || '';
  if (avatarPreview) { if (a && /^https?:\/\//i.test(a)) avatarPreview.style.backgroundImage = `url('${a}')`; else avatarPreview.style.backgroundImage = ''; }
  [setUsername, setFullName, setEmail, setBio].forEach(el => el && el.dispatchEvent(new Event('input')));
};
initCurrent();
computeStats();
updateChart();
initViewFromHash();

if (saveSettingsBtn) {
  saveSettingsBtn.addEventListener('click', () => {
    const username = setUsername && setUsername.value.trim() || '';
    const name = setFullName && setFullName.value.trim() || '';
    const email = setEmail && setEmail.value.trim() || '';
    const avatar = avatarInput && avatarInput.value.trim() || '';
    const bio = setBio && setBio.value.trim() || '';
    const cu = getCurrentUser();
    const users = getUsers();
    const oldEmail = cu && cu.email ? String(cu.email).toLowerCase() : '';
    const idx = users.findIndex(u => String(u.email).toLowerCase() === oldEmail);
    if (idx >= 0) {
      users[idx] = { ...users[idx], username, name, email, avatar, bio };
    } else if (email) {
      users.push({ username, name, email, password: '', avatar, bio });
    }
    setUsersLS(users);
    const newCu = { username, name, email, avatar, bio };
    setCurrentUser(newCu);
    if (navUser) navUser.textContent = username || name || 'User';
    if (profileName) profileName.textContent = username || 'User';
    if (avatarPreview) { if (avatar && /^https?:\/\//i.test(avatar)) avatarPreview.style.backgroundImage = `url('${avatar}')`; else avatarPreview.style.backgroundImage = ''; }
    showToast('Saved');
  });
}

const applyTheme = (t) => { document.documentElement.setAttribute('data-theme', t); const btn = qs('#themeToggle'); if (btn) btn.textContent = t === 'light' ? '☀️' : '🌙'; localStorage.setItem('theme', t); };
const initTheme = () => { const t = localStorage.getItem('theme') || 'dark'; applyTheme(t); const btn = qs('#themeToggle'); if (btn) btn.addEventListener('click', () => { const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light'; applyTheme(next); }); };
initTheme();

const logoutBtn = qs('#logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    try { localStorage.removeItem('currentUser'); } catch {}
    window.location.href = 'login.html';
  });
}