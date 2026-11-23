(() => {
  const products = Array.isArray(window.MORTALSHADE_PRODUCTS) ? window.MORTALSHADE_PRODUCTS : [];
  const grid = document.getElementById("product-grid");
  const tabs = document.getElementById("server-tabs");
  const resultLabel = document.getElementById("result-label");
  const cartButton = document.getElementById("cart-button");
  const cartCount = document.getElementById("cart-count");
  const cartDialog = document.getElementById("cart-dialog");
  const cartItems = document.getElementById("cart-items");
  const coinInput = document.getElementById("coin-amount");
  const inrOutput = document.getElementById("inr-output");
  const cart = [];
  let activeServer = "all";

  const COINS_PER_INR = 5;
  const serverNames = {
    lifesteal: "LifeSteal",
    survival: "Survival",
    bedwars: "BedWars",
    pvp: "PvP / Mini-Games"
  };

  const inrFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  });
  const coinFormatter = new Intl.NumberFormat("en-IN");

  function updateCalculator() {
    const coins = Math.max(0, Number(coinInput.value) || 0);
    inrOutput.textContent = inrFormatter.format(coins / COINS_PER_INR);
  }

  function renderProducts() {
    const visible = activeServer === "all"
      ? products
      : products.filter(product => product.server === activeServer);

    resultLabel.textContent = activeServer === "all"
      ? "All available products"
      : serverNames[activeServer] + " products";

    if (!visible.length) {
      grid.innerHTML = '<div class="empty-state"><div class="empty-icon">✦</div><h3>New items are on the way</h3><p>We are preparing the official packages for this server. Products and prices will appear here once they are confirmed.</p></div>';
      return;
    }

    grid.replaceChildren();
    visible.forEach(product => {
      const card = document.createElement("article");
      card.className = "step-card product-card";
      const server = document.createElement("p");
      server.className = "eyebrow";
      server.textContent = product.category === "Special offer"
        ? "SPECIAL OFFER"
        : serverNames[product.server] || product.server;
      const name = document.createElement("h3");
      name.textContent = product.name;
      const description = document.createElement("p");
      description.textContent = product.description || "";
      const price = document.createElement("p");
      price.className = "product-price";
      price.textContent = coinFormatter.format(product.coins) + " Coins · " + inrFormatter.format(product.price);
      const duration = document.createElement("p");
      duration.className = "product-meta";
      duration.textContent = product.duration ? "Duration: " + product.duration : "";
      card.append(server, name, description, price);
      if (duration.textContent) card.append(duration);

      if (product.specialOffer) {
        const offer = document.createElement("p");
        offer.className = "product-offer";
        offer.textContent = product.specialOffer;
        card.append(offer);
      } else {
        const add = document.createElement("button");
        add.className = "server-tab active";
        add.type = "button";
        add.textContent = "Add to preview cart";
        add.addEventListener("click", () => {
          cart.push(product);
          updateCart();
        });
        card.append(add);
      }
      grid.append(card);
    });
  }

  function updateCart() {
    cartCount.textContent = String(cart.length);
    cartItems.replaceChildren();
    if (!cart.length) {
      cartItems.textContent = "Your cart is empty.";
      return;
    }
    cart.forEach(item => {
      const line = document.createElement("p");
      line.textContent = item.name + " — " + (serverNames[item.server] || item.server) + " — " + inrFormatter.format(item.price);
      cartItems.append(line);
    });
  }

  tabs.addEventListener("click", event => {
    const button = event.target.closest("button[data-server]");
    if (!button) return;
    activeServer = button.dataset.server;
    tabs.querySelectorAll("button").forEach(tab => tab.classList.toggle("active", tab === button));
    renderProducts();
  });

  coinInput.addEventListener("input", updateCalculator);
  cartButton.addEventListener("click", () => cartDialog.showModal());
  document.getElementById("close-cart").addEventListener("click", () => cartDialog.close());
  cartDialog.addEventListener("click", event => {
    if (event.target === cartDialog) cartDialog.close();
  });
  document.getElementById("year").textContent = String(new Date().getFullYear());
  updateCalculator();
  updateCart();
  renderProducts();
})();
