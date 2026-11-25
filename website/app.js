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
  const detailsDialog = document.getElementById("product-details-dialog");
  const detailsBody = document.getElementById("product-details-body");
  const closeDetails = document.getElementById("close-product-details");
  if (closeDetails && detailsDialog) closeDetails.addEventListener("click", () => detailsDialog.close());
  const COINS_PER_INR = 5;
  const SERVER_HOST = "play.mortalshade.fun";
  const BEDROCK_PORT = 19135;
  const labels = {\n    "all-items": "All Items",
    "lifesteal-ranks": "LifeSteal Ranks",
    "lifesteal-keys": "LifeSteal Keys",
    "survival-keys": "Survival Keys",
    "survival-ranks": "Survival Ranks",
    "coins": "MortalShade Coin Packs",
    "special": "Special & Bundles"
  };
  const inr = new Intl.NumberFormat("en-IN", {style:"currency",currency:"INR",maximumFractionDigits:2});
  const coinsFormat = new Intl.NumberFormat("en-IN");
  let activeCategory = "all-items";
  // Use the same cart storage as checkout so items survive navigation and new tabs.
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
      const urls=[
        "https://api.mcstatus.io/v2/status/java/"+SERVER_HOST,
        "https://api.mcstatus.io/v2/status/bedrock/"+SERVER_HOST+":"+BEDROCK_PORT
      ];
      const results=await Promise.allSettled(urls.map(url=>fetch(url,{cache:"no-store"}).then(r=>{if(!r.ok)throw new Error("Status unavailable");return r.json();})));
      const java=results[0].status==="fulfilled"?results[0].value:null;
      const bedrock=results[1].status==="fulfilled"?results[1].value:null;
      // Prefer Java's proxy ping for the network-wide count; use Bedrock as fallback.
      const data=java?.online?java:(bedrock?.online?bedrock:null);
      if(data?.online) {
        statusText.textContent="SERVER ONLINE";
        countText.textContent=(data.players?.online ?? 0)+" / "+(data.players?.max ?? "?")+" players online · "+(java?.online?"Java network":"Bedrock");
        if(light) light.classList.add("online");
      } else {
        statusText.textContent="SERVER OFFLINE"; countText.textContent="No response from Java or Bedrock status checks";
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
    if (grid) grid.querySelectorAll(".view-cart-button").forEach(button => { button.hidden = cart.length === 0; });
    if (!cartItems) return;
    cartItems.replaceChildren();
    if (!cart.length) { cartItems.textContent = "Your cart is empty."; return; }
    cart.forEach((item, index) => {
      const line = document.createElement("div");
      line.className = "cart-line";
      const title = document.createElement("span");
      const serverNames = {lifesteal:"LifeSteal",survival:"Survival",bedwars:"BedWars",pvp:"PvP / Mini-Games",network:"Network-wide"};
      title.textContent = item.name + " — " + (serverNames[item.server] || "Server to confirm");
      const price = document.createElement("strong");
      price.textContent = inr.format(item.price);
      const remove = document.createElement("button");
      remove.type = "button"; remove.className = "remove-cart-item"; remove.textContent = "Remove";
      remove.addEventListener("click", () => { cart.splice(index, 1); saveCart(); updateCart(); });
      line.append(title, price, remove);
      cartItems.append(line);
    });
    const total = cart.reduce((sum,item)=>sum+(Number(item.price)||0),0);
    const totalLine=document.createElement("div"); totalLine.className="cart-total-line";
    const totalLabel=document.createElement("span"); totalLabel.textContent="Cart total";
    const totalValue=document.createElement("strong"); totalValue.textContent=inr.format(total);
    totalLine.append(totalLabel,totalValue); cartItems.append(totalLine);
    const checkoutLink=document.createElement("a"); checkoutLink.className="primary-button"; checkoutLink.href="./checkout.html"; checkoutLink.textContent="CONTINUE TO CHECKOUT →"; checkoutLink.style.marginTop="18px"; cartItems.append(checkoutLink);
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
  function renderProductDetails(product) {
    if (!detailsDialog || !detailsBody) return;
    detailsBody.replaceChildren();
    const art = document.createElement("img");
    art.className = "detail-rank-art";
    art.src = product.art || ("./assets/ranks/" + product.id + ".svg");
    art.alt = product.name + " artwork";
    art.addEventListener("error", () => { art.hidden = true; }, {once:true});
    const title = document.createElement("h2"); title.textContent = product.name;
    const server = document.createElement("p"); server.className = "detail-server"; server.textContent = product.server === "network" ? "MortalShade Network · Coin Pack" : (product.server === "lifesteal" ? "LifeSteal" : "Survival") + " server";
    const price = document.createElement("p"); price.className = "detail-price"; price.textContent = inr.format(product.price) + " · " + coinsFormat.format(product.coins) + " MortalShade Coins";
    const description = document.createElement("p"); description.className = "detail-description"; description.textContent = product.description || "Details coming soon.";
    detailsBody.append(art, title, server, price);
    if (product.details && product.details.length) {
      const checklist = document.createElement("div"); checklist.className = "detail-checklist";
      product.details.forEach(group => {
        const section = document.createElement("section"); section.className = "detail-check-section";
        const heading = document.createElement("h3"); heading.textContent = group.label;
        const list = document.createElement("ul");
        (group.items || []).forEach(item => {
          const row = document.createElement("li");
          const tick = document.createElement("span"); tick.className = "detail-check"; tick.setAttribute("aria-hidden", "true"); tick.textContent = "✓";
          const copy = document.createElement("span"); copy.textContent = item;
          row.append(tick, copy); list.append(row);
        });
        section.append(heading, list); checklist.append(section);
      });
      detailsBody.append(checklist);
    } else {
      detailsBody.append(description);
    }
    if (product.duration) { const duration = document.createElement("p"); duration.className = "detail-meta"; duration.textContent = "Duration: " + product.duration; detailsBody.append(duration); }
    if (product.specialOffer) { const offer = document.createElement("p"); offer.className = "detail-offer"; offer.textContent = "OFFER: " + product.specialOffer; detailsBody.append(offer); }
    detailsDialog.showModal();
  }
  function renderProducts() {
    if (!grid) return;
    let visible = products.filter(p => {
      if (activeCategory === "lifesteal-ranks") return p.server === "lifesteal" && p.category === "Rank" && p.id !== "spidey-special";
      if (activeCategory === "survival-ranks") return p.server === "survival" && p.category === "Rank";
      if (activeCategory === "lifesteal-keys") return p.server === "lifesteal" && p.category === "Key";
      if (activeCategory === "survival-keys") return p.server === "survival" && p.category === "Key";
      if (activeCategory === "coins") return p.category === "Coins";
      if (activeCategory === "special") return p.category === "Special offer" || p.featuredIn === "special";
      return p.server === "lifesteal" && p.category === "Key";
    });
    if (resultLabel) resultLabel.textContent = labels[activeCategory] + " · " + visible.length + " item" + (visible.length===1?"":"s");
    grid.replaceChildren();
    if (!visible.length) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      const heading = "Items coming soon";
      const message = activeCategory === "coins"
        ? "Coin packs are being prepared. Pack amounts and prices will appear here soon."
        : activeCategory === "special"
          ? "There are no active special offers listed right now. Check Discord for announcements."
          : "We have not added products to this category yet. Check back soon!";
      const symbol = document.createElement("div"); symbol.className="empty-icon"; symbol.textContent="✦";
      const title = document.createElement("h3"); title.textContent=heading;
      const copy = document.createElement("p"); copy.textContent=message;
      empty.append(symbol,title,copy); grid.append(empty); return;
    }
    visible.forEach(product => {
      const card = document.createElement("article");
      card.className = "step-card product-card product-" + product.id;
      const art = document.createElement("img"); art.className = "product-art-image" + (product.category === "Coins" ? " coin-pack-art" : ""); art.src = product.art || ("./assets/ranks/" + product.id + ".svg"); art.alt = product.name + (product.category === "Coins" ? " coin pack artwork" : " emblem"); art.loading = "lazy"; art.addEventListener("error", () => { art.hidden = true; }, {once:true});
      const tier = document.createElement("span"); tier.className = "product-tier"; tier.textContent = product.category === "Coins" ? "COIN PACK" : product.specialOffer ? "LIMITED OFFER" : (product.server || "network").toUpperCase() + " · " + product.category.toUpperCase();
      const eyebrow = document.createElement("p"); eyebrow.className = "eyebrow"; eyebrow.textContent = labels[activeCategory];
      const name = document.createElement("h3"); name.textContent = product.name;
      const desc = document.createElement("p"); desc.textContent = product.description || "";
      const price = document.createElement("p"); price.className = "product-price"; price.textContent = coinsFormat.format(product.coins)+" Coins · "+inr.format(product.price);
      card.append(tier,art,eyebrow,name,desc,price);
      if (product.duration) { const duration=document.createElement("p"); duration.className="product-meta"; duration.textContent="Duration: "+product.duration; card.append(duration); }
      const actions = document.createElement("div"); actions.className = "product-actions";
      const details = document.createElement("button"); details.type = "button"; details.className = "server-tab details-button"; details.textContent = "View details";
      details.addEventListener("click", () => renderProductDetails(product));
      const add = document.createElement("button");
      add.className="server-tab active add-to-cart"; add.type="button"; add.textContent="Add to cart";
      add.addEventListener("click", () => {
        cart.push({id:product.id,name:product.name,server:product.server,price:product.price,coins:product.coins});
        saveCart(); updateCart(); flyToCart(card);
      });
      const viewCart = document.createElement("button");
      viewCart.className="server-tab view-cart-button"; viewCart.type="button"; viewCart.textContent="View your cart";
      viewCart.hidden = cart.length === 0;
      viewCart.addEventListener("click", () => {
        updateCart();
        if (cartDialog && !cartDialog.open) cartDialog.showModal();
      });
      actions.append(details, add, viewCart); card.append(actions); grid.append(card);
    });
  }
  if (categoryTabs) {
    categoryTabs.addEventListener("click", event => {
      const button = event.target.closest("[data-category]");
      if (!button) return;
      activeCategory = button.dataset.category;
      categoryTabs.querySelectorAll("[data-category]").forEach(option => {
        const active = option === button;
        option.classList.toggle("active", active);
        option.setAttribute("aria-pressed", String(active));
      });
      renderProducts();
    });
  }
  if (coinInput) coinInput.addEventListener("input",updateCalculator);
  document.querySelectorAll(".store-copy-ip[data-copy]").forEach(button => {
    button.addEventListener("click", async () => {
      const original = button.textContent;
      try {
        await navigator.clipboard.writeText(button.dataset.copy);
        button.textContent = "COPIED";
        window.setTimeout(() => { button.textContent = original; }, 1600);
      } catch (_) {
        button.textContent = button.dataset.copy;
        window.setTimeout(() => { button.textContent = original; }, 2600);
      }
    });
  });
  const copyIp=document.getElementById("copy-server-ip");
  if(copyIp) copyIp.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(SERVER_HOST);copyIp.classList.add("copied");copyIp.querySelector("small").textContent="IP COPIED!";window.setTimeout(()=>{copyIp.classList.remove("copied");copyIp.querySelector("small").textContent="BEDROCK PORT: 19135 · TAP TO COPY";},1800);}catch(_){copyIp.querySelector("small").textContent=SERVER_HOST+":"+BEDROCK_PORT;}});
  if (cartButton && cartDialog) cartButton.addEventListener("click",()=>cartDialog.showModal());
  const close=document.getElementById("close-cart");
  if (close && cartDialog) close.addEventListener("click",()=>cartDialog.close());
  if (cartDialog) cartDialog.addEventListener("click",event=>{if(event.target===cartDialog)cartDialog.close();});
  const backToTop=document.getElementById("back-to-top");
  if(backToTop){
    const syncBackToTop=()=>backToTop.classList.toggle("is-visible",window.scrollY>320);
    window.addEventListener("scroll",syncBackToTop,{passive:true});
    syncBackToTop();
    backToTop.addEventListener("click",()=>window.scrollTo({top:0,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"}));
  }
  const gameSlides=document.getElementById("game-slides");
  if(gameSlides){
    const progress=document.getElementById("game-slide-progress");
    const cards=Array.from(gameSlides.querySelectorAll(".game-slide"));
    const updateGameProgress=()=>{
      if(!progress || !cards.length) return;
      const index=Math.min(cards.length-1,Math.max(0,Math.round(gameSlides.scrollLeft/(cards[0].getBoundingClientRect().width+14))));
      progress.textContent=String(index+1).padStart(2,"0")+" / "+String(cards.length).padStart(2,"0");
    };
    document.querySelectorAll("[data-game-direction]").forEach(button=>button.addEventListener("click",()=>{
      const first=cards[0]; if(!first) return;
      const distance=first.getBoundingClientRect().width+14;
      gameSlides.scrollBy({left:Number(button.dataset.gameDirection)*distance,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
    }));
    gameSlides.addEventListener("scroll",updateGameProgress,{passive:true});
    updateGameProgress();
  }
  const year=document.getElementById("year");
  if(year) year.textContent=String(new Date().getFullYear());
  updateCalculator(); updateCart(); renderProducts();
  updateServerStatus();
  if(document.getElementById("server-status-text")) window.setInterval(updateServerStatus,120000);
})();