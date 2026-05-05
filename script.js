/* ════════════════════════════════════════
   PORTFOLIO SCRIPT — Dr. Amara Osei
   ════════════════════════════════════════ */

// ── Footer year ──
document.getElementById('year').textContent = new Date().getFullYear();

// ── Navbar scroll shadow ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ── Mobile burger menu ──
const burger    = document.getElementById('burger');
const navLinks  = document.getElementById('nav-links');

burger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  burger.classList.toggle('open', isOpen);
  burger.setAttribute('aria-expanded', isOpen);
});

// Close mobile menu when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', false);
  });
});

// ── Scroll reveal ──
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger siblings inside the same parent
      const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal'));
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, idx * 90);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Active nav link on scroll ──
const sections   = document.querySelectorAll('section[id], header[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navAnchors.forEach(a => {
        a.style.color = '';
        if (a.getAttribute('href') === `#${id}`) {
          a.style.color = 'var(--blue)';
        }
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => sectionObserver.observe(s));

// ── Contact form (Formspree) ──
const form     = document.getElementById('contact-form');
const formNote = document.getElementById('form-note');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name    = form.name.value.trim();
  const email   = form.email.value.trim();
  const message = form.message.value.trim();

  if (!name || !email || !message) {
    formNote.textContent = 'Please fill in your name, email, and message.';
    formNote.style.color = '#c0392b';
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    formNote.textContent = 'Please enter a valid email address.';
    formNote.style.color = '#c0392b';
    return;
  }

  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Sending…';
  btn.disabled    = true;

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      formNote.textContent = '✓ Thank you! Your message has been received. I\'ll be in touch soon.';
      formNote.style.color = 'var(--blue-light)';
      form.reset();
    } else {
      formNote.textContent = 'Oops! Something went wrong. Please try again or reach out via LinkedIn.';
      formNote.style.color = '#c0392b';
    }
  } catch (err) {
    formNote.textContent = 'Network error. Please check your connection and try again.';
    formNote.style.color = '#c0392b';
  }

  btn.textContent = 'Send Message';
  btn.disabled    = false;
});

// ── Smooth-scroll for same-page anchors ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = navbar.offsetHeight + 16;
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ── Carousels ──
function initCarousel(wrapperId) {
  const wrapper   = document.getElementById(wrapperId);
  if (!wrapper) return;

  const track     = wrapper.querySelector('.carousel-track');
  const slides    = Array.from(wrapper.querySelectorAll('.carousel-slide'));
  const prevBtn   = wrapper.querySelector('.carousel-prev');
  const nextBtn   = wrapper.querySelector('.carousel-next');
  const dotsWrap  = wrapper.querySelector('.carousel-dots');

  let currentIndex = 0;

  // ── Determine visible slides per viewport ──
  function getSlidesVisible() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  // ── Build dots ──
  function buildDots() {
    dotsWrap.innerHTML = '';
    const total = slides.length - getSlidesVisible() + 1;
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  // ── Update dot states ──
  function updateDots() {
    dotsWrap.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  // ── Compute slide width including gap ──
  function getSlideStep() {
    if (!slides[0]) return 0;
    const style  = getComputedStyle(track);
    const gap    = parseFloat(style.gap) || 0;
    return slides[0].getBoundingClientRect().width + gap;
  }

  // ── Go to index ──
  function goTo(index) {
    const maxIndex = slides.length - getSlidesVisible();
    currentIndex   = Math.max(0, Math.min(index, maxIndex));
    track.style.transform = `translateX(-${currentIndex * getSlideStep()}px)`;
    updateDots();
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= maxIndex;
  }

  // ── Buttons ──
  prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

  // ── Touch/swipe ──
  let touchStartX = 0;
  wrapper.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  wrapper.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(currentIndex + (diff > 0 ? 1 : -1));
  });

  // ── Keyboard ──
  wrapper.setAttribute('tabindex', '0');
  wrapper.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  goTo(currentIndex - 1);
    if (e.key === 'ArrowRight') goTo(currentIndex + 1);
  });

  // ── Init & re-init on resize ──
  function init() {
    currentIndex = 0;
    buildDots();
    goTo(0);
  }

  init();
  window.addEventListener('resize', () => {
    init();
  }, { passive: true });
}

initCarousel('research-carousel');
initCarousel('projects-carousel');
initCarousel('awards-carousel');
