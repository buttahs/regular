const app = document.querySelector("#app");
const money = value => `£${value.toFixed(2)}`;
const savedBasket = JSON.parse(localStorage.getItem("my-regulars-basket") || '{"cluck":1,"beyond":1,"oatly":1}');
const savedSchemes = JSON.parse(localStorage.getItem("my-regulars-schemes") || '{"Nectar":true,"Clubcard":true}');

const state = {
  basket: savedBasket,
  schemes: savedSchemes,
  view: "list",
  data: null
};

const effectivePrice = listing =>
  listing.loyalty !== null && state.schemes[listing.scheme]
    ? listing.loyalty
    : listing.standard;

function save() {
  localStorage.setItem("my-regulars-basket", JSON.stringify(state.basket));
  localStorage.setItem("my-regulars-schemes", JSON.stringify(state.schemes));
}

function calculate() {
  const selected = state.data.products.filter(product => (state.basket[product.id] || 0) > 0);
  const totals = Object.fromEntries(state.data.retailers.map(retailer => [
    retailer,
    selected.reduce((sum, product) =>
      sum + effectivePrice(product.prices[retailer]) * state.basket[product.id], 0)
  ]));
  const best = state.data.retailers.reduce((winner, retailer) =>
    totals[retailer] < totals[winner] ? retailer : winner, state.data.retailers[0]);
  const split = selected.reduce((sum, product) =>
    sum + Math.min(...state.data.retailers.map(retailer =>
      effectivePrice(product.prices[retailer]))) * state.basket[product.id], 0);
  return { selected, totals, best, split };
}

function render() {
  const { selected, totals, best, split } = calculate();
  const offerProducts = state.data.products.filter(product =>
    Object.values(product.prices).some(price => price.loyalty !== null));
  const visibleProducts = state.view === "offers" ? offerProducts : state.data.products;
  const schemes = [...new Set(state.data.products.flatMap(product =>
    Object.values(product.prices).map(price => price.scheme).filter(Boolean)))];

  app.innerHTML = `
    <header class="site-header">
      <button class="brand" data-view="list">My Regulars</button>
      <nav aria-label="Main navigation">
        <button class="${state.view === "list" ? "active" : ""}" data-view="list">🧺 My list</button>
        <button class="${state.view === "offers" ? "active" : ""}" data-view="offers">🏷 Offers</button>
      </nav>
      <div class="profile"><span class="avatar">JT</span></div>
    </header>
    <div class="sample-note"><span>Prototype</span> Demo prices · loyalty pricing is separated from standard pricing</div>
    <section class="dashboard">
      <div class="content">
        <p class="eyebrow">${state.view === "offers" ? "Offers on your regulars" : "Good afternoon, Jon"}</p>
        <section class="hero-card">
          <div>
            <p class="hero-kicker">${selected.length} items selected</p>
            <h1>${selected.length ? `${best} is your best shop this week` : "Choose what you need this week"}</h1>
            <p class="hero-detail">A split shop would save ${money(totals[best] - split)} more.</p>
            <div class="hero-actions"><a class="button primary" href="#basket">Review my basket →</a></div>
          </div>
          <div class="bag-illustration" aria-hidden="true"><span class="bread"></span><span class="greens">♣</span><span class="carton"></span><span class="bag-handle"></span><span class="bag-face">⌣</span></div>
        </section>
        <section class="basket-card" id="basket">
          <h2>🧺 ${selected.length} selected items</h2>
          ${selected.length ? selected.map(product => `
            <div class="basket-row">
              <span class="item-icon">${product.icon}</span>
              <div><strong>${product.name}</strong><small>${product.size}</small></div>
              <div class="stepper">
                <button data-change="${product.id}" data-delta="-1">−</button>
                <span>${state.basket[product.id]}</span>
                <button data-change="${product.id}" data-delta="1">+</button>
              </div>
              <b>${money(effectivePrice(product.prices[best]) * state.basket[product.id])}</b>
              <button class="remove" data-remove="${product.id}">×</button>
            </div>`).join("") : `<p class="empty-state">Add a regular below to begin comparing.</p>`}
        </section>
        <div class="section-heading">
          <div><p>${state.view === "offers" ? "Worth buying now" : "Your regulars"}</p><small>Tap + to add something to this week’s basket</small></div>
          <button data-view="${state.view === "offers" ? "list" : "offers"}">${state.view === "offers" ? "Show all" : "Offers only"}</button>
        </div>
        <section class="offer-grid">
          ${visibleProducts.map(product => {
            const candidates = state.data.retailers.map(retailer => ({
              retailer, value: effectivePrice(product.prices[retailer]), listing: product.prices[retailer]
            }));
            const lowest = Math.min(...candidates.map(item => item.value));
            const winner = candidates.find(item => item.value === lowest);
            const loyalty = winner.listing.loyalty !== null && state.schemes[winner.listing.scheme];
            return `<article class="offer-card ${(state.basket[product.id] || 0) ? "selected-product" : ""}">
              <div class="pack" aria-hidden="true"><span class="pack-brand">${product.brand}</span><b>${product.name}</b><span class="pack-window">${product.icon}</span></div>
              <div class="offer-copy"><p class="product-kicker">${product.brand}</p><h3>${product.name}</h3><div><strong>${money(lowest)}</strong></div><small>${product.size} · ${winner.retailer}${loyalty ? ` ${winner.listing.scheme}` : ""}</small></div>
              ${loyalty ? `<span class="deal-sticker">${winner.listing.scheme}<br>price</span>` : ""}
              <button class="add-button" data-change="${product.id}" data-delta="1">${state.basket[product.id] || "+"}</button>
            </article>`;
          }).join("")}
        </section>
      </div>
      <aside class="compare-card">
        <h2>Compare prices</h2>
        <div class="retailer-list">${state.data.retailers.map(retailer => `
          <div class="retailer-row ${retailer === best && selected.length ? "best" : ""}">
            ${retailer === best && selected.length ? `<span class="best-sticker">BEST<br>PRICE</span>` : ""}
            <strong>${retailer}</strong><b>${money(totals[retailer])}</b><span>›</span>
          </div>`).join("")}
        </div>
        <dl class="totals"><div><dt>🧺 Basket total</dt><dd>${money(totals[best])}</dd></div><div class="saving"><dt>● Split basket</dt><dd>${money(split)}</dd></div></dl>
        <div class="split-note"><strong>Your loyalty cards</strong>${schemes.map(scheme => `<label><input type="checkbox" data-scheme="${scheme}" ${state.schemes[scheme] ? "checked" : ""}> ${scheme}</label>`).join("")}</div>
      </aside>
    </section>`;
}

app.addEventListener("click", event => {
  const view = event.target.closest("[data-view]")?.dataset.view;
  const change = event.target.closest("[data-change]");
  const remove = event.target.closest("[data-remove]")?.dataset.remove;
  if (view) state.view = view;
  if (change) state.basket[change.dataset.change] = Math.max(0, (state.basket[change.dataset.change] || 0) + Number(change.dataset.delta));
  if (remove) state.basket[remove] = 0;
  if (view || change || remove) { save(); render(); }
});

app.addEventListener("change", event => {
  if (event.target.matches("[data-scheme]")) {
    state.schemes[event.target.dataset.scheme] = event.target.checked;
    save(); render();
  }
});

try {
  const response = await fetch("./data/products.json");
  state.data = await response.json();
  render();
} catch (error) {
  app.innerHTML = `<p style="padding:2rem">Could not load product data. ${error.message}</p>`;
}
