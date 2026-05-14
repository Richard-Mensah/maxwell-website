const fallbackProfile = {
  name: "Maxwell Kwadwo Baidoo",
  title: "Development Leader, Agribusiness Professional and Natural Resources Advocate",
  location: "Western North Region, Ghana",
  currentRole: "President, Western North Development Association (WENDA)",
  intro: "Development leader advancing opportunity in Ghana's Western North Region.",
  homeMessage: "",
  phone: "+233 24 743 4025",
  phoneHref: "tel:+233247434025",
  heroImage: "/assets/images/hero-speaking.jpg",
  portraitImage: "/assets/images/ceremony-portrait.jpg",
  logoImage: "/assets/images/maxwell-logo.png",
  stats: [],
  focusAreas: [],
  homeHighlights: [],
  biography: [],
  credentials: [],
  leadershipPrinciples: [],
  impact: [],
  agendaPriorities: [],
  services: [],
  timeline: [],
  gallery: []
};

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value || "";
}

function setImage(selector, src, alt) {
  const image = document.querySelector(selector);
  if (!image) return;
  image.src = src;
  if (alt) image.alt = alt;
}

function renderStats(profile) {
  const target = document.querySelector("#stats-grid");
  if (!target) return;
  target.innerHTML = profile.stats
    .map((item) => `<article><strong>${escapeHtml(item.value)}</strong><span>${escapeHtml(item.label)}</span></article>`)
    .join("");
}

function renderBiography(profile) {
  const target = document.querySelector("#biography");
  if (!target) return;
  target.innerHTML = profile.biography.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
}

function renderFocus(profile) {
  const target = document.querySelector("#focus-list");
  if (!target) return;
  target.innerHTML = profile.focusAreas.map((area) => `<span>${escapeHtml(area)}</span>`).join("");
}

function renderImpact(profile) {
  const target = document.querySelector("#impact-grid");
  if (!target) return;
  target.innerHTML = profile.impact
    .map(
      (item) => `
        <article class="impact-card">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}">
          <div>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.body)}</p>
          </div>
        </article>
      `
    )
    .join("");
}

function renderServices(profile) {
  const target = document.querySelector("#service-grid");
  if (!target) return;
  target.innerHTML = profile.services
    .map(
      (item) => `
        <article class="service-item">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.description)}</p>
        </article>
      `
    )
    .join("");
}

function renderTimeline(profile) {
  const target = document.querySelector("#timeline");
  if (!target) return;
  target.innerHTML = profile.timeline
    .map(
      (item) => `
        <li>
          <time>${escapeHtml(item.year)}</time>
          <p>${escapeHtml(item.event)}</p>
        </li>
      `
    )
    .join("");
}

function renderFeaturedGallery(profile) {
  const target = document.querySelector("#featured-gallery");
  if (!target) return;
  target.innerHTML = profile.gallery
    .map(
      (item) => `
        <figure>
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.caption)}">
          <figcaption>${escapeHtml(item.caption)}</figcaption>
        </figure>
      `
    )
    .join("");
}

function renderHomeHighlights(profile) {
  const target = document.querySelector("#home-highlights");
  if (!target) return;
  target.innerHTML = profile.homeHighlights
    .map(
      (item) => `
        <article class="feature-card">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}">
          <div>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.body)}</p>
          </div>
        </article>
      `
    )
    .join("");
}

function renderCredentials(profile) {
  const target = document.querySelector("#credentials-grid");
  if (!target) return;
  target.innerHTML = profile.credentials
    .map(
      (item) => `
        <article class="quiet-card">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.body)}</p>
        </article>
      `
    )
    .join("");
}

function renderLeadershipPrinciples(profile) {
  const target = document.querySelector("#principles-grid");
  if (!target) return;
  target.innerHTML = profile.leadershipPrinciples
    .map(
      (item) => `
        <article class="principle-card">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.body)}</p>
        </article>
      `
    )
    .join("");
}

function renderAgendaPriorities(profile) {
  const target = document.querySelector("#agenda-priorities");
  if (!target) return;
  target.innerHTML = profile.agendaPriorities
    .map(
      (item) => `
        <article class="priority-card">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.body)}</p>
        </article>
      `
    )
    .join("");
}

async function renderFullGallery() {
  const target = document.querySelector("#gallery-grid");
  if (!target) return;

  try {
    const response = await fetch("/api/gallery");
    if (!response.ok) throw new Error("Gallery request failed");
    const images = await response.json();
    target.innerHTML = images
      .map(
        (item) => `
          <figure>
            <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.caption)}" loading="lazy">
            <figcaption>${escapeHtml(item.caption)}</figcaption>
          </figure>
        `
      )
      .join("");
    setText("#gallery-count", `${images.length} images`);
  } catch (error) {
    target.innerHTML = "<p>Gallery images could not be loaded.</p>";
  }
}

function renderProfile(profile) {
  document.title = `${profile.name} | Development Leader`;
  setText("#hero-title", profile.name);
  setText("#hero-role", profile.currentRole);
  setText("#hero-copy", profile.intro);
  setText("#home-message", profile.homeMessage);
  setText("#page-title-name", profile.name);
  setText("#location", profile.location);
  setText("#title-line", profile.title);
  setText("#contact-phone", profile.phone);
  setText("#footer-phone", profile.phone);
  const phoneLinks = document.querySelectorAll("[data-phone-link]");
  phoneLinks.forEach((link) => {
    link.href = profile.phoneHref;
    link.textContent = profile.phone;
  });
  setImage("#hero-image", profile.heroImage, `${profile.name} speaking at an event`);
  setImage("#portrait-image", profile.portraitImage, `${profile.name} at a civic ceremony`);

  renderStats(profile);
  renderHomeHighlights(profile);
  renderBiography(profile);
  renderFocus(profile);
  renderCredentials(profile);
  renderLeadershipPrinciples(profile);
  renderImpact(profile);
  renderAgendaPriorities(profile);
  renderServices(profile);
  renderTimeline(profile);
  renderFeaturedGallery(profile);
}

async function loadProfile() {
  try {
    const response = await fetch("/api/profile");
    if (!response.ok) throw new Error("Profile request failed");
    const profile = await response.json();
    renderProfile(profile);
  } catch (error) {
    renderProfile(fallbackProfile);
  }
}

function setupNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#site-nav");
  if (!toggle || !nav) return;

  const currentPath = window.location.pathname === "/" ? "/" : window.location.pathname.replace(/\/$/, "");
  nav.querySelectorAll("a").forEach((link) => {
    const linkPath = new URL(link.href).pathname.replace(/\/$/, "") || "/";
    if (linkPath === currentPath) link.setAttribute("aria-current", "page");
  });

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    nav.classList.toggle("open", !isOpen);
  });

  nav.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("open");
    }
  });
}

function setupContactForm() {
  const form = document.querySelector("#contact-form");
  const status = document.querySelector("#form-status");
  if (!form || !status) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "Sending...";

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      status.textContent = result.message;
      if (response.ok) form.reset();
    } catch (error) {
      status.textContent = "The message could not be sent. Please try again.";
    }
  });
}

loadProfile();
renderFullGallery();
setupNavigation();
setupContactForm();
