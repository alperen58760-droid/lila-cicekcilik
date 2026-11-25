const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector("#primary-nav");
const searchInput = document.querySelector("#product-search");
const filterButtons = [...document.querySelectorAll(".filter-chip")];
const productCards = [...document.querySelectorAll(".product-card")];
const emptyState = document.querySelector("#empty-state");
const cartDialog = document.querySelector("#cart-dialog");
const cartItems = document.querySelector("#cart-items");
const cartCount = document.querySelector("#cart-count");
const cartTotal = document.querySelector("#cart-total");
const cartEmpty = document.querySelector("#cart-empty");
const checkoutLink = document.querySelector("#cart-checkout");

const products = {
  "krem-buket": { name: "Krem Rengi Gül Detaylı Gerçek Aynalı Özel Gün Buketi", price: 1999 },
  "beyaz-ayicik": { name: "40 cm Beyaz Renk Yumuşacık Sevimli Peluş Ayıcık", price: 999 },
  labubu: { name: "Labubu Monster Kutulu Sürpriz Oyuncak Karma Renk", price: 799 },
  "kahve-ayicik": { name: "40 cm Koyu Kahve Yumuşacık Sevimli Peluş Ayıcık", price: 1499 },
  "pembe-kelebek": { name: "Işıklı Renkli Kelebek Buketi (Pembe)", price: 2299 },
  "mavi-kelebek": { name: "Işıklı Güllü Renkli Kelebek Buketi (Mavi)", price: 2299 }
};

const cart = new Map();
let activeFilter = "all";

function formatPrice(price) {
  return `${new Intl.NumberFormat("tr-TR").format(price)} TL`;
}

function normalizeText(text) {
  return text.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function updateProducts() {
  const query = normalizeText(searchInput.value.trim());
  let visibleCount = 0;

  productCards.forEach((card) => {
    const matchesCategory = activeFilter === "all" || card.dataset.category.split(" ").includes(activeFilter);
    const matchesSearch = normalizeText(card.dataset.name).includes(query);
    const visible = matchesCategory && matchesSearch;
    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  emptyState.hidden = visibleCount > 0;
}

function updateCart() {
  const itemCount = [...cart.values()].reduce((sum, item) => sum + item.quantity, 0);
  const total = [...cart.values()].reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  cartCount.textContent = String(itemCount);
  cartTotal.textContent = formatPrice(total);
  cartEmpty.hidden = itemCount > 0;
  cartItems.replaceChildren();

  cart.forEach(({ product, quantity }, id) => {
    const row = document.createElement("div");
    row.className = "cart-item";

    const details = document.createElement("div");
    const name = document.createElement("p");
    name.className = "cart-item__name";
    name.textContent = `${product.name} × ${quantity}`;
    const price = document.createElement("span");
    price.className = "cart-item__price";
    price.textContent = formatPrice(product.price * quantity);
    details.append(name, price);

    const removeButton = document.createElement("button");
    removeButton.className = "cart-item__remove";
    removeButton.type = "button";
    removeButton.dataset.remove = id;
    removeButton.textContent = "Kaldır";
    removeButton.setAttribute("aria-label", `${product.name} ürününü sepetten kaldır`);

    row.append(details, removeButton);
    cartItems.append(row);
  });

  const orderLines = [...cart.values()]
    .map(({ product, quantity }) => `${product.name} x${quantity} — ${formatPrice(product.price * quantity)}`)
    .join("\n");
  const message = orderLines
    ? `Merhaba, sipariş vermek istiyorum:\n${orderLines}\nToplam: ${formatPrice(total)}`
    : "Merhaba, çiçek siparişi vermek istiyorum.";
  checkoutLink.href = `https://wa.me/905521142797?text=${encodeURIComponent(message)}`;
}

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  primaryNav.classList.toggle("is-open", !isExpanded);
});

primaryNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    primaryNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((filterButton) => {
      const selected = filterButton === button;
      filterButton.classList.toggle("is-active", selected);
      filterButton.setAttribute("aria-pressed", String(selected));
    });
    updateProducts();
  });
});

searchInput.addEventListener("input", updateProducts);

document.querySelectorAll(".add-button").forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.dataset.product;
    const product = products[id];
    if (!product) return;

    const existing = cart.get(id);
    cart.set(id, { product, quantity: existing ? existing.quantity + 1 : 1 });
    updateCart();
    button.innerHTML = "Eklendi <span aria-hidden=\"true\">✓</span>";
    window.setTimeout(() => {
      button.innerHTML = "Sepete ekle <span aria-hidden=\"true\">+</span>";
    }, 1100);
  });
});

cartItems.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove]");
  if (!removeButton) return;
  cart.delete(removeButton.dataset.remove);
  updateCart();
});

document.querySelector("#open-cart").addEventListener("click", () => cartDialog.showModal());
document.querySelector("#close-cart").addEventListener("click", () => cartDialog.close());
cartDialog.addEventListener("click", (event) => {
  if (event.target === cartDialog) cartDialog.close();
});

document.querySelector("#current-year").textContent = String(new Date().getFullYear());
updateCart();
