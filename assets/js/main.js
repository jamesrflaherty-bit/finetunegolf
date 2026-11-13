/* Fine Tune Golf - site behavior.
   No libraries, no trackers. Edit the settings below when the contact details change. */
(function () {
  'use strict';

  // Turns on the scroll-reveal animation. If this file fails to load, the class is never added and all content stays visible.
  document.documentElement.classList.add('js');

  var CONFIG = {
    // Option A (recommended): the Web3Forms access key. Requests are then emailed straight to the shop
    // and the visitor sees a thank-you message on the page. Get a free key at web3forms.com.
    // This key is meant to be public; it only lets the form send to the shop's inbox.
    web3formsKey: '22e50c5e-4e88-4478-b281-c9110c575e54',

    // Option B (used while the key above is empty): the visitor's email app opens with the request
    // filled in, addressed to this email. Also offered as a backup if Option A ever fails.
    contactEmail: 'jeff@jpfcompany.com'
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

  /* Services drop-down (desktop): the arrow button opens it for touch and keyboard */
  var subItems = document.querySelectorAll('.has-sub');
  function closeSubs(except) {
    subItems.forEach(function (item) {
      if (item !== except) {
        item.classList.remove('is-open');
        var b = item.querySelector('.sub-toggle');
        if (b) { b.setAttribute('aria-expanded', 'false'); }
      }
    });
  }
  subItems.forEach(function (item) {
    var btn = item.querySelector('.sub-toggle');
    if (!btn) { return; }
    btn.addEventListener('click', function (event) {
      event.stopPropagation();
      var open = !item.classList.contains('is-open');
      closeSubs(item);
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('click', function (event) {
    if (!event.target.closest || !event.target.closest('.has-sub')) {
      closeSubs(null);
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      setNav(false);
      closeSubs(null);
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

  /* Scroll depth: a 2px brass hairline along the bottom edge of the sticky header */
  if (header) {
    var progress = document.createElement('span');
    progress.className = 'scroll-progress';
    progress.setAttribute('aria-hidden', 'true');
    header.appendChild(progress);

    var progressQueued = false;
    var drawProgress = function () {
      progressQueued = false;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var depth = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      progress.style.transform = 'scaleX(' + depth.toFixed(4) + ')';
    };
    var queueProgress = function () {
      if (!progressQueued) {
        progressQueued = true;
        window.requestAnimationFrame(drawProgress);
      }
    };
    window.addEventListener('scroll', queueProgress, { passive: true });
    window.addEventListener('resize', queueProgress);
    queueProgress();
  }

  /* Lightbox: links marked data-lightbox open a native dialog. Without JS the link plays the file directly. */
  document.querySelectorAll('[data-lightbox]').forEach(function (trigger) {
    var dialog = document.getElementById(trigger.getAttribute('data-lightbox'));
    if (!dialog || typeof dialog.showModal !== 'function') {
      return;
    }
    var clip = dialog.querySelector('video');
    var closeBtn = dialog.querySelector('.lightbox-close');

    trigger.addEventListener('click', function (event) {
      event.preventDefault();
      if (clip && !clip.getAttribute('src')) {
        clip.setAttribute('src', clip.getAttribute('data-src'));
      }
      dialog.showModal();
      if (clip) {
        var started = clip.play();
        if (started && typeof started.catch === 'function') {
          started.catch(function () {});
        }
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        dialog.close();
      });
    }

    // Clicking the dark backdrop (the dialog element itself, outside the video) closes it
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) {
        dialog.close();
      }
    });

    dialog.addEventListener('close', function () {
      if (clip) {
        clip.pause();
        clip.currentTime = 0;
      }
      trigger.focus();
    });
  });

  /* Sample build spec: pill toggle between two builds in one fixed footprint */
  document.querySelectorAll('[data-spec-card]').forEach(function (card) {
    var tabs = card.querySelectorAll('[role="tab"]');
    var panels = card.querySelectorAll('.spec-panel');
    if (!tabs.length || !panels.length) {
      return;
    }
    card.classList.add('spec-js');

    function show(key, focusTab) {
      tabs.forEach(function (tab) {
        var on = tab.getAttribute('data-spec') === key;
        tab.setAttribute('aria-selected', String(on));
        tab.setAttribute('tabindex', on ? '0' : '-1');
        if (on && focusTab) {
          tab.focus();
        }
      });
      panels.forEach(function (panel) {
        var on = panel.getAttribute('data-spec') === key;
        if (on) {
          panel.removeAttribute('data-off');
          panel.removeAttribute('inert');
          panel.removeAttribute('aria-hidden');
        } else {
          panel.setAttribute('data-off', '');
          panel.setAttribute('inert', '');
          panel.setAttribute('aria-hidden', 'true');
        }
      });
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () {
        show(tab.getAttribute('data-spec'), false);
      });
      tab.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault();
          var next = tabs[(index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
          show(next.getAttribute('data-spec'), true);
        }
      });
    });

    show(tabs[0].getAttribute('data-spec'), false);
  });

  /* Booking form */
  var form = document.getElementById('booking-form');
  if (!form) {
    return;
  }

  var select = form.elements.namedItem('service');
  var status = form.querySelector('.form-status');
  var submitBtn = form.querySelector('button[type="submit"]');
  var buttonLabel = submitBtn ? submitBtn.textContent : 'Send request';
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /* Pre-fill from links such as contact.html?service=reshaft */
  var params = new URLSearchParams(window.location.search);
  var requested = params.get('service');
  if (requested && select) {
    Array.prototype.forEach.call(select.options, function (option) {
      if (option.value === requested) {
        select.value = requested;
      }
    });
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
    var subject = 'Website request: ' + data.serviceLabel;
    var body = [
      'Name: ' + data.name,
      'Email: ' + data.email,
      'Phone: ' + (data.phone || 'not given'),
      'Interested in: ' + data.serviceLabel,
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

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    if (CONFIG.web3formsKey) {
      var payload = {
        access_key: CONFIG.web3formsKey,
        subject: 'Website request: ' + data.serviceLabel,
        from_name: 'Fine Tune Golf website',
        name: data.name,
        email: data.email,
        'Phone': data.phone || 'not given',
        'Interested in': data.serviceLabel,
        'Preferred days or times': data.preferred || 'not given',
        'Details': data.goals || 'not given'
      };

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (result) {
          if (!response.ok || result.success === false) {
            throw new Error('Request failed');
          }
        });
      }).then(function () {
        form.reset();
        resetButton();
        showStatus('success', 'Thank you, ' + data.name.split(' ')[0] + '. Your request is in. We reply to every request, usually within one business day.');
      }).catch(function () {
        resetButton();
        showStatus('error', 'Sorry, that did not send. Please call or text us at (330) 715-2282, or ');
        var link = document.createElement('a');
        link.href = buildMailto(data);
        link.textContent = 'send it by email instead';
        status.appendChild(link);
        status.appendChild(document.createTextNode('.'));
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
  function ring(x, y) {
    var s = document.createElement('span');
    s.className = 'click-ripple';
    s.style.left = x + 'px';
    s.style.top = y + 'px';
    document.body.appendChild(s);
    s.addEventListener('animationend', function () { s.remove(); });
  }
  // Mouse: ring on press. Touch and pen: ring only on a real tap (a click),
  // so starting a scroll never draws a ring under the finger.
  var lastType = 'mouse';
  document.addEventListener('pointerdown', function (e) {
    lastType = e.pointerType || 'mouse';
    if (lastType === 'mouse' && e.button === 0) ring(e.clientX, e.clientY);
  }, { passive: true });
  document.addEventListener('click', function (e) {
    if (lastType === 'mouse' || e.detail === 0) return;
    ring(e.clientX, e.clientY);
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

// Contact page map: nothing loads from Google until the visitor asks for it.
(function () {
  var card = document.querySelector('[data-map]');
  if (!card) return;
  var btn = card.querySelector('[data-map-load]');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var frame = document.createElement('iframe');
    frame.src = 'https://www.google.com/maps?q=' + encodeURIComponent('Fine Tune Golf, 130 Reimer Rd, Wadsworth, OH 44281') + '&z=14&output=embed';
    frame.title = 'Map showing Fine Tune Golf at 130 Reimer Rd, Wadsworth, Ohio';
    frame.loading = 'lazy';
    frame.referrerPolicy = 'no-referrer-when-downgrade';
    frame.setAttribute('allowfullscreen', '');
    card.innerHTML = '';
    card.appendChild(frame);
    card.classList.add('is-loaded');
    frame.focus();
  });
})();
