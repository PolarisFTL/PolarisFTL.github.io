(function () {
  'use strict';

  var root = document.documentElement;
  var navToggle = document.querySelector('.nav-toggle');
  var navigation = document.querySelector('.site-navigation');
  var themeToggle = document.querySelector('.theme-toggle');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var cloverMusic = initCloverMusicPlayer();
  initCloverVisitorCounter();

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

  function initCloverVisitorCounter() {
    var widget = document.getElementById('cloverVisitorCounter');
    if (!widget || widget.dataset.initialized === 'true') return;
    var number = widget.querySelector('#cloverVisitorNumber');
    if (!number) return;
    widget.dataset.initialized = 'true';

    var image = widget.querySelector('[data-visitor-image]');
    var fallback = widget.querySelector('[data-visitor-fallback]');
    function showMascotFallback() {
      if (image) image.hidden = true;
      if (fallback) fallback.hidden = false;
      widget.classList.add('has-mascot-fallback');
    }
    if (image) {
      image.addEventListener('error', showMascotFallback);
      if (image.complete && !image.naturalWidth) showMascotFallback();
    }

    var sessionKey = 'clover-home-visitor-seen';
    var warned = false;
    function setUnavailable(message) {
      number.textContent = '------';
      number.setAttribute('aria-label', 'Visitor count unavailable');
      number.setAttribute('aria-busy', 'false');
      widget.classList.remove('is-loaded', 'is-arriving');
      if (!warned && window.console && typeof window.console.warn === 'function') {
        warned = true;
        window.console.warn(message);
      }
    }

    function renderCount(count) {
      var text = count < 1000000 ? String(count).padStart(6, '0') : count.toLocaleString('en-US');
      number.textContent = text;
      number.style.fontSize = text.length > 6 ? Math.max(5, 17 * 6 / text.length) + 'px' : '';
      number.setAttribute('aria-label', count.toLocaleString('en-US') + ' homepage visits');
      number.setAttribute('aria-busy', 'false');
      widget.classList.add('is-loaded');
    }

    function showArrival() {
      var seen = false;
      try {
        seen = sessionStorage.getItem(sessionKey) === 'true';
        sessionStorage.setItem(sessionKey, 'true');
      } catch (error) {
        // No extra tracking or persistent identifier when session storage is blocked.
      }
      if (seen || reduceMotion.matches || root.getAttribute('data-theme') !== 'clover') return;
      widget.classList.add('is-arriving');
      window.setTimeout(function () { widget.classList.remove('is-arriving'); }, 900);
    }

    var local = /^(localhost|127(?:\.\d+){3}|\[?::1\]?)$/.test(location.hostname) || /\.localhost$/.test(location.hostname);
    if (local) {
      number.textContent = 'DEV';
      number.setAttribute('aria-label', 'Visitor counter preview; no visits are recorded');
      if (new URLSearchParams(location.search).get('visitorDemo') === '1') {
        var demoLabel = widget.querySelector('.clover-visitor-board__label');
        if (demoLabel) demoLabel.textContent = 'Demo visits';
        number.setAttribute('aria-label', 'Loading visitor counter demonstration');
        window.setTimeout(function () {
          renderCount(1248);
          number.setAttribute('aria-label', 'Local demonstration: 1,248. No visits are recorded.');
          showArrival();
        }, 350);
      }
      return;
    }

    var code = (widget.dataset.goatcounterCode || '').trim();
    if (widget.dataset.goatcounterEnabled !== 'true' || !code) {
      setUnavailable('Visitor counter is not configured.');
      return;
    }
    if (!/^[a-z0-9][a-z0-9-]{0,62}$/.test(code)) {
      setUnavailable('Visitor counter site code is invalid.');
      return;
    }
    var homePath = widget.dataset.homePath || '/';
    var site;
    try { site = new URL(widget.dataset.siteUrl); } catch (error) { return; }
    if (widget.dataset.production !== 'true' || location.protocol !== 'https:' || location.hostname !== site.hostname ||
        (location.pathname !== homePath && location.pathname !== homePath + 'index.html')) return;

    number.setAttribute('aria-busy', 'true');
    number.setAttribute('aria-label', 'Loading homepage visitor count');
    var endpoint = 'https://' + code + '.goatcounter.com';

    function loadGoatCounter() {
      return new Promise(function (resolve, reject) {
        var existing = document.querySelector('script[data-goatcounter]');
        if (existing) {
          // Reuse an already active integration without sending a second pageview.
          if (existing.dataset.goatcounter === endpoint + '/count' && window.goatcounter &&
              typeof window.goatcounter.count === 'function') resolve({ counter: window.goatcounter, manual: false });
          else reject(new Error('Tracking script already present but unavailable'));
          return;
        }
        var template = document.getElementById('cloverVisitorScript');
        var source = template && template.content && template.content.querySelector('script');
        if (!source || source.dataset.goatcounter !== endpoint + '/count') {
          reject(new Error('Tracking script not configured'));
          return;
        }
        var script = document.createElement('script');
        Array.prototype.forEach.call(source.attributes, function (attribute) {
          script.setAttribute(attribute.name, attribute.value);
        });
        var settled = false;
        var timer = window.setTimeout(function () { finish(new Error('Tracking script timed out')); }, 4000);
        function finish(error) {
          if (settled) return;
          settled = true;
          window.clearTimeout(timer);
          script.onload = script.onerror = null;
          if (error) { script.remove(); reject(error); }
          else if (window.goatcounter && typeof window.goatcounter.count === 'function') {
            resolve({ counter: window.goatcounter, manual: true });
          } else reject(new Error('Tracking API unavailable'));
        }
        script.onload = function () { finish(); };
        script.onerror = function () { finish(new Error('Tracking script blocked')); };
        document.head.appendChild(script);
      });
    }

    function readCount() {
      // The public endpoint can be cached. Never calculate a fake increment locally.
      return new Promise(function (resolve, reject) {
        var controller = typeof AbortController === 'function' ? new AbortController() : null;
        var settled = false;
        var timer = window.setTimeout(function () {
          settled = true;
          if (controller) controller.abort();
          reject(new Error('Visitor count timed out'));
        }, 4000);
        var options = { credentials: 'omit' };
        if (controller) options.signal = controller.signal;
        fetch(endpoint + '/counter/' + encodeURIComponent('/') + '.json', options)
          .then(function (response) {
            if (!response.ok) throw new Error('Visitor count unavailable');
            return response.json();
          }).then(function (data) {
            if (settled) return;
            var value = data && data.count;
            var text = typeof value === 'number' ? String(value) : (typeof value === 'string' ? value.trim() : '');
            if (!/^(\d+|\d{1,3}(,\d{3})+)$/.test(text)) throw new Error('Invalid visitor count');
            var count = Number(text.replace(/,/g, ''));
            if (!Number.isSafeInteger(count) || count < 0) throw new Error('Invalid visitor count');
            settled = true;
            window.clearTimeout(timer);
            resolve(count);
          }).catch(function (error) {
            if (settled) return;
            settled = true;
            window.clearTimeout(timer);
            reject(error);
          });
      });
    }

    function trackAndRead() {
      loadGoatCounter().then(function (loaded) {
        var counter = loaded.counter;
        var filtered = typeof counter.filter !== 'function' || counter.filter();
        if (!filtered && loaded.manual) counter.count({ path: '/' });
        return readCount().then(function (count) {
          renderCount(count);
          // Arrival is a greeting, not proof the cached total has increased by one.
          if (!filtered) showArrival();
        });
      }).catch(function () { setUnavailable('Visitor counter is unavailable.'); });
    }
    if (document.visibilityState === 'hidden' || document.prerendering) {
      document.addEventListener('visibilitychange', function onVisible() {
        if (document.visibilityState !== 'visible' || document.prerendering) return;
        document.removeEventListener('visibilitychange', onVisible);
        trackAndRead();
      });
    } else trackAndRead();
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
