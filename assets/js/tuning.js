/* Tuning Bench (Craft page). No libraries.
   Plain-JavaScript port of spec-drift/calculateSpecDrift.ts and TuningBench.tsx.
   The coefficients are working assumptions, not measured data: the output is an
   Estimated Maintenance Interval, not a physical calculation. */
(function () {
  var root = document.querySelector('[data-tb]');
  if (!root) return;

  // ---------------------------------------------------------------- engine
  var COEFFICIENTS = {
    impactsPerDegreeForged: 5000,
    matsMultiplier: 2.5,
    lowHandicapMultiplier: 1.2,
    lowHandicapThreshold: 10,
    checkThresholdDegrees: 0.75,
    checkLatestDegrees: 1.0
  };
  var WEEKS_PER_MONTH = 52 / 12;
  var DRIFT_ALERT_DEGREES = 0.5;
  var GAUGE_FULL_SCALE_MONTHS = 12;
  var PULSE_MS = 900;
  var RING_LENGTH = 2 * Math.PI * 84;

  function nonNegative(v) {
    var n = typeof v === 'number' ? v : Number(v);
    return isFinite(n) && n > 0 ? n : 0;
  }

  function roundTo(v, d) {
    var f = Math.pow(10, d);
    return Math.round((v + Number.EPSILON) * f) / f;
  }

  function surfaceMultiplier(surface) {
    return surface === 'mats' ? COEFFICIENTS.matsMultiplier : 1;
  }

  function handicapMultiplier(index) {
    if (!isFinite(index)) return 1;
    return index <= COEFFICIENTS.lowHandicapThreshold ? COEFFICIENTS.lowHandicapMultiplier : 1;
  }

  function intervalMonths(target, current, perSwing, perWeek) {
    if (perSwing <= 0) return null;
    if (current >= target) return 0;
    var weekly = perSwing * perWeek;
    if (weekly <= 0) return null;
    return roundTo(((target - current) / weekly) / WEEKS_PER_MONTH, 1);
  }

  function calculateSpecDrift(input) {
    var rigid = input.ironType === 'cast';
    var swings = nonNegative(input.swingsPerWeek);
    var logged = nonNegative(input.totalSwingsLogged);
    var multiplier = rigid ? 0 : surfaceMultiplier(input.surfaceType) * handicapMultiplier(input.handicapIndex);
    var perSwing = rigid ? 0 : multiplier / COEFFICIENTS.impactsPerDegreeForged;
    var drift = perSwing * logged;
    return {
      months: intervalMonths(COEFFICIENTS.checkThresholdDegrees, drift, perSwing, swings),
      drift: roundTo(drift, 2),
      rigid: rigid,
      multiplier: roundTo(multiplier, 2),
      tendency: rigid
        ? 'None expected'
        : (input.surfaceType === 'mats' ? 'Upright/De-lofted' : 'No consistent tendency')
    };
  }

  // -------------------------------------------------------------------- UI
  var FLIGHT = {
    mats: 'Mechanical hosel bending pushes the club upright and de-lofted. For a right-handed player that tends to start shots left: pulls or hooks.',
    turf: 'No consistent tendency on natural turf. Have loft and lie checked at the interval above.',
    cast: 'None expected. Cast heads resist bending under normal use.'
  };

  function $(name) { return root.querySelector('[data-tb-el="' + name + '"]'); }

  var el = {
    swings: $('swings'), swingsOut: $('swings-out'),
    weeks: $('weeks'), weeksOut: $('weeks-out'),
    handicap: $('handicap'), badge: $('badge'), help: $('help'),
    gauge: $('gauge'), ring: $('ring'), big: $('big'), small: $('small'),
    lock: $('lock'), alert: $('alert'), alertText: $('alert-text'),
    drift: $('drift'), multiplier: $('multiplier'), tendency: $('tendency'),
    flight: $('flight'), engage: $('engage'), status: $('status'), live: $('live')
  };
  var ironButtons = root.querySelectorAll('[data-tb-iron]');
  var surfaceButtons = root.querySelectorAll('[data-tb-surface]');
  if (!el.swings || !el.weeks || !el.handicap || !el.ring) return;

  var state = { ironType: 'forged', surfaceType: 'mats' };
  var pulseTimer;

  function press(buttons, attr, value) {
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-pressed', buttons[i].getAttribute(attr) === value ? 'true' : 'false');
    }
  }

  function render() {
    var swings = nonNegative(el.swings.value);
    var weeks = nonNegative(el.weeks.value);
    var index = parseFloat(el.handicap.value);
    var valid = isFinite(index);
    var high = valid && index <= COEFFICIENTS.lowHandicapThreshold;
    var cutoff = COEFFICIENTS.lowHandicapThreshold.toFixed(1);

    var r = calculateSpecDrift({
      ironType: state.ironType,
      surfaceType: state.surfaceType,
      swingsPerWeek: swings,
      handicapIndex: index,
      totalSwingsLogged: swings * weeks
    });
    var detected = !r.rigid && r.drift > DRIFT_ALERT_DEGREES;

    press(ironButtons, 'data-tb-iron', state.ironType);
    press(surfaceButtons, 'data-tb-surface', state.surfaceType);
    el.swingsOut.firstChild.nodeValue = swings + ' ';
    el.weeksOut.firstChild.nodeValue = weeks + ' ';
    el.swings.setAttribute('aria-valuetext', swings + ' swings per week');
    el.weeks.setAttribute('aria-valuetext', weeks + ' weeks since last calibration');

    el.badge.textContent = high
      ? 'High compression ×' + COEFFICIENTS.lowHandicapMultiplier
      : 'Standard (cutoff ' + cutoff + ')';
    el.badge.className = 'tb-badge' + (high ? ' is-on' : '');
    el.help.textContent = valid
      ? 'Index ' + cutoff + ' or lower applies the high-compression multiplier.'
      : 'Enter a handicap index. Until then the standard multiplier applies.';

    var big, small, fraction, tone = 'ok';
    if (r.rigid) { big = 'LOCK'; small = 'no routine interval'; fraction = 1; }
    else if (r.months === null) { big = '--'; small = 'add weekly swings'; fraction = 0; }
    else if (r.months <= 0) { big = '0.0'; small = 'months · check due'; fraction = 0; tone = 'alert'; }
    else {
      big = r.months.toFixed(1); small = 'months, estimated';
      fraction = Math.min(r.months, GAUGE_FULL_SCALE_MONTHS) / GAUGE_FULL_SCALE_MONTHS;
      if (r.months <= 3) tone = 'warn';
    }
    el.big.textContent = big;
    el.small.textContent = small;
    el.gauge.setAttribute('data-tone', tone);
    el.gauge.setAttribute('aria-label', 'Estimated Maintenance Interval: ' + big + ' ' + small);
    el.ring.style.strokeDashoffset = String(RING_LENGTH * (1 - fraction));

    el.lock.hidden = !r.rigid;
    el.alert.hidden = !detected;
    el.alertText.textContent = 'Estimated drift ' + r.drift.toFixed(2) + '° is above ' + DRIFT_ALERT_DEGREES.toFixed(1) + '°.';

    el.drift.textContent = r.drift.toFixed(2) + '°';
    el.drift.setAttribute('data-tone', detected ? 'alert' : 'ok');
    el.multiplier.textContent = r.rigid ? 'n/a' : '×' + r.multiplier.toFixed(2);
    el.tendency.textContent = r.tendency;
    el.tendency.setAttribute('data-tone', !r.rigid && state.surfaceType === 'mats' ? 'warn' : 'ok');
    el.flight.textContent = r.rigid ? FLIGHT.cast : FLIGHT[state.surfaceType];
  }

  function bindToggle(buttons, attr, key) {
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function () {
        state[key] = this.getAttribute(attr);
        render();
      });
    }
  }

  bindToggle(ironButtons, 'data-tb-iron', 'ironType');
  bindToggle(surfaceButtons, 'data-tb-surface', 'surfaceType');
  el.swings.addEventListener('input', render);
  el.weeks.addEventListener('input', render);
  el.handicap.addEventListener('input', render);

  el.engage.addEventListener('click', function () {
    el.weeks.value = '0';
    render();
    root.classList.remove('is-pulsing');
    void root.offsetWidth; // restart the pulse animation
    root.classList.add('is-pulsing');
    el.status.textContent = 'Calibrating';
    el.live.textContent = 'Calibration complete. Drift reset to baseline.';
    window.clearTimeout(pulseTimer);
    pulseTimer = window.setTimeout(function () {
      root.classList.remove('is-pulsing');
      el.status.textContent = 'System online';
      el.live.textContent = '';
    }, PULSE_MS);
  });

  render();
})();
