/* ==========================================================
   FORNO — script.js
   1. Data  2. Mobile nav  3. Smooth scroll  4. Menu filter
   5. Order modal  6. Reveal on scroll  7. Image fallback
   ========================================================== */

(function () {
  'use strict';

  // ---------- 1. Data (illustrative demo prices, in rupees) ----------
  var PIZZAS = [
    { name: 'Margherita',  price: 299 },
    { name: 'Diavola',     price: 399 },
    { name: 'Burrata',     price: 449 },
    { name: 'Four Cheese', price: 429 }
  ];

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var formatINR = function (n) { return '₹' + n.toLocaleString('en-IN'); };

  // ---------- 2. Mobile navigation ----------
  var toggle = $('.nav__toggle');
  var navLinks = $('#site-nav');

  function setNav(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    navLinks.classList.toggle('is-open', open);
  }

  toggle.addEventListener('click', function () {
    setNav(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // ---------- 3. Smooth scrolling ----------
  // CSS handles the smooth motion; here we close the mobile menu and move focus.
  $$('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (link.hasAttribute('data-open-order')) return; // handled by the modal
      if (id.length < 2) return;
      var target = $(id);
      if (!target) return;
      e.preventDefault();
      setNav(false);
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', id);
    });
  });

  // ---------- 4. Menu filter ----------
  var filters = $$('.filter');
  var dishes = $$('.dish');
  var grid = $('.menu__grid');

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var value = btn.getAttribute('data-filter');
      filters.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      dishes.forEach(function (d) {
        d.hidden = !(value === 'all' || d.getAttribute('data-diet') === value);
      });
      grid.classList.toggle('is-filtered', value !== 'all');
    });
  });

  // ---------- 5. Order modal ----------
  var modal = $('#order-modal');
  var select = $('#order-pizza');
  var qtyValue = $('#qty-value');
  var subtotalEl = $('#order-subtotal');
  var notice = $('#order-notice');
  var form = $('#order-form');
  var DEMO_TEXT = 'This is a demo. No real order is placed and no payment is taken.';
  var qty = 1;
  var lastFocus = null;

  PIZZAS.forEach(function (p) {
    var opt = document.createElement('option');
    opt.value = p.name;
    opt.textContent = p.name + ' — ' + formatINR(p.price);
    select.appendChild(opt);
  });

  function priceOf(name) {
    for (var i = 0; i < PIZZAS.length; i++) if (PIZZAS[i].name === name) return PIZZAS[i].price;
    return 0;
  }

  function updateSubtotal() {
    qtyValue.textContent = qty;
    subtotalEl.textContent = formatINR(priceOf(select.value) * qty);
    notice.textContent = DEMO_TEXT;
    notice.classList.remove('is-confirmed');
  }

  function openModal(pizzaName) {
    lastFocus = document.activeElement;
    if (pizzaName) select.value = pizzaName;
    qty = 1;
    updateSubtotal();
    setNav(false);
    modal.hidden = false;
    document.body.classList.add('modal-open');
    select.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastFocus) lastFocus.focus();
  }

  $$('[data-open-order]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); openModal(); });
  });
  $$('[data-order]').forEach(function (el) {
    el.addEventListener('click', function () { openModal(el.getAttribute('data-order')); });
  });
  $$('[data-close-order]').forEach(function (el) {
    el.addEventListener('click', closeModal);
  });

  select.addEventListener('change', updateSubtotal);
  $('#qty-minus').addEventListener('click', function () { if (qty > 1) { qty--; updateSubtotal(); } });
  $('#qty-plus').addEventListener('click', function () { if (qty < 20) { qty++; updateSubtotal(); } });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    notice.textContent = 'Demo only — nothing was ordered and no payment was taken. Thanks for trying Forno!';
    notice.classList.add('is-confirmed');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (!modal.hidden) closeModal();
      else setNav(false);
    }
    // Keep Tab focus inside the open modal
    if (e.key === 'Tab' && !modal.hidden) {
      var items = $$('button, select, [href]', $('.modal__panel')).filter(function (el) { return !el.disabled; });
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // ---------- 6. Reveal on scroll ----------
  var reveals = $$('.reveal');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  // ---------- 7. Image fallback ----------
  // If a photo fails, the wrapper's warm beige background shows instead.
  $$('img').forEach(function (img) {
    var fail = function () { if (img.parentElement) img.parentElement.classList.add('img-failed'); };
    img.addEventListener('error', fail);
    if (img.complete && img.naturalWidth === 0) fail();
  });

  $('#year').textContent = new Date().getFullYear();
})();
