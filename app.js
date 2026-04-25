/**
 * app.js — The Arcane Bazaar logic
 * Handles filtering, search, card rendering, and modal.
 */

(function () {
  // ── State ────────────────────────────────────────────────────────────────
  let activeFilter = "all";
  let searchQuery  = "";

  // ── DOM refs ─────────────────────────────────────────────────────────────
  const grid        = document.getElementById("itemGrid");
  const emptyMsg    = document.getElementById("emptyMsg");
  const filterBtns  = document.querySelectorAll(".filter-btn");
  const searchInput = document.getElementById("searchInput");
  const overlay     = document.getElementById("modalOverlay");
  const modalEl     = document.getElementById("modal");
  const modalClose  = document.getElementById("modalClose");
  const modalCont   = document.getElementById("modalContent");
  const lastUpdEl   = document.getElementById("lastUpdated");

  // ── Init ─────────────────────────────────────────────────────────────────
  if (lastUpdEl && typeof LAST_UPDATED !== "undefined") {
    lastUpdEl.textContent = LAST_UPDATED;
  }

  // ── Filtering / searching ─────────────────────────────────────────────────
  function getFiltered() {
    return ITEMS.filter(item => {
      const matchType = activeFilter === "all" || item.type === activeFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q
        || item.name.toLowerCase().includes(q)
        || (item.category || "").toLowerCase().includes(q)
        || (item.note || "").toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────
  function render() {
    const items = getFiltered();
    grid.innerHTML = "";

    if (!items.length) {
      emptyMsg.style.display = "block";
      return;
    }
    emptyMsg.style.display = "none";

    items.forEach((item, i) => {
      const card = document.createElement("div");
      card.className = `card ${item.type}`;
      card.style.animationDelay = `${i * 0.04}s`;

      // Tag label
      const tagLabels = { selling: "For Sale", buying: "Buying", trading: "Trade" };

      // Price row HTML
      let priceHTML = "";
      if (item.price != null) {
        priceHTML = `
          <div class="card-price-row">
            <span class="price-label">${item.type === "buying" ? "Paying" : "Price"}:</span>
            <span class="price-value">${item.price.toLocaleString()}</span>
            <span class="price-unit">${item.priceUnit || "Galleons"}</span>
          </div>`;
      }

      // Trade wants HTML
      let tradeHTML = "";
      if (item.type === "trading" && item.tradeWants && item.tradeWants.length) {
        const chips = item.tradeWants
          .map(w => `<span class="trade-chip">${w}</span>`)
          .join("");
        tradeHTML = `
          <div class="card-trade-wants">
            <div class="trade-label">Looking for</div>
            <div class="trade-items">${chips}</div>
          </div>`;
      }

      // Note HTML
      const noteHTML = item.note
        ? `<div class="card-note">${item.note}</div>`
        : "";

      card.innerHTML = `
        <div class="card-top">
          <div class="card-name">${item.name}</div>
          <span class="tag ${item.type}">${tagLabels[item.type]}</span>
        </div>
        <div class="card-category">${item.category || "Miscellaneous"}</div>
        ${priceHTML}
        ${tradeHTML}
        ${noteHTML}
      `;

      card.addEventListener("click", () => openModal(item));
      grid.appendChild(card);
    });
  }

  // ── Modal ─────────────────────────────────────────────────────────────────
  function openModal(item) {
    const tagLabels = { selling: "For Sale", buying: "Buying", trading: "Trade" };

    let rows = [
      { label: "Type",     val: tagLabels[item.type],               cls: "" },
      { label: "Category", val: item.category || "Miscellaneous",   cls: "" },
    ];

    if (item.price != null) {
      const priceLabel = item.type === "buying" ? "Paying" : "Price";
      rows.push({
        label: priceLabel,
        val: `${item.price.toLocaleString()} ${item.priceUnit || "Galleons"}`,
        cls: "gold"
      });
    }

    if (item.note) {
      rows.push({ label: "Notes", val: item.note, cls: "" });
    }

    if (item.tradeWants && item.tradeWants.length) {
      rows.push({ label: "Trade Wants", val: item.tradeWants.join(", "), cls: "" });
    }

    const rowsHTML = rows.map(r => `
      <div class="modal-row">
        <span class="modal-row-label">${r.label}</span>
        <span class="modal-row-val ${r.cls}">${r.val}</span>
      </div>`).join("");

    modalCont.innerHTML = `
      <div class="modal-name">${item.name}</div>
      <div class="modal-meta">${item.category || "Miscellaneous"}</div>
      ${rowsHTML}
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

  searchInput.addEventListener("input", e => {
    searchQuery = e.target.value;
    render();
  });

  modalClose.addEventListener("click", closeModal);
  overlay.addEventListener("click", e => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
  });

  // ── Go ────────────────────────────────────────────────────────────────────
  render();
})();
