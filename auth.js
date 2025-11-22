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

const loadUsers = () => { try { return JSON.parse(localStorage.getItem('users') || '[]'); } catch { return []; } };
const setUsers = users => { localStorage.setItem('users', JSON.stringify(users)); };

const emailExists = email => {
  const users = loadUsers();
  const e = String(email).toLowerCase();
  return users.some(u => String(u.email).toLowerCase() === e);
};

const handleSignup = () => {
  const form = qs('#signupForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const username = qs('#username')?.value.trim() || '';
    const name = qs('#name')?.value.trim() || '';
    const email = qs('#email')?.value.trim() || '';
    const password = qs('#password')?.value || '';
    clearErrors();
    let hasErr = false;
    if (!username) { setError('username', 'Username is required'); hasErr = true; }
    if (!name) { setError('name', 'Full name is required'); hasErr = true; }
    if (!email) { setError('email', 'Email is required'); hasErr = true; }
    if (!password) { setError('password', 'Password is required'); hasErr = true; }
    if (hasErr) { showError('Please fix the errors'); return; }
    if (emailExists(email)) { setError('email', 'Email already registered'); showError('Email already registered'); return; }
    saveUser();
  });
};

const handleLogin = () => {
  const form = qs('#loginForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    clearErrors();
    validateLogin();
  });
};

const setError = (field, message) => {
  const err = qs(`#${field}Err`) || qs(`#login${capitalize(field)}Err`);
  const wrap = qs(`#${field}`)?.closest('.field') || qs(`#login${capitalize(field)}`)?.closest('.field');
  if (wrap) wrap.classList.add('error');
  if (err) err.textContent = message;
};

const clearErrors = () => {
  document.querySelectorAll('.field.error').forEach(el => el.classList.remove('error'));
  document.querySelectorAll('.error').forEach(el => { el.textContent = ''; });
};

const showError = message => { showToast(message, 'error'); };

const saveUser = () => {
  const username = qs('#username')?.value.trim() || '';
  const name = qs('#name')?.value.trim() || '';
  const email = qs('#email')?.value.trim() || '';
  const password = qs('#password')?.value || '';
  const users = loadUsers();
  users.push({ username, name, email, password });
  setUsers(users);
  showToast('Account created. Redirecting...', 'success');
  setTimeout(() => { window.location.href = 'login.html'; }, 900);
};

const validateLogin = () => {
  const email = qs('#loginEmail')?.value.trim() || '';
  const password = qs('#loginPassword')?.value || '';
  let hasErr = false;
  if (!email) { setError('email', 'Email is required'); hasErr = true; }
  if (!password) { setError('password', 'Password is required'); hasErr = true; }
  if (hasErr) { showError('Please enter credentials'); return; }
  const users = loadUsers();
  const e = String(email).toLowerCase();
  const user = users.find(u => String(u.email).toLowerCase() === e);
  if (!user) { setError('email', 'Email not found'); showError('Email not found'); return; }
  if (user.password !== password) { setError('password', 'Incorrect password'); showError('Incorrect password'); return; }
  const cu = { username: user.username || '', name: user.name || '', email: user.email };
  localStorage.setItem('currentUser', JSON.stringify(cu));
  showToast('Welcome back. Redirecting...', 'success');
  setTimeout(() => { window.location.href = 'dashboard.html'; }, 900);
};

const capitalize = s => (s || '').charAt(0).toUpperCase() + (s || '').slice(1);

handleSignup();
handleLogin();