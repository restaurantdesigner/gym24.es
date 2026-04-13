document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".btn");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      console.log("CTA clicked:", button.textContent.trim());
    });
  });

  const autoplayVideos = Array.from(document.querySelectorAll("video[autoplay]"));
  const keepVideoPlaying = (video) => {
    if (!video) {
      return;
    }

    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    const tryPlay = () => {
      if (document.hidden) {
        return;
      }
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          // Ignore autoplay errors silently; next user interaction/focus will retry.
        });
      }
    };

    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("canplay", tryPlay);
    video.addEventListener("pause", () => {
      if (!document.hidden) {
        tryPlay();
      }
    });
    video.addEventListener("ended", tryPlay);

    tryPlay();
  };

  autoplayVideos.forEach(keepVideoPlaying);

  const replayVisibleVideos = () => {
    autoplayVideos.forEach((video) => {
      if (video.paused) {
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
      }
    });
  };

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      replayVisibleVideos();
    }
  });
  window.addEventListener("focus", replayVisibleVideos);
  window.addEventListener("pageshow", replayVisibleVideos);

  const marquee = document.querySelector(".reviews-marquee");
  const track = marquee ? marquee.querySelector(".reviews-track") : null;

  if (marquee && track) {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const originalCards = Array.from(track.children);

    // Duplicate cards once to create a seamless loop segment.
    originalCards.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });

    let loopWidth = track.scrollWidth / 2;
    let position = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartPosition = 0;
    let lastTs = 0;
    const speedPxPerMs = 0.045;

    const normalizePosition = () => {
      if (!loopWidth) {
        return;
      }
      while (position <= -loopWidth) {
        position += loopWidth;
      }
      while (position > 0) {
        position -= loopWidth;
      }
    };

    const render = () => {
      track.style.transform = `translate3d(${position}px, 0, 0)`;
    };

    const updateLoopWidth = () => {
      loopWidth = track.scrollWidth / 2;
      normalizePosition();
      render();
    };

    const animate = (ts) => {
      if (!lastTs) {
        lastTs = ts;
      }
      const dt = ts - lastTs;
      lastTs = ts;

      if (!isDragging && !prefersReducedMotion) {
        position -= speedPxPerMs * dt;
        normalizePosition();
        render();
      }

      requestAnimationFrame(animate);
    };

    const onPointerDown = (event) => {
      isDragging = true;
      marquee.classList.add("is-dragging");
      dragStartX = event.clientX;
      dragStartPosition = position;
      if (marquee.setPointerCapture && event.pointerId !== undefined) {
        marquee.setPointerCapture(event.pointerId);
      }
    };

    const onPointerMove = (event) => {
      if (!isDragging) {
        return;
      }
      const deltaX = event.clientX - dragStartX;
      position = dragStartPosition + deltaX;
      normalizePosition();
      render();
    };

    const onPointerUp = (event) => {
      if (!isDragging) {
        return;
      }
      isDragging = false;
      marquee.classList.remove("is-dragging");
      if (marquee.releasePointerCapture && event.pointerId !== undefined) {
        marquee.releasePointerCapture(event.pointerId);
      }
    };

    marquee.addEventListener("pointerdown", onPointerDown);
    marquee.addEventListener("pointermove", onPointerMove);
    marquee.addEventListener("pointerup", onPointerUp);
    marquee.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("resize", updateLoopWidth);

    updateLoopWidth();
    requestAnimationFrame(animate);
  }

  const stepsSection = document.querySelector(".section-steps");
  if (stepsSection) {
    const stepsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            stepsSection.classList.add("is-visible");
            stepsObserver.unobserve(stepsSection);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    stepsObserver.observe(stepsSection);
  }

  const communitySection = document.querySelector(".section-community");
  if (communitySection) {
    const communityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            communitySection.classList.add("is-visible");
            communityObserver.unobserve(communitySection);
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    communityObserver.observe(communitySection);
  }

  const leadForm = document.getElementById("leadForm");
  const formNext = document.getElementById("formNext");
  const formSuccess = document.getElementById("formSuccess");

  if (formNext) {
    const returnUrl = `${window.location.origin}${window.location.pathname}?sent=1#contacto`;
    formNext.value = returnUrl;
  }

  const params = new URLSearchParams(window.location.search);
  if (formSuccess && params.get("sent") === "1") {
    formSuccess.hidden = false;
  }

  if (leadForm) {
    leadForm.addEventListener("submit", () => {
      const submitButton = leadForm.querySelector(".form-submit");
      if (submitButton) {
        submitButton.setAttribute("disabled", "true");
        submitButton.textContent = "Enviando...";
      }
    });
  }
});

// ===================== HEADER: BURGER + SCROLL =====================
(function () {
  const header     = document.getElementById("siteHeader");
  const burgerBtn  = document.getElementById("burgerBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  // Scroll → darken header
  if (header) {
    window.addEventListener("scroll", function () {
      header.classList.toggle("header--scrolled", window.scrollY > 40);
    }, { passive: true });
  }

  // Burger toggle
  if (burgerBtn && mobileMenu) {
    burgerBtn.addEventListener("click", function () {
      var open = burgerBtn.getAttribute("aria-expanded") === "true";
      burgerBtn.setAttribute("aria-expanded", String(!open));
      burgerBtn.classList.toggle("is-open", !open);
      mobileMenu.classList.toggle("is-open", !open);
      mobileMenu.setAttribute("aria-hidden", String(open));
    });

    // Close menu on link click
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        burgerBtn.setAttribute("aria-expanded", "false");
        burgerBtn.classList.remove("is-open");
        mobileMenu.classList.remove("is-open");
        mobileMenu.setAttribute("aria-hidden", "true");
      });
    });
  }

  // Active nav link on scroll
  var sections = document.querySelectorAll("section[id], main[id]");
  var navLinks = document.querySelectorAll(".site-nav__link");
  if (navLinks.length && sections.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove("active"); });
          var active = document.querySelector('.site-nav__link[href="#' + entry.target.id + '"]');
          if (active) active.classList.add("active");
        }
      });
    }, { threshold: 0.35 });
    sections.forEach(function (s) { observer.observe(s); });
  }
})();


(function () {
  const STORAGE_KEY = "gym24_cookie_consent";

  const banner        = document.getElementById("cookieBanner");
  const modal         = document.getElementById("cookieModal");
  const overlay       = document.getElementById("cookieModalOverlay");
  const closeBtn      = document.getElementById("cookieModalClose");
  const acceptAllBtn  = document.getElementById("cookieAcceptAll");
  const rejectAllBtn  = document.getElementById("cookieRejectAll");
  const configureBtn  = document.getElementById("cookieConfigure");
  const savePrefsBtn  = document.getElementById("cookieSavePrefs");
  const acceptAllModal = document.getElementById("cookieAcceptAllModal");
  const analyticsCheck = document.getElementById("cookieAnalytics");
  const marketingCheck = document.getElementById("cookieMarketing");

  function getConsent() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); }
    catch (e) { return null; }
  }

  function saveConsent(prefs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prefs, ts: Date.now() }));
  }

  function hideBanner() { if (banner) banner.hidden = true; }

  function hideModal() {
    if (modal) modal.hidden = true;
    document.body.style.overflow = "";
  }

  function showModal() {
    const c = getConsent();
    if (analyticsCheck) analyticsCheck.checked = c ? !!c.analytics : false;
    if (marketingCheck) marketingCheck.checked = c ? !!c.marketing : false;
    if (modal) modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function applyConsent(prefs) {
    if (prefs.analytics) document.dispatchEvent(new CustomEvent("consent:analytics", { detail: true }));
    if (prefs.marketing)  document.dispatchEvent(new CustomEvent("consent:marketing",  { detail: true }));
  }

  function init() {
    const existing = getConsent();
    if (!existing) {
      if (banner) banner.hidden = false;
    } else {
      applyConsent(existing);
    }
  }

  if (acceptAllBtn) {
    acceptAllBtn.addEventListener("click", function () {
      var prefs = { essential: true, analytics: true, marketing: true };
      saveConsent(prefs); applyConsent(prefs); hideBanner();
    });
  }

  if (rejectAllBtn) {
    rejectAllBtn.addEventListener("click", function () {
      saveConsent({ essential: true, analytics: false, marketing: false });
      hideBanner();
    });
  }

  if (configureBtn) configureBtn.addEventListener("click", showModal);

  if (savePrefsBtn) {
    savePrefsBtn.addEventListener("click", function () {
      var prefs = {
        essential: true,
        analytics: analyticsCheck ? analyticsCheck.checked : false,
        marketing:  marketingCheck  ? marketingCheck.checked  : false,
      };
      saveConsent(prefs); applyConsent(prefs); hideBanner(); hideModal();
    });
  }

  if (acceptAllModal) {
    acceptAllModal.addEventListener("click", function () {
      if (analyticsCheck) analyticsCheck.checked = true;
      if (marketingCheck)  marketingCheck.checked  = true;
      var prefs = { essential: true, analytics: true, marketing: true };
      saveConsent(prefs); applyConsent(prefs); hideBanner(); hideModal();
    });
  }

  if (closeBtn)  closeBtn.addEventListener("click", hideModal);
  if (overlay)   overlay.addEventListener("click", hideModal);

  // Reopen from footer "Política de cookies" link
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-cookie-settings]")) {
      e.preventDefault();
      showModal();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal && !modal.hidden) hideModal();
  });

  init();
})();

document.addEventListener('DOMContentLoaded', function () {
  const leadForm = document.getElementById('leadForm');

  if (leadForm) {
    leadForm.addEventListener('submit', function () {
      gtag('event', 'generate_lead', {
        event_category: 'form',
        event_label: 'Solicitar información'
      });
    });
  }
});