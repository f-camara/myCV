(function () {
  "use strict";

  const onReady = (fn) =>
    document.readyState !== "loading"
      ? fn()
      : document.addEventListener("DOMContentLoaded", fn);

  onReady(init);

  function init() {
    setCurrentYear();
    handleNavScroll();
    smoothScrollLinks();
    revealOnScroll();
    backToTop();
    activeNavOnScroll();
    contactFormValidation();
    closeMenuOnNavClick();
  }

  /* ----------  Footer year  ---------- */
  function setCurrentYear() {
    const el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ----------  Navbar background on scroll  ---------- */
  function handleNavScroll() {
    const nav = document.getElementById("mainNav");
    if (!nav) return;
    const toggle = () => nav.classList.toggle("scrolled", window.scrollY > 24);
    toggle();
    window.addEventListener("scroll", toggle, { passive: true });
  }

  /* ----------  Smooth scroll for in-page anchors  ---------- */
  function smoothScrollLinks() {
    const nav = document.getElementById("mainNav");
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const id = link.getAttribute("href");
        if (id === "#" || id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const navH = nav ? nav.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - navH + 1;
        window.scrollTo({ top, behavior: "smooth" });
        history.replaceState(null, "", id);
      });
    });
  }

  /* ----------  Reveal elements + animate skill bars  ---------- */
  function revealOnScroll() {
    const items = document.querySelectorAll("[data-animate]");
    const bars = document.querySelectorAll(".skill-bar");

    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("in"));
      bars.forEach((el) => el.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = parseInt(el.dataset.delay || "0", 10);
          setTimeout(() => el.classList.add("in"), delay);
          obs.unobserve(el);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach((el) => io.observe(el));

    const barIO = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );
    bars.forEach((el) => barIO.observe(el));
  }

  /* ----------  Back to top button  ---------- */
  function backToTop() {
    const btn = document.getElementById("backToTop");
    if (!btn) return;
    const toggle = () => btn.classList.toggle("show", window.scrollY > 500);
    toggle();
    window.addEventListener("scroll", toggle, { passive: true });
    btn.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );
  }

  /* ----------  Active nav link highlighting on scroll  ---------- */
  function activeNavOnScroll() {
    const links = Array.from(
      document.querySelectorAll('#mainNav .nav-link[href^="#"]')
    );
    if (!links.length || !("IntersectionObserver" in window)) return;

    const map = new Map();
    links.forEach((link) => {
      const section = document.querySelector(link.getAttribute("href"));
      if (section) map.set(section, link);
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = map.get(entry.target);
          if (!link) return;
          if (entry.isIntersecting) {
            links.forEach((l) => l.classList.remove("active"));
            link.classList.add("active");
          }
        });
      },
      { threshold: 0.5, rootMargin: "-20% 0px -35% 0px" }
    );
    map.forEach((_, section) => io.observe(section));
  }

  /* ----------  Close mobile menu after click  ---------- */
  function closeMenuOnNavClick() {
    const collapse = document.getElementById("navItems");
    if (!collapse) return;
    collapse.querySelectorAll(".nav-link, .btn").forEach((link) => {
      link.addEventListener("click", () => {
        if (!collapse.classList.contains("show")) return;
        const instance =
          window.bootstrap && window.bootstrap.Collapse
            ? window.bootstrap.Collapse.getOrCreateInstance(collapse)
            : null;
        if (instance) instance.hide();
      });
    });
  }

  /* ----------  Contact form validation
    ---------- */
  function contactFormValidation() {
    const form = document.getElementById("contactForm");
    if (!form) return;
    
    const status = document.getElementById("formStatus");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        if (status) {
          status.textContent = "Please fix the highlighted fields.";
          status.className = "form-status err";
        }
        const firstInvalid = form.querySelector(":invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Valid — simulate async submit
      const btn = form.querySelector('button[type="submit"]');
      const original = btn ? btn.innerHTML : "";
      if (btn) {
        btn.disabled = true;
        btn.innerHTML =
          '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';
      }
      if (status) {
        status.textContent = "";
        status.className = "form-status";
      }

      setTimeout(() => {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = original;
        }
        form.reset();
        form.classList.remove("was-validated");
        if (status) {
          status.textContent = "Thanks! Your message has been sent.";
          status.className = "form-status ok";
        }
      }, 1400);
    });

    // Live-clear validation state as the user corrects fields
    form.querySelectorAll(".form-control").forEach((field) => {
      field.addEventListener("input", () => {
        if (form.classList.contains("was-validated") && field.checkValidity()) {
          field.classList.remove("is-invalid");
        }
      });
    });
  }
})();
