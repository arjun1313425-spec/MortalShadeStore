(() => {
  const products = Array.isArray(window.MORTALSHADE_PRODUCTS) ? window.MORTALSHADE_PRODUCTS : [];
  const grid = document.getElementById("product-grid");
  const tabs = document.getElementById("server-tabs");
  const resultLabel = document.getElementById("result-label");
  const cartButton = document.getElementById("cart-button");
  const cartCount = document.getElementById("cart-count");
  const cartDialog = document.getElementById("cart-dialog");
  const cartItems = document.getElementById("cart-items");
  const cart = [];
  let activeServer = "all";

  const serverNames = {
    lifesteal: "LifeSteal",
    survival: "Survival",
    bedwars: "BedWars",
    pvp: "PvP / Mini-Games"
  };

  function renderProducts() {
    const visible = activeServer === "all"
      ? products
      : products.filter(product => product.server === activeServer);

    resultLabel.textContent = activeServer === "all"
      ? "All available products"
      : serverNames[activeServer] + " products";

    if (!visible.length) {
      grid.innerHTML = '<div class="empty-state"><div class="empty-icon">✦</div><h3>New items are on the way</h3><p>We are preparing the official packages for this server. Products and prices will appear here once they are confirmed. No placeholder prices or fake checkout buttons.</p></div>';
      return;
    }

    grid.replaceChildren();
    visible.forEach(product => {
      const card = document.createElement("article");
      card.className = "step-card product-card";
      const name = document.createElement("h3");
      name.textContent = product.name;
      const description = document.createElement("p");
      description.textContent = product.description || "";
      const server = document.createElement("p");
      server.className = "eyebrow";
      server.textContent = serverNames[product.server] || product.server;
      const price = document.createElement("p");
      price.className = "product-price";
      price.textContent = Number.isFinite(product.price) && product.price > 0
        ? new Intl.NumberFormat(undefined, { style: "currency", currency: product.currency || "NPR" }).format(product.price)
        : "Price to be confirmed";
      const add = document.createElement("button");
      add.className = "server-tab active";
      add.type = "button";
      add.textContent = "Add to preview cart";
      add.disabled = !(Number.isFinite(product.price) && product.price > 0);
      add.addEventListener("click", () => {
        cart.push(product);
        updateCart();
      });
      card.append(server, name, description, price, add);
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
      line.textContent = item.name + " — " + (serverNames[item.server] || item.server);
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

  cartButton.addEventListener("click", () => cartDialog.showModal());
  document.getElementById("close-cart").addEventListener("click", () => cartDialog.close());
  cartDialog.addEventListener("click", event => {
    if (event.target === cartDialog) cartDialog.close();
  });
  document.getElementById("year").textContent = String(new Date().getFullYear());
  updateCart();
  renderProducts();
})();