/**
 * app.js — The Arcane Bazaar logic
 * Fetches items from Google Sheets, handles filtering, search, modals.
 */

(function () {

  // ── State ────────────────────────────────────────────────────────────────
  let ITEMS        = [];
  let activeFilter = "all";
  let searchQuery  = "";

  // ── DOM refs ─────────────────────────────────────────────────────────────
  const grid         = document.getElementById("itemGrid");
  const emptyMsg     = document.getElementById("emptyMsg");
  const filterBtns   = document.querySelectorAll(".filter-btn");
  const searchInput  = document.getElementById("searchInput");
  const overlay      = document.getElementById("modalOverlay");
  const modalClose   = document.getElementById("modalClose");
  const modalCont    = document.getElementById("modalContent");
  const lastUpdEl    = document.getElementById("lastUpdated");
  const loadingEl    = document.getElementById("loadingState");
  const errorEl      = document.getElementById("errorState");
  const errorMsgEl   = document.getElementById("errorMsg");
  const retryBtn     = document.getElementById("retryBtn");
  const mainContent  = document.getElementById("mainContent");
  const shopNameEl   = document.getElementById("shopName");
  const shopSubEl    = document.getElementById("shopSubtitle");
  const contactEl    = document.getElementById("contactNote");

  // ── Apply config ──────────────────────────────────────────────────────────
  if (typeof CONFIG !== "undefined") {
    if (shopNameEl && CONFIG.SHOP_NAME)     shopNameEl.textContent  = CONFIG.SHOP_NAME;
    if (shopSubEl  && CONFIG.SHOP_SUBTITLE) shopSubEl.textContent   = CONFIG.SHOP_SUBTITLE;
    if (contactEl  && CONFIG.CONTACT_NOTE)  contactEl.textContent   = CONFIG.CONTACT_NOTE;
    if (CONFIG.SHOP_NAME)                   document.title          = CONFIG.SHOP_NAME;
  }

  // ── UI state helpers ──────────────────────────────────────────────────────
  function showLoading() {
    loadingEl.style.display   = "block";
    errorEl.style.display     = "none";
    mainContent.style.display = "none";
  }

  function showError(msg) {
    loadingEl.style.display   = "none";
    errorEl.style.display     = "block";
    mainContent.style.display = "none";
    errorMsgEl.textContent    = msg;
  }

  function showContent() {
    loadingEl.style.display   = "none";
    errorEl.style.display     = "none";
    mainContent.style.display = "block";
  }

  // ── Data load ─────────────────────────────────────────────────────────────
  async function loadItems() {
    showLoading();

    if (!CONFIG.SHEET_CSV_URL || CONFIG.SHEET_CSV_URL === "YOUR_GOOGLE_SHEET_CSV_URL_HERE") {
      showError("No Google Sheet URL configured. Open config.js and paste your published sheet URL into SHEET_CSV_URL.");
      return;
    }

    try {
      ITEMS = await fetchItemsFromSheet(CONFIG.SHEET_CSV_URL);

      if (ITEMS.length === 0) {
        showError("The sheet loaded but no valid items were found. Check your column headers match the expected format.");
        return;
      }

      if (lastUpdEl) {
        const now = new Date();
        lastUpdEl.textContent = now.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
      }

      showContent();
      render();
    } catch (err) {
      console.error("Sheet fetch error:", err);
      showError("Failed to fetch your sheet. Make sure it's published to the web as CSV and the URL in config.js is correct. (" + err.message + ")");
    }
  }

  // ── Filtering / searching ─────────────────────────────────────────────────
  function getFiltered() {
    return ITEMS.filter(item => {
      const matchType   = activeFilter === "all" || item.type === activeFilter;
      const q           = searchQuery.toLowerCase();
      const matchSearch = !q
        || item.name.toLowerCase().includes(q)
        || (item.category || "").toLowerCase().includes(q)
        || (item.note     || "").toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────
  function render() {
    const items = getFiltered();
    grid.innerHTML = "";

    if (!items.length) { emptyMsg.style.display = "block"; return; }
    emptyMsg.style.display = "none";

    items.forEach((item, i) => {
      const card = document.createElement("div");
      card.className = `card ${item.type}`;
      card.style.animationDelay = `${i * 0.04}s`;

      const tagLabels = { selling: "For Sale", buying: "Buying", trading: "Trade" };

      let priceHTML = "";
      if (item.price != null) {
        priceHTML = `<div class="card-price-row">
            <span class="price-label">${item.type === "buying" ? "Paying" : "Price"}:</span>
            <span class="price-value">${item.price.toLocaleString()}</span>
            <span class="price-unit">${item.priceUnit || "Galleons"}</span>
          </div>`;
      }

      let tradeHTML = "";
      if (item.type === "trading" && item.tradeWants && item.tradeWants.length) {
        const chips = item.tradeWants.map(w => `<span class="trade-chip">${w}</span>`).join("");
        tradeHTML = `<div class="card-trade-wants"><div class="trade-label">Looking for</div><div class="trade-items">${chips}</div></div>`;
      }

      const noteHTML = item.note ? `<div class="card-note">${item.note}</div>` : "";

      card.innerHTML = `
        <div class="card-top">
          <div class="card-name">${item.name}</div>
          <span class="tag ${item.type}">${tagLabels[item.type]}</span>
        </div>
        <div class="card-category">${item.category || "Miscellaneous"}</div>
        ${priceHTML}${tradeHTML}${noteHTML}
      `;

      card.addEventListener("click", () => openModal(item));
      grid.appendChild(card);
    });
  }

  // ── Modal ─────────────────────────────────────────────────────────────────
  function openModal(item) {
    const tagLabels = { selling: "For Sale", buying: "Buying", trading: "Trade" };
    const rows = [
      { label: "Type",     val: tagLabels[item.type],             cls: "" },
      { label: "Category", val: item.category || "Miscellaneous", cls: "" },
    ];
    if (item.price != null)
      rows.push({ label: item.type === "buying" ? "Paying" : "Price",
                  val: `${item.price.toLocaleString()} ${item.priceUnit || "Galleons"}`, cls: "gold" });
    if (item.note)
      rows.push({ label: "Notes", val: item.note, cls: "" });
    if (item.tradeWants && item.tradeWants.length)
      rows.push({ label: "Trade Wants", val: item.tradeWants.join(", "), cls: "" });

    modalCont.innerHTML = `
      <div class="modal-name">${item.name}</div>
      <div class="modal-meta">${item.category || "Miscellaneous"}</div>
      ${rows.map(r => `<div class="modal-row"><span class="modal-row-label">${r.label}</span><span class="modal-row-val ${r.cls}">${r.val}</span></div>`).join("")}
    `;
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  // ── Events ────────────────────────────────────────────────────────────────
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      render();
    });
  });

  searchInput.addEventListener("input", e => { searchQuery = e.target.value; render(); });
  modalClose.addEventListener("click", closeModal);
  overlay.addEventListener("click", e => { if (e.target === overlay) closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
  retryBtn.addEventListener("click", loadItems);

  // ── Boot ──────────────────────────────────────────────────────────────────
  loadItems();

})();
