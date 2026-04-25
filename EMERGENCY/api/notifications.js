/**
 * Show a native notification (for desktop/PWA)
 */
export function showNotification(title, options = {}) {
  if (localStorage.getItem("pushNotif") === "false") {
    return;
  }

  if (!("Notification" in window)) {
    console.warn("Notifications are not supported by this browser");
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(title, {
      icon: "/assets/emergency-icon.png",
      badge: "/assets/badge.png",
      ...options,
    });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification(title, options);
      }
    });
  }
}

function playAlertTone() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return;
  }

  const ctx = new AudioContextClass();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = 880;
  gain.gain.value = 0.08;

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.12);
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    return { success: false, error: "Notifications not supported" };
  }

  if (Notification.permission === "granted") {
    return { success: true, permission: "granted" };
  }

  try {
    const permission = await Notification.requestPermission();
    return { success: true, permission };
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Show a toast-style notification
 */
export function showToast(message, type = "info", duration = 3000) {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 20px;
    background: ${type === "success" ? "#4caf50" : type === "error" ? "#f44336" : "#2196f3"};
    color: white;
    border-radius: 4px;
    z-index: 10000;
    font-size: 14px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  `;

  document.body.appendChild(toast);

  if (localStorage.getItem("soundAlerts") !== "false") {
    try {
      playAlertTone();
    } catch {
      // Ignore audio errors silently because some environments block autoplay.
    }
  }

  if (localStorage.getItem("vibration") !== "false" && navigator.vibrate) {
    if (type === "error") {
      navigator.vibrate([80, 40, 80]);
    } else {
      navigator.vibrate(80);
    }
  }

  setTimeout(() => {
    toast.remove();
  }, duration);
}

/**
 * Show alert modal for critical incidents
 */
export function showAlertModal(title, message, onConfirm, onCancel) {
  const modal = document.createElement("div");
  modal.className = "alert-modal";
  modal.innerHTML = `
    <div class="alert-modal-content">
      <h2>${title}</h2>
      <p>${message}</p>
      <div class="alert-modal-buttons">
        <button class="btn-cancel">Cancel</button>
        <button class="btn-confirm">Confirm</button>
      </div>
    </div>
  `;

  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10001;
  `;

  const content = modal.querySelector(".alert-modal-content");
  content.style.cssText = `
    background: white;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    max-width: 300px;
  `;

  content.querySelector("h2").style.cssText =
    "margin: 0 0 10px; color: #2e793e;";
  content.querySelector("p").style.cssText = "margin: 0 0 20px; color: #555;";

  const buttonsDiv = content.querySelector(".alert-modal-buttons");
  buttonsDiv.style.cssText =
    "display: flex; gap: 10px; justify-content: center;";

  const cancelBtn = buttonsDiv.querySelector(".btn-cancel");
  const confirmBtn = buttonsDiv.querySelector(".btn-confirm");

  [cancelBtn, confirmBtn].forEach((btn) => {
    btn.style.cssText = `
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    `;
  });

  cancelBtn.style.background = "#ddd";
  cancelBtn.style.color = "#333";
  confirmBtn.style.background = "#a83232";
  confirmBtn.style.color = "white";

  cancelBtn.addEventListener("click", () => {
    modal.remove();
    if (onCancel) onCancel();
  });

  confirmBtn.addEventListener("click", () => {
    modal.remove();
    if (onConfirm) onConfirm();
  });

  document.body.appendChild(modal);
}
