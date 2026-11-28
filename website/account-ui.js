(() => {
  const splash = document.getElementById("ms-intro");
  if (splash) {
    // Replay the three-second intro on every page load / reload.
    window.setTimeout(() => {
      splash.classList.add("is-leaving");
      window.setTimeout(() => splash.remove(), 650);
    }, 2350);
  }

  const dialog = document.getElementById("player-login-dialog");
  const open = document.getElementById("open-player-login");
  const close = document.getElementById("close-player-login");
  const discord = document.getElementById("discord-login-start");
  const logout = document.getElementById("discord-logout");
  const minecraftForm = document.getElementById("minecraft-link-form");
  const status = document.getElementById("login-setup-status");
  const defaultAccountLabel = "PLAYER LOGIN";
  const showStatus = (message) => {
    if (!status) return;
    status.textContent = message;
    status.hidden = false;
  };

  if (open && dialog) open.addEventListener("click", () => dialog.showModal());
  if (close && dialog) close.addEventListener("click", () => dialog.close());
  if (discord) discord.addEventListener("click", () => { window.location.href = "/api/auth/discord/start"; });

  const refreshDiscordSession = async () => {
    try {
      const response = await fetch("/api/auth/me", { credentials: "same-origin", cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      if (data.authenticated && data.user) {
        const label = data.user.globalName || data.user.username;
        if (open) open.textContent = "MY ACCOUNT";
        if (discord) {
          discord.querySelector("strong").textContent = "Connected: " + label;
          discord.querySelector("small").textContent = "Your Discord account is linked";
          discord.disabled = true;
        }
        if (logout) logout.hidden = false;
        showStatus("Signed in with Discord as " + label + ".");
      } else if (open) {
        open.textContent = defaultAccountLabel;
      }
    } catch (_) {
      // Login UI remains usable if the auth service is not deployed yet.
    }
  };
  refreshDiscordSession();

  if (logout) logout.addEventListener("click", async () => {
    logout.disabled = true;
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" }
      });
      if (!response.ok) throw new Error("Logout failed");
      if (discord) {
        discord.querySelector("strong").textContent = "Continue with Discord";
        discord.querySelector("small").textContent = "Secure Discord account sign-in";
        discord.disabled = false;
      }
      if (open) open.textContent = defaultAccountLabel;
      logout.hidden = true;
      showStatus("You have been signed out of Discord.");
    } catch (_) {
      showStatus("Could not sign out right now. Please try again.");
    } finally {
      logout.disabled = false;
    }
  });

  if (minecraftForm) minecraftForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const username = document.getElementById("minecraft-link-username")?.value.trim();
    if (!username) return;
    showStatus("Minecraft account linking is not active yet. It will use a one-time code confirmed inside the MortalShade server. No Minecraft or Microsoft password is needed.");
  });
})();
