/* ==========================================================================
   [ΟΝΟΜΑ_ΕΤΑΙΡΕΙΑΣ] — Vanilla JS
   Navbar scroll, mobile menu, fade-in on scroll, lightbox gallery,
   contact form (Web3Forms), language toggle EL/EN.
   Δεν χρειάζεται build — απλό <script> include.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     0. Lucide icons (φορτώνονται από CDN). createIcons() ζωγραφίζει τα <i data-lucide>.
     --------------------------------------------------------------------- */
  function renderIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  /* ---------------------------------------------------------------------
     1. Έτος στο footer
     --------------------------------------------------------------------- */
  function setYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------------------------------------------------------------------
     2. Sticky navbar — γίνεται solid κατά το scroll
     --------------------------------------------------------------------- */
  function initNavbar() {
    var nav = document.getElementById("navbar");
    if (!nav) return;
    // Σε σελίδες χωρίς hero, το navbar είναι ήδη solid (μέσω body.has-solid-nav)
    if (document.body.classList.contains("has-solid-nav")) return;

    function onScroll() {
      if (window.scrollY > 40) nav.classList.add("nav-solid");
      else nav.classList.remove("nav-solid");
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------------------------------------------------------------------
     3. Mobile menu toggle
     --------------------------------------------------------------------- */
  function initMobileMenu() {
    var btn = document.getElementById("menu-toggle");
    var menu = document.getElementById("mobile-menu");
    if (!btn || !menu) return;

    btn.addEventListener("click", function () {
      var isOpen = menu.classList.toggle("open");
      btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Κλείσιμο όταν πατηθεί ένα link
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        menu.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------------------------------------------------------------
     4. Fade-in on scroll (IntersectionObserver)
     --------------------------------------------------------------------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    items.forEach(function (el) { obs.observe(el); });
  }

  /* ---------------------------------------------------------------------
     5. Lightbox gallery
        Κάθε .gallery-item μέσα στο #gallery γίνεται clickable.
     --------------------------------------------------------------------- */
  function initLightbox() {
    var gallery = document.getElementById("gallery");
    var lb = document.getElementById("lightbox");
    if (!gallery || !lb) return;

    var lbImg = document.getElementById("lb-img");
    var lbCounter = document.getElementById("lb-counter");
    var btnClose = document.getElementById("lb-close");
    var btnPrev = document.getElementById("lb-prev");
    var btnNext = document.getElementById("lb-next");

    var items = Array.prototype.slice.call(gallery.querySelectorAll(".gallery-item img"));
    var current = 0;

    function show(index) {
      current = (index + items.length) % items.length;
      var src = items[current].getAttribute("data-full") || items[current].src;
      lbImg.src = src;
      lbImg.alt = items[current].alt || "";
      if (lbCounter) lbCounter.textContent = (current + 1) + " / " + items.length;
    }

    function open(index) {
      show(index);
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
      lb.setAttribute("aria-hidden", "false");
      btnClose.focus();
    }

    function close() {
      lb.classList.remove("open");
      document.body.style.overflow = "";
      lb.setAttribute("aria-hidden", "true");
    }

    items.forEach(function (img, i) {
      var parent = img.closest(".gallery-item");
      parent.setAttribute("role", "button");
      parent.setAttribute("tabindex", "0");
      parent.setAttribute("aria-label", "Άνοιγμα φωτογραφίας " + (i + 1));
      parent.addEventListener("click", function () { open(i); });
      parent.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); }
      });
    });

    btnClose.addEventListener("click", close);
    btnPrev.addEventListener("click", function () { show(current - 1); });
    btnNext.addEventListener("click", function () { show(current + 1); });

    lb.addEventListener("click", function (e) {
      if (e.target === lb) close();
    });

    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(current - 1);
      else if (e.key === "ArrowRight") show(current + 1);
    });
  }

  /* ---------------------------------------------------------------------
     6. Φόρμα επικοινωνίας — αποστολή στο send.php (PHP mail)
        Validation στον client, αποστολή με fetch, απάντηση σε JSON.
     --------------------------------------------------------------------- */
  function initContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;

    var msg = document.getElementById("form-msg");
    var submitBtn = form.querySelector('button[type="submit"]');

    function setFieldError(name, on) {
      var field = form.elements[name];
      var errEl = form.querySelector('[data-error-for="' + name + '"]');
      if (field) field.classList.toggle("invalid", on);
      if (errEl) errEl.classList.toggle("show", on);
    }

    function validEmail(v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    }

    function showMessage(type, text) {
      if (!msg) return;
      msg.className = "form-msg show " + type;
      msg.textContent = text;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // --- Validation ---
      var ok = true;
      var name = form.elements["name"].value.trim();
      var email = form.elements["email"].value.trim();
      var message = form.elements["message"].value.trim();

      if (!name) { setFieldError("name", true); ok = false; } else setFieldError("name", false);
      if (!validEmail(email)) { setFieldError("email", true); ok = false; } else setFieldError("email", false);
      if (!message) { setFieldError("message", true); ok = false; } else setFieldError("message", false);

      if (!ok) {
        showMessage("error", "Παρακαλώ συμπληρώστε σωστά τα υποχρεωτικά πεδία.");
        return;
      }

      // --- Αποστολή στο PHP (send.php) ---
      var original = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.textContent = "Αποστολή...";
      showMessage("success", "Αποστολή του μηνύματος...");

      var data = new FormData(form);

      fetch("send.php", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data
      })
        .then(function (res) { return res.json(); })
        .then(function (json) {
          if (json && json.success) {
            showMessage("success", json.message || "Ευχαριστούμε! Το μήνυμά σας στάλθηκε. Θα επικοινωνήσουμε σύντομα.");
            form.reset();
          } else {
            showMessage("error", (json && json.message) || "Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά.");
          }
        })
        .catch(function () {
          showMessage("error", "Σφάλμα δικτύου. Παρακαλώ δοκιμάστε ξανά αργότερα.");
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.innerHTML = original;
        });
    });
  }

  /* ---------------------------------------------------------------------
     7. Language toggle EL / EN
        Τα στοιχεία με data-en κρατούν το αγγλικό κείμενο· το ελληνικό
        είναι το αρχικό innerHTML. Η επιλογή αποθηκεύεται στο localStorage.
     --------------------------------------------------------------------- */
  function initLangToggle() {
    var STORAGE = "site-lang";
    var nodes = document.querySelectorAll("[data-en]");
    var phNodes = document.querySelectorAll("[data-en-ph]");

    // Αποθήκευση του αρχικού (ελληνικού) κειμένου
    nodes.forEach(function (el) {
      el.setAttribute("data-el", el.innerHTML);
    });
    // Αποθήκευση του αρχικού (ελληνικού) placeholder
    phNodes.forEach(function (el) {
      el.setAttribute("data-el-ph", el.getAttribute("placeholder") || "");
    });

    function apply(lang) {
      nodes.forEach(function (el) {
        el.innerHTML = el.getAttribute(lang === "en" ? "data-en" : "data-el");
      });
      phNodes.forEach(function (el) {
        el.setAttribute("placeholder", el.getAttribute(lang === "en" ? "data-en-ph" : "data-el-ph"));
      });
      document.documentElement.setAttribute("lang", lang === "en" ? "en" : "el");
      document.querySelectorAll("[data-lang-label]").forEach(function (b) {
        b.textContent = lang === "en" ? "EL" : "EN";
      });
      try { localStorage.setItem(STORAGE, lang); } catch (e) {}
      renderIcons(); // ξανα-render icons αν χάθηκαν
    }

    var saved = "el";
    try { saved = localStorage.getItem(STORAGE) || "el"; } catch (e) {}
    if (saved === "en") apply("en");

    document.querySelectorAll("[data-lang-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var currentlyEn = document.documentElement.getAttribute("lang") === "en";
        apply(currentlyEn ? "el" : "en");
      });
    });
  }

  /* ---------------------------------------------------------------------
     8. Service Worker registration
  --------------------------------------------------------------------- */
  function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("service-worker.js").then(function (registration) {
        console.log("Service Worker registered:", registration.scope);
      }).catch(function (error) {
        console.warn("Service Worker registration failed:", error);
      });
    }
  }

  /* ---------------------------------------------------------------------
     9. Cookie consent + φόρτωση χάρτη μόνο μετά από συγκατάθεση
        Ο χάρτης Google Maps φορτώνεται ΜΟΝΟ αν ο χρήστης συναινέσει
        (μέχρι τότε δεν στέλνεται κανένα αίτημα στο Google). Η επιλογή
        αποθηκεύεται στο localStorage ("cookie-consent").
     --------------------------------------------------------------------- */
  function getConsent() {
    try { return localStorage.getItem("cookie-consent"); } catch (e) { return null; }
  }
  function setConsent(v) {
    try { localStorage.setItem("cookie-consent", v); } catch (e) {}
  }

  function loadMaps() {
    document.querySelectorAll(".map-frame[data-map]").forEach(function (frame) {
      var iframe = frame.querySelector("iframe[data-src]");
      if (iframe && !iframe.getAttribute("src")) {
        iframe.setAttribute("src", iframe.getAttribute("data-src"));
      }
      frame.classList.add("consented");
    });
  }

  function initCookieConsent() {
    var banner = document.createElement("div");
    banner.id = "cookie-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-live", "polite");
    banner.setAttribute("aria-label", "Συγκατάθεση cookies");
    banner.innerHTML = [
      '<h2 data-en="We value your privacy">Σεβόμαστε το απόρρητό σας</h2>',
      '<p data-en="We use only essential storage so the site works (e.g. your language choice). With your consent we also load Google Maps to show our location, which may set third-party cookies. You can change your choice at any time.">',
      'Χρησιμοποιούμε μόνο απαραίτητη αποθήκευση για να λειτουργεί το site (π.χ. η επιλογή γλώσσας). Με τη συγκατάθεσή σας φορτώνουμε επίσης τον χάρτη Google Maps για να δείξουμε την τοποθεσία μας, ο οποίος ενδέχεται να ορίσει cookies τρίτων. Μπορείτε να αλλάξετε την επιλογή σας όποτε θέλετε.',
      '</p>',
      '<div class="cookie-actions">',
        '<button type="button" class="cookie-btn cookie-btn-accept" data-cookie-accept data-en="Accept all">Αποδοχή όλων</button>',
        '<button type="button" class="cookie-btn cookie-btn-reject" data-cookie-reject data-en="Essential only">Μόνο απαραίτητα</button>',
        '<a href="privacy.html" class="cookie-btn cookie-btn-ghost" data-en="Privacy Policy">Πολιτική Απορρήτου</a>',
      '</div>'
    ].join("");
    document.body.appendChild(banner);

    function show() { banner.classList.add("show"); }
    function hide() { banner.classList.remove("show"); }

    banner.querySelector("[data-cookie-accept]").addEventListener("click", function () {
      setConsent("accepted"); loadMaps(); hide();
    });
    banner.querySelector("[data-cookie-reject]").addEventListener("click", function () {
      setConsent("rejected"); hide();
    });

    // Σύνδεσμος "Ρυθμίσεις cookies" στο footer — ξανανοίγει το banner
    document.querySelectorAll("[data-cookie-settings]").forEach(function (el) {
      el.addEventListener("click", function (e) { e.preventDefault(); show(); });
    });

    // Κουμπί "Εμφάνιση χάρτη" πάνω στον ίδιο τον χάρτη
    document.querySelectorAll("[data-map-accept]").forEach(function (btn) {
      btn.addEventListener("click", function () { setConsent("accepted"); loadMaps(); hide(); });
    });

    var consent = getConsent();
    if (consent === "accepted") loadMaps();
    else if (consent !== "rejected") show();

    renderIcons();
  }

  /* ---------------------------------------------------------------------
     Init
     --------------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    renderIcons();
    setYear();
    initNavbar();
    initMobileMenu();
    initReveal();
    initLightbox();
    initContactForm();
    initCookieConsent();
    initLangToggle();
    registerServiceWorker();
  });
})();
