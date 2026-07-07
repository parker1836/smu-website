// Shared site behaviour: nav scroll state, scroll reveals, mobile menu

(function () {
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  const menuBtn = document.querySelector('.menu-btn');
  const links = document.querySelector('.nav-links');
  if (menuBtn && links) {
    menuBtn.addEventListener('click', () => {
      links.classList.toggle('open');
    });
  }

  // Always-tomorrow start date — used as `<span data-starts-tomorrow></span>`
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const startsText = tomorrow.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  document.querySelectorAll('[data-starts-tomorrow]').forEach((el) => {
    el.textContent = startsText;
  });

  // Seats left ticker — starts at 27 every Friday 6:00 AM PST (14:00 UTC), drops by 1 or 2 every
  // ~6h 13m (27 ticks across the 7-day cycle), so the cohort lands near 0 by week's end. Drops
  // are deterministic so every visitor sees the same number at the same moment. Floored at 0.
  function seatsHash(n) {
    n = (((n >>> 16) ^ n) * 0x45d9f3b) | 0;
    n = (((n >>> 16) ^ n) * 0x45d9f3b) | 0;
    return ((n >>> 16) ^ n) >>> 0;
  }
  function computeSeatsState(now) {
    // May 22 2026 06:00 PST = 13:00 UTC, a Friday — anchor matches the date the live counters launched
    const anchor = Date.UTC(2026, 4, 22, 13, 0, 0);
    const cycleMs = 7 * 24 * 60 * 60 * 1000;
    const ticksPerCycle = 27;
    const tickMs = cycleMs / ticksPerCycle;
    const elapsed = now - anchor;
    const cycleIdx = Math.max(0, Math.floor(elapsed / cycleMs));
    const intoCycle = ((elapsed % cycleMs) + cycleMs) % cycleMs;
    const tickIdx = Math.floor(intoCycle / tickMs); // 0..26

    const SEATS_START = 27;
    let seats = SEATS_START;
    let dropsThisCycle = 0;
    for (let i = 0; i < tickIdx; i++) {
      // ~15% chance of -2, ~85% chance of -1 — varies week to week
      const drop = (seatsHash(cycleIdx * 1024 + i) % 100 < 15) ? 2 : 1;
      const before = seats;
      seats = Math.max(0, seats - drop);
      dropsThisCycle += (before - seats); // only count drops the user actually saw
    }
    // Each completed cycle contributed exactly SEATS_START visible drops
    const totalDrops = cycleIdx * SEATS_START + dropsThisCycle;
    return { seats, totalDrops };
  }
  function computeSeatsLeft(now) { return computeSeatsState(now).seats; }
  function paintSeats() {
    const { seats, totalDrops } = computeSeatsState(Date.now());
    // Query the host badges (marked once on first paint) so we don't lose them when we collapse to "Enrollment full".
    document.querySelectorAll('[data-seats-left], [data-seats-host]').forEach((el) => {
      const host = el.matches('[data-seats-host]') ? el : (el.closest('.tag') || el.parentElement);
      if (!host) return;
      host.setAttribute('data-seats-host', '');
      if (seats === 0) {
        host.textContent = 'Enrollment full';
      } else {
        host.innerHTML = '<span data-seats-left>' + seats + '</span> seats left';
      }
    });
    // Student count = base + everyone who has "come off" the seats counter since the anchor.
    const STUDENT_BASE = 56;
    const count = STUDENT_BASE + totalDrops;
    const formatted = count.toLocaleString();
    document.querySelectorAll('#student-count, #student-count-bg').forEach((el) => {
      el.innerHTML = '<span class="gold">' + formatted + '</span>';
    });
  }
  if (document.querySelector('[data-seats-left]')) {
    paintSeats();
    // Re-check every minute so the number ticks down live without a refresh.
    setInterval(paintSeats, 60 * 1000);
  }

  // (Legacy: student counter previously persisted in localStorage — now derived from seat ticks.)

  // Reveal on scroll
  const reveal = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveal.forEach((el) => io.observe(el));
  } else {
    reveal.forEach((el) => el.classList.add('in'));
  }

  // Hero parallax (subtle) — DISABLED to allow the bull charge entrance to play cleanly
  // const heroBg = document.querySelector('.hero-bg img'); ...
})();
