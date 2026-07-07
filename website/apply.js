// Tier-aware application page logic.
(function () {
  const TIERS = {
    audit: {
      name: 'Foundation',
      title: 'Foundation',
      eyebrow: 'Enrollment',
      sub: "Video library and read-only modules. No application required.",
      price: '$800',
      strike: 'List $1,100',
      seatsRemaining: 50,
      submitLabel: 'Enroll · pay $800',
      footNote: 'Charged once. Lifetime access to the recorded modules.',
      successTitle: 'You\'re enrolled.',
      successBody: 'Your seat for Cohort 12 is reserved. Login details are on the way to <b>EMAIL</b>.',
      requiresApplication: false,
      features: [
        'Prop firm domination',
        '8 modules, video-recorded',
        'Basic market understanding',
        'Read-only access',
      ],
    },
    cohort: {
      name: 'Silver',
      title: 'Silver',
      eyebrow: 'Enrollment',
      sub: '',
      price: '$1,800',
      strike: 'List $2,200 · save $400 before May 21',
      seatsRemaining: 24,
      submitLabel: 'Enroll · reserve my seat',
      footNote: 'Hold your seat with a deposit. No payment now — link emailed after review.',
      successTitle: 'Thank you for applying.',
      successBody: 'We\'ll review your application and let you know if you\'ve been accepted within 24 hours. Watch for an email at <b>EMAIL</b>.',
      requiresApplication: false,
      features: [
        'Everything in Foundation',
        '9 additional modules, video-recorded',
        'Journaling',
      ],
    },
    desk: {
      name: 'Gold',
      title: 'Gold',
      eyebrow: 'Application',
      sub: '',
      price: '$2,800',
      strike: 'List $3,500 · application only',
      seatsRemaining: 8,
      submitLabel: 'Submit application',
      footNote: 'Application reviewed within 1 business day. We\'ll email you if accepted.',
      successTitle: 'Thank you for applying.',
      successBody: 'We\'ll review your application and let you know if you\'ve been accepted within 24 hours. Watch for an email at <b>EMAIL</b>.',
      requiresApplication: true,
      features: [
        'Everything in Silver',
        '45 hours of video lessons',
        '11 total modules, video-recorded',
        'Trade plan development',
        'Psychology',
        'Advanced market mastery',
        'Weekly watchlist',
        'Weekly market review',
        'SMU hat',
      ],
    },
    allocation: {
      name: 'Diamond',
      title: 'Diamond',
      eyebrow: 'Application · by interview',
      sub: 'Trade live capital, funded by the program. Seats are by interview only — tell us about your edge, your record, and your goals.',
      price: '$8,000',
      strike: 'List $9,000 · by interview',
      seatsRemaining: 8,
      submitLabel: 'Apply for allocation',
      footNote: 'Application reviewed within 2 business days. Initial interview is 30 min on Zoom.',
      successTitle: 'Application received.',
      successBody: 'We\'ll review carefully and reply to <b>EMAIL</b> within 2 business days. If we\'re a fit, we\'ll schedule a 30-min interview.',
      requiresApplication: true,
      features: [
        'Everything in Gold',
        'Live calls',
        'Live market breakdown',
        'Direct, priority access to me',
        '1:1 coaching',
        'Direct, priority access to me',
        '1:1 coaching',
      ],
    },
  };

  // Read tier from URL
  const params = new URLSearchParams(location.search);
  const tierKey = (params.get('tier') || 'cohort').toLowerCase();
  const tier = TIERS[tierKey] || TIERS.cohort;

  // Populate header + summary
  // If a tier has seatsRemaining set, derive both the eyebrow tag and the seats summary from the same number
  if (typeof tier.seatsRemaining === 'number') {
    const flash = `<span class="seats-flash">${tier.seatsRemaining} seats remaining</span>`;
    tier.eyebrow = `${tier.eyebrow} · ${flash}`;
    tier.seats   = `${tier.seatsRemaining} remaining`;
  }
  document.getElementById('tier-eyebrow').innerHTML = tier.eyebrow;
  document.getElementById('tier-title').textContent = tier.title;
  document.getElementById('tier-sub').textContent = tier.sub;
  document.getElementById('sum-tier').textContent = tier.name;
  document.getElementById('sum-price').innerHTML = `${tier.price} <small style="color:var(--muted); text-decoration:line-through; font-family:var(--font-mono); font-size:12px; margin-left:6px">${tier.strike}</small>`;
  document.getElementById('sum-seats').textContent = tier.seats;

  // "Starts" = always tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const startsEl = document.getElementById('sum-starts');
  if (startsEl) {
    startsEl.textContent = tomorrow.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  // Side panel
  document.getElementById('side-title').textContent = `What's in ${tier.name}`;
  const list = document.getElementById('side-list');
  list.innerHTML = tier.features.map(f =>
    `<li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> ${f}</li>`
  ).join('');

  // Hide advanced sections for non-application tiers (Audit, Cohort)
  if (!tier.requiresApplication) {
    document.querySelectorAll('.apply-form .advanced').forEach(el => el.classList.add('hidden'));
  }

  // CTA + foot note
  document.getElementById('submitLabel').textContent = tier.submitLabel;
  document.getElementById('formFoot').textContent = tier.footNote;
  document.title = `${tier.requiresApplication ? 'Apply' : 'Enroll'} · ${tier.name} — Stock Market University`;

  // Submit handler
  const form = document.getElementById('applyForm');
  const successEl = document.getElementById('applySuccess');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Cheap validation: required fields
    let valid = true;
    form.querySelectorAll('[required]').forEach((el) => {
      const filled = el.type === 'checkbox' ? el.checked : el.value.trim();
      if (!filled) {
        valid = false;
        el.closest('.field, .check')?.classList.add('invalid');
      } else {
        el.closest('.field, .check')?.classList.remove('invalid');
      }
    });
    if (!valid) {
      form.querySelector('.invalid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Build success state
    const data = new FormData(form);
    const email = data.get('email') || 'you';
    const ref = `SMU-12-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date();
    const time = now.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

    document.getElementById('success-title').textContent = tier.successTitle;
    document.getElementById('success-body').innerHTML = tier.successBody.replace('EMAIL', `<span style="color:var(--gold)">${email}</span>`);
    document.getElementById('success-ref').textContent = ref;
    document.getElementById('success-tier').textContent = tier.name;
    document.getElementById('success-time').textContent = time;

    // Increment the global student counter (visible on the home hero)
    try {
      const STUDENT_KEY = 'smu_student_count';
      const STUDENT_BASE = 56;
      const cur = parseInt(localStorage.getItem(STUDENT_KEY), 10);
      const next = (isNaN(cur) ? STUDENT_BASE : cur) + 1;
      localStorage.setItem(STUDENT_KEY, String(next));
    } catch (_) {}

    // Swap views
    form.parentElement.style.display = 'none';
    document.querySelector('.apply-head').style.display = 'none';
    successEl.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Live-clear invalid state on input
  form.addEventListener('input', (e) => {
    e.target.closest('.field, .check')?.classList.remove('invalid');
  });
})();
