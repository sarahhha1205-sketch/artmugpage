/**
 * ARTPORT — Main JavaScript
 */

(function () {
  'use strict';

  // ========== DOM Elements ==========
  const header = document.getElementById('header');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const galleryGrid = document.getElementById('gallery-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const lightbox = document.getElementById('lightbox');
  const cursorGlow = document.querySelector('.cursor-glow');

  let currentFilter = 'all';
  let currentLightboxIndex = 0;
  let filteredArtworks = [...ARTWORKS];

  // ========== Init ==========
  function init() {
    renderGallery();
    setupEventListeners();
    setupScrollAnimations();
    setupHeroAnimations();
  }

  // ========== Gallery Rendering ==========
  function createArtElement(art, index) {
    const item = document.createElement('article');
    item.className = `gallery-item gallery-item--${art.layout || 'normal'}`;
    item.dataset.category = art.category;
    item.dataset.index = index;
    item.style.transitionDelay = `${(index % 6) * 0.08}s`;

    const imageContent = art.image
      ? `<img src="${art.image}" alt="${art.title}" loading="lazy">`
      : `<div class="placeholder-art" style="background: linear-gradient(135deg, hsl(${art.hue} 35% 22%) 0%, hsl(${art.hue + 30} 30% 12%) 100%)">${art.title}</div>`;

    item.innerHTML = `
      <div class="gallery-item-image">
        ${imageContent}
        <div class="gallery-item-overlay">
          <span class="gallery-item-category">${art.categoryLabel}</span>
          <h3 class="gallery-item-title">${art.title}</h3>
        </div>
      </div>
    `;

    item.addEventListener('click', () => openLightbox(index));
    return item;
  }

  function renderGallery() {
    galleryGrid.innerHTML = '';
    filteredArtworks = currentFilter === 'all'
      ? [...ARTWORKS]
      : ARTWORKS.filter(a => a.category === currentFilter);

    filteredArtworks.forEach((art, index) => {
      const globalIndex = ARTWORKS.indexOf(art);
      galleryGrid.appendChild(createArtElement(art, globalIndex));
    });

    requestAnimationFrame(() => {
      observeGalleryItems();
    });
  }

  function observeGalleryItems() {
    const items = galleryGrid.querySelectorAll('.gallery-item');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    items.forEach(item => observer.observe(item));
  }

  // ========== Filter ==========
  function setFilter(filter) {
    currentFilter = filter;
    filterBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    renderGallery();
  }

  // ========== Lightbox ==========
  function openLightbox(index) {
    currentLightboxIndex = index;
    const art = ARTWORKS[index];
    if (!art) return;

    const imageEl = document.getElementById('lightbox-image');
    imageEl.innerHTML = art.image
      ? `<img src="${art.image}" alt="${art.title}">`
      : `<div class="placeholder-art" style="background: linear-gradient(135deg, hsl(${art.hue} 35% 22%) 0%, hsl(${art.hue + 30} 30% 12%) 100%); min-height: 400px; font-size: 2rem;">${art.title}</div>`;

    document.getElementById('lightbox-category').textContent = art.categoryLabel;
    document.getElementById('lightbox-title').textContent = art.title;
    document.getElementById('lightbox-desc').textContent = art.description;
    document.getElementById('lightbox-year').textContent = art.year;
    document.getElementById('lightbox-medium').textContent = art.medium;

    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function navigateLightbox(direction) {
    const visibleArtworks = currentFilter === 'all'
      ? ARTWORKS
      : ARTWORKS.filter(a => a.category === currentFilter);

    const currentArt = ARTWORKS[currentLightboxIndex];
    const visibleIndex = visibleArtworks.indexOf(currentArt);
    let newVisibleIndex = visibleIndex + direction;

    if (newVisibleIndex < 0) newVisibleIndex = visibleArtworks.length - 1;
    if (newVisibleIndex >= visibleArtworks.length) newVisibleIndex = 0;

    const newArt = visibleArtworks[newVisibleIndex];
    currentLightboxIndex = ARTWORKS.indexOf(newArt);
    openLightbox(currentLightboxIndex);
  }

  // ========== Scroll & Animations ==========
  function setupScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-animate]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 }
    );
    animatedElements.forEach(el => observer.observe(el));

    // Section headers
    const sectionHeaders = document.querySelectorAll('.section-header, .about-content, .process-step, .contact-connect');
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      },
      { threshold: 0.1 }
    );

    sectionHeaders.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      sectionObserver.observe(el);
    });
  }

  function setupHeroAnimations() {
    setTimeout(() => {
      document.querySelectorAll('.hero [data-animate]').forEach(el => {
        el.classList.add('visible');
      });
    }, 200);
  }

  // ========== Event Listeners ==========
  function setupEventListeners() {
    // Header scroll
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    // Mobile nav
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('active', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Filter buttons
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => setFilter(btn.dataset.filter));
    });

    // Lightbox
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', () => navigateLightbox(-1));
    lightbox.querySelector('.lightbox-next').addEventListener('click', () => navigateLightbox(1));

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    });

    // Cursor glow (desktop)
    if (cursorGlow && window.matchMedia('(hover: hover)').matches) {
      document.addEventListener('mousemove', (e) => {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
      }, { passive: true });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ========== Start ==========
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
