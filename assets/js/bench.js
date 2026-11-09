/* Interactive Virtual Bending Bench (Craft page). No libraries.
   The torque figures are an illustrative model, not measurements. */
(function () {
  var bench = document.querySelector('[data-bench]');
  if (!bench) return;

  var MATERIALS = {
    forged: { limit: 4.0, perDegree: 9, name: 'forged carbon steel' },
    cast: { limit: 2.0, perDegree: 14, name: 'cast stainless steel' }
  };

  // Schematic geometry: pivot at the hosel base, deflection drawn at 6x so half-degree steps are visible.
  var PIVOT_X = 180, PIVOT_Y = 230, RADIUS = 190, VISUAL_GAIN = 6;
  var SVG_NS = 'http://www.w3.org/2000/svg';

  var slider = bench.querySelector('[data-slider]');
  var radios = bench.querySelectorAll('input[name="bench-head"]');
  var reset = bench.querySelector('[data-reset]');
  var rig = bench.querySelector('[data-rig]');
  var ticks = bench.querySelector('[data-ticks]');
  var arcSafe = bench.querySelector('[data-arc-safe]');
  var arcFull = bench.querySelector('[data-arc-full]');
  var out = {
    value: bench.querySelector('[data-out="value"]'),
    torque: bench.querySelector('[data-out="torque"]'),
    flexion: bench.querySelector('[data-out="flexion"]'),
    status: bench.querySelector('[data-out="status"]'),
    banner: bench.querySelector('[data-out="banner"]'),
    led: bench.querySelector('[data-out="led"]')
  };
  var statusBox = bench.querySelector('[data-status]');
  if (!slider || !rig || !statusBox) return;

  function point(deg) {
    var a = deg * VISUAL_GAIN * Math.PI / 180;
    return [PIVOT_X + RADIUS * Math.sin(a), PIVOT_Y - RADIUS * Math.cos(a)];
  }

  function arcPath(from, to) {
    var p1 = point(from), p2 = point(to);
    return 'M' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) +
      ' A' + RADIUS + ' ' + RADIUS + ' 0 0 1 ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
  }

  function signed(deg) {
    if (deg === 0) return '0.0°';
    return (deg > 0 ? '+' : '−') + Math.abs(deg).toFixed(1) + '°';
  }

  // Gauge ticks, one per half degree, drawn once.
  (function drawTicks() {
    if (!ticks) return;
    for (var d = -5; d <= 5; d += 0.5) {
      var major = d % 1 === 0;
      var a = d * VISUAL_GAIN * Math.PI / 180;
      var r1 = RADIUS + 5, r2 = RADIUS + (major ? 14 : 10);
      var line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', (PIVOT_X + r1 * Math.sin(a)).toFixed(1));
      line.setAttribute('y1', (PIVOT_Y - r1 * Math.cos(a)).toFixed(1));
      line.setAttribute('x2', (PIVOT_X + r2 * Math.sin(a)).toFixed(1));
      line.setAttribute('y2', (PIVOT_Y - r2 * Math.cos(a)).toFixed(1));
      line.setAttribute('class', 'b-tick' + (major ? ' b-tick-major' : ''));
      ticks.appendChild(line);
    }
    if (arcFull) arcFull.setAttribute('d', arcPath(-5, 5));
  })();

  function material() {
    for (var i = 0; i < radios.length; i++) if (radios[i].checked) return radios[i].value;
    return 'forged';
  }

  function render() {
    var key = material();
    var m = MATERIALS[key];
    var deg = parseFloat(slider.value) || 0;
    var mag = Math.abs(deg);
    var over = mag > m.limit;
    var state = 'safe';
    var status, banner, led;

    if (key === 'cast' && over) {
      state = 'alert';
      status = 'Critical';
      led = 'High alert';
      banner = 'Critical hosel fatigue: high fracture/snap risk for cast stainless steel';
    } else if (key === 'forged' && over) {
      state = 'caution';
      status = 'Beyond typical range';
      led = 'Caution';
      banner = 'Beyond the typical ±4.0° range for forged carbon steel. Assessed head by head.';
    } else {
      status = mag === 0 ? 'Factory standard' : 'Nominal';
      led = 'Nominal';
      banner = key === 'forged'
        ? 'Ductile Material Yielding Safely under Controlled Torque.'
        : 'Within the ±2.0° tolerance for cast stainless steel.';
    }

    bench.setAttribute('data-state', state);
    bench.setAttribute('data-material', key);
    statusBox.setAttribute('role', state === 'alert' ? 'alert' : 'status');

    var direction = deg === 0 ? 'Factory standard' : (deg > 0 ? 'Upright / Weak' : 'Flat / Strong');
    out.value.textContent = signed(deg) + ' · ' + direction;
    out.torque.textContent = (mag * m.perDegree).toFixed(1) + ' ft-lbs';
    out.flexion.textContent = signed(deg) + ' · ' + Math.round(mag / m.limit * 100) + '% of ±' + m.limit.toFixed(1) + '°';
    out.status.textContent = status;
    out.banner.textContent = banner;
    if (out.led) out.led.textContent = led;

    slider.setAttribute('aria-valuetext', signed(deg) + ', ' + direction + ', ' + status);
    rig.setAttribute('transform', 'rotate(' + (deg * VISUAL_GAIN) + ' ' + PIVOT_X + ' ' + PIVOT_Y + ')');
    if (arcSafe) arcSafe.setAttribute('d', arcPath(-m.limit, m.limit));
  }

  slider.addEventListener('input', render);
  slider.addEventListener('change', render);
  for (var i = 0; i < radios.length; i++) radios[i].addEventListener('change', render);
  if (reset) {
    reset.addEventListener('click', function () {
      slider.value = '0';
      render();
      slider.focus();
    });
  }

  render();
})();
