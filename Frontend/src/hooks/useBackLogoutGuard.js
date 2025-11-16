import { useEffect } from "react";

const DEFAULT_MESSAGE = "Are you sure you want to logout?";

const useBackLogoutGuard = (navigate, options = {}) => {
  const { confirmMessage = DEFAULT_MESSAGE, enabled = true } = options;

  useEffect(() => {
    if (typeof navigate !== "function" || !enabled) {
      return;
    }

    let removePopup = null;

    const closePopup = () => {
      if (typeof removePopup === "function") {
        removePopup();
        removePopup = null;
      }
    };

    const pushGuardState = () => {
      try {
        const url = `${window.location.pathname}${window.location.search}`;
        window.history.pushState({ guard: true }, "", url);
      } catch (err) {
        console.error("Failed to push history state for logout guard", err);
      }
    };

    const showPopup = () => {
      if (removePopup) {
        return;
      }

      const overlay = document.createElement("div");
      overlay.setAttribute("role", "dialog");
      overlay.setAttribute("aria-modal", "true");
      overlay.style.cssText =
        "position:fixed;inset:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;z-index:9999;padding:1rem";

      const card = document.createElement("div");
      card.style.cssText =
        "width:100%;max-width:360px;background:#fff;border-radius:16px;box-shadow:0 20px 40px rgba(15,23,42,0.15);padding:24px;font-family:inherit";

      const title = document.createElement("h3");
      title.textContent = "Confirm Logout";
      title.style.cssText = "margin-bottom:8px;font-size:1.1rem;font-weight:600;color:#0f172a";

      const message = document.createElement("p");
      message.textContent = confirmMessage;
      message.style.cssText = "margin-bottom:20px;font-size:0.95rem;color:#475569";

      const buttonRow = document.createElement("div");
      buttonRow.style.cssText = "display:flex;gap:12px;justify-content:flex-end";

      const cancelButton = document.createElement("button");
      cancelButton.type = "button";
      cancelButton.textContent = "Stay";
      cancelButton.style.cssText =
        "flex:1;padding:10px 0;border:1px solid #e2e8f0;border-radius:10px;background:#fff;color:#1e293b;font-weight:600;cursor:pointer";

      const confirmButton = document.createElement("button");
      confirmButton.type = "button";
      confirmButton.textContent = "Logout";
      confirmButton.style.cssText =
        "flex:1;padding:10px 0;border:none;border-radius:10px;background:#dc2626;color:#fff;font-weight:700;cursor:pointer";

      cancelButton.addEventListener("click", () => {
        closePopup();
      });

      confirmButton.addEventListener("click", () => {
        closePopup();
        localStorage.removeItem("ccms_token");
        localStorage.removeItem("ccms_user");
        window.removeEventListener("popstate", handlePopState);
        navigate("/login", { replace: true });
      });

      buttonRow.appendChild(cancelButton);
      buttonRow.appendChild(confirmButton);

      card.appendChild(title);
      card.appendChild(message);
      card.appendChild(buttonRow);

      overlay.appendChild(card);
      document.body.appendChild(overlay);

      removePopup = () => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      };
    };

    const handlePopState = (event) => {
      if (!event?.state?.guard) {
        return;
      }
      pushGuardState();
      showPopup();
    };

    pushGuardState();
    window.addEventListener("popstate", handlePopState);

    return () => {
      closePopup();
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate, confirmMessage, enabled]);
};

export default useBackLogoutGuard;
