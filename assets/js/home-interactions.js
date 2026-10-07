(function () {
  'use strict';

  var root = document.documentElement;
  var navToggle = document.querySelector('.nav-toggle');
  var navigation = document.querySelector('.site-navigation');
  var themeToggle = document.querySelector('.theme-toggle');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var cloverMusic = initCloverMusicPlayer();

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

    if (cloverMusic) cloverMusic.handleThemeChange(isClover);
  }

  applyTheme(root.getAttribute('data-theme') === 'academic' ? 'academic' : 'clover', false);

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      applyTheme(root.getAttribute('data-theme') === 'clover' ? 'academic' : 'clover', true);
    });
  }

  function initCloverMusicPlayer() {
    var audio = document.getElementById('cloverBgmAudio');
    var player = document.querySelector('[data-clover-music]');
    var modal = document.querySelector('[data-music-consent]');
    if (!audio || !player || !modal) return null;

    var playButton = player.querySelector('[data-music-play]');
    var playIcon = player.querySelector('[data-music-play-icon]');
    var playLabel = player.querySelector('[data-music-play-label]');
    var muteButton = player.querySelector('[data-music-mute]');
    var muteIcon = player.querySelector('[data-music-mute-icon]');
    var status = player.querySelector('[data-music-status]');
    var allowButton = modal.querySelector('[data-music-allow]');
    var denyButton = modal.querySelector('[data-music-deny]');
    if (!playButton || !muteButton || !status || !allowButton || !denyButton) return null;

    function readPreference(key) {
      try { return localStorage.getItem(key); } catch (error) { return null; }
    }

    function savePreference(key, value) {
      try { localStorage.setItem(key, value); } catch (error) {
        /* The current visit still works when storage is blocked. */
      }
    }

    var consent = readPreference('clover-bgm-consent');
    if (consent !== 'allow' && consent !== 'deny') consent = null;
    var unavailable = false;
    var themeInitialized = false;
    var consentTimer;
    var returnFocus;
    var playRequest = 0;
    var wantsPlayback = false;
    audio.volume = 0.35;
    audio.muted = readPreference('clover-bgm-muted') === 'true';

    function isClover() {
      return root.getAttribute('data-theme') === 'clover';
    }

    function setPlayingState() {
      var playing = !unavailable && !audio.paused && !audio.ended;
      player.classList.toggle('is-playing', playing);
      status.textContent = unavailable ? 'BGM UNAVAILABLE' : (playing ? 'NOW PLAYING' : 'PAUSED');
      playButton.disabled = unavailable;
      playButton.setAttribute('aria-label', unavailable ? 'Background music unavailable' : (playing ? 'Pause background music' : 'Play background music'));
      if (playIcon) playIcon.className = playing ? 'fas fa-pause' : 'fas fa-play';
      if (playLabel) playLabel.textContent = playing ? 'Pause' : 'Play';
    }

    function setMutedState() {
      muteButton.setAttribute('aria-pressed', String(audio.muted));
      muteButton.setAttribute('aria-label', audio.muted ? 'Unmute background music' : 'Mute background music');
      if (muteIcon) muteIcon.className = audio.muted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
    }

    function closeConsent(restoreFocus) {
      window.clearTimeout(consentTimer);
      if (!modal.open) return;
      modal.close();
      if (restoreFocus !== false && returnFocus && returnFocus.isConnected && returnFocus.getClientRects().length) {
        returnFocus.focus({ preventScroll: true });
      }
    }

    function pauseBgm() {
      wantsPlayback = false;
      playRequest += 1;
      audio.pause();
      setPlayingState();
    }

    function markUnavailable() {
      unavailable = true;
      pauseBgm();
      muteButton.disabled = true;
      playButton.title = 'Listen using Official Video instead.';
      closeConsent();
    }

    function handlePlaybackError(error, request) {
      if (request !== playRequest) return;
      if (audio.error || (error && error.name === 'NotSupportedError')) markUnavailable();
      else pauseBgm();
      // Autoplay denial and interrupted playback need no retry or alert.
    }

    function playBgm(userInitiated) {
      if (!isClover() || unavailable) return;
      if (userInitiated) {
        consent = 'allow';
        savePreference('clover-bgm-consent', consent);
      }
      if (consent !== 'allow') return;
      wantsPlayback = true;
      var request = ++playRequest;
      // Call play directly in the click handler to preserve the user gesture.
      var attempt;
      try { attempt = audio.play(); } catch (error) {
        handlePlaybackError(error, request);
        return;
      }
      if (attempt && typeof attempt.then === 'function') {
        attempt.then(function () {
          // An older promise must not pause a newer user-initiated play.
          if (request !== playRequest) return;
          if (!isClover() || !wantsPlayback) audio.pause();
          setPlayingState();
        }).catch(function (error) {
          handlePlaybackError(error, request);
        });
      }
    }

    function openConsent() {
      if (!isClover() || consent !== null || unavailable || modal.open) return;
      // Older browsers retain the manual Play button without a blocking overlay.
      if (typeof modal.showModal !== 'function') return;
      returnFocus = document.activeElement;
      modal.showModal();
      denyButton.focus({ preventScroll: true });
    }

    function denyMusic() {
      consent = 'deny';
      savePreference('clover-bgm-consent', consent);
      pauseBgm();
      closeConsent();
    }

    playButton.addEventListener('click', function () {
      if (audio.paused || audio.ended) playBgm(true);
      else pauseBgm();
    });

    muteButton.addEventListener('click', function () {
      audio.muted = !audio.muted;
      savePreference('clover-bgm-muted', String(audio.muted));
      setMutedState();
    });

    allowButton.addEventListener('click', function () {
      playBgm(true);
      closeConsent();
    });
    denyButton.addEventListener('click', denyMusic);
    modal.addEventListener('cancel', function (event) {
      event.preventDefault();
      denyMusic();
    });
    modal.addEventListener('keydown', function (event) {
      if (event.key !== 'Tab') return;
      if (event.shiftKey && document.activeElement === allowButton) {
        event.preventDefault();
        denyButton.focus();
      } else if (!event.shiftKey && document.activeElement === denyButton) {
        event.preventDefault();
        allowButton.focus();
      }
    });

    ['play', 'playing', 'pause', 'ended'].forEach(function (eventName) {
      audio.addEventListener(eventName, function () {
        if (!audio.paused && (!isClover() || consent !== 'allow' || !wantsPlayback)) pauseBgm();
        else setPlayingState();
      });
    });
    audio.addEventListener('volumechange', setMutedState);
    audio.addEventListener('error', markUnavailable);
    window.addEventListener('pagehide', pauseBgm);

    muteButton.disabled = false;
    setMutedState();
    setPlayingState();
    if (audio.error) markUnavailable();

    return {
      handleThemeChange: function (clover) {
        var firstTheme = !themeInitialized;
        themeInitialized = true;
        window.clearTimeout(consentTimer);
        if (!clover) {
          pauseBgm();
          closeConsent(false);
        } else if (consent === null) {
          consentTimer = window.setTimeout(openConsent, 450);
        } else if (consent === 'allow' && firstTheme) {
          // One attempt on a returning visit; switching themes never resumes BGM.
          playBgm(false);
        }
      }
    };
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
