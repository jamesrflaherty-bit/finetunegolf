/* Quick Tune-Up Estimator (services page only). Prices mirror the list above it. */
(function () {
  'use strict';

  var root = document.querySelector('[data-estimator]');
  if (!root) {
    return;
  }

  var PRICE = { single: 7, set: 50, setExtra: 6, shop: 5, own: 8, putterGrip: 10, blueprint: 10, bundle: 10, flexClub: 5, flexSet: 35 };
  var LIMIT = { single: [1, 7], set: [8, 14], grip: [1, 14] };
  var state = { ll: 'set', count: { single: 1, set: 8 }, grip: 'off', gripCount: 8, putterGrip: false, bp: false, flex: false };

  function q(sel) { return root.querySelector(sel); }
  function all(sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }

  var bpBox = q('[data-opt="bp"]');
  var bpText = q('[data-bp-text]');
  var sms = q('[data-sms]');
  var copyBtn = q('[data-copy]');
  var isApple = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (/Mac/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);

  function build() {
    var lines = [];
    var total = 0;
    var n;

    if (state.ll === 'single') {
      n = state.count.single;
      total += n * PRICE.single;
      lines.push('Loft & lie, ' + n + (n === 1 ? ' club' : ' clubs') + ': $' + n * PRICE.single);
    } else if (state.ll === 'set') {
      n = state.count.set;
      var setCost = PRICE.set + (n - 8) * PRICE.setExtra;
      total += setCost;
      lines.push('Full iron set loft & lie, ' + n + ' clubs: $' + setCost);
    }
    if (state.grip !== 'off') {
      n = state.gripCount;
      var each = PRICE[state.grip];
      total += n * each;
      lines.push((state.grip === 'shop' ? 'Regrip with shop grips, ' : 'Install my own grips, ') + n +
        (n === 1 ? ' club' : ' clubs') + ': $' + n * each + (state.grip === 'shop' ? ' + grips' : ''));
    }
    if (state.putterGrip) {
      total += PRICE.putterGrip;
      lines.push('Putter regrip: $' + PRICE.putterGrip);
    }

    /* Club count for per-club extras: the loft and lie count, or the grip count if higher */
    var clubCount = 0;
    if (state.ll === 'set') { clubCount = state.count.set; }
    else if (state.ll === 'single') { clubCount = state.count.single; }
    if (state.grip !== 'off') { clubCount = Math.max(clubCount, state.gripCount); }

    /* Blueprint: $10 a club */
    var bpCount = clubCount || 1;
    var bpCost = bpCount * PRICE.blueprint;
    var bpClubs = bpCount + (bpCount === 1 ? ' club' : ' clubs');
    var anyLL = false;
    if (state.bp) {
      total += bpCost;
      lines.push('Precision Spec Blueprint, ' + bpClubs + ': $' + bpCost);
    }

    /* Flex check follows the club count: $5 a club, capped at the $35 full-set rate from 7 clubs */
    var flexCount = clubCount;
    var flexFull = flexCount === 0 || flexCount >= 7;
    var flexCost = flexFull ? PRICE.flexSet : flexCount * PRICE.flexClub;
    if (state.flex) {
      total += flexCost;
      lines.push(flexFull ? 'Shaft Flex Check, full set: $' + flexCost
        : 'Shaft Flex Check, ' + flexCount + (flexCount === 1 ? ' club' : ' clubs') + ': $' + flexCost);
    }

    var bundle = state.ll === 'set' && state.grip === 'shop' && state.gripCount >= 8;
    if (bundle) {
      total -= PRICE.bundle;
      lines.push('Full-Bag Refresh Bundle: -$' + PRICE.bundle);
    }

    return { bpCount: bpCount, bpCost: bpCost, flexFull: flexFull, flexCount: flexCount, flexCost: flexCost, lines: lines, total: total, anyLL: anyLL, bundle: bundle, plusGrips: state.grip === 'shop' };
  }

  function render() {
    var r = build();

    all('[data-seg]').forEach(function (seg) {
      var key = seg.getAttribute('data-seg');
      Array.prototype.forEach.call(seg.querySelectorAll('button'), function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-val') === state[key]));
      });
    });

    q('[data-line="ll"]').hidden = state.ll === 'off';
    if (state.ll !== 'off') {
      q('[data-step="ll"] output').textContent = state.count[state.ll];
      q('[data-hint="ll"]').textContent = state.ll === 'set' ? '$50 for 8 clubs + $6/extra iron' : '$7/club';
    }

    q('[data-line="grip"]').hidden = state.grip === 'off';
    if (state.grip !== 'off') {
      q('[data-step="grip"] output').textContent = state.gripCount;
      q('[data-hint="grip"]').textContent = state.grip === 'shop' ? '$5/club + grip' : '$8/club';
    }

    bpBox.disabled = r.anyLL;
    bpBox.checked = r.anyLL || state.bp;
    bpText.innerHTML = r.anyLL
      ? 'Precision Spec Blueprint ($' + r.bpCost + ' value) &mdash; <strong>INCLUDED FREE</strong>'
      : 'Precision Spec Blueprint <span class="mono">$' + r.bpCost + ' · ' + r.bpCount + (r.bpCount === 1 ? ' club' : ' clubs') + '</span>';

    q('[data-opt="flex"]').checked = state.flex;
    q('[data-flex-text]').innerHTML = 'Shaft Flex Check <span class="mono">' +
      (r.flexFull ? '$35 full set' : '$' + r.flexCost + ' · ' + r.flexCount + (r.flexCount === 1 ? ' club' : ' clubs')) + '</span>';

    q('[data-total]').textContent = '$' + r.total;
    var notes = [];
    if (r.plusGrips) { notes.push('+ cost of grips'); }
    if (r.bundle) { notes.push('$10 bundle saving applied'); }
    q('[data-total-note]').textContent = notes.join(' · ');

    var text = 'Hi Fine Tune Golf, I would like to book:\n' +
      r.lines.map(function (l) { return '- ' + l; }).join('\n') +
      '\nEstimated labor: $' + r.total + (r.plusGrips ? ' + cost of grips' : '');
    if (!r.lines.length) {
      text = 'Hi Fine Tune Golf, I would like to book a tune-up.';
    }
    root.estimateText = text;
    sms.href = 'sms:+13307152282' + (isApple ? '&' : '?') + 'body=' + encodeURIComponent(text);
  }

  root.addEventListener('click', function (event) {
    var btn = event.target.closest('button');
    if (!btn || !root.contains(btn)) {
      return;
    }
    var seg = btn.closest('[data-seg]');
    var step = btn.closest('[data-step]');
    if (seg) {
      state[seg.getAttribute('data-seg')] = btn.getAttribute('data-val');
      render();
    } else if (step) {
      var dir = Number(btn.getAttribute('data-dir'));
      if (step.getAttribute('data-step') === 'll') {
        var lim = LIMIT[state.ll];
        state.count[state.ll] = Math.min(lim[1], Math.max(lim[0], state.count[state.ll] + dir));
      } else {
        state.gripCount = Math.min(LIMIT.grip[1], Math.max(LIMIT.grip[0], state.gripCount + dir));
      }
      render();
    }
  });

  root.addEventListener('change', function (event) {
    var opt = event.target.getAttribute('data-opt');
    if (opt) {
      state[opt] = event.target.checked;
      render();
    }
  });

  copyBtn.addEventListener('click', function () {
    var text = root.estimateText + '\nFine Tune Golf · (330) 715-2282';
    function done() {
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('is-copied');
      window.setTimeout(function () {
        copyBtn.textContent = 'Copy Estimate';
        copyBtn.classList.remove('is-copied');
      }, 2000);
    }
    function fallback() {
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try { document.execCommand('copy'); done(); } catch (e) { /* no clipboard available */ }
      document.body.removeChild(area);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }
  });

  render();
  root.hidden = false;
  var jump = document.querySelector('[data-estimator-link]');
  if (jump) {
    jump.hidden = false;
  }
})();
