(function () {
  'use strict';

  var PHONE = '447504681171';
  var OPEN = 7, CLOSE = 22;

  /* Year */
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

  /* Header shadow on scroll */
  var header = document.querySelector('.header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile nav */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('nav');
  function setNav(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  toggle.addEventListener('click', function () { setNav(!nav.classList.contains('is-open')); });
  nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') setNav(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setNav(false); });

  /* Open / closed status using London time */
  function londonNow() {
    var parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
    }).formatToParts(new Date());
    var o = {};
    parts.forEach(function (p) { o[p.type] = p.value; });
    var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return { day: days[o.weekday], hour: parseInt(o.hour, 10) % 24, minute: parseInt(o.minute, 10) };
  }
  var now = londonNow();
  var mins = now.hour * 60 + now.minute;
  var isOpen = mins >= OPEN * 60 && mins < CLOSE * 60;
  var status = document.querySelector('[data-status]');
  if (status) {
    status.classList.toggle('is-open', isOpen);
    status.querySelector('[data-status-text]').textContent = isOpen ? 'Open now · until 22:00' : 'Closed · opens 07:00';
  }
  var today = document.querySelector('.hours tr[data-day="' + now.day + '"]');
  if (today) today.classList.add('is-today');

  /* Active nav link */
  var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
  if ('IntersectionObserver' in window) {
    var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id); });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { navObs.observe(s); });

    /* Reveal on scroll */
    var revealEls = document.querySelectorAll('.section__head, .menu__item, .tile, .cake, .steps li, .review, .christmas__copy, .christmas__media, .form, .visit__info, .visit__map');
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); revObs.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (i % 4) * 60 + 'ms';
      revObs.observe(el);
    });
  }

  /* Lightbox */
  var lb = document.getElementById('lightbox');
  var lbImg = lb.querySelector('img');
  var lbCap = lb.querySelector('figcaption');
  var lastFocus = null;
  function openLb(src, cap) {
    lastFocus = document.activeElement;
    lbImg.src = src; lbImg.alt = cap || ''; lbCap.textContent = cap || '';
    lb.hidden = false;
    requestAnimationFrame(function () { lb.classList.add('is-open'); });
    document.body.style.overflow = 'hidden';
    lb.querySelector('.lightbox__close').focus();
  }
  function closeLb() {
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(function () { lb.hidden = true; lbImg.src = ''; }, 200);
    if (lastFocus) lastFocus.focus();
  }
  document.querySelectorAll('[data-lightbox]').forEach(function (el) {
    el.addEventListener('click', function () { openLb(el.getAttribute('data-lightbox'), el.getAttribute('data-caption')); });
  });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.closest('.lightbox__close')) closeLb(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) closeLb(); });

  /* Christmas button preselects occasion */
  var form = document.getElementById('orderForm');
  document.querySelectorAll('[data-occasion]').forEach(function (btn) {
    btn.addEventListener('click', function () { form.occasion.value = btn.getAttribute('data-occasion'); });
  });

  /* Order form -> WhatsApp */
  var minDate = new Date(); minDate.setDate(minDate.getDate() + 1);
  form.date.min = minDate.toISOString().split('T')[0];

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var required = [form.name, form.phone, form.date];
    var valid = true;
    required.forEach(function (f) {
      var bad = !f.value.trim();
      f.classList.toggle('is-invalid', bad);
      if (bad) valid = false;
    });
    form.querySelector('.form__error').hidden = valid;
    if (!valid) return;

    var d = new Date(form.date.value + 'T12:00:00');
    var dateStr = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    var lines = [
      'Hello Milk Bar, I would like to order a cake.',
      '',
      'Name: ' + form.name.value.trim(),
      'Phone: ' + form.phone.value.trim(),
      'Occasion: ' + form.occasion.value,
      'Collection date: ' + dateStr
    ];
    if (form.guests.value) lines.push('Guests: ' + form.guests.value);
    if (form.notes.value.trim()) lines.push('Details: ' + form.notes.value.trim());

    window.open('https://wa.me/' + PHONE + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
  });
})();

