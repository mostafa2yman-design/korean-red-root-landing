/* إعدادات قابلة للتعديل — عدّل رقم واتساب والأسعار من هنا. */
const SITE_CONFIG = {
  whatsappNumber: "201064312414", // رقم واتساب بصيغة دولية بدون + أو مسافات
  originalPrice: 8190,
  salePrice: 7290,
  digitalPaymentPrice: 6561,
  currency: "جنيه"
};

const formatPrice = (amount) => `${new Intl.NumberFormat("en-EG").format(amount)} ${SITE_CONFIG.currency}`;
const form = document.getElementById("orderForm");
const total = document.getElementById("selectedTotal");
const error = document.getElementById("formError");

function selectedPaymentPrice(payment) {
  return payment === "إنستا باي" || payment === "محفظة إلكترونية"
    ? SITE_CONFIG.digitalPaymentPrice
    : SITE_CONFIG.salePrice;
}

function trackPixelEvent(eventName, parameters) {
  if (typeof window.fbq === "function") window.fbq("track", eventName, parameters);
}

function trackPixelCustomEvent(eventName, parameters) {
  if (typeof window.fbq === "function") window.fbq("trackCustom", eventName, parameters);
}

function trackOpenAIPixelEvent(eventName, eventData) {
  if (typeof window.oaiq === "function") window.oaiq("measure", eventName, eventData);
}

// Track a product view once when the product section becomes visible.
const productSection = document.getElementById("product");
if (productSection && "IntersectionObserver" in window) {
  const productObserver = new IntersectionObserver((entries, observer) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      trackPixelEvent("ViewContent", {
        content_name: "Korean Red Root Kwangdong 6 Years",
        content_category: "Korean Red Ginseng"
      });
      trackOpenAIPixelEvent("contents_viewed", {
        type: "contents",
        contents: [{ id: "korean-red-root-6-years", name: "Korean Red Root Kwangdong 6 Years", content_type: "product" }]
      });
      observer.disconnect();
    }
  }, { threshold: 0.35 });
  productObserver.observe(productSection);
}

document.getElementById("oldPriceHero").textContent = formatPrice(SITE_CONFIG.originalPrice);
document.getElementById("salePriceHero").textContent = formatPrice(SITE_CONFIG.salePrice);
document.getElementById("year").textContent = new Date().getFullYear();

document.querySelectorAll('input[name="payment"]').forEach((input) => {
  input.addEventListener("change", () => {
    total.innerHTML = `السعر المستحق: <b>${formatPrice(selectedPaymentPrice(input.value))}</b>`;
    trackPixelCustomEvent("PaymentMethodSelected", {
      payment_method: input.value
    });
  });
});

let orderFormStarted = false;
form.addEventListener("focusin", () => {
  if (orderFormStarted) return;
  orderFormStarted = true;
  trackPixelCustomEvent("OrderFormStart", { form_name: "WhatsApp order" });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  error.hidden = true;

  if (!form.reportValidity()) return;
  if (!/^\d{10,15}$/.test(SITE_CONFIG.whatsappNumber)) {
    error.textContent = "رقم واتساب في إعدادات الموقع غير صحيح. عدّل whatsappNumber داخل script.js.";
    error.hidden = false;
    return;
  }

  const data = new FormData(form);
  const normalizedPhone = String(data.get("phone") || "").replace(/[٠-٩۰-۹]/g, (digit) => {
    const code = digit.charCodeAt(0);
    return String(code - (code >= 0x06f0 ? 0x06f0 : 0x0660));
  });
  const phoneDigits = normalizedPhone.replace(/\D/g, "");
  if (!/^[+\d\s().-]+$/.test(normalizedPhone) || phoneDigits.length < 10 || phoneDigits.length > 15) {
    error.textContent = "رقم التليفون يجب أن يحتوي على 10 إلى 15 رقمًا.";
    error.hidden = false;
    return;
  }

  const payment = data.get("payment");
  const finalPrice = selectedPaymentPrice(payment);
  const message = [
    "طلب جديد — Korean Red Root",
    "",
    `الاسم: ${data.get("name")}`,
    `رقم التليفون: ${data.get("phone")}`,
    `المحافظة: ${data.get("governorate")}`,
    `العنوان: ${data.get("address")}`,
    `طريقة الدفع: ${payment}`,
    `السعر قبل الخصم: ${formatPrice(SITE_CONFIG.originalPrice)}`,
    `السعر الأساسي بعد الخصم: ${formatPrice(SITE_CONFIG.salePrice)}`,
    `الإجمالي المستحق: ${formatPrice(finalPrice)}`,
    "الشحن: مجانًا"
  ].join("\n");

  trackPixelEvent("Lead", {
    content_name: "Korean Red Root Kwangdong 6 Years",
    payment_method: payment
  });
  trackOpenAIPixelEvent("lead_created", { type: "customer_action" });

  const whatsappUrl = `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
});

// تكبير صور المعرض
const lightbox = document.getElementById("lightbox");
const lightboxImage = lightbox.querySelector("img");
function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImage.src = "";
}
document.querySelectorAll(".gallery-item").forEach((item) => {
  item.addEventListener("click", () => {
    trackPixelCustomEvent("ProductImageView", {
      image_name: item.querySelector("span")?.textContent.trim() || "Product image"
    });
    lightboxImage.src = item.dataset.full;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
  });
});
lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLightbox();
});
