const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const header = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const cta = document.getElementById('ctaBtn');

const handleScroll = () => {
  const scrolled = window.scrollY > 10;
  if (scrolled) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
};
handleScroll();
window.addEventListener('scroll', handleScroll, { passive: true });

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href') || '';
    if (href.startsWith('#')) {
      e.preventDefault();
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (id === 'login') {
        alert('Login is coming soon. This module is only the landing page.');
        return;
      }
      if (target) {
        const top = target.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  });
});

const createRipple = (x, y, el) => {
  const span = document.createElement('span');
  span.className = 'ripple';
  const rect = el.getBoundingClientRect();
  span.style.setProperty('--x', `${x - rect.left}px`);
  span.style.setProperty('--y', `${y - rect.top}px`);
  el.appendChild(span);
  span.addEventListener('animationend', () => span.remove());
};

if (cta) {
  cta.addEventListener('click', e => {
    const x = e.clientX;
    const y = e.clientY;
    createRipple(x, y, cta);
    const count = Number(localStorage.getItem('ctaClicks') || 0) + 1;
    localStorage.setItem('ctaClicks', String(count));
    localStorage.setItem('visitedLanding', 'true');
  });
}