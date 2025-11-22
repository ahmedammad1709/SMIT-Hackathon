const qs = s => document.querySelector(s);
const qsa = s => Array.from(document.querySelectorAll(s));

const toast = qs('#toast');
const menuToggle = qs('#menuToggle');
const sides = qsa('.side-item');
const views = {
  overview: qs('#view-overview'),
  blogs: qs('#view-blogs'),
  create: qs('#view-create'),
  settings: qs('#view-settings')
};

const showToast = (msg) => { if (!toast) return; toast.textContent = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 1400); };

const setFilled = el => { const f = el && el.closest('.field'); if (!f) return; const v = (el.tagName === 'SELECT') ? el.value : (el.value || '').trim(); if (v) f.classList.add('filled'); else f.classList.remove('filled'); };
qsa('.field input, .field textarea, .field select').forEach(el => { setFilled(el); ['input','change','blur'].forEach(ev => el.addEventListener(ev, () => setFilled(el))); });

sides.forEach(btn => {
  btn.addEventListener('click', () => {
    sides.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    Object.values(views).forEach(v => v.classList.remove('active'));
    const v = views[btn.dataset.view];
    if (v) v.classList.add('active');
    if (document.body.clientWidth <= 992) {
      const sidebar = qs('.sidebar');
      if (sidebar) sidebar.classList.remove('open');
    }
  });
});

const bars = qsa('.bar');
const dummy = [16, 28, 12, 30, 22, 40, 26];
bars.forEach((bar, i) => { const h = dummy[i % dummy.length]; requestAnimationFrame(() => { bar.style.height = h * 3 + 'px'; }); });

const blogsList = qs('#blogsList');
const blogs = [
  { title: 'Mastering Async JS', cat: 'Technology' },
  { title: 'AI in 2025', cat: 'Science' },
  { title: 'Top 10 Indie Movies', cat: 'Movies' },
  { title: 'Weekend Football Recap', cat: 'Sports' },
  { title: 'Life Minimalism', cat: 'Lifestyle' },
  { title: 'Hidden Gems in Kyoto', cat: 'Travel' }
];
if (blogsList) {
  blogsList.innerHTML = blogs.map(b => `
    <article class="card list-item">
      <div>
        <div><strong>${b.title}</strong></div>
        <div class="list-meta">Category: <span class="pill">${b.cat}</span></div>
      </div>
      <div class="actions">
        <button class="btn small edit">Edit</button>
        <button class="btn small delete">Delete</button>
      </div>
    </article>
  `).join('');
  qsa('.btn.edit').forEach(el => el.addEventListener('click', () => showToast('Edit clicked')));
  qsa('.btn.delete').forEach(el => el.addEventListener('click', () => showToast('Delete clicked')));
}

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
    showToast('UI only: post created preview');
  });
}

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    const sidebar = qs('.sidebar');
    if (sidebar) sidebar.classList.toggle('open');
  });
}

const setUsername = qs('#setUsername');
const navUser = qs('#navUser');
const avatarInput = qs('#setAvatar');
const avatarPreview = qs('#avatarPreview');
const profileName = qs('#profileName');

if (setUsername) setUsername.addEventListener('input', () => { const v = setUsername.value.trim(); if (navUser) navUser.textContent = v || 'User'; if (profileName) profileName.textContent = v || 'User'; });
if (avatarInput) avatarInput.addEventListener('input', () => { const url = avatarInput.value.trim(); if (url && /^https?:\/\//i.test(url)) avatarPreview.style.backgroundImage = `url('${url}')`; else avatarPreview.style.backgroundImage = ''; });