(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;

  /* --------------------------------------------------------------------
   * Scroll progress bar + nav scrolled state
   * ------------------------------------------------------------------ */
  const progressBar = document.getElementById("scroll-progress");
  const nav = document.querySelector(".site-nav");

  function onScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + "%";
    if (nav) nav.classList.toggle("is-scrolled", scrollTop > 12);
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* --------------------------------------------------------------------
   * Scrollspy — highlight active nav link
   * ------------------------------------------------------------------ */
  const navLinks = document.querySelectorAll(".nav-links a[href^='#'], .mobile-menu a[href^='#']");
  const sections = Array.from(navLinks)
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = "#" + entry.target.id;
          navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === id));
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* --------------------------------------------------------------------
   * Mobile menu
   * ------------------------------------------------------------------ */
  const navToggle = document.querySelector(".nav-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");
  if (navToggle && mobileMenu) {
    const toggleIcon = navToggle.querySelector("use");
    const setState = (isOpen) => {
      mobileMenu.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
      if (toggleIcon) toggleIcon.setAttribute("href", isOpen ? "#i-close" : "#i-menu");
    };
    const closeMenu = () => setState(false);
    navToggle.addEventListener("click", () => setState(!mobileMenu.classList.contains("is-open")));
    mobileMenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
  }

  /* --------------------------------------------------------------------
   * Scroll reveal (fade / slide / scale / stagger)
   * ------------------------------------------------------------------ */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = el.getAttribute("data-reveal-delay");
          if (delay) el.style.transitionDelay = delay + "ms";
          el.classList.add("is-visible");
          obs.unobserve(el);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* --------------------------------------------------------------------
   * Hero terminal typing effect
   * ------------------------------------------------------------------ */
  const typedEl = document.getElementById("terminal-typed");
  if (typedEl) {
    const lines = JSON.parse(typedEl.getAttribute("data-lines") || "[]");
    if (prefersReducedMotion || !lines.length) {
      typedEl.textContent = lines.join(" ");
    } else {
      let lineIndex = 0;
      let charIndex = 0;
      const typeSpeed = 32;
      const linePause = 550;

      function typeStep() {
        const current = lines[lineIndex];
        if (charIndex <= current.length) {
          typedEl.textContent = current.slice(0, charIndex);
          charIndex++;
          setTimeout(typeStep, typeSpeed);
        } else if (lineIndex < lines.length - 1) {
          setTimeout(() => {
            lineIndex++;
            charIndex = 0;
            typedEl.textContent = "";
            typeStep();
          }, linePause);
        }
      }
      typeStep();
    }
  }

  /* --------------------------------------------------------------------
   * Mouse-follow glow
   * ------------------------------------------------------------------ */
  const glow = document.querySelector(".mouse-glow");
  if (glow && !prefersReducedMotion && matchMedia("(pointer:fine)").matches) {
    window.addEventListener(
      "pointermove",
      (e) => {
        glow.style.left = e.clientX + "px";
        glow.style.top = e.clientY + "px";
      },
      { passive: true }
    );
  } else if (glow) {
    glow.style.display = "none";
  }

  /* --------------------------------------------------------------------
   * Magnetic buttons
   * ------------------------------------------------------------------ */
  if (!prefersReducedMotion && matchMedia("(pointer:fine)").matches) {
    document.querySelectorAll(".btn, .social-btn, .back-to-top").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });
  }

  /* --------------------------------------------------------------------
   * Background canvas — subtle grid + floating particles
   * ------------------------------------------------------------------ */
  const canvas = document.getElementById("bg-canvas");
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext("2d");
    let w, h, particles;
    const PARTICLE_COUNT = 46;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }

    function makeParticles() {
      particles = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.4,
        vy: Math.random() * 0.25 + 0.05,
        vx: (Math.random() - 0.5) * 0.15,
        a: Math.random() * 0.5 + 0.15,
      }));
    }

    function drawGrid() {
      const gap = 64;
      ctx.strokeStyle = "rgba(0, 229, 255, 0.045)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += gap) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gap) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    }

    function tick() {
      ctx.clearRect(0, 0, w, h);
      drawGrid();
      particles.forEach((p) => {
        p.y -= p.vy;
        p.x += p.vx;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 136, ${p.a})`;
        ctx.fill();
      });
      requestAnimationFrame(tick);
    }

    resize();
    makeParticles();
    tick();
    window.addEventListener("resize", () => { resize(); makeParticles(); }, { passive: true });
  } else if (canvas) {
    canvas.remove();
  }

  /* --------------------------------------------------------------------
   * Copy email button
   * ------------------------------------------------------------------ */
  const copyBtn = document.querySelector(".copy-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const email = copyBtn.getAttribute("data-email");
      try {
        await navigator.clipboard.writeText(email);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = email;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      copyBtn.classList.add("is-copied");
      const original = copyBtn.getAttribute("aria-label");
      copyBtn.setAttribute("aria-label", "Copied!");
      setTimeout(() => {
        copyBtn.classList.remove("is-copied");
        copyBtn.setAttribute("aria-label", original);
      }, 2000);
    });
  }

  /* --------------------------------------------------------------------
   * Contact form — AJAX submit to Formspree
   * ------------------------------------------------------------------ */
  const form = document.getElementById("contactForm");
  if (form) {
    const status = document.getElementById("form-status");
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      submitBtn.disabled = true;
      const originalLabel = submitBtn.textContent;
      submitBtn.textContent = "Sending…";
      status.className = "form-status";
      status.textContent = "";

      try {
        const res = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          status.className = "form-status success";
          status.textContent = "Message sent — I'll get back to you soon.";
          form.reset();
        } else {
          throw new Error("Request failed");
        }
      } catch {
        status.className = "form-status error";
        status.textContent = "Something went wrong. Please email me directly instead.";
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    });
  }

  /* --------------------------------------------------------------------
   * Smooth-scroll offset fix for browsers ignoring scroll-margin-top
   * (kept minimal; CSS scroll-margin-top handles the general case)
   * ------------------------------------------------------------------ */
})();
