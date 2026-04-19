// --- STATE & CONFIG ---
let state = {
  name: "User",
  avatar: "🧙",
  classType: null,
  level: 1,
  xp: 0,
  nextXp: 100,
  burnout: 0,
  gold: 0,
  skillPoints: 0,
  streak: 0,
  lastLogin: Date.now(),
  skills: { flow: false, merchant: false, recovery: false },
  dailyQuests: [],
  customQuests: [],
  lastDailyQuestDate: null,
  // History tracking
  history: {
    totalQuests: 0,
    totalXp: 0,
    totalGold: 0,
    totalLevels: 0,
    dailyXp: [0, 0, 0, 0, 0, 0, 0],
    dailyQuests: [0, 0, 0, 0, 0, 0, 0],
    dailyGold: [0, 0, 0, 0, 0, 0, 0],
    lastActivityDate: null,
  },
};

// Common life tasks for daily quests
const commonLifeQuests = [
  { text: "Drink 8 glasses of water 💧", xp: 10, type: "daily" },
  { text: "Exercise for 30 minutes 🏃", xp: 20, type: "daily" },
  { text: "Read for 20 minutes 📖", xp: 15, type: "daily" },
  { text: "Meditate for 10 minutes 🧘", xp: 10, type: "daily" },
  { text: "Get 8 hours of sleep 😴", xp: 15, type: "daily" },
  { text: "Eat a healthy breakfast 🥗", xp: 10, type: "daily" },
  { text: "Take a 15-minute walk 🚶", xp: 10, type: "daily" },
  { text: "No social media for 4 hours 📵", xp: 25, type: "daily" },
  { text: "Complete a coding task 💻", xp: 30, type: "daily" },
  { text: "Call a family member 📞", xp: 15, type: "daily" },
  { text: "Practice a musical instrument 🎸", xp: 20, type: "daily" },
  { text: "Write in a journal ✍️", xp: 10, type: "daily" },
  { text: "Do laundry 🧺", xp: 15, type: "daily" },
  { text: "Clean your room 🧹", xp: 15, type: "daily" },
  { text: "Cook a meal 🍳", xp: 20, type: "daily" },
];

// Generate 3 random daily quests
function generateDailyQuests() {
  const today = new Date().toDateString();

  // If it's a new day or no daily quests exist, generate new ones
  if (state.lastDailyQuestDate !== today || state.dailyQuests.length === 0) {
    state.dailyQuests = getRandomDailyQuests();
    state.lastDailyQuestDate = today;
  }
}

// Get random daily quests
function getRandomDailyQuests() {
  const shuffled = [...commonLifeQuests].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3).map((q, index) => ({
    id: Date.now() + index,
    text: q.text,
    xp: q.xp,
    type: "daily",
    completed: false,
  }));
}

// Refresh daily quests (for testing)
function refreshDailyQuests() {
  if (confirm("Refresh daily quests? Current progress will be reset.")) {
    state.dailyQuests = getRandomDailyQuests();
    save();
    renderDailyQuests();
  }
}

// --- INIT ---
window.onload = () => {
  // Load data from LocalStorage
  if (localStorage.getItem("lq_pro_save")) {
    state = JSON.parse(localStorage.getItem("lq_pro_save"));
    document.getElementById("onboarding-modal").classList.remove("active");

    // Generate daily quests if not exist (for old saves)
    if (!state.dailyQuests || state.dailyQuests.length === 0) {
      generateDailyQuests();
    }
    // Initialize customQuests if not exist (for old saves)
    if (!state.customQuests) {
      state.customQuests = [];
    }
    // Migrate old quests to customQuests if they exist
    if (state.quests && state.quests.length > 0) {
      state.customQuests = [...state.customQuests, ...state.quests];
      state.quests = [];
    }
  } else {
    // New user - generate daily quests
    generateDailyQuests();
  }

  // Streak Logic
  const today = new Date().toDateString();
  const last = new Date(state.lastLogin).toDateString();
  if (today !== last) {
    // If logged in within 48 hours, keep streak, otherwise reset
    state.streak =
      Date.now() - state.lastLogin < 172800000 ? state.streak + 1 : 1;
    state.lastLogin = Date.now();
    // Generate new daily quests for new day
    generateDailyQuests();
    alert(`🔥 Daily Streak! You are on a ${state.streak} day streak.`);
  }

  updateUI();
  renderDailyQuests();
  renderCustomQuests();
  updateHamburgerVisibility();
};

// Handle window resize for hamburger visibility
window.addEventListener("resize", updateHamburgerVisibility);

function save() {
  localStorage.setItem("lq_pro_save", JSON.stringify(state));
  updateUI();
}

// --- ACTIONS ---
function selectClass(className) {
  // Get username from input
  const usernameInput = document.getElementById("username-input").value;
  state.name = usernameInput.trim() || "Hero";

  // Get selected avatar
  const selectedAvatar = document.querySelector(".avatar-btn.selected");
  state.avatar = selectedAvatar ? selectedAvatar.dataset.avatar : "🧙";

  state.classType = className;
  state.gold = 50; // Starter Bonus
  document.getElementById("onboarding-modal").classList.remove("active");
  save();
  updateHamburgerVisibility();
}

function selectAvatar(btn) {
  // Remove selected class from all avatar buttons
  document
    .querySelectorAll(".avatar-btn")
    .forEach((b) => b.classList.remove("selected"));
  // Add selected class to clicked button
  btn.classList.add("selected");
}

function logout() {
  if (
    confirm("Are you sure you want to logout? Your progress will be saved.")
  ) {
    // Clear localStorage to allow fresh login
    localStorage.removeItem("lq_pro_save");
    // Reset state to default
    state = {
      name: "User",
      avatar: "🧙",
      classType: null,
      level: 1,
      xp: 0,
      nextXp: 100,
      burnout: 0,
      gold: 0,
      skillPoints: 0,
      streak: 0,
      lastLogin: Date.now(),
      skills: { flow: false, merchant: false, recovery: false },
      quests: [],
    };
    // Reset username input
    document.getElementById("username-input").value = "";
    // Reset avatar selection
    document
      .querySelectorAll(".avatar-btn")
      .forEach((b) => b.classList.remove("selected"));
    document
      .querySelector('.avatar-btn[data-avatar="🧙"]')
      .classList.add("selected");
    // Reload the page to start fresh
    location.reload();
  }
}

function switchTab(tabId, event) {
  // Hide all tabs
  const tabs = ["dashboard", "skills", "shop", "history"];
  tabs.forEach((id) => {
    const tabElement = document.getElementById("tab-" + id);
    if (tabElement) tabElement.style.display = "none";
  });

  // Show selected tab
  const selectedTab = document.getElementById("tab-" + tabId);
  if (selectedTab) {
    selectedTab.style.display = "block";
    // Scroll to top of main view
    document.querySelector(".main-view").scrollTop = 0;
  }

  // Update Sidebar active state
  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));

  if (event && event.currentTarget) {
    event.currentTarget.classList.add("active");
  }

  // Close mobile sidebar when switching tabs
  if (window.innerWidth <= 768) {
    closeMobileSidebar();
  }
}

function addTask() {
  // This function now completes daily quests
  // For daily quests, we just mark them as complete
}

function addCustomQuest() {
  const txt = document.getElementById("custom-task-input").value;
  const diff = document.getElementById("custom-task-diff").value;
  if (!txt) return;

  let xpVal = diff === "easy" ? 10 : diff === "med" ? 50 : 100;

  // Class Bonus: Scholars get 20% more XP
  if (state.classType === "Scholar") xpVal = Math.floor(xpVal * 1.2);

  state.customQuests.push({
    id: Date.now(),
    text: txt,
    xp: xpVal,
    type: diff,
  });

  // Burnout Logic (Skill check)
  let burnAdd = 5;
  if (state.skills.flow) burnAdd = 3;
  state.burnout = Math.min(100, state.burnout + burnAdd);

  document.getElementById("custom-task-input").value = "";
  save();
  renderCustomQuests();
}

// History tracking helper
function updateHistory(xpEarned, goldEarned) {
  // Initialize history if not exist
  if (!state.history) {
    state.history = {
      totalQuests: 0,
      totalXp: 0,
      totalGold: 0,
      totalLevels: 0,
      dailyXp: [0, 0, 0, 0, 0, 0, 0],
      dailyQuests: [0, 0, 0, 0, 0, 0, 0],
      dailyGold: [0, 0, 0, 0, 0, 0, 0],
      lastActivityDate: null,
    };
  }

  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday

  // Reset daily arrays if new day
  if (state.history.lastActivityDate !== today.toDateString()) {
    state.history.dailyXp = [0, 0, 0, 0, 0, 0, 0];
    state.history.dailyQuests = [0, 0, 0, 0, 0, 0, 0];
    state.history.dailyGold = [0, 0, 0, 0, 0, 0, 0];
    state.history.lastActivityDate = today.toDateString();
  }

  // Update totals
  state.history.totalQuests++;
  state.history.totalXp += xpEarned;
  state.history.totalGold += goldEarned;

  // Update daily (use dayOfWeek index)
  state.history.dailyXp[dayOfWeek] += xpEarned;
  state.history.dailyQuests[dayOfWeek]++;
  state.history.dailyGold[dayOfWeek] += goldEarned;
}

function completeDailyQuest(id) {
  const idx = state.dailyQuests.findIndex((q) => q.id === id);
  if (idx === -1) return;
  const q = state.dailyQuests[idx];

  if (q.completed) return; // Already completed

  // XP & Gold Calculation
  let gainXp = q.xp;
  let gainGold = Math.floor(q.xp * 0.5);

  // Freelancer Bonus: 50% more gold
  if (state.classType === "Freelancer") gainGold = Math.floor(gainGold * 1.5);

  // Burnout Penalty: If burnout is high, XP is cut
  if (state.burnout >= 80) {
    gainXp = Math.floor(gainXp * 0.4);
    alert("⚠️ Burnout is high! XP significantly reduced.");
  }

  state.xp += gainXp;
  state.gold += gainGold;

  // Update history
  updateHistory(gainXp, gainGold);

  // Mark as completed
  q.completed = true;

  // Reduce Burnout
  let burnHeal = 10;
  if (state.skills.recovery) burnHeal = 20;
  state.burnout = Math.max(0, state.burnout - burnHeal);

  // Level Up Check
  if (state.xp >= state.nextXp) {
    state.level++;
    state.xp -= state.nextXp;
    state.nextXp = Math.floor(state.nextXp * 1.4);
    state.skillPoints++;

    document.getElementById("new-level-num").innerText = state.level;
    document.getElementById("levelup-modal").classList.add("active");
  }

  save();
  renderDailyQuests();
}

function completeCustomQuest(id) {
  const idx = state.customQuests.findIndex((q) => q.id === id);
  if (idx === -1) return;
  const q = state.customQuests[idx];

  // XP & Gold Calculation
  let gainXp = q.xp;
  let gainGold = Math.floor(q.xp * 0.5);

  // Freelancer Bonus: 50% more gold
  if (state.classType === "Freelancer") gainGold = Math.floor(gainGold * 1.5);

  // Burnout Penalty: If burnout is high, XP is cut
  if (state.burnout >= 80) {
    gainXp = Math.floor(gainXp * 0.4);
    alert("⚠️ Burnout is high! XP significantly reduced.");
  }

  state.xp += gainXp;
  state.gold += gainGold;

  // Update history
  updateHistory(gainXp, gainGold);

  // Reduce Burnout
  let burnHeal = 10;
  if (state.skills.recovery) burnHeal = 20;
  state.burnout = Math.max(0, state.burnout - burnHeal);

  // Level Up Check
  if (state.xp >= state.nextXp) {
    state.level++;
    state.xp -= state.nextXp;
    state.nextXp = Math.floor(state.nextXp * 1.4);
    state.skillPoints++;

    document.getElementById("new-level-num").innerText = state.level;
    document.getElementById("levelup-modal").classList.add("active");
  }

  state.customQuests.splice(idx, 1);
  save();
  renderCustomQuests();
}

function completeQuest(id) {
  // Legacy function - redirect to custom quest completion
  completeCustomQuest(id);
}

function completeQuest(id) {
  const idx = state.quests.findIndex((q) => q.id === id);
  if (idx === -1) return;
  const q = state.quests[idx];

  // XP & Gold Calculation
  let gainXp = q.xp;
  let gainGold = Math.floor(q.xp * 0.5);

  // Freelancer Bonus: 50% more gold
  if (state.classType === "Freelancer") gainGold = Math.floor(gainGold * 1.5);

  // Burnout Penalty: If burnout is high, XP is cut by 60%
  if (state.burnout >= 80) {
    gainXp = Math.floor(gainXp * 0.4);
    alert("⚠️ Burnout is high! XP significantly reduced.");
  }

  state.xp += gainXp;
  state.gold += gainGold;

  // Reduce Burnout based on task completion
  let burnHeal = 10;
  if (state.skills.recovery) burnHeal = 20;

  if (q.type === "boss")
    state.burnout = Math.min(100, state.burnout + 20); // Bosses tire you out
  else state.burnout = Math.max(0, state.burnout - burnHeal);

  // Level Up Check
  if (state.xp >= state.nextXp) {
    state.level++;
    state.xp -= state.nextXp;
    state.nextXp = Math.floor(state.nextXp * 1.4);
    state.skillPoints++;

    document.getElementById("new-level-num").innerText = state.level;
    document.getElementById("levelup-modal").classList.add("active");
  }

  state.quests.splice(idx, 1);
  save();
  renderQuests();
}

function unlockSkill(key, cost) {
  if (state.skills[key]) return alert("Already unlocked!");
  if (state.skillPoints < cost) return alert("Not enough Skill Points!");

  state.skillPoints -= cost;
  state.skills[key] = true;
  save();
}

function buyReward(cost) {
  // Master Merchant Skill: 20% discount
  let realCost = cost;
  if (state.skills.merchant) realCost = Math.floor(cost * 0.8);

  if (state.gold >= realCost) {
    state.gold -= realCost;
    alert("Reward Purchased! Enjoy.");
    // Meditation reward clears burnout
    if (cost === 100) state.burnout = Math.max(0, state.burnout - 50);
    save();
  } else {
    alert("Not enough Gold.");
  }
}

function closeModal(id) {
  document.getElementById(id).classList.remove("active");
}

// --- MOBILE SIDEBAR FUNCTIONS ---
function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const hamburger = document.querySelector(".hamburger-menu");

  // Don't toggle if onboarding modal is active
  const onboardingModal = document.getElementById("onboarding-modal");
  if (onboardingModal && onboardingModal.classList.contains("active")) {
    return;
  }

  if (window.innerWidth <= 768) {
    if (sidebar.classList.contains("mobile-open")) {
      sidebar.classList.remove("mobile-open");
      hamburger.classList.remove("active");
      // Remove overlay
      const overlay = document.getElementById("sidebar-overlay");
      if (overlay) overlay.remove();
    } else {
      sidebar.classList.add("mobile-open");
      hamburger.classList.add("active");
      // Create overlay
      createOverlay();
    }
  }
}

function closeMobileSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const hamburger = document.querySelector(".hamburger-menu");
  sidebar.classList.remove("mobile-open");
  hamburger.classList.remove("active");
  // Remove overlay
  const overlay = document.getElementById("sidebar-overlay");
  if (overlay) overlay.remove();
}

function createOverlay() {
  const overlay = document.createElement("div");
  overlay.id = "sidebar-overlay";
  overlay.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;z-index:999;background:rgba(0,0,0,0.5);";
  overlay.onclick = closeMobileSidebar;
  document.body.appendChild(overlay);
}

function updateHamburgerVisibility() {
  const hamburger = document.querySelector(".hamburger-menu");
  const onboardingModal = document.getElementById("onboarding-modal");
  if (hamburger) {
    // Hide hamburger when onboarding modal is active
    if (onboardingModal && onboardingModal.classList.contains("active")) {
      hamburger.style.display = "none";
    } else if (window.innerWidth <= 768) {
      hamburger.style.display = "flex";
    } else {
      hamburger.style.display = "none";
    }
  }
}

// --- RENDER ---
function updateUI() {
  // Update Dashboard Header - User Profile
  document.getElementById("dash-avatar").innerText = state.avatar || "🧙";
  document.getElementById("dash-username").innerText = state.name || "Hero";
  document.getElementById("dash-class").innerText = state.classType || "Novice";
  document.getElementById("dash-level").innerText = state.level;

  // Update Dashboard Header - Resources (Gold & SP)
  document.getElementById("dash-gold").innerText = state.gold;
  document.getElementById("dash-sp").innerText = state.skillPoints;

  // Update Shop Gold Display
  const shopGold = document.getElementById("shop-gold");
  if (shopGold) shopGold.innerText = state.gold;

  // Update Sidebar User Info
  const sidebarAvatar = document.getElementById("sidebar-avatar");
  const sidebarUsername = document.getElementById("sidebar-username");
  if (sidebarAvatar) sidebarAvatar.innerText = state.avatar || "🧙";
  if (sidebarUsername) sidebarUsername.innerText = state.name || "Hero";

  // XP Progress Bar
  const xpPct = (state.xp / state.nextXp) * 100;
  document.getElementById("dash-xp-bar").style.width = xpPct + "%";
  document.getElementById("dash-xp-current").innerText = state.xp;
  document.getElementById("dash-xp-next").innerText = state.nextXp;

  // Streak
  document.getElementById("dash-streak").innerText = state.streak;
  document.getElementById("streak-disp").innerText = state.streak + " 🔥";

  // Burnout Bar
  const burnBar = document.getElementById("dash-burnout-bar");
  const burnMsg = document.getElementById("dash-burnout-msg");
  burnBar.style.width = state.burnout + "%";

  if (state.burnout < 50) {
    burnBar.style.background = "var(--success)";
    burnMsg.innerText = "Optimal State";
    burnMsg.style.color = "var(--success)";
  } else if (state.burnout < 80) {
    burnBar.style.background = "var(--gold)";
    burnMsg.innerText = "Caution: Fatigue Setting In";
    burnMsg.style.color = "var(--gold)";
  } else {
    burnBar.style.background = "var(--danger)";
    burnMsg.innerText = "CRITICAL: XP PENALTY ACTIVE";
    burnMsg.style.color = "var(--danger)";
  }

  // Skills Visuals
  for (const [key, unlocked] of Object.entries(state.skills)) {
    const node = document.getElementById("skill-" + key);
    if (node && unlocked) node.classList.add("unlocked");
  }

  // Render Upgrades Panel
  renderUpgrades();

  // Render History
  renderHistory();
}

function renderUpgrades() {
  const container = document.getElementById("my-upgrades-list");
  if (!container) return;

  container.innerHTML = "";

  // Skill definitions
  const skillInfo = {
    flow: { name: "Flow State", icon: "🧠", desc: "Burnout 20% slower" },
    merchant: {
      name: "Master Merchant",
      icon: "🤝",
      desc: "Shop 20% discount",
    },
    recovery: { name: "Quick Recovery", icon: "🛌", desc: "Rest 2x effective" },
  };

  // Get unlocked skills
  const unlockedSkills = Object.entries(state.skills).filter(
    ([key, unlocked]) => unlocked,
  );

  if (unlockedSkills.length === 0) {
    container.innerHTML =
      "<p class='no-upgrades'>No upgrades yet. Unlock skills below!</p>";
    return;
  }

  unlockedSkills.forEach(([key, unlocked]) => {
    const info = skillInfo[key];
    if (info) {
      const badge = document.createElement("div");
      badge.className = "upgrade-badge";
      badge.innerHTML = `<span>${info.icon}</span> <span>${info.name}</span>`;
      badge.title = info.desc;
      container.appendChild(badge);
    }
  });
}

function renderHistory() {
  // Initialize history if not exist
  if (!state.history) {
    state.history = {
      totalQuests: 0,
      totalXp: 0,
      totalGold: 0,
      totalLevels: 0,
      dailyXp: [0, 0, 0, 0, 0, 0, 0],
      dailyQuests: [0, 0, 0, 0, 0, 0, 0],
      dailyGold: [0, 0, 0, 0, 0, 0, 0],
      lastActivityDate: null,
    };
  }

  const h = state.history;
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date().getDay();

  // Get last 7 days in order
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    let dayIndex = (today - i + 7) % 7;
    last7Days.push(days[dayIndex]);
  }

  // Update stats
  const totalQuestsEl = document.getElementById("total-quests");
  const totalXpEl = document.getElementById("total-xp");
  const totalGoldEl = document.getElementById("total-gold");
  const currentLevelEl = document.getElementById("current-level");
  const totalLevelsEl = document.getElementById("total-levels");

  if (totalQuestsEl) totalQuestsEl.innerText = h.totalQuests;
  if (totalXpEl) totalXpEl.innerText = h.totalXp;
  if (totalGoldEl) totalGoldEl.innerText = h.totalGold;
  if (currentLevelEl) currentLevelEl.innerText = state.level;
  if (totalLevelsEl) totalLevelsEl.innerText = h.totalLevels;

  // Render XP Chart
  const xpChart = document.getElementById("xp-chart");
  const xpLabels = document.getElementById("xp-labels");
  if (xpChart && xpLabels) {
    const maxXp = Math.max(...h.dailyXp, 1);
    xpChart.innerHTML = h.dailyXp
      .map(
        (xp) =>
          `<div class="bar" style="height: ${(xp / maxXp) * 100}%"></div>`,
      )
      .join("");
    xpLabels.innerHTML = last7Days.map((d) => `<span>${d}</span>`).join("");
  }

  // Render Quest Chart
  const questChart = document.getElementById("quest-chart");
  const questLabels = document.getElementById("quest-labels");
  if (questChart && questLabels) {
    const maxQuests = Math.max(...h.dailyQuests, 1);
    questChart.innerHTML = h.dailyQuests
      .map(
        (q) =>
          `<div class="bar" style="height: ${(q / maxQuests) * 100}%"></div>`,
      )
      .join("");
    questLabels.innerHTML = last7Days.map((d) => `<span>${d}</span>`).join("");
  }

  // Render Gold Chart
  const goldChart = document.getElementById("gold-chart");
  const goldLabels = document.getElementById("gold-labels");
  if (goldChart && goldLabels) {
    const maxGold = Math.max(...h.dailyGold, 1);
    goldChart.innerHTML = h.dailyGold
      .map(
        (g) =>
          `<div class="bar" style="height: ${(g / maxGold) * 100}%"></div>`,
      )
      .join("");
    goldLabels.innerHTML = last7Days.map((d) => `<span>${d}</span>`).join("");
  }
}

function renderDailyQuests() {
  const container = document.getElementById("daily-quest-list");
  container.innerHTML = "";

  if (state.dailyQuests.length === 0) {
    container.innerHTML =
      "<p class='no-quests'>No daily quests available. Check back tomorrow!</p>";
    return;
  }

  state.dailyQuests.forEach((q) => {
    const div = document.createElement("div");
    const completedClass = q.completed ? "completed" : "";
    const icon = q.completed ? "✅" : "⭕";
    const buttonHtml = q.completed
      ? "<span class='completed-tag'>Completed</span>"
      : `<button class="btn-primary btn-small" onclick="completeDailyQuest(${q.id})">Done</button>`;

    div.className = `daily-quest-card ${completedClass}`;
    div.innerHTML = `
      <div class="quest-info">
        <span class="quest-icon">${icon}</span>
        <div>
          <strong>${q.text}</strong>
          <small class="quest-reward">+${q.xp} XP</small>
        </div>
      </div>
      ${buttonHtml}
    `;
    container.appendChild(div);
  });
}

function renderCustomQuests() {
  const container = document.getElementById("custom-quest-list");
  container.innerHTML = "";

  if (state.customQuests.length === 0) {
    container.innerHTML =
      "<p class='no-quests'>No custom quests yet. Create one above!</p>";
    return;
  }

  state.customQuests.forEach((q) => {
    const div = document.createElement("div");
    const hardClass = q.type === "hard" ? "quest-hard" : "";

    div.className = `custom-quest-card ${hardClass}`;
    div.innerHTML = `
      <div>
        <strong>${q.text}</strong>
        <small class="quest-reward">${q.type.toUpperCase()} | +${q.xp} XP</small>
      </div>
      <div style="display: flex; gap: 10px;">
        <button class="quest-proof-btn" onclick="uploadProof(${q.id})">📷</button>
        <button class="btn-primary" onclick="completeCustomQuest(${q.id})">Done</button>
      </div>
    `;
    container.appendChild(div);
  });
}

function renderQuests() {
  // Legacy function - redirect to custom quests
  renderCustomQuests();
}

// Handle picture upload for quest proof
function uploadProof(questId) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = function (e) {
    const file = e.target.files[0];
    if (file) {
      alert(`📷 Proof uploaded for quest! (${file.name})`);
      // In a real app, you would save this to state/localStorage
    }
  };
  input.click();
}
