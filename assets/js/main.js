// AUREAS Ingeniería — interacciones, sin dependencias

document.addEventListener('DOMContentLoaded', () => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Año actual en el footer
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  // Menú móvil (con cierre por Escape o clic fuera)
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav__links, .nav-links');
  const closeMenu = () => {
    if (links && links.classList.contains('is-open')) {
      links.classList.remove('is-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }
  };
  if (toggle && links) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', (e) => { 
      if (e.target.closest('a') && !e.target.closest('.nav-link--dropdown')) closeMenu(); 
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
    document.addEventListener('click', (e) => {
      if (links.classList.contains('is-open') && !toggle.contains(e.target) && !links.contains(e.target)) {
        closeMenu();
      }
    });
  }

  // Desplegable de Servicios en la Cabecera
  const dropdownItems = document.querySelectorAll('.nav-item--dropdown');
  dropdownItems.forEach((item) => {
    const trigger = item.querySelector('.nav-link--dropdown');
    if (!trigger) return;

    trigger.addEventListener('click', (e) => {
      if (window.innerWidth <= 760) {
        e.preventDefault();
        const isOpen = item.classList.toggle('is-open');
        trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      }
    });

    item.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        item.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.focus();
      }
    });
  });

  document.addEventListener('click', (e) => {
    dropdownItems.forEach((item) => {
      if (!item.contains(e.target)) {
        item.classList.remove('is-open');
        const trigger = item.querySelector('.nav-link--dropdown');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Acordeones FAQ Técnicos
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      if (!item) return;
      const isOpen = item.classList.contains('is-open');

      const parentAccordion = item.closest('.faq-accordion');
      if (parentAccordion) {
        parentAccordion.querySelectorAll('.faq-item').forEach((sibling) => {
          if (sibling !== item) {
            sibling.classList.remove('is-open');
            const sibBtn = sibling.querySelector('.faq-question');
            if (sibBtn) sibBtn.setAttribute('aria-expanded', 'false');
          }
        });
      }

      item.classList.toggle('is-open', !isOpen);
      btn.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
    });
  });

  // Aparición progresiva al hacer scroll
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // Gestor inteligente de enlaces de correo (mailto + Webmail + Portapapeles)
  const showMailToast = (email) => {
    let toast = document.querySelector('.mail-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'mail-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
    const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(email)}`;

    toast.innerHTML = `
      <div class="mail-toast__inner">
        <div class="mail-toast__info">
          <span class="mail-toast__icon">✓</span>
          <div>
            <div class="mail-toast__title"><strong>Correo copiado:</strong> <span class="mail-toast__email">${email}</span></div>
            <div class="mail-toast__hint">Abriendo tu gestor de correo predeterminado... O elígelo directamente:</div>
          </div>
        </div>
        <div class="mail-toast__actions">
          <a class="mail-toast__btn" href="${gmailUrl}" target="_blank" rel="noopener noreferrer">Abrir en Gmail</a>
          <a class="mail-toast__btn" href="${outlookUrl}" target="_blank" rel="noopener noreferrer">Abrir en Outlook</a>
          <button class="mail-toast__close" type="button" aria-label="Cerrar notificación">✕</button>
        </div>
      </div>
    `;

    toast.classList.remove('is-visible');
    void toast.offsetWidth;
    toast.classList.add('is-visible');

    const closeBtn = toast.querySelector('.mail-toast__close');
    let timer = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 8500);

    closeBtn.addEventListener('click', () => {
      clearTimeout(timer);
      toast.classList.remove('is-visible');
    });
  };

  // Escuchar todos los enlaces mailto
  document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
    link.addEventListener('click', async () => {
      const href = link.getAttribute('href');
      const email = href.replace(/^mailto:/i, '').split('?')[0];
      if (!email) return;
      try {
        await navigator.clipboard.writeText(email);
      } catch (_) {}
      showMailToast(email);
    });
  });

  // Botones dedicados de copiar correo
  document.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const text = btn.getAttribute('data-copy');
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        const prev = btn.textContent;
        btn.textContent = 'Copiado ✓';
        btn.classList.add('is-copied');
        showMailToast(text);
        setTimeout(() => { btn.textContent = prev; btn.classList.remove('is-copied'); }, 1800);
      } catch (_) {
        showMailToast(text);
      }
    });
  });

  // Barra de progreso de lectura: completa el corte áureo del header
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.prepend(progress);

  // Parallax de scroll + progreso, en un solo rAF
  const arcs = document.querySelector('.hero__arcs');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
      if (arcs && !reduced && window.innerWidth > 760) {
        arcs.style.setProperty('--plx', (window.scrollY * -0.07).toFixed(1) + 'px');
      }
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Los arcos siguen suavemente al puntero (solo escritorio)
  const hero = document.querySelector('.hero');
  const fine = window.matchMedia('(pointer: fine)').matches;
  if (hero && arcs && fine && !reduced) {
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      arcs.style.setProperty('--mx', (nx * 14).toFixed(1) + 'px');
      arcs.style.setProperty('--my', (ny * 10).toFixed(1) + 'px');
    });
    hero.addEventListener('mouseleave', () => {
      arcs.style.setProperty('--mx', '0px');
      arcs.style.setProperty('--my', '0px');
    });
  }

  // Firma para quien abra la consola
  try {
    console.log('%cAUREAS Ingeniería', 'color:#00c4c4;font-weight:bold;font-size:14px;font-family:monospace');
    console.log('%cφ = 1.6180339887…  ·  Elche, Alicante', 'color:#d9b45b;font-family:monospace');
  } catch (_) {}

  // ---------- Órbita de servicios ----------
  const orbit = document.getElementById('orbit');
  if (orbit) {
    const coreEl = orbit.querySelector('#orbit-core') || orbit.querySelector('.orbit__core');
    const core = {
      ref: orbit.querySelector('[data-core-ref]'),
      title: orbit.querySelector('[data-core-title]'),
      text: orbit.querySelector('[data-core-text]'),
      cta: orbit.querySelector('[data-core-cta]')
    };
    const defaults = {
      ref: core.ref.innerHTML, title: core.title.innerHTML,
      text: core.text.innerHTML, cta: ''
    };
    const nodes = orbit.querySelectorAll('.orbit__node');
    let activeNode = null;

    const show = (node) => {
      activeNode = node;
      orbit.classList.add('is-paused');
      nodes.forEach((n) => n.classList.toggle('is-active', n === node));
      core.ref.textContent = node.dataset.num + ' · ' + node.dataset.who;
      core.title.textContent = node.dataset.title;
      core.text.textContent = node.dataset.text;
      core.cta.textContent = 'Ver detalle →';
    };
    const reset = () => {
      activeNode = null;
      orbit.classList.remove('is-paused');
      nodes.forEach((n) => n.classList.remove('is-active'));
      core.ref.innerHTML = defaults.ref;
      core.title.innerHTML = defaults.title;
      core.text.innerHTML = defaults.text;
      core.cta.textContent = defaults.cta;
    };

    const isTouchDevice = () => window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

    nodes.forEach((node) => {
      node.addEventListener('mouseenter', () => {
        if (!isTouchDevice()) show(node);
      });
      node.addEventListener('focus', () => show(node));

      const go = () => {
        const h = node.dataset.href;
        if (h) window.location.href = h;
      };

      node.addEventListener('click', (e) => {
        if (isTouchDevice()) {
          // En pantallas táctiles: primer toque activa y muestra info; segundo toque navega
          if (activeNode === node) {
            go();
          } else {
            e.preventDefault();
            show(node);
          }
        } else {
          go();
        }
      });

      node.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
      });
    });

    if (coreEl) {
      coreEl.addEventListener('click', () => {
        if (activeNode && activeNode.dataset.href) {
          window.location.href = activeNode.dataset.href;
        }
      });
    }

    orbit.addEventListener('mouseleave', () => {
      if (!isTouchDevice()) reset();
    });
    orbit.addEventListener('focusout', (e) => {
      if (!orbit.contains(e.relatedTarget)) reset();
    });

    // En pantallas táctiles, si se pulsa fuera de la órbita, reanudar giro
    document.addEventListener('touchstart', (e) => {
      if (activeNode && !orbit.contains(e.target)) {
        reset();
      }
    }, { passive: true });
  }

  // ---------- Proceso: carrusel horizontal ----------
  const seq = document.getElementById('seq');
  const track = document.getElementById('seq-track');
  if (seq && track) {
    const slides = Array.from(track.querySelectorAll('[data-seq-slide]'));
    const dots = Array.from(seq.querySelectorAll('[data-seq-dot]'));
    const DUR = 6000;
    let idx = 0, timer = null, userTouched = false;

    const mark = (i) => {
      idx = i;
      slides.forEach((s, n) => s.classList.toggle('is-current', n === i));
      dots.forEach((d, n) => {
        d.classList.remove('is-running');
        d.classList.toggle('is-current', n === i);
      });
      if (!userTouched && !reduced) {
        const d = dots[i];
        d.style.setProperty('--seq-dur', DUR + 'ms');
        void d.offsetWidth;
        d.classList.add('is-running');
      }
    };
    const scrollTo = (i) => {
      track.scrollTo({ left: slides[i].offsetLeft - slides[0].offsetLeft, behavior: 'smooth' });
    };
    const start = () => {
      clearInterval(timer);
      if (userTouched || reduced) return;
      timer = setInterval(() => { const n = (idx + 1) % slides.length; scrollTo(n); mark(n); }, DUR);
    };
    const stopAuto = () => { userTouched = true; clearInterval(timer); dots.forEach(d => d.classList.remove('is-running')); };

    // sincroniza el punto activo cuando el usuario desliza
    let scrollTick = false;
    track.addEventListener('scroll', () => {
      if (scrollTick) return;
      scrollTick = true;
      requestAnimationFrame(() => {
        const mid = track.scrollLeft + track.clientWidth / 2;
        let best = 0, bestD = Infinity;
        slides.forEach((s, n) => {
          const c = s.offsetLeft - slides[0].offsetLeft + s.offsetWidth / 2;
          const d = Math.abs(c - mid);
          if (d < bestD) { bestD = d; best = n; }
        });
        if (best !== idx) mark(best);
        scrollTick = false;
      });
    }, { passive: true });

    ['pointerdown', 'wheel', 'touchstart'].forEach((ev) =>
      track.addEventListener(ev, stopAuto, { passive: true }));
    dots.forEach((d, n) => d.addEventListener('click', () => { stopAuto(); scrollTo(n); mark(n); }));
    seq.addEventListener('mouseenter', () => clearInterval(timer));
    seq.addEventListener('mouseleave', start);

    mark(0);
    start();
  }
});
