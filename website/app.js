(() => {
  const products = Array.isArray(window.MORTALSHADE_PRODUCTS) ? window.MORTALSHADE_PRODUCTS : [];
  const grid = document.getElementById("product-grid");
  const categoryTabs = document.getElementById("category-tabs");
  const resultLabel = document.getElementById("result-label");
  const cartButton = document.getElementById("cart-button");
  const cartCount = document.getElementById("cart-count");
  const cartDialog = document.getElementById("cart-dialog");
  const cartItems = document.getElementById("cart-items");
  const coinInput = document.getElementById("coin-amount");
  const inrOutput = document.getElementById("inr-output");
  const COINS_PER_INR = 5;
  const SERVER_HOST = "play.mortalshade.fun";
  const BEDROCK_PORT = 19135;
  const labels = {
    "lifesteal-ranks": "LifeSteal Ranks",
    "lifesteal-keys": "LifeSteal Keys",
    "survival-ranks": "Survival Ranks"
  };
  const inr = new Intl.NumberFormat("en-IN", {style:"currency",currency:"INR",maximumFractionDigits:2});
  const coinsFormat = new Intl.NumberFormat("en-IN");
  let activeCategory = "lifesteal-ranks";
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem("mortalshade-cart") || "[]"); } catch (_) { cart = []; }
  if (!Array.isArray(cart)) cart = [];

  function saveCart() {
    try { localStorage.setItem("mortalshade-cart", JSON.stringify(cart)); } catch (_) {}
  }
  async function updateServerStatus() {
    const statusText=document.getElementById("server-status-text");
    const countText=document.getElementById("server-player-count");
    const light=document.getElementById("server-status-light");
    if(!statusText || !countText) return;
    try {
      const response=await fetch("https://api.mcstatus.io/v2/status/bedrock/"+SERVER_HOST+":"+BEDROCK_PORT,{cache:"no-store"});
      if(!response.ok) throw new Error("Status unavailable");
      const data=await response.json();
      if(data.online) {
        statusText.textContent="SERVER ONLINE";
        countText.textContent=(data.players?.online ?? 0)+" / "+(data.players?.max ?? "?")+" players online";
        if(light) light.classList.add("online");
      } else {
        statusText.textContent="SERVER OFFLINE"; countText.textContent="No response from the Bedrock endpoint";
        if(light) light.classList.remove("online");
      }
    } catch (_) { statusText.textContent="STATUS UNAVAILABLE"; countText.textContent="Live player count could not be loaded"; if(light) light.classList.remove("online"); }
  }
  function updateCalculator() {
    if (!coinInput || !inrOutput) return;
    const amount = Math.max(0, Number(coinInput.value) || 0);
    inrOutput.textContent = inr.format(amount / COINS_PER_INR);
  }
  function updateCart() {
    if (cartCount) cartCount.textContent = String(cart.length);
    if (!cartItems) return;
    cartItems.replaceChildren();
    if (!cart.length) { cartItems.textContent = "Your cart is empty."; return; }
    cart.forEach((item, index) => {
      const line = document.createElement("div");
      line.className = "cart-line";
      const title = document.createElement("span");
      title.textContent = item.name + " — " + (item.server === "lifesteal" ? "LifeSteal" : "Survival");
      const price = document.createElement("strong");
      price.textContent = inr.format(item.price);
      const remove = document.createElement("button");
      remove.type = "button"; remove.className = "remove-cart-item"; remove.textContent = "Remove";
      remove.addEventListener("click", () => { cart.splice(index, 1); saveCart(); updateCart(); });
      line.append(title, price, remove);
      cartItems.append(line);
    });
  }
  function flyToCart(card) {
    if (!cartButton || !card) return;
    const source = card.getBoundingClientRect();
    const target = cartButton.getBoundingClientRect();
    const ghost = card.cloneNode(true);
    ghost.classList.add("cart-fly-card");
    Object.assign(ghost.style, {left:source.left+"px",top:source.top+"px",width:source.width+"px",height:source.height+"px"});
    document.body.append(ghost);
    const dx = target.left + target.width/2 - (source.left + source.width/2);
    const dy = target.top + target.height/2 - (source.top + source.height/2);
    const animation = ghost.animate([
      {transform:"translate(0,0) scale(1)",opacity:1,borderRadius:"12px"},
      {transform:"translate("+dx+"px,"+dy+"px) scale(.08)",opacity:.25,borderRadius:"50%"}
    ], {duration:650,easing:"cubic-bezier(.2,.8,.25,1)",fill:"forwards"});
    animation.onfinish = () => ghost.remove();
    cartButton.classList.remove("cart-bump");
    void cartButton.offsetWidth;
    cartButton.classList.add("cart-bump");
  }
  function renderProducts() {
    if (!grid) return;
    const visible = products.filter(p => {
      if (activeCategory === "lifesteal-ranks") return p.server === "lifesteal" && p.category === "Rank" && p.id !== "spidey-special";
      if (activeCategory === "survival-ranks") return p.server === "survival" && p.category === "Rank";
      return p.server === "lifesteal" && p.category === "Key";
    });
    if (resultLabel) resultLabel.textContent = labels[activeCategory];
    grid.replaceChildren();
    if (!visible.length) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.innerHTML = '<div class="empty-icon">✦</div><h3>Items coming soon</h3><p>We have not added products to this category yet. Check back soon!</p>';
      grid.append(empty);
      return;
    }
    visible.forEach(product => {
      const card = document.createElement("article");
      card.className = "step-card product-card";
      const eyebrow = document.createElement("p"); eyebrow.className = "eyebrow"; eyebrow.textContent = labels[activeCategory];
      const name = document.createElement("h3"); name.textContent = product.name;
      const desc = document.createElement("p"); desc.textContent = product.description || "";
      const price = document.createElement("p"); price.className = "product-price"; price.textContent = coinsFormat.format(product.coins)+" Coins · "+inr.format(product.price);
      card.append(eyebrow,name,desc,price);
      if (product.duration) { const duration=document.createElement("p"); duration.className="product-meta"; duration.textContent="Duration: "+product.duration; card.append(duration); }
      const add = document.createElement("button");
      add.className="server-tab active add-to-cart"; add.type="button"; add.textContent="Add to cart";
      add.addEventListener("click", () => {
        cart.push({id:product.id,name:product.name,server:product.server,price:product.price});
        saveCart(); updateCart(); flyToCart(card);
      });
      card.append(add);
      grid.append(card);
    });
  }
  if (categoryTabs) {
    categoryTabs.addEventListener("click", event => {
      const button=event.target.closest("button[data-category]");
      if (!button) return;
      activeCategory=button.dataset.category;
      categoryTabs.querySelectorAll("button").forEach(tab=>tab.classList.toggle("active",tab===button));
      renderProducts();
    });
  }
  if (coinInput) coinInput.addEventListener("input",updateCalculator);
  const copyIp=document.getElementById("copy-server-ip");
  if(copyIp) copyIp.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(SERVER_HOST);copyIp.classList.add("copied");copyIp.querySelector("small").textContent="IP COPIED!";window.setTimeout(()=>{copyIp.classList.remove("copied");copyIp.querySelector("small").textContent="BEDROCK PORT: 19135 · TAP TO COPY";},1800);}catch(_){copyIp.querySelector("small").textContent=SERVER_HOST+":"+BEDROCK_PORT;}});
  if (cartButton && cartDialog) cartButton.addEventListener("click",()=>cartDialog.showModal());
  const close=document.getElementById("close-cart");
  if (close && cartDialog) close.addEventListener("click",()=>cartDialog.close());
  if (cartDialog) cartDialog.addEventListener("click",event=>{if(event.target===cartDialog)cartDialog.close();});
  const year=document.getElementById("year");
  if(year) year.textContent=String(new Date().getFullYear());
  updateCalculator(); updateCart(); renderProducts();
  updateServerStatus();
  if(document.getElementById("server-status-text")) window.setInterval(updateServerStatus,120000);
})();