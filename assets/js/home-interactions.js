(function () {
  'use strict';

  var root = document.documentElement;
  var navToggle = document.querySelector('.nav-toggle');
  var navigation = document.querySelector('.site-navigation');
  var themeToggle = document.querySelector('.theme-toggle');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function setNavigation(open) {
    if (!navToggle || !navigation) return;
    navToggle.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
  }

  if (navToggle && navigation) {
    navToggle.addEventListener('click', function () {
      setNavigation(navToggle.getAttribute('aria-expanded') !== 'true');
    });

    navigation.addEventListener('click', function (event) {
      if (event.target.closest('a')) setNavigation(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setNavigation(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) setNavigation(false);
    });
  }

  function applyTheme(theme, persist) {
    var isClover = theme === 'clover';
    root.setAttribute('data-theme', isClover ? 'clover' : 'academic');

    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(isClover));
      themeToggle.setAttribute('aria-label', isClover ? 'Switch to Academic theme' : 'Switch to Clover theme');
      var icon = themeToggle.querySelector('.theme-toggle__icon');
      var label = themeToggle.querySelector('.theme-toggle__label');
      if (icon) icon.textContent = isClover ? '♣' : 'A';
      if (label) label.textContent = isClover ? 'Clover' : 'Academic';
    }

    if (persist) {
      try {
        localStorage.setItem('tianle-home-theme', isClover ? 'clover' : 'academic');
      } catch (error) {
        /* Theme switching still works when storage is unavailable. */
      }
    }
  }

  applyTheme(root.getAttribute('data-theme') === 'academic' ? 'academic' : 'clover', false);

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      applyTheme(root.getAttribute('data-theme') === 'clover' ? 'academic' : 'clover', true);
    });
  }

  var navLinks = Array.prototype.slice.call(document.querySelectorAll('[data-nav-section]'));
  var sections = navLinks.map(function (link) {
    return document.getElementById(link.getAttribute('data-nav-section'));
  }).filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          var active = link.getAttribute('data-nav-section') === entry.target.id;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, {
      rootMargin: '-22% 0px -67% 0px',
      threshold: 0
    });

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  var companion = document.querySelector('[data-companion]');
  if (!companion) return;

  var companionButton = companion.querySelector('.companion__button');
  var bubble = companion.querySelector('.companion__bubble');
  var fallbackImage = companion.querySelector('.companion__image--fallback');
  var customImage = companion.querySelector('.companion__image--custom');
  var messages = [
    'Keep exploring ✨',
    'Research mode: ON.',
    'One more experiment?',
    "Welcome to Tianle's homepage."
  ];
  var messageIndex = 0;
  var bubbleTimer;

  if (customImage && customImage.getAttribute('data-pet-src')) {
    var petLoader = new Image();
    petLoader.addEventListener('load', function () {
      customImage.src = petLoader.src;
      customImage.hidden = false;
      if (fallbackImage) fallbackImage.hidden = true;
      companion.classList.add('has-custom-pet');
    });
    petLoader.src = customImage.getAttribute('data-pet-src');
  }

  function hideBubble() {
    if (!bubble) return;
    bubble.classList.remove('is-visible');
    bubble.hidden = true;
  }

  if (companionButton && bubble) {
    companionButton.addEventListener('click', function () {
      window.clearTimeout(bubbleTimer);
      bubble.textContent = messages[messageIndex];
      messageIndex = (messageIndex + 1) % messages.length;
      bubble.hidden = false;
      bubble.classList.remove('is-visible');
      window.requestAnimationFrame(function () {
        bubble.classList.add('is-visible');
      });
      bubbleTimer = window.setTimeout(hideBubble, 3600);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') hideBubble();
    });
  }

  if (!reduceMotion.matches && window.matchMedia('(pointer: fine)').matches) {
    var pointerFrame;
    var pointerX = 0;
    var pointerY = 0;

    document.addEventListener('pointermove', function (event) {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (pointerFrame) return;

      pointerFrame = window.requestAnimationFrame(function () {
        var bounds = companion.getBoundingClientRect();
        var centerX = bounds.left + bounds.width / 2;
        var centerY = bounds.top + bounds.height / 2;
        var deltaX = pointerX - centerX;
        var deltaY = pointerY - centerY;
        var distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        var near = distance < 420;
        var shiftX = near ? Math.max(-3, Math.min(3, deltaX / 90)) : 0;
        var shiftY = near ? Math.max(-2, Math.min(2, deltaY / 120)) : 0;
        companion.style.setProperty('--pet-shift-x', shiftX.toFixed(2) + 'px');
        companion.style.setProperty('--pet-shift-y', shiftY.toFixed(2) + 'px');
        pointerFrame = null;
      });
    }, { passive: true });
  }
})();
