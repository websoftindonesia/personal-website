/* ============================================================
   3D ENHANCEMENTS JS — hemat performa
   - semua update lewat requestAnimationFrame (maks 1x/frame)
   - listener passive, hanya aktif saat elemen terlihat
   - FPS governor: perangkat lemah otomatis masuk mode "lite"
   Load SETELAH responsive-fixes.js (atau dengan defer)
   ============================================================ */
(function () {
    'use strict';

    var root = document.documentElement;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (reduce) { root.classList.add('fx-lite'); return; }

    // Perangkat sangat lemah -> langsung lite
    if ((navigator.deviceMemory && navigator.deviceMemory <= 2) ||
        (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2)) {
        root.classList.add('fx-lite');
        return;
    }

    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        var hero = document.querySelector('.hero');
        var frame = document.querySelector('.hero-photo-frame');
        var heroVisible = true;

        /* ---------- 1. Kubus 3D + chip di hero ---------- */
        var cubes = null;
        if (hero) {
            cubes = document.createElement('div');
            cubes.className = 'fx-cubes';
            cubes.setAttribute('aria-hidden', 'true');
            for (var c = 0; c < 4; c++) {
                var cube = document.createElement('div');
                cube.className = 'fx-cube';
                cube.innerHTML = '<i></i><i></i><i></i><i></i><i></i><i></i>';
                cubes.appendChild(cube);
            }
            var container = hero.querySelector('.hero-container');
            hero.insertBefore(cubes, container || hero.firstChild);
        }
        if (frame) {
            ['fa-code', 'fa-bolt', 'fa-layer-group'].forEach(function (ic) {
                var chip = document.createElement('div');
                chip.className = 'fx-chip';
                chip.setAttribute('aria-hidden', 'true');
                chip.innerHTML = '<i class="fas ' + ic + '"></i>';
                frame.appendChild(chip);
            });
        }

        /* ---------- 2. Tilt foto + parallax kubus (pointer & scroll) ---------- */
        var nx = 0, ny = 0, sy = 0, queued = false;

        function apply() {
            queued = false;
            if (!heroVisible) return;
            if (frame) {
                frame.style.setProperty('--fx-rx', (-ny * 7).toFixed(2) + 'deg');
                frame.style.setProperty('--fx-ry', (nx * 9).toFixed(2) + 'deg');
                frame.style.setProperty('--fx-sy', (-sy * 0.04).toFixed(1) + 'px');
            }
            if (cubes) {
                cubes.style.transform =
                    'translate3d(' + (nx * -14).toFixed(1) + 'px,' +
                    (sy * 0.12 + ny * -10).toFixed(1) + 'px,0)';
            }
        }
        function schedule() {
            if (!queued) { queued = true; requestAnimationFrame(apply); }
        }

        if (hero && fine) {
            hero.addEventListener('pointermove', function (e) {
                var r = hero.getBoundingClientRect();
                nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
                ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
                schedule();
            }, { passive: true });
            hero.addEventListener('pointerleave', function () {
                nx = 0; ny = 0; schedule();
            }, { passive: true });
        }
        window.addEventListener('scroll', function () {
            if (!heroVisible) return;
            sy = window.scrollY || 0;
            schedule();
        }, { passive: true });

        // Pause animasi CSS & update JS saat hero keluar layar
        if (hero && 'IntersectionObserver' in window) {
            new IntersectionObserver(function (entries) {
                heroVisible = entries[0].isIntersecting;
                hero.classList.toggle('fx-paused', !heroVisible);
            }, { threshold: 0.02 }).observe(hero);
        }
        document.addEventListener('visibilitychange', function () {
            if (hero) hero.classList.toggle('fx-paused', document.hidden || !heroVisible);
        });

        /* ---------- 3. Kilau kartu (glare) — tidak menyentuh transform tilt lama ---------- */
        if (fine) {
            var sel = '.project-card, .service-card, .certificate-card, .education-card, .testi-simple-card';
            document.querySelectorAll(sel).forEach(function (card) {
                if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
                var glare = document.createElement('span');
                glare.className = 'fx-glare';
                glare.setAttribute('aria-hidden', 'true');
                card.appendChild(glare);

                var raf = 0, px = 0, py = 0;
                card.addEventListener('pointermove', function (e) {
                    var r = card.getBoundingClientRect();
                    px = e.clientX - r.left; py = e.clientY - r.top;
                    if (raf) return;
                    raf = requestAnimationFrame(function () {
                        raf = 0;
                        glare.style.setProperty('--gx', px + 'px');
                        glare.style.setProperty('--gy', py + 'px');
                    });
                }, { passive: true });
                card.addEventListener('pointerenter', function () { card.classList.add('fx-glare-on'); }, { passive: true });
                card.addEventListener('pointerleave', function () { card.classList.remove('fx-glare-on'); }, { passive: true });
            });
        }

        /* ---------- 4. Ripple klik pada tombol utama ---------- */
        document.addEventListener('click', function (e) {
            var btn = e.target.closest('.hero-cta, .filter-btn, .tab-btn, .certificate-btn');
            if (!btn) return;
            btn.classList.add('fx-ripple-host');
            var r = btn.getBoundingClientRect();
            var dot = document.createElement('span');
            dot.className = 'fx-ripple';
            dot.style.left = (e.clientX - r.left) + 'px';
            dot.style.top = (e.clientY - r.top) + 'px';
            btn.appendChild(dot);
            setTimeout(function () { dot.remove(); }, 650);
        }, { passive: true });

        /* ---------- 5. FPS governor: kalau lag, matikan efek 3D otomatis ---------- */
        window.addEventListener('load', function () {
            setTimeout(function () {
                var deltas = [], last = 0, n = 0;
                function sample(t) {
                    if (document.hidden) { return setTimeout(function () { requestAnimationFrame(sample); }, 500); }
                    if (last) deltas.push(t - last);
                    last = t;
                    if (++n < 90) return requestAnimationFrame(sample);
                    deltas.sort(function (a, b) { return a - b; });
                    var median = deltas[Math.floor(deltas.length / 2)];
                    if (median > 28) {            // < ~35 FPS
                        root.classList.add('fx-lite');
                        console.info('[3D FX] Mode lite aktif (FPS rendah).');
                    }
                }
                requestAnimationFrame(sample);
            }, 800);
        });
    });
})();