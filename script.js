

(function(){
  // Utilities
  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

  // Year in footer
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();

  // Mobile menu
  const menuBtn = $('.menu-btn');
  const mobileNav = $('#mobileNav');
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', () => {
      const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', String(!expanded));
      if(expanded){ mobileNav.setAttribute('hidden',''); } else { mobileNav.removeAttribute('hidden'); }
    });
    // Close mobile nav when clicking a link
    $$('#mobileNav a').forEach(a => a.addEventListener('click', () => {
      mobileNav.setAttribute('hidden','');
      menuBtn.setAttribute('aria-expanded', 'false');
    }));
  }

  // Smooth scroll for hash links
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' });
      }
    });
  });

  // Contact form (demo). If data-endpoint is provided, POST JSON there.
  const form = $('#contactForm');
  const clearBtn = document.getElementById('contactClear');
  if (clearBtn && form) {
    clearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      form.reset();
      const fields = ['name','email'];
      fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      const msgEl = document.getElementById('msg');
      if (msgEl) {
        msgEl.value = '';
        msgEl.style.height = '36px';
      }
      const focusField = document.getElementById('name');
      if (focusField) focusField.focus();
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      // Honeypot
      const hp = form.querySelector('input[name="company"]');
      if (hp && hp.value) { return; }

      const data = Object.fromEntries(new FormData(form).entries());
      const endpoint = form.getAttribute('data-endpoint');

      try {
        if (endpoint && endpoint !== '#') {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          if (!res.ok) throw new Error('Błąd wysyłki');
          alert('Dzięki! Formularz został wysłany.');
        } else {
          alert('Dzięki! To demo — podepnij tu wysyłkę do e‑maila lub narzędzia (np. Formspree, Netlify Forms, własny endpoint).');
        }
        form.reset();
      } catch (err) {
        alert('Nie udało się wysłać formularza. Spróbuj ponownie później.');
      }
    });
  }

  // Auto-grow contact textarea
  const messageField = $('#msg');
  if (messageField) {
    const adjust = (el) => {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    };
    adjust(messageField);
    messageField.addEventListener('input', () => adjust(messageField));
  }

  // Lightbox
  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightbox-img');
  const lightboxClose = $('.lightbox-close');
  const prevBtn = $('.lightbox-prev');
  const nextBtn = $('.lightbox-next');
  const galleryLinks = $$('.lightbox-link');
  const galleryItems = galleryLinks.map((link, index) => {
    const img = link.querySelector('img');
    return {
      src: link.getAttribute('href') || img?.src || '',
      alt: img?.alt || `Realizacja ${index + 1}`
    };
  });

  let lastFocused = null;
  let previousOverflow = '';
  let currentIndex = -1;

  function showImage(index){
    if (!lightbox || !lightboxImg) return false;
    const item = galleryItems[index];
    if (!item?.src) return false;
    currentIndex = index;
    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt || '';
    if (galleryItems.length > 1) {
      prevBtn?.removeAttribute('hidden');
      nextBtn?.removeAttribute('hidden');
    } else {
      prevBtn?.setAttribute('hidden', '');
      nextBtn?.setAttribute('hidden', '');
    }
    return true;
  }

  function openLightbox(index){
    if (!galleryItems.length) return;
    if (!showImage(index)) return;
    lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    lightbox.removeAttribute('hidden');
    lightbox.setAttribute('aria-hidden', 'false');
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightboxClose?.focus({ preventScroll: true });
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox(){
    if (!lightbox) return;
    lightbox.setAttribute('hidden', '');
    lightbox.setAttribute('aria-hidden', 'true');
    if (lightboxImg) {
      lightboxImg.src = '';
      lightboxImg.alt = '';
    }
    currentIndex = -1;
    document.body.style.overflow = previousOverflow || '';
    previousOverflow = '';
    if (lastFocused) {
      lastFocused.focus({ preventScroll: true });
      lastFocused = null;
    }
  }

  // bind gallery links
  galleryLinks.forEach((link, index) => {
    link.addEventListener('click', e => {
      e.preventDefault();
      openLightbox(index);
    });
  });
  if (prevBtn) prevBtn.addEventListener('click', () => {
    if (galleryItems.length <= 1) return;
    const prevIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    showImage(prevIndex);
  });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    if (galleryItems.length <= 1) return;
    const nextIndex = (currentIndex + 1) % galleryItems.length;
    showImage(nextIndex);
  });
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (!lightbox || lightbox.hasAttribute('hidden')) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeLightbox();
    }
    if (e.key === 'ArrowRight' && galleryItems.length > 1) {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % galleryItems.length;
      showImage(nextIndex);
    }
    if (e.key === 'ArrowLeft' && galleryItems.length > 1) {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
      showImage(prevIndex);
    }
  });
})();

// Ensure aria-expanded sync on load
(function(){
  const btn = document.querySelector('.menu-btn');
  const mobile = document.getElementById('mobileNav');
  if(btn && mobile){
    btn.setAttribute('aria-expanded', String(!mobile.hasAttribute('hidden')));
  }
})();
