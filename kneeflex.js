(() => {
  const doc = document;
  const config = window.KNEEFLEX_CONFIG || {};
  const isHttps = value => { try { return new URL(value).protocol === 'https:'; } catch { return false; } };
  const enableLink = (link, href, text) => {
    link.href = href;
    link.removeAttribute('aria-disabled');
    if (text) link.textContent = text;
  };
  if (config.contactEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.contactEmail)) {
    doc.querySelectorAll('[data-email-link]').forEach(link => enableLink(link, 'mailto:' + config.contactEmail, config.contactEmail));
  }
  if (isHttps(config.instagramUrl)) {
    doc.querySelectorAll('[data-social-link]').forEach(link => {
      enableLink(link, config.instagramUrl, 'Follow KneeFlex on Instagram ↗');
      link.target = '_blank'; link.rel = 'noopener noreferrer';
    });
  }
  if (isHttps(config.donationUrl)) {
    const link = doc.querySelector('[data-donate-link]');
    enableLink(link, config.donationUrl);
    link.target = '_blank'; link.rel = 'noopener noreferrer';
    doc.querySelector('[data-donate-note]').textContent = 'Continue to our donation page.';
  }
  const video = doc.getElementById('hero-video');
  const menuToggle = doc.getElementById('menu-toggle');
  const menu = doc.getElementById('mobile-menu');

  if (video) {
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    const playFilm = () => video.play().catch(() => {});
    playFilm();
    doc.addEventListener('visibilitychange', () => {
      if (!doc.hidden) playFilm();
    });
  }

  const signup = doc.getElementById('signup-form');
  if (isHttps(config.waitlistEndpoint)) signup.dataset.endpoint = config.waitlistEndpoint;
  const signupStatus = doc.getElementById('signup-status');
  signup?.addEventListener('submit', async event => {
    event.preventDefault();
    if (!signup.reportValidity()) return;
    const endpoint = signup.dataset.endpoint.trim();
    if (!endpoint) {
      signupStatus.textContent = 'Email signup is opening soon. Your email has not been submitted.';
      return;
    }
    const button = signup.querySelector('button');
    button.disabled = true;
    signupStatus.textContent = 'Sending…';
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: new FormData(signup),
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) throw new Error('Signup failed');
      signupStatus.textContent = 'Thank you. We’ll be in touch!';
      signup.reset();
    } catch {
      signupStatus.textContent = 'We couldn’t submit your email. Please try again.';
    } finally {
      button.disabled = false;
    }
  });

  function closeMenu() {
    if (!menu || !menuToggle) return;
    menu.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
  }
  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    menu.hidden = open;
    menuToggle.setAttribute('aria-expanded', String(!open));
    menuToggle.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
  });
  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  doc.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 720) closeMenu(); }, { passive: true });

  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = doc.documentElement;
  const hero = doc.querySelector('.hero');
  const showcase = doc.querySelector('.product-showcase');
  const storyPhotos = doc.querySelector('.story-photos');
  const reviewRows = doc.querySelectorAll('.review-row');
  let frame = 0;

  function updateScroll() {
    frame = 0;
    const scrollRange = root.scrollHeight - window.innerHeight;
    const progress = scrollRange > 0 ? window.scrollY / scrollRange : 0;
    const heroRect = hero?.getBoundingClientRect();
    const productRect = showcase?.getBoundingClientRect();
    const mobile = window.innerWidth <= 720;
    doc.querySelector('.scroll-progress')?.style.setProperty('transform', `scaleX(${Math.min(1, Math.max(0, progress))})`);
    if (storyPhotos) {
      const photoRect = storyPhotos.getBoundingClientRect();
      const unfold = Math.max(0, Math.min(1, (window.innerHeight * .88 - photoRect.top) / (window.innerHeight * .48)));
      storyPhotos.style.setProperty('--photo-fold', motionPreference.matches ? '0' : String(1 - unfold));
    }
    reviewRows.forEach(row => {
      const reviewRect = row.getBoundingClientRect();
      const unfold = Math.max(0, Math.min(1, (window.innerHeight * .92 - reviewRect.top) / (window.innerHeight * .42)));
      row.style.setProperty('--review-fold', motionPreference.matches ? '0' : String(1 - unfold));
    });
    if (motionPreference.matches) return;
    if (heroRect && heroRect.bottom > 0) {
      const distance = Math.max(0, -heroRect.top);
      hero.style.setProperty('--hero-offset', `${distance * .12}px`);
      hero.style.setProperty('--film-offset', `${distance * .16}px`);
      hero.style.setProperty('--hero-opacity', String(Math.max(.25, 1 - distance / heroRect.height)));
    }
    if (productRect && productRect.bottom > 0 && productRect.top < window.innerHeight) {
      const position = Math.max(0, Math.min(1, (window.innerHeight - productRect.top) / (window.innerHeight + productRect.height)));
      showcase.style.setProperty('--product-offset', `${(position - .5) * (mobile ? 12 : 50)}px`);
      showcase.style.setProperty('--product-scale', String((mobile ? 1.04 : 1.16) - position * (mobile ? .02 : .10)));
    }
  }
  function scheduleScroll() {
    if (!frame) frame = requestAnimationFrame(updateScroll);
  }
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll, { passive: true });
  window.addEventListener('load', scheduleScroll, { once: true });
  scheduleScroll();

  if ('IntersectionObserver' in window) {
    if (!motionPreference.matches) root.classList.add('js-ready', 'motion-ready');
    doc.querySelectorAll('.feature').forEach((feature, index) => {
      feature.style.setProperty('--reveal-delay', `${index * 130}ms`);
    });
    doc.querySelector('.contact-copy')?.style.setProperty('--reveal-delay', '150ms');
    doc.querySelector('.idea-film')?.style.setProperty('--reveal-delay', '160ms');
    doc.querySelector('.load-card')?.style.setProperty('--reveal-delay', '130ms');
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .08, rootMargin: '0px 0px -20px 0px' });
    doc.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
    const ambientObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('is-running', entry.isIntersecting));
    });
    doc.querySelectorAll('.contact, .mechanics-card').forEach(el => ambientObserver.observe(el));
  }
  motionPreference.addEventListener('change', () => {
    root.classList.toggle('motion-ready', !motionPreference.matches);
    if (motionPreference.matches) {
      root.classList.remove('js-ready');
      doc.querySelectorAll('[style]').forEach(el => {
        el.style.removeProperty('--pointer-x');
        el.style.removeProperty('--pointer-y');
      });
    }
    scheduleScroll();
  });
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  doc.querySelectorAll('.nav-cta, .signup-field button, .discover-icon').forEach(button => {
    button.addEventListener('pointermove', event => {
      if (motionPreference.matches || !finePointer.matches || button.disabled) return;
      const bounds = button.getBoundingClientRect();
      button.style.setProperty('--pointer-x', `${(event.clientX - bounds.left - bounds.width / 2) * .12}px`);
      button.style.setProperty('--pointer-y', `${(event.clientY - bounds.top - bounds.height / 2) * .15}px`);
    });
    button.addEventListener('pointerleave', () => {
      button.style.setProperty('--pointer-x', '0px');
      button.style.setProperty('--pointer-y', '0px');
    });
  });
})();
