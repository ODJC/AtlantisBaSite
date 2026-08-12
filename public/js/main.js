const heroSlides = [
  {
    title: "Impulsamos empresas",
    text: "Nos dedicamos a impulsar proyectos de emprendedurismo enfocados en tu sector",
  },
  {
    title: "Somos Atlantis BA",
    text: "Incubamos empresas de alto rendimiento desde capital semilla hasta ecosistemas financieros",
  },
];

function initHeader() {
  const header = document.getElementById("site-header");
  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("nav");

  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (toggle && nav) {
    toggle.addEventListener("click", () => nav.classList.toggle("open"));
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => nav.classList.remove("open"));
    });
  }
}

function initHero() {
  const slides = [...document.querySelectorAll(".hero-slide")];
  const dotsWrap = document.getElementById("hero-dots");
  const titleEl = document.querySelector("[data-hero-title]");
  const textEl = document.querySelector("[data-hero-text]");
  if (!slides.length || !dotsWrap) return;

  let index = 0;
  slides.forEach((_, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", `Ir a slide ${i + 1}`);
    if (i === 0) btn.classList.add("is-active");
    btn.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(btn);
  });

  const dots = [...dotsWrap.querySelectorAll("button")];

  function goTo(next) {
    slides[index].classList.remove("is-active");
    dots[index].classList.remove("is-active");
    index = next;
    slides[index].classList.add("is-active");
    dots[index].classList.add("is-active");
    const copy = heroSlides[index] || heroSlides[0];
    if (titleEl) titleEl.textContent = copy.title;
    if (textEl) textEl.textContent = copy.text;
  }

  setInterval(() => goTo((index + 1) % slides.length), 6500);
}

function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  items.forEach((el) => io.observe(el));
}

function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const note = document.getElementById("form-note");
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    if (!name || !email) {
      if (note) note.textContent = "Por favor completa nombre y correo.";
      return;
    }
    if (note) {
      note.textContent =
        "Gracias. Hemos recibido tu solicitud. Nuestro equipo te contactará pronto.";
    }
    form.reset();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initHero();
  initReveal();
  initContactForm();
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
});
