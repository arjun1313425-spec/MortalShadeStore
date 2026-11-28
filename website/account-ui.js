(() => {
  const splash = document.getElementById("ms-intro");
  if (splash) {
    let alreadyShown = false;
    try { alreadyShown = sessionStorage.getItem("ms-intro-seen") === "1"; } catch (_) {}
    const hide = () => {
      if (alreadyShown) { splash.remove(); return; }
      splash.classList.add("is-leaving");
      window.setTimeout(() => splash.remove(), 650);
      try { sessionStorage.setItem("ms-intro-seen", "1"); } catch (_) {}
    };
    if (alreadyShown) splash.remove();
    else if (document.readyState === "complete") window.setTimeout(hide, 1050);
    else {
      window.addEventListener("load", () => window.setTimeout(hide, 650), { once: true });
      window.setTimeout(hide, 2600);
    }
  }

  const dialog = document.getElementById("player-login-dialog");
  const open = document.getElementById("open-player-login");
  const close = document.getElementById("close-player-login");
  const discord = document.getElementById("discord-login-start");
  const minecraftForm = document.getElementById("minecraft-link-form");
  const status = document.getElementById("login-setup-status");
  const showStatus = (message) => {
    if (!status) return;
    status.textContent = message;
    status.hidden = false;
  };
  if (open && dialog) open.addEventListener("click", () => dialog.showModal());
  if (close && dialog) close.addEventListener("click", () => dialog.close());
  if (discord) discord.addEventListener("click", () => showStatus("Discord sign-in is not connected yet. It needs a MortalShade Discord application and a secure Cloudflare Worker OAuth callback."));
  if (minecraftForm) minecraftForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = document.getElementById("minecraft-link-username")?.value.trim();
    if (!username) return;
    showStatus("Account linking is not active yet. The secure setup will issue a one-time code for you to confirm inside the MortalShade server. No Minecraft or Microsoft password is needed.");
  });
})();