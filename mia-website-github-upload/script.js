const counters = document.querySelectorAll(".count");
const hero = document.querySelector(".hero");
const heroPhoto = document.querySelector(".hero-photo");
const photoChoices = document.querySelectorAll(".photo-choice");
const posterGrid = document.querySelector(".poster-grid");
let photoTimer;

const applyPhotoChoice = (choice) => {
  if (!hero || !choice) {
    return;
  }

  window.clearTimeout(photoTimer);
  hero.style.setProperty("--hero-photo", `url("${choice.dataset.photo}")`);
  hero.style.setProperty("--hero-photo-position", choice.dataset.photoPosition || "50% 48%");
  hero.classList.toggle("is-wide-photo", choice.dataset.photoMode === "wide");

  if (heroPhoto) {
    heroPhoto.style.opacity = "0";
    photoTimer = window.setTimeout(() => {
      heroPhoto.src = choice.dataset.photo;
      heroPhoto.style.opacity = "0.98";
    }, 120);
  }
};

photoChoices.forEach((choice) => {
  choice.addEventListener("click", () => {
    photoChoices.forEach((item) => item.classList.remove("is-active"));
    choice.classList.add("is-active");
    applyPhotoChoice(choice);
  });
});

applyPhotoChoice(document.querySelector(".photo-choice.is-active"));

const posters = Array.from(document.querySelectorAll(".poster"));
const workButtons = document.querySelectorAll("[data-work-page-button]");
const workStatus = document.querySelector(".work-page-status");
const workSection = document.querySelector(".work-section");
let activeWorkPage = 1;
const totalWorkPages = Math.max(...posters.map((poster) => Number(poster.dataset.workPage) || 1), 1);

const updateWorkPage = (page) => {
  activeWorkPage = Math.min(Math.max(page, 1), totalWorkPages);
  posterGrid?.classList.remove("is-turning");
  void posterGrid?.offsetWidth;
  posterGrid?.classList.add("is-turning");

  posters.forEach((poster) => {
    poster.hidden = Number(poster.dataset.workPage) !== activeWorkPage;
  });

  if (workStatus) {
    workStatus.textContent = `${String(activeWorkPage).padStart(2, "0")} / ${String(totalWorkPages).padStart(2, "0")}`;
  }

  workButtons.forEach((button) => {
    const direction = button.dataset.workPageButton;
    button.disabled = (direction === "prev" && activeWorkPage === 1) || (direction === "next" && activeWorkPage === totalWorkPages);
  });
};

workButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const direction = button.dataset.workPageButton;
    updateWorkPage(activeWorkPage + (direction === "next" ? 1 : -1));
    workSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

updateWorkPage(activeWorkPage);

const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const setActiveNav = (id) => {
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
  });
};

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActiveNav(entry.target.id);
      }
    });
  },
  {
    rootMargin: "-38% 0px -55% 0px",
    threshold: 0,
  },
);

sections.forEach((section) => navObserver.observe(section));

posters.forEach((poster) => {
  poster.addEventListener("pointermove", (event) => {
    const rect = poster.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    poster.style.setProperty("--tilt-x", `${(x * 5).toFixed(2)}deg`);
    poster.style.setProperty("--tilt-y", `${(y * -5).toFixed(2)}deg`);
  });

  poster.addEventListener("pointerleave", () => {
    poster.style.setProperty("--tilt-x", "0deg");
    poster.style.setProperty("--tilt-y", "0deg");
  });
});

const revealItems = Array.from(
  document.querySelectorAll(
    ".section-row, .metric, .social-wall a, .poster, .intro-card, .hero-press a, .contact-links > *",
  ),
);

revealItems.forEach((item, index) => {
  item.classList.add("reveal");
  item.style.setProperty("--reveal-delay", `${Math.min(index % 8, 5) * 55}ms`);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  {
    rootMargin: "0px 0px -12% 0px",
    threshold: 0.12,
  },
);

revealItems.forEach((item) => revealObserver.observe(item));

const formatCount = (value) => {
  if (value >= 1000000) {
    return `${Math.round(value / 1000000)}M`;
  }

  if (value >= 1000) {
    return `${Math.round(value / 1000)}K`;
  }

  return new Intl.NumberFormat("en-US").format(value);
};

const animateCount = (element) => {
  const target = Number(element.dataset.target);
  const duration = 1300;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = formatCount(Math.round(target * eased));

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      element.textContent = formatCount(target);
    }
  };

  requestAnimationFrame(tick);
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      animateCount(entry.target);
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.55 }
);

counters.forEach((counter) => observer.observe(counter));
