let userBalance = 150.0;
let userPoints = 120;
let totalPointsEarned = 120;
let totalPointsSpent = 0;
let redeemedVouchers = [];
let hasDigitalSwitchDiscount = false;

// Quiz Questions Data
const quizData = [
  {
    question:
      "You receive a WhatsApp message claiming to be UUM Bursary asking you to transfer RM 50 via an unverified personal bank account to avoid account suspension. Is this scam?",
    isScam: true,
    explanation:
      "Scam! Official UUM payments are only processed through certified portals or verified DuitNow QR merchants.",
  },
  {
    question:
      "Scanning a DuitNow QR code at the Library Cafe shows the merchant name 'UUM Library Cafe Sdn Bhd' on your bank app screen before entering PIN. Safe or Scam?",
    isScam: false,
    explanation:
      "Safe! DuitNow QR dynamically displays certified merchant names on your screen to prevent spoofing.",
  },
  {
    question:
      "A printed DuitNow QR paper at a canteen stall looks pasted over another QR sticker. Should you report this as suspicious?",
    isScam: true,
    explanation:
      "Correct! Fraudsters sometimes paste fake QR stickers over real ones (QR Phishing).",
  },
];

let currentQuizIndex = 0;

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  updateHeaderDisplays();
  loadQuizQuestion();
});

// Navigation Switcher
function switchTab(tabId) {
  const pages = ["home", "discover", "payment", "educator", "rewards", "trust"];
  pages.forEach((p) => {
    document.getElementById(`page-${p}`).classList.add("hidden");
    const btn = document.getElementById(`tab-${p}`);
    if (btn) btn.classList.remove("active", "bg-blue-600", "text-white");
  });

  document.getElementById(`page-${tabId}`).classList.remove("hidden");
  const activeBtn = document.getElementById(`tab-${tabId}`);
  if (activeBtn) {
    activeBtn.classList.add("active");
  }
}

// Update Header Text Values
function updateHeaderDisplays() {
  document.getElementById("header-balance").innerText =
    `RM ${userBalance.toFixed(2)}`;
  document.getElementById("header-points").innerText = `${userPoints} PTS`;
  document.getElementById("modal-balance-val").innerText =
    `RM ${userBalance.toFixed(2)}`;
  document.getElementById("modal-points-avail").innerText = `${userPoints} PTS`;
  document.getElementById("modal-points-earned").innerText =
    `${totalPointsEarned} PTS`;
  document.getElementById("modal-points-spent").innerText =
    `${totalPointsSpent} PTS`;
}

// Toast Notification Banner
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `p-4 rounded-xl text-xs font-bold shadow-xl border flex items-center space-x-2 transform transition-all duration-300 pointer-events-auto ${
    type === "success"
      ? "bg-emerald-600 text-white border-emerald-500"
      : "bg-red-600 text-white border-red-500"
  }`;
  toast.innerHTML = `<i class="fa-solid ${type === "success" ? "fa-circle-check" : "fa-circle-xmark"}"></i> <span>${message}</span>`;

  const container = document.getElementById("toast-container");
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Login Modal Controls
function openLoginModal() {
  const modal = document.getElementById("modal-login");
  const content = document.getElementById("login-content");

  modal.classList.remove("hidden");

  // Trigger popup animation shortly after unhiding
  setTimeout(() => {
    content.classList.remove("scale-95", "opacity-0");
    content.classList.add("scale-100", "opacity-100");
  }, 10);
}

function closeLoginModal() {
  const modal = document.getElementById("modal-login");
  const content = document.getElementById("login-content");

  // Trigger close animation
  content.classList.remove("scale-100", "opacity-100");
  content.classList.add("scale-95", "opacity-0");

  // Hide modal completely after animation finishes
  setTimeout(() => {
    modal.classList.add("hidden");
  }, 300);
}

// Balance Modal Controls
function openBalanceModal() {
  document.getElementById("modal-balance").classList.remove("hidden");
}
function closeBalanceModal() {
  document.getElementById("modal-balance").classList.add("hidden");
}
function quickAddMoney(amt) {
  document.getElementById("input-add-money").value = amt;
}
function confirmAddMoney() {
  const input = document.getElementById("input-add-money");
  const val = parseFloat(input.value);
  if (!isNaN(val) && val > 0) {
    userBalance += val;
    updateHeaderDisplays();
    showToast(`Successfully added RM ${val.toFixed(2)} to your balance!`);
    input.value = "";
    closeBalanceModal();
  } else {
    showToast("Please enter a valid amount to add.", "error");
  }
}

// Points Modal Controls
function openPointsModal() {
  renderRedeemedVouchers();
  document.getElementById("modal-points").classList.remove("hidden");
}
function closePointsModal() {
  document.getElementById("modal-points").classList.add("hidden");
}

function renderRedeemedVouchers() {
  const container = document.getElementById("redeemed-vouchers-list");
  if (redeemedVouchers.length === 0) {
    container.innerHTML = `<p class="text-xs text-slate-400 text-center py-4">No vouchers redeemed yet. Earn points and redeem above!</p>`;
    return;
  }

  container.innerHTML = redeemedVouchers
    .map(
      (v, i) => `
    <div class="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
      <div>
        <p class="font-bold text-slate-800">${v.title}</p>
        <span class="text-[10px] text-slate-400">Code: ${v.code}</span>
      </div>
      <button onclick="toggleVoucherStatus(${i})" class="px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all ${
        v.used
          ? "bg-slate-200 text-slate-600"
          : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
      }">
        ${v.used ? "Used" : "Mark as Used"}
      </button>
    </div>
  `,
    )
    .join("");
}

function toggleVoucherStatus(index) {
  redeemedVouchers[index].used = !redeemedVouchers[index].used;
  renderRedeemedVouchers();
}

// Payment Simulator Logic
function setPayMode(mode) {
  if (mode === "qr") {
    document.getElementById("sim-qr-box").classList.remove("hidden");
    document.getElementById("sim-acc-box").classList.add("hidden");
    document.getElementById("btn-mode-qr").className =
      "flex-1 py-2 text-xs font-bold rounded-lg bg-white text-blue-600 shadow-sm transition-all";
    document.getElementById("btn-mode-acc").className =
      "flex-1 py-2 text-xs font-bold rounded-lg text-slate-600 hover:text-slate-900 transition-all";
  } else {
    document.getElementById("sim-qr-box").classList.add("hidden");
    document.getElementById("sim-acc-box").classList.remove("hidden");
    document.getElementById("btn-mode-acc").className =
      "flex-1 py-2 text-xs font-bold rounded-lg bg-white text-blue-600 shadow-sm transition-all";
    document.getElementById("btn-mode-qr").className =
      "flex-1 py-2 text-xs font-bold rounded-lg text-slate-600 hover:text-slate-900 transition-all";
  }
}

function updateSimAmount() {
  const select = document.getElementById("sim-merchant");
  const selectedOpt = select.options[select.selectedIndex];
  let price = parseFloat(selectedOpt.getAttribute("data-price"));

  if (price) {
    // Check if it's the canteen and the discount is active
    if (select.value.includes("Inasis Canteen") && hasDigitalSwitchDiscount) {
      price -= 2.0; // Apply the RM 2.00 discount
      document.getElementById("sim-amount").value = price.toFixed(2);
      showToast("Digital Switch Promo (-RM 2.00) automatically applied!");
    } else {
      document.getElementById("sim-amount").value = price.toFixed(2);
    }
  }
}

function executePayment() {
  const amount = parseFloat(document.getElementById("sim-amount").value);
  const merchant = document.getElementById("sim-merchant").value;

  if (isNaN(amount) || amount <= 0) {
    showToast("Please enter a valid amount.", "error");
    return;
  }

  if (userBalance < amount) {
    showToast("Insufficient balance! Please top up first.", "error");
    openBalanceModal();
    return;
  }

  // Consume the discount if applied
  if (merchant.includes("Inasis Canteen") && hasDigitalSwitchDiscount) {
    hasDigitalSwitchDiscount = false; // Mark as used so it doesn't apply to the next transaction
    const voucher = redeemedVouchers.find((v) =>
      v.title.includes("Digital Switch"),
    );
    if (voucher) voucher.used = true;
  }

  // Execute Deduct & Add Points
  userBalance -= amount;
  userPoints += 10;
  totalPointsEarned += 10;
  updateHeaderDisplays();

  // Add to Payment History
  const historyList = document.getElementById("tx-history-list");
  const item = document.createElement("div");
  item.className =
    "flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs animate-fade-in";
  item.innerHTML = `
    <div class="flex items-center space-x-3">
      <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
        <i class="fa-solid fa-store"></i>
      </div>
      <div>
        <p class="font-bold text-slate-800">${merchant}</p>
        <p class="text-[10px] text-slate-400">Digital Payment Verified</p>
      </div>
    </div>
    <div class="text-right">
      <p class="font-extrabold text-slate-800">- RM ${amount.toFixed(2)}</p>
      <span class="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">+10 XP</span>
    </div>
  `;
  historyList.prepend(item);

  openPaymentSuccessModal(amount, merchant);

  // Reset the simulator amount back to standard price for the next transaction
  updateSimAmount();
}
// Payment Success Modal Controls
function openPaymentSuccessModal(amount, merchant) {
  const modal = document.getElementById("modal-payment-success");
  const content = document.getElementById("payment-success-content");
  const desc = document.getElementById("payment-success-desc");

  // Update text dynamically
  desc.innerHTML = `You paid <span class="font-bold text-slate-800">RM ${amount.toFixed(2)}</span> to ${merchant}.`;

  // Unhide modal container
  modal.classList.remove("hidden");

  // Trigger popup animation shortly after unhiding
  setTimeout(() => {
    content.classList.remove("scale-95", "opacity-0");
    content.classList.add("scale-100", "opacity-100");
  }, 10);
}

function closePaymentSuccessModal() {
  const modal = document.getElementById("modal-payment-success");
  const content = document.getElementById("payment-success-content");

  // Trigger close animation
  content.classList.remove("scale-100", "opacity-100");
  content.classList.add("scale-95", "opacity-0");

  // Hide modal after animation completes
  setTimeout(() => {
    modal.classList.add("hidden");
  }, 300);
}

// Quiz Educator Logic
function loadQuizQuestion() {
  const q = quizData[currentQuizIndex];
  document.getElementById("quiz-question").innerText = q.question;
  document.getElementById("quiz-progress-text").innerText =
    `Question ${currentQuizIndex + 1} of ${quizData.length}`;
  document.getElementById("quiz-feedback").classList.add("hidden");
}

function answerQuiz(userThinksScam) {
  const q = quizData[currentQuizIndex];
  const isCorrect = userThinksScam === q.isScam;
  const feedback = document.getElementById("quiz-feedback");

  if (isCorrect) {
    userPoints += 10;
    totalPointsEarned += 10;
    updateHeaderDisplays();
    feedback.className =
      "mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-1";
    feedback.innerHTML = `<strong><i class="fa-solid fa-circle-check"></i> Correct! (+10 XP)</strong><p>${q.explanation}</p>`;
  } else {
    feedback.className =
      "mt-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs space-y-1";
    feedback.innerHTML = `<strong><i class="fa-solid fa-circle-xmark"></i> Incorrect</strong><p>${q.explanation}</p>`;
  }

  feedback.classList.remove("hidden");

  setTimeout(() => {
    currentQuizIndex = (currentQuizIndex + 1) % quizData.length;
    loadQuizQuestion();
  }, 3500);
}

// Rewards Logic
function redeemVoucher(title, cost) {
  if (userPoints < cost) {
    showToast(`Not enough XP! You need ${cost} XP for this voucher.`, "error");
    return;
  }

  userPoints -= cost;
  totalPointsSpent += cost;
  updateHeaderDisplays();

  const voucherCode = "UUM-" + Math.floor(1000 + Math.random() * 9000);
  redeemedVouchers.push({ title, code: voucherCode, used: false });

  showToast(`Redeemed "${title}"! View code in XP Points ledger.`);
}

function filterRewards(category) {
  // 1. Filter the cards
  const cards = document.querySelectorAll("#page-rewards .glass-card");
  cards.forEach((card) => {
    const cardCategory = card.getAttribute("data-category");
    if (category === "all" || cardCategory === category) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  });
  const buttons = document.querySelectorAll(
    '#page-rewards button[onclick^="filterRewards"]',
  );
  buttons.forEach((btn) => {
    if (btn.getAttribute("onclick").includes(`'${category}'`)) {
      // Active styling
      btn.className =
        "px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl";
    } else {
      // Inactive styling
      btn.className =
        "px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl";
    }
  });
}

function redeemDigitalSwitch() {
  if (hasDigitalSwitchDiscount) {
    showToast("You have already claimed this promo!", "error");
    return;
  }
  hasDigitalSwitchDiscount = true;
  const voucherCode = "DIGITAL-UUM-" + Math.floor(1000 + Math.random() * 9000);
  redeemedVouchers.push({
    title: "RM 2.00 Off Canteen (Digital Switch)",
    code: voucherCode,
    used: false,
  });

  showToast("Promo Claimed! Your Inasis Canteen meal is now discounted.");
  updateSimAmount(); // Automatically update simulator price if they are on that tab
}

// FPX Modal Controls
function openFpxModal() {
  document.getElementById("modal-fpx").classList.remove("hidden");
}
function closeFpxModal() {
  document.getElementById("modal-fpx").classList.add("hidden");
}
