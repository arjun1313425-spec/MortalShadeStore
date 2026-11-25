(()=> {
  const KEY = "mortalshade-age-confirmed-v1";
  const MAX_AGE_CONFIRM_AGE_MS = 30 * 24 * 60 * 60 * 1000;
  try {
    const saved = Number(localStorage.getItem(KEY) || 0);
    if (saved && Date.now() - saved < MAX_AGE_CONFIRM_AGE_MS) return;
  } catch (_) {}
  const style = document.createElement("style");
  style.textContent = `
    .age-gate{position:fixed;inset:0;z-index:100000;display:grid;place-items:center;padding:22px;background:rgba(5,4,10,.88);backdrop-filter:blur(16px)}
    .age-gate-card{width:min(460px,100%);padding:30px;border:1px solid #7554a0;border-radius:20px;background:radial-gradient(ellipse at 50% 0,#30203f 0,transparent 62%),#13101d;color:#f8f5ff;box-shadow:0 30px 100px #000b}
    .age-gate-kicker{color:#c5a2ff;font:10px/1.5 Monocraft,monospace;letter-spacing:.16em}
    .age-gate h2{margin:16px 0 10px;font:22px/1.45 Monocraft,monospace}
    .age-gate p{color:#bdb4cb;font:14px/1.75 Inter,system-ui,sans-serif}
    .age-gate-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:22px}
    .age-gate button{min-height:48px;border-radius:10px;border:1px solid #624a7d;background:#21192e;color:#eee6ff;font:11px Monocraft,monospace;cursor:pointer}
    .age-gate button.primary{border-color:#a77be5;background:linear-gradient(110deg,#7045b5,#9859c6)}
    .age-gate small{display:block;margin-top:16px;color:#8f879d;font:11px/1.6 Inter,system-ui,sans-serif}
    @media(max-width:420px){.age-gate-card{padding:22px}.age-gate h2{font-size:18px}.age-gate-actions{grid-template-columns:1fr}}
  `;
  document.head.append(style);
  const gate=document.createElement("div");
  gate.className="age-gate";
  gate.setAttribute("role","dialog");
  gate.setAttribute("aria-modal","true");
  gate.setAttribute("aria-labelledby","age-gate-title");
  gate.innerHTML=`
    <section class="age-gate-card">
      <span class="age-gate-kicker">MORTALSHADE NETWORK · AGE CHECK</span>
      <h2 id="age-gate-title">Before you enter</h2>
      <p>This store is intended for adults aged 18 or older. Please confirm your age to continue. We do not ask for or store your date of birth.</p>
      <div class="age-gate-actions">
        <button type="button" class="primary" data-age-yes>I AM 18 OR OLDER</button>
        <button type="button" data-age-no>I AM UNDER 18</button>
      </div>
      <small>By continuing, you confirm that the information is accurate. This is a self-declared age gate, not identity or document verification.</small>
    </section>`;
  document.body.append(gate);
  gate.querySelector("[data-age-yes]").addEventListener("click",()=>{
    try{localStorage.setItem(KEY,String(Date.now()));}catch(_){}
    gate.remove();style.remove();
  });
  gate.querySelector("[data-age-no]").addEventListener("click",()=>{
    const card=gate.querySelector(".age-gate-card");
    card.innerHTML='<span class="age-gate-kicker">ACCESS RESTRICTED</span><h2>You cannot continue</h2><p>You must be at least 18 to use this store. Please close this page.</p>';
  });
})();