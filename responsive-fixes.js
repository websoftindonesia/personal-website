/* ============================================================
   RESPONSIVE FIXES JS — patch perilaku kaku
   Load SETELAH interactive-features.js
   ============================================================ */
(function () {
    'use strict';

    /* 1. MATIKAN AUTO SCROLL-SNAP paling kaku.
       interactive-features.js menambahkan listener anonim yang tidak bisa
       di-remove, jadi kita netralkan lewat interceptor scrollIntoView:
       panggilan yang terjadi 150ms SETELAH scroll berhenti (karakteristik
       snap) akan diabaikan; panggilan dari klik navigasi tetap jalan. */
    var snapGuard = false;
    window.addEventListener('scroll', function () {
        snapGuard = true;
        clearTimeout(window.__snapGuardT);
        window.__snapGuardT = setTimeout(function () { snapGuard = false; }, 200);
    }, { passive: true });

    var originalScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function (options) {
        // Lewati jika ini pemanggilan "snap" (terjadi tepat setelah scroll berhenti)
        if (snapGuard && window.__lastNavClick !== true) {
            return; // abaikan auto-snap
        }
        window.__lastNavClick = false;
        return originalScrollIntoView.call(this, options);
    };

    // Tandai klik navigasi yang sah (user sengaja klik link anchor)
    document.addEventListener('click', function (e) {
        var link = e.target.closest('a[href^="#"]');
        if (link) window.__lastNavClick = true;
    }, true);

    /* 2. FIX TINGGI VIEWPORT MOBILE (address bar show/hide) —
       pakai visualViewport supaya panel chat/voice tidak terpotong */
    function syncViewportHeight() {
        var vv = window.visualViewport;
        if (!vv) return;
        document.documentElement.style.setProperty('--vh', (vv.height * 0.01) + 'px');
    }
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', syncViewportHeight);
        syncViewportHeight();
    }

    /* 3. ORIENTATION CHANGE — reflow halus setelah rotate */
    var orientT;
    window.addEventListener('orientationchange', function () {
        clearTimeout(orientT);
        orientT = setTimeout(function () {
            window.dispatchEvent(new Event('resize'));
            // Re-trigger reveal untuk elemen yang baru terlihat
            document.querySelectorAll('.animate-on-scroll:not(.visible)').forEach(function (el) {
                var r = el.getBoundingClientRect();
                if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('visible');
            });
        }, 350);
    });

    /* 4. CEK OVERFLOW HORIZONTAL — log elemen penyebab (debug) */
    function reportOverflow() {
        if (window.innerWidth > document.documentElement.clientWidth + 2) {
            var offenders = [];
            document.querySelectorAll('*').forEach(function (el) {
                if (el.scrollWidth > document.documentElement.clientWidth &&
                    el.children.length < 50 &&
                    !['HTML','BODY','MAIN','SCRIPT','STYLE'].includes(el.tagName)) {
                    var r = el.getBoundingClientRect();
                    if (r.left < -2 || r.right > window.innerWidth + 2) {
                        offenders.push(el.className.toString().slice(0, 60) || el.tagName);
                    }
                }
            });
            if (offenders.length) {
                console.warn('[ResponsiveFix] Elemen penyebab scroll horizontal:', offenders.slice(0, 8));
            }
        }
    }
    window.addEventListener('load', reportOverflow);
    window.addEventListener('resize', function () {
        clearTimeout(window.__ovfT);
        window.__ovfT = setTimeout(reportOverflow, 400);
    });

    /* 5. KEYBOARD MOBILE — tutup mobile nav saat input difokuskan */
    document.addEventListener('focusin', function (e) {
        if (e.target.matches('input, textarea, select')) {
            var nav = document.getElementById('mobileNav');
            var toggle = document.getElementById('mobileMenuToggle');
            if (nav && nav.classList.contains('active')) {
                nav.classList.remove('active');
                if (toggle) toggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        }
    });

    console.log('%c[ResponsiveFix] Patch aktif: snap dinonaktifkan, viewport sync, overflow guard.', 'color:#1877f2');
})();