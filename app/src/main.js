import "@fontsource-variable/manrope";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@fontsource/ibm-plex-sans-arabic/700.css";
import "./styles.css";
import { getLanguage, initLanguage, setLanguage, t } from "./i18n.js";

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

initLanguage();
$("#current-year").textContent = new Date().getFullYear();

/* Toasts */
let toastTimer;
function showToast(message) {
  const toast = $("#toast");
  $("span", toast).textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 2800);
}

/* Header and scroll progress */
const header = $("#site-header");
const progressBar = $("#scroll-progress-bar");
let scrollTicking = false;
function updateScrollUI() {
  const y = window.scrollY;
  header.classList.toggle("is-scrolled", y > 36);
  const available = document.documentElement.scrollHeight - window.innerHeight;
  const progress = available > 0 ? Math.min(y / available, 1) : 0;
  progressBar.style.transform = `scaleX(${progress})`;
  scrollTicking = false;
}
window.addEventListener("scroll", () => {
  if (!scrollTicking) {
    requestAnimationFrame(updateScrollUI);
    scrollTicking = true;
  }
}, { passive: true });
updateScrollUI();

/* Mobile navigation */
const menuToggle = $("#menu-toggle");
const mobileMenu = $("#mobile-menu");
function setMenu(open) {
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  mobileMenu.setAttribute("aria-hidden", String(!open));
  mobileMenu.classList.toggle("is-open", open);
  header.classList.toggle("menu-active", open);
  document.body.classList.toggle("menu-open", open);
}
menuToggle.addEventListener("click", () => setMenu(menuToggle.getAttribute("aria-expanded") !== "true"));
$$("a", mobileMenu).forEach((link) => link.addEventListener("click", () => setMenu(false)));
window.addEventListener("resize", () => { if (window.innerWidth > 980) setMenu(false); });

/* Language switcher */
const languageButton = $("#language-button");
const languageMenu = $("#language-menu");
function setLanguageMenu(open) {
  languageMenu.hidden = !open;
  languageButton.setAttribute("aria-expanded", String(open));
}
languageButton.addEventListener("click", (event) => {
  event.stopPropagation();
  setLanguageMenu(languageMenu.hidden);
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".language-switcher")) setLanguageMenu(false);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setLanguageMenu(false);
    if (menuToggle.getAttribute("aria-expanded") === "true") setMenu(false);
  }
});
$$('[data-language]').forEach((button) => {
  button.addEventListener("click", () => {
    setLanguage(button.dataset.language, { notify: true });
    setLanguageMenu(false);
  });
});
document.addEventListener("enjaz:language", (event) => {
  updateSummary();
  if (currentPackage && journeyDialog.open) renderPackage(currentPackage);
  if (event.detail.notify) {
    showToast(t(event.detail.language === "ar" ? "languageChanged" : "languageChangedBack"));
  }
});

/* Reveal choreography */
const revealElements = $$('[data-reveal]');
if (reduceMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -45px" });
  revealElements.forEach((element) => revealObserver.observe(element));
}

/* Play the process route only while it is visible */
const processSteps = $(".process-steps");
const processLine = processSteps ? $(".process-line", processSteps) : null;
const processMobile = window.matchMedia("(max-width: 760px)");
if (processSteps && processLine && typeof processLine.pauseAnimations === "function") {
  let processInView = false;
  processLine.pauseAnimations();
  processLine.setCurrentTime(0);

  const syncProcessAnimation = () => {
    const active = processInView && !document.hidden && !reduceMotion;
    processSteps.classList.toggle("is-route-active", active);
    if (active && !processMobile.matches) processLine.unpauseAnimations();
    else processLine.pauseAnimations();
  };

  if ("IntersectionObserver" in window) {
    const processObserver = new IntersectionObserver((entries) => {
      processInView = entries[0].isIntersecting;
      syncProcessAnimation();
    }, { threshold: 0.2 });
    processObserver.observe(processSteps);
  } else {
    processInView = true;
  }
  document.addEventListener("visibilitychange", syncProcessAnimation);
  if (processMobile.addEventListener) processMobile.addEventListener("change", syncProcessAnimation);
  else processMobile.addListener(syncProcessAnimation);
  syncProcessAnimation();
}

/* Small magnetic CTA movement on precise pointers */
if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
  $$('[data-magnetic]').forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.1;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.12;
      element.style.transform = `translate(${x}px, ${y}px)`;
    });
    element.addEventListener("pointerleave", () => { element.style.transform = ""; });
  });
}

/* Destination filtering and deep links into the trip planner */
const destinationGrid = $("#destination-grid");
$$('[data-filter]').forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    $$('[data-filter]').forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    destinationGrid.classList.toggle("is-filtered", filter !== "all");
    $$('[data-category]', destinationGrid).forEach((card) => {
      card.hidden = filter !== "all" && card.dataset.category !== filter;
    });
  });
});

function selectDestination(destination) {
  $$('input[name="destination"]').forEach((input) => {
    input.checked = input.value === destination;
  });
  updateSummary();
}
$$('[data-destination-link]').forEach((link) => {
  link.addEventListener("click", () => selectDestination(link.dataset.destinationLink));
});

/* Stay preferences */
$$('[data-preference]').forEach((button) => {
  button.addEventListener("click", () => {
    $$('[data-preference]').forEach((item) => item.classList.toggle("is-selected", item === button));
    const select = $("#stay-style");
    const value = button.textContent.trim();
    const option = [...select.options].find((item) => item.textContent.trim() === value || item.value === value);
    if (option) select.value = option.value;
    else select.value = getLanguage() === "ar"
      ? ({ "بوتيك": "Boutique", "مريحة": "Comfort", "فاخرة": "Luxury" }[value] || "No preference")
      : value;
    showToast(t("preferenceSelected"));
  });
});

/* Journey details */
const packages = {
  istanbul: {
    destination: "Istanbul",
    image: "./images/istanbul.webp",
    days: 4,
    title: { en: "Istanbul, at your own pace", ar: "إسطنبول، على إيقاعك الخاص" },
    style: { en: "Culture · City", ar: "ثقافة · مدينة" },
    overview: {
      en: "A creative starting point for discovering Istanbul through contrast: old-city texture, Bosphorus calm, and time left open for your own discoveries.",
      ar: "نقطة بداية لاكتشاف إسطنبول من خلال تباينها الجميل: تفاصيل المدينة القديمة، وهدوء البوسفور، ووقت مفتوح لاكتشافاتك الخاصة."
    },
    itinerary: [
      { title: { en: "Old city, new eyes", ar: "المدينة القديمة بعيون جديدة" }, body: { en: "A gentle orientation, layered architecture, and space to wander.", ar: "جولة تعريفية هادئة، وعمارة غنية، ومساحة للتجول." } },
      { title: { en: "Life along the Bosphorus", ar: "الحياة على ضفاف البوسفور" }, body: { en: "Waterfront neighborhoods, local flavors, and a sunset by the water.", ar: "أحياء على الواجهة البحرية، ونكهات محلية، وغروب بجوار الماء." } },
      { title: { en: "Your Istanbul", ar: "إسطنبول كما تحبها" }, body: { en: "A flexible day shaped around food, design, shopping, or simply slowing down.", ar: "يوم مرن حول الطعام أو التصميم أو التسوق أو ببساطة الهدوء." } }
    ]
  },
  cappadocia: {
    destination: "Cappadocia",
    image: "./images/cappadocia.webp",
    days: 3,
    title: { en: "Cappadocia after dawn", ar: "كابادوكيا بعد الفجر" },
    style: { en: "Nature · Wonder", ar: "طبيعة · دهشة" },
    overview: {
      en: "A slower way into Cappadocia’s surreal landscapes, balancing the iconic views with quiet valleys, generous pauses, and room to look up.",
      ar: "طريقة أهدأ لاكتشاف مناظر كابادوكيا الاستثنائية، تجمع بين المشاهد الشهيرة والوديان الهادئة ومساحة كافية للتأمل."
    },
    itinerary: [
      { title: { en: "First light", ar: "الضوء الأول" }, body: { en: "A dawn viewpoint, warm breakfast, and an unhurried valley walk.", ar: "منظر عند الفجر، وفطور دافئ، وجولة هادئة في الوادي." } },
      { title: { en: "Sculpted by time", ar: "منحوتة بمرور الزمن" }, body: { en: "Rock formations, cave architecture, and stories held in the landscape.", ar: "تكوينات صخرية وعمارة داخل الكهوف وحكايات يحفظها المكان." } },
      { title: { en: "The quiet side", ar: "الجانب الهادئ" }, body: { en: "A flexible final day for craft, photography, or one more sunrise.", ar: "يوم أخير مرن للحرف أو التصوير أو مشاهدة شروق آخر." } }
    ]
  },
  blacksea: {
    destination: "Black Sea",
    image: "./images/black-sea.webp",
    days: 5,
    title: { en: "The Black Sea, slowly", ar: "البحر الأسود، دون استعجال" },
    style: { en: "Nature · Slow travel", ar: "طبيعة · سفر هادئ" },
    overview: {
      en: "An illustrative escape into Türkiye’s green north, built around scenic roads, lakeside stops, and the freedom to pause whenever the view asks you to.",
      ar: "هروب توضيحي إلى شمال تركيا الأخضر، حول طرق خلابة وتوقفات بجوار البحيرات وحرية التوقف كلما أخذك المنظر."
    },
    itinerary: [
      { title: { en: "Into the green", ar: "إلى قلب الخضرة" }, body: { en: "A scenic drive, mountain air, and time to settle into a slower rhythm.", ar: "طريق خلاب وهواء جبلي ووقت للتعود على إيقاع أهدأ." } },
      { title: { en: "Lakes and highlands", ar: "بحيرات ومرتفعات" }, body: { en: "Waterfront pauses, forest roads, and wide-open viewpoints.", ar: "توقفات أمام الماء وطرق بين الغابات وإطلالات مفتوحة." } },
      { title: { en: "Follow the weather", ar: "اتبع إحساس المكان" }, body: { en: "A flexible day for villages, nature, photography, or simply the view.", ar: "يوم مرن للقرى أو الطبيعة أو التصوير أو مجرد الاستمتاع بالمنظر." } }
    ]
  }
};

const journeyDialog = $("#journey-dialog");
const dialogContent = $("#dialog-content");
let currentPackage = null;
function renderPackage(key) {
  const item = packages[key];
  if (!item) return;
  currentPackage = key;
  const lang = getLanguage();
  $(".dialog-close", journeyDialog).setAttribute("aria-label", t("close"));
  dialogContent.innerHTML = `
    <div class="dialog-hero">
      <img src="${item.image}" alt="" width="800" height="500" />
      <div class="dialog-hero__content">
        <span>${t("sampleItinerary")}</span>
        <h2 id="dialog-title">${item.title[lang]}</h2>
      </div>
    </div>
    <div class="dialog-body">
      <div class="dialog-overview">
        <div class="dialog-facts">
          <div><span>${t("duration")}</span><strong>${item.days} ${t("days")}</strong></div>
          <div><span>${t("pace")}</span><strong>${item.style[lang]}</strong></div>
        </div>
        <p>${item.overview[lang]}</p>
      </div>
      <div class="dialog-itinerary">
        <span>${t("itinerary")}</span>
        <div class="dialog-days">
          ${item.itinerary.map((day, index) => `
            <article class="dialog-day">
              <b>${t("day")} ${String(index + 1).padStart(2, "0")}</b>
              <h3>${day.title[lang]}</h3>
              <p>${day.body[lang]}</p>
            </article>`).join("")}
        </div>
      </div>
      <div class="dialog-footer">
        <p>${t("demoNote")}</p>
        <button class="button button--primary" type="button" data-dialog-customize>
          <span>${t("customize")}</span><svg class="icon"><use href="#i-arrow"></use></svg>
        </button>
      </div>
    </div>`;
  $("[data-dialog-customize]", dialogContent).addEventListener("click", () => {
    selectDestination(item.destination);
    journeyDialog.close();
    $("#planner").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  });
}
$$('[data-package-open]').forEach((button) => {
  button.addEventListener("click", () => {
    renderPackage(button.dataset.packageOpen);
    journeyDialog.showModal();
    document.body.classList.add("dialog-open");
  });
});
$("[data-dialog-close]", journeyDialog).addEventListener("click", () => journeyDialog.close());
journeyDialog.addEventListener("click", (event) => { if (event.target === journeyDialog) journeyDialog.close(); });
journeyDialog.addEventListener("close", () => document.body.classList.remove("dialog-open"));

/* Trip planner */
const tripForm = $("#trip-form");
const plannerCard = $(".planner-card");
const travelerOutput = $("#traveler-count");
let plannerStep = 1;
let travelers = 2;

const destinationNames = {
  "Istanbul": { en: "Istanbul", ar: "إسطنبول" },
  "Cappadocia": { en: "Cappadocia", ar: "كابادوكيا" },
  "Black Sea": { en: "Black Sea", ar: "البحر الأسود" },
  "Antalya": { en: "Antalya", ar: "أنطاليا" },
  "Not sure yet": { en: "Open to ideas", ar: "مفتوح للأفكار" }
};

function updateSummary() {
  const summary = $("#trip-summary");
  if (!summary) return;
  const lang = getLanguage();
  const selectedDestinations = $$('input[name="destination"]:checked').map((input) => destinationNames[input.value]?.[lang] || input.value);
  const pace = $('input[name="pace"]:checked')?.value.toLowerCase() || "balanced";
  summary.innerHTML = `
    <div><span>${t("destinations")}</span><strong title="${selectedDestinations.join(", ")}">${selectedDestinations.join(", ") || t("notChosen")}</strong></div>
    <div><span>${t("travelers")}</span><strong>${travelers} ${t(travelers === 1 ? "person" : "people")}</strong></div>
    <div><span>${t("travelStyle")}</span><strong>${t(pace)}</strong></div>`;
}

function showPlannerStep(step) {
  plannerStep = step;
  $$('[data-planner-step]').forEach((panel) => {
    const active = Number(panel.dataset.plannerStep) === step;
    panel.hidden = !active;
    panel.classList.toggle("is-active", active);
  });
  $$('[data-step-label]').forEach((label) => {
    const number = Number(label.dataset.stepLabel);
    label.classList.toggle("is-active", number === step);
    label.classList.toggle("is-complete", number < step);
  });
  $("#planner-progress-bar").style.width = `${step * 33.333}%`;
  if (step === 3) updateSummary();
  if (window.innerWidth < 760 && step !== 1) {
    plannerCard.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }
}

$$('[data-next]').forEach((button) => {
  button.addEventListener("click", () => {
    const next = Number(button.dataset.next);
    if (plannerStep === 1 && !$('input[name="destination"]:checked')) {
      showToast(t("destinationRequired"));
      return;
    }
    showPlannerStep(next);
  });
});
$$('[data-back]').forEach((button) => button.addEventListener("click", () => showPlannerStep(Number(button.dataset.back))));

$("#traveler-minus").addEventListener("click", () => {
  travelers = Math.max(1, travelers - 1);
  travelerOutput.textContent = travelers;
  updateSummary();
});
$("#traveler-plus").addEventListener("click", () => {
  travelers = Math.min(12, travelers + 1);
  travelerOutput.textContent = travelers;
  updateSummary();
});
tripForm.addEventListener("change", updateSummary);

const dateInput = $("#travel-date");
dateInput.min = new Date().toISOString().split("T")[0];
$("#flexible-date").addEventListener("change", (event) => {
  dateInput.disabled = event.target.checked;
  if (event.target.checked) dateInput.value = "";
});

tripForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const requiredFields = [$("#traveler-name"), $("#traveler-contact")];
  const valid = requiredFields.every((field) => {
    if (!field.checkValidity()) {
      field.reportValidity();
      return false;
    }
    return true;
  });
  if (!valid) {
    showToast(t("required"));
    return;
  }
  tripForm.hidden = true;
  $(".planner-step-labels").hidden = true;
  $("#planner-success").hidden = false;
  $("#planner-progress-bar").style.width = "100%";
});
$("#planner-reset").addEventListener("click", () => {
  tripForm.reset();
  travelers = 2;
  travelerOutput.textContent = "2";
  dateInput.disabled = false;
  $("#planner-success").hidden = true;
  $(".planner-step-labels").hidden = false;
  tripForm.hidden = false;
  showPlannerStep(1);
  updateSummary();
});
updateSummary();

/* FAQ accordion */
$$('.accordion-item > button').forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".accordion-item");
    const willOpen = !item.classList.contains("is-open");
    $$('.accordion-item').forEach((other) => {
      other.classList.remove("is-open");
      $("button", other).setAttribute("aria-expanded", "false");
    });
    if (willOpen) {
      item.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");
    }
  });
});

/* Load the real Three.js diorama after critical UI content */
const sceneContainer = $("#scene-container");
async function loadScene() {
  try {
    const { createEnjazScene } = await import("./scene.js");
    createEnjazScene(sceneContainer, { reducedMotion: reduceMotion });
  } catch (error) {
    console.warn("The static 3D fallback is being used.", error);
    $("#scene-loading").hidden = true;
  }
}
if ("requestIdleCallback" in window) {
  window.requestIdleCallback(loadScene, { timeout: 900 });
} else {
  window.setTimeout(loadScene, 250);
}
