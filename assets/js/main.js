/* Fine Tune Golf - site behavior.
   No libraries, no trackers. Edit the settings below when the promotion or contact details change. */
(function () {
  'use strict';

  // Turns on the scroll-reveal animation. If this file fails to load, the class is never added and all content stays visible.
  document.documentElement.classList.add('js');

  var CONFIG = {
    // Option A: paste a form-service URL here (for example a Formspree or Web3Forms endpoint).
    // Leave it empty to use Option B.
    formEndpoint: '',

    // Option B (default): the visitor's email app opens with the request filled in, addressed to this email.
    contactEmail: 'finetunegolf@gmail.com',

    // Time zone used for the promotion countdown.
    timeZone: 'America/New_York'
  };

  // Black Friday promotion. Anything marked data-promo is hidden automatically after the last day below.
  var PROMO = {
    code: 'BLACKFRIDAY10',
    // Last day of the offer, as a calendar date in the shop's time zone. The promotion hides after this day.
    lastDay: '2026-11-27'
  };

  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');

  /* Footer year */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* Header gets a soft border and shadow once the page has scrolled */
  function updateHeader() {
    if (header) {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    }
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* Mobile navigation */
  function setNav(open) {
    if (!header || !toggle) {
      return;
    }
    header.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      setNav(!header.classList.contains('nav-open'));
    });
  }

  if (nav) {
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setNav(false);
      });
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      setNav(false);
    }
  });

  var desktopQuery = window.matchMedia('(min-width: 1181px)');
  if (desktopQuery.addEventListener) {
    desktopQuery.addEventListener('change', function (event) {
      if (event.matches) {
        setNav(false);
      }
    });
  }

  /* Black Friday promotion: days left, and everything marked data-promo hides once it ends */
  // Calendar days from today (Eastern Time) to the last day of the offer. Returns null once the offer has ended.
  function promoDaysLeft() {
    var parts = new Intl.DateTimeFormat('en-US', {
      timeZone: CONFIG.timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(new Date());

    var lookup = {};
    parts.forEach(function (part) {
      lookup[part.type] = part.value;
    });

    var today = Date.parse(lookup.year + '-' + lookup.month + '-' + lookup.day + 'T00:00:00Z');
    var lastDay = Date.parse(PROMO.lastDay + 'T00:00:00Z');
    var days = Math.round((lastDay - today) / 86400000);
    return days < 0 ? null : days;
  }

  function applyPromo() {
    var days = promoDaysLeft();
    var countdown = days === 0 ? 'Last day to save' : (days === 1 ? '1 day left' : days + ' days left');

    document.querySelectorAll('[data-promo]').forEach(function (el) {
      el.hidden = days === null;
    });

    document.querySelectorAll('[data-promo-days]').forEach(function (el) {
      el.textContent = days === null ? '' : 'Ends Nov 27 · ' + countdown;
    });
  }

  try {
    applyPromo();
  } catch (error) {
    // If the date check fails, the offer simply stays visible. The rest of the page keeps working.
  }

  /* Copy-to-clipboard for promo codes */
  function flash(button, message) {
    button.textContent = message;
    window.setTimeout(function () {
      button.textContent = button.getAttribute('data-label');
    }, 2200);
  }

  // Copies text with the Clipboard API, falling back to a hidden text field where that is blocked
  function legacyCopy(text) {
    var field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    var copied = false;
    try {
      copied = document.execCommand('copy');
    } catch (error) {
      copied = false;
    }
    document.body.removeChild(field);
    return copied;
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () {
        return true;
      }, function () {
        return legacyCopy(text);
      });
    }
    return Promise.resolve(legacyCopy(text));
  }

  document.querySelectorAll('[data-copy-code]').forEach(function (button) {
    button.setAttribute('data-label', button.textContent.trim());
    button.addEventListener('click', function () {
      copyText(button.getAttribute('data-copy-code')).then(function (copied) {
        flash(button, copied ? 'Copied!' : 'Press Ctrl+C');
      });
    });
  });

  /* Reveal sections as they scroll into view */
  var revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealItems.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealItems.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* Front-page swing video: loops muted, can be paused, and only appears once the file loads */
  var swing = document.querySelector('[data-swing-video]');
  if (swing) {
    var clip = swing.querySelector('.video-main');
    var frame = swing.querySelector('[data-video-frame]');
    var toggleButton = swing.querySelector('.video-toggle');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var userPaused = reduceMotion.matches;

    function playClip() {
      var attempt = clip.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function (error) {
          // Only a refused autoplay should show the Play button. An AbortError just means the
          // clip was paused again (for example when it scrolls off screen) before it started.
          if (error && error.name === 'NotAllowedError') {
            userPaused = true;
            updateToggle();
          }
        });
      }
    }

    function updateToggle() {
      frame.classList.toggle('is-paused', userPaused);
      toggleButton.setAttribute('aria-label', userPaused ? 'Play video' : 'Pause video');
    }

    function showClip() {
      if (clip.videoWidth && clip.videoHeight) {
        var ratio = clip.videoWidth / clip.videoHeight;
        // Keep the frame between 1:2 (tall phone footage) and 16:9 (landscape footage)
        frame.style.aspectRatio = String(Math.min(Math.max(ratio, 0.5), 1.78));
      }
      // The section is visible from the start (space is reserved in CSS, so nothing shifts).
      // Playback starts from the observer below, once the clip is actually on screen.
      updateToggle();
    }

    clip.addEventListener('loadedmetadata', showClip);

    clip.addEventListener('error', function () {
      // If the file is missing, the section stays hidden and the rest of the page is unaffected.
      swing.hidden = true;
    });

    // The script is deferred, so the file may already have loaded before these listeners exist
    if (clip.error) {
      swing.hidden = true;
    } else if (clip.readyState >= 1) {
      showClip();
    }

    toggleButton.addEventListener('click', function () {
      if (clip.paused) {
        userPaused = false;
        playClip();
      } else {
        userPaused = true;
        clip.pause();
      }
      updateToggle();
    });

    // Play only while the clip is on screen, and pause it when it scrolls away to save battery and data
    if ('IntersectionObserver' in window) {
      var watchSwing = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (!userPaused) {
              playClip();
            }
          } else {
            clip.pause();
          }
        });
      }, { threshold: 0.25 });
      watchSwing.observe(clip);
    }

    updateToggle();
  }

  /* Booking form */
  var form = document.getElementById('booking-form');
  if (!form) {
    return;
  }

  var select = form.elements.namedItem('service');
  var promoField = form.elements.namedItem('promo');
  var status = form.querySelector('.form-status');
  var submitBtn = form.querySelector('button[type="submit"]');
  var buttonLabel = submitBtn ? submitBtn.textContent : 'Send request';
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /* Pre-fill from links such as contact.html?service=reshaft or contact.html?promo=BLACKFRIDAY10 */
  var params = new URLSearchParams(window.location.search);
  var requested = params.get('service');
  if (requested && select) {
    Array.prototype.forEach.call(select.options, function (option) {
      if (option.value === requested) {
        select.value = requested;
      }
    });
  }

  var requestedPromo = params.get('promo');
  if (requestedPromo && promoField && requestedPromo.toUpperCase() === PROMO.code) {
    promoField.value = PROMO.code;
  }

  function checkField(input) {
    if (input.type === 'checkbox') {
      return input.checked ? '' : 'Please tick this box so we can reply to you.';
    }
    var value = input.value.trim();
    if (!value) {
      return 'This field is required.';
    }
    if (input.type === 'email' && !emailPattern.test(value)) {
      return 'Please enter a valid email address.';
    }
    return '';
  }

  function setFieldError(input, message) {
    var field = input.closest('.field');
    if (!field) {
      return;
    }
    var error = field.querySelector('.field-error');
    field.classList.toggle('has-error', Boolean(message));
    if (error) {
      error.textContent = message || '';
    }
    if (message) {
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.removeAttribute('aria-invalid');
    }
  }

  function clearIfFixed(input) {
    var field = input.closest('.field');
    if (field && field.classList.contains('has-error') && !checkField(input)) {
      setFieldError(input, '');
    }
  }

  function validateForm() {
    var firstInvalid = null;
    form.querySelectorAll('[required]').forEach(function (input) {
      var message = checkField(input);
      setFieldError(input, message);
      if (message && !firstInvalid) {
        firstInvalid = input;
      }
    });
    if (firstInvalid) {
      firstInvalid.focus();
    }
    return !firstInvalid;
  }

  function showStatus(type, message) {
    status.textContent = message;
    status.classList.toggle('is-success', type === 'success');
    status.classList.toggle('is-error', type === 'error');
  }

  function resetButton() {
    submitBtn.disabled = false;
    submitBtn.textContent = buttonLabel;
  }

  function buildMailto(data) {
    var subject = 'Website request: ' + data.serviceLabel + (data.promo ? ' (promo ' + data.promo + ')' : '');
    var body = [
      'Name: ' + data.name,
      'Email: ' + data.email,
      'Phone: ' + (data.phone || 'not given'),
      'Interested in: ' + data.serviceLabel,
      'Promo code: ' + (data.promo || 'none'),
      'Preferred days or times: ' + (data.preferred || 'not given'),
      '',
      'Details:',
      data.goals || 'not given'
    ].join('\n');

    return 'mailto:' + CONFIG.contactEmail +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
  }

  form.addEventListener('input', function (event) {
    if (event.target.hasAttribute('required')) {
      clearIfFixed(event.target);
    }
  });

  form.addEventListener('change', function (event) {
    if (event.target.hasAttribute('required')) {
      clearIfFixed(event.target);
    }
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    showStatus('', '');

    // Honeypot: real visitors never fill this hidden field, bots often do.
    var honeypot = form.querySelector('input[name="website"]');
    if (honeypot && honeypot.value) {
      return;
    }

    if (!validateForm()) {
      showStatus('error', 'Please check the highlighted fields and try again.');
      return;
    }

    var data = {};
    new FormData(form).forEach(function (value, key) {
      data[key] = String(value).trim();
    });
    data.serviceLabel = select && select.selectedIndex >= 0
      ? select.options[select.selectedIndex].text
      : data.service;

    var endpoint = form.getAttribute('data-endpoint') || CONFIG.formEndpoint;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    if (endpoint) {
      fetch(endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      }).then(function (response) {
        if (!response.ok) {
          throw new Error('Request failed');
        }
        form.reset();
        resetButton();
        showStatus('success', 'Thank you. Your request is in, and we reply to every request, usually within one business day.');
      }).catch(function () {
        resetButton();
        showStatus('error', 'Sorry, that did not send. Please call or text us at (330) 715-2282.');
      });
      return;
    }

    // No form service connected: open the visitor's email app with the request filled in.
    window.location.href = buildMailto(data);
    resetButton();
    showStatus('success', 'Your email app should open with your request ready to send. If nothing happens, call or text us at (330) 715-2282.');
  });
})();

// Water-style click ripple: a ring spreads from wherever the visitor clicks.
// Skipped when the visitor asks for reduced motion.
(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.addEventListener('pointerdown', function (e) {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    var s = document.createElement('span');
    s.className = 'click-ripple';
    s.style.left = e.clientX + 'px';
    s.style.top = e.clientY + 'px';
    document.body.appendChild(s);
    s.addEventListener('animationend', function () { s.remove(); });
  });
})();

// Front-page swing video: sound toggle (the clip starts muted so autoplay works).
(function () {
  var swing = document.querySelector('[data-swing-video]');
  if (!swing) return;
  var clip = swing.querySelector('.video-main');
  var btn = swing.querySelector('.video-sound');
  if (!clip || !btn) return;
  btn.addEventListener('click', function () {
    clip.muted = !clip.muted;
    if (!clip.muted && clip.paused) clip.play().catch(function () {});
    btn.textContent = clip.muted ? 'Sound off' : 'Sound on';
    btn.setAttribute('aria-pressed', clip.muted ? 'false' : 'true');
  });
})();
