/* VISUAILS — shared interactions */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Header scrolled state */
  var header = document.querySelector(".site-header");
  function onScroll() { if (header) header.classList.toggle("scrolled", window.scrollY > 20); }
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

  /* Mobile nav */
  var toggle = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");
  var closeBtn = document.querySelector(".mobile-close");
  function openNav() { if (mobileNav) { mobileNav.classList.add("open"); document.body.style.overflow = "hidden"; } }
  function closeNav() { if (mobileNav) { mobileNav.classList.remove("open"); document.body.style.overflow = ""; } }
  toggle && toggle.addEventListener("click", openNav);
  closeBtn && closeBtn.addEventListener("click", closeNav);
  mobileNav && mobileNav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeNav); });

  /* Reveal on scroll — enhancement only; content is visible by default */
  var revealEls = document.querySelectorAll(".reveal");
  if (!reduce && "IntersectionObserver" in window && revealEls.length) {
    document.documentElement.classList.add("reveal-on");
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); ro.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
    revealEls.forEach(function (el) { ro.observe(el); });
    /* Failsafe: if anything is still hidden after 2.4s (paused tab, headless, no scroll), show it */
    setTimeout(function () {
      document.querySelectorAll(".reveal:not(.in)").forEach(function (el) { el.classList.add("in"); });
    }, 2400);
  }

  /* Counters */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, target = parseFloat(el.getAttribute("data-count")),
            suffix = el.getAttribute("data-suffix") || "", dur = 1400, t0 = null;
        if (reduce) { el.textContent = target + suffix; co.unobserve(el); return; }
        function tick(ts) {
          if (!t0) t0 = ts; var p = Math.min((ts - t0) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (Math.round(target * eased * 10) / 10).toString().replace(/\.0$/, "") + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick); co.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* Accordion (details-based or button-based) */
  document.querySelectorAll(".acc-q[aria-controls]").forEach(function (btn) {
    var body = document.getElementById(btn.getAttribute("aria-controls"));
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      body.style.maxHeight = open ? "0px" : body.scrollHeight + "px";
    });
  });

  /* Before/After slider */
  document.querySelectorAll(".ba").forEach(function (ba) {
    var pos = 50, dragging = false;
    function set(x) {
      var rect = ba.getBoundingClientRect();
      pos = Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100));
      ba.style.setProperty("--pos", pos + "%");
    }
    function down(e) { dragging = true; set((e.touches ? e.touches[0] : e).clientX); }
    function move(e) { if (dragging) set((e.touches ? e.touches[0] : e).clientX); }
    function up() { dragging = false; }
    ba.addEventListener("mousedown", down); ba.addEventListener("touchstart", down, { passive: true });
    window.addEventListener("mousemove", move); window.addEventListener("touchmove", move, { passive: true });
    window.addEventListener("mouseup", up); window.addEventListener("touchend", up);
    ba.setAttribute("tabindex", "0"); ba.setAttribute("role", "slider");
    ba.setAttribute("aria-label", "Before and after comparison");
    ba.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { pos = Math.max(0, pos - 4); ba.style.setProperty("--pos", pos + "%"); }
      if (e.key === "ArrowRight") { pos = Math.min(100, pos + 4); ba.style.setProperty("--pos", pos + "%"); }
    });
  });

  /* Marquee: duplicate track for seamless loop */
  document.querySelectorAll(".marquee-track").forEach(function (track) {
    if (reduce) return;
    track.innerHTML += track.innerHTML;
  });

  /* Multi-step forms (data-step-form) */
  document.querySelectorAll("[data-step-form]").forEach(function (form) {
    var steps = form.querySelectorAll("[data-step]");
    var bar = form.querySelector(".progress > i");
    var cur = 0;
    function show(i) {
      cur = i;
      steps.forEach(function (s, idx) { s.hidden = idx !== i; });
      if (bar) bar.style.width = Math.round(((i + 1) / steps.length) * 100) + "%";
      form.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      updatePrice();
    }
    form.querySelectorAll("[data-next]").forEach(function (b) {
      b.addEventListener("click", function () { if (validateStep(steps[cur]) && cur < steps.length - 1) show(cur + 1); });
    });
    form.querySelectorAll("[data-prev]").forEach(function (b) {
      b.addEventListener("click", function () { if (cur > 0) show(cur - 1); });
    });
    function validateStep(step) {
      var ok = true;
      step.querySelectorAll("[required]").forEach(function (f) {
        if (!f.value || (f.type === "radio" && !form.querySelector('input[name="' + f.name + '"]:checked'))) {
          f.setAttribute("aria-invalid", "true"); ok = false;
        } else { f.removeAttribute("aria-invalid"); }
      });
      return ok;
    }
    /* live price */
    function updatePrice() {
      var out = form.querySelector("[data-total]"); if (!out) return;
      var base = parseFloat(form.getAttribute("data-base") || "35");
      var total = base;
      form.querySelectorAll("input[type=radio]:checked, input[type=checkbox]:checked").forEach(function (i) {
        total += parseFloat(i.getAttribute("data-add") || "0");
      });
      var qtySel = form.querySelector("[data-qty]");
      var qty = qtySel ? parseInt(qtySel.value || "1", 10) : 1;
      total = base * qty + (total - base);
      out.textContent = "€" + Math.round(total);
    }
    form.addEventListener("change", updatePrice);
    show(0);
  });

  /* Gallery filters */
  var filterBar = document.querySelector("[data-filters]");
  if (filterBar) {
    var items = document.querySelectorAll("[data-tags]");
    filterBar.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () {
        filterBar.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
        var f = b.getAttribute("data-filter");
        items.forEach(function (it) {
          var show = f === "all" || (it.getAttribute("data-tags") || "").indexOf(f) > -1;
          it.style.display = show ? "" : "none";
        });
      });
    });
  }

  /* Footer year */
  var y = document.querySelector("[data-year]"); if (y) y.textContent = new Date().getFullYear();
})();

/* Persistent conversion bar — orange V mark, appears on scroll, dismissible */
(function () {
  var P0 = "M0.0 0.4 57.2 100.0 80.8 43.0 63.5 66.4 29.2 8.8 17.5 1.5Z";
  var P1 = "M97.9 0.0 91.2 0.2 82.7 2.1 76.2 5.4 71.6 10.0 68.7 16.5 68.1 25.5 69.3 33.4 72.0 41.1 76.8 39.2 82.7 35.5 86.6 31.7 90.0 27.1 94.2 16.7Z";
  var bar = document.createElement("div");
  bar.className = "convbar"; bar.setAttribute("role", "complementary"); bar.setAttribute("aria-label", "Quick start");
  bar.innerHTML =
    '<span class="cb-dot"><svg viewBox="0 0 97.9 100" aria-hidden="true"><path d="' + P0 + '" fill="#FF5B2E"/><path d="' + P1 + '" fill="#FF5B2E"/></svg></span>' +
    '<em>See it on your own product — free.</em>' +
    '<a class="cb-cta" href="test-sample.html">Free test sample</a>' +
    '<button class="cb-close" type="button" aria-label="Dismiss">&times;</button>';
  document.body.appendChild(bar);
  var dismissed = false;
  bar.querySelector(".cb-close").addEventListener("click", function () { dismissed = true; bar.classList.remove("show"); });
  function onScroll() { if (!dismissed) bar.classList.toggle("show", window.scrollY > 640); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
})();

/* Pointer-tracking warm glow on hover cards (subtle, desktop only) */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(hover: hover)").matches) return;
  document.querySelectorAll(".card-hover").forEach(function (c) {
    c.addEventListener("pointermove", function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%");
      c.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100) + "%");
    });
  });
})();

/* Collage mouse parallax (desktop, motion-safe) */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(hover: hover)").matches) return;
  var hero = document.querySelector(".hero-collage");
  if (!hero) return;
  var els = hero.querySelectorAll("[data-depth]");
  var raf = null, tx = 0, ty = 0;
  hero.addEventListener("pointermove", function (e) {
    var r = hero.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width - 0.5;
    ty = (e.clientY - r.top) / r.height - 0.5;
    if (!raf) raf = requestAnimationFrame(apply);
  });
  hero.addEventListener("pointerleave", function () { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(apply); });
  function apply() {
    raf = null;
    els.forEach(function (el) {
      var d = parseFloat(el.getAttribute("data-depth") || "0");
      el.style.transform = "translate(" + (-tx * d) + "px," + (-ty * d) + "px)";
    });
  }
})();
