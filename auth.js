const qs = s => document.querySelector(s);
const qsa = s => document.querySelectorAll(s);

const showToast = (msg, type = 'info') => {
  const el = qs('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('success', 'error');
  if (type === 'success') el.classList.add('success');
  if (type === 'error') el.classList.add('error');
  el.classList.add('show');
  setTimeout(() => { el.classList.remove('show'); }, 1800);
};

const getUsers = () => {
  try { return JSON.parse(localStorage.getItem('users') || '[]'); } catch { return []; }
};
const setUsers = users => { localStorage.setItem('users', JSON.stringify(users)); };

const emailExists = email => {
  const users = getUsers();
  const e = String(email).toLowerCase();
  return users.some(u => String(u.email).toLowerCase() === e);
};

const handleSignup = () => {
  const form = qs('#signupForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = qs('#name')?.value.trim() || '';
    const email = qs('#email')?.value.trim() || '';
    const password = qs('#password')?.value || '';
    if (!name || !email || !password) { showToast('Please fill all fields.', 'error'); return; }
    if (emailExists(email)) { showToast('Email already registered.', 'error'); return; }
    const users = getUsers();
    users.push({ name, email, password });
    setUsers(users);
    showToast('Account created. Redirecting...', 'success');
    setTimeout(() => { window.location.href = 'login.html'; }, 900);
  });
};

const handleLogin = () => {
  const form = qs('#loginForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = qs('#loginEmail')?.value.trim() || '';
    const password = qs('#loginPassword')?.value || '';
    if (!email || !password) { showToast('Enter email and password.', 'error'); return; }
    const users = getUsers();
    const e = String(email).toLowerCase();
    const user = users.find(u => String(u.email).toLowerCase() === e && u.password === password);
    if (!user) { showToast('Invalid email or password.', 'error'); return; }
    localStorage.setItem('currentUser', JSON.stringify(user));
    showToast('Welcome back. Redirecting...', 'success');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 900);
  });
};

handleSignup();
handleLogin();