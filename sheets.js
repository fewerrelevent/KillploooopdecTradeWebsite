/**
 * sheets.js — Fetches and parses item data from a published Google Sheet CSV.
 * No API key required — uses the public "Publish to web" CSV endpoint.
 */

function parseCSV(text) {
  const rows = [];
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");

  for (const line of lines) {
    if (!line.trim()) continue;
    const row = [];
    let inQuote = false;
    let cell = "";

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') { cell += '"'; i++; }
        else { inQuote = !inQuote; }
      } else if (ch === "," && !inQuote) {
        row.push(cell.trim());
        cell = "";
      } else {
        cell += ch;
      }
    }
    row.push(cell.trim());
    rows.push(row);
  }

  return rows;
}

function rowsToItems(rows) {
  if (rows.length < 2) {
    console.warn("[Bazaar] CSV parsed but only", rows.length, "row(s) found (need at least 2: header + 1 item)");
    return [];
  }

  const headers = rows[0].map(h => h.toLowerCase().trim());
  console.log("[Bazaar] Headers detected:", headers);

  const col = key => headers.indexOf(key);

  const iName       = col("name");
  const iType       = col("type");
  const iCategory   = col("category");
  const iPrice      = col("price");
  const iPriceUnit  = col("priceunit");
  const iNote       = col("note");
  const iTradeWants = col("tradewants");

  console.log("[Bazaar] Column indices → name:", iName, "type:", iType, "category:", iCategory,
    "price:", iPrice, "priceUnit:", iPriceUnit, "note:", iNote, "tradeWants:", iTradeWants);

  function cell(row, idx) {
    return (idx >= 0 && idx < row.length) ? (row[idx] || "").trim() : "";
  }

  const items = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    console.log(`[Bazaar] Row ${r} raw:`, row);

    const name = cell(row, iName);
    if (!name) { console.log(`[Bazaar] Row ${r} skipped — empty name`); continue; }

    const type = cell(row, iType).toLowerCase();
    const validTypes = ["selling", "buying", "trading"];
    if (!validTypes.includes(type)) {
      console.warn(`[Bazaar] Row ${r} skipped — invalid type: "${type}"`);
      continue;
    }

    const rawPrice = cell(row, iPrice).replace(/[^0-9.]/g, "");
    const price = rawPrice ? parseFloat(rawPrice) : null;

    const tradeWantsRaw = cell(row, iTradeWants);
    const tradeWants = tradeWantsRaw
      ? tradeWantsRaw.split(",").map(s => s.trim()).filter(Boolean)
      : [];

    const item = {
      name,
      type,
      category:  cell(row, iCategory)  || "Miscellaneous",
      price,
      priceUnit: cell(row, iPriceUnit) || "Galleons",
      note:      cell(row, iNote),
      tradeWants,
    };

    console.log(`[Bazaar] Row ${r} parsed OK:`, item);
    items.push(item);
  }

  console.log("[Bazaar] Total items loaded:", items.length);
  return items;
}

async function fetchItemsFromSheet(csvUrl) {
  // Try allorigins first, fall back to corsproxy.io
  const proxies = [
    `https://api.allorigins.win/get?url=${encodeURIComponent(csvUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(csvUrl)}`,
  ];

  let csvText = null;
  let lastError = null;

  // Try allorigins (returns JSON wrapper)
  try {
    console.log("[Bazaar] Trying proxy: allorigins");
    const res = await fetch(proxies[0]);
    if (res.ok) {
      const json = await res.json();
      csvText = json.contents;
      console.log("[Bazaar] allorigins success, first 200 chars:", csvText?.slice(0, 200));
    }
  } catch (e) {
    lastError = e;
    console.warn("[Bazaar] allorigins failed:", e.message);
  }

  // Fall back to corsproxy.io (returns raw CSV)
  if (!csvText) {
    try {
      console.log("[Bazaar] Trying proxy: corsproxy.io");
      const res = await fetch(proxies[1]);
      if (res.ok) {
        csvText = await res.text();
        console.log("[Bazaar] corsproxy.io success, first 200 chars:", csvText?.slice(0, 200));
      }
    } catch (e) {
      lastError = e;
      console.warn("[Bazaar] corsproxy.io failed:", e.message);
    }
  }

  if (!csvText) {
    throw new Error("Both CORS proxies failed. " + (lastError?.message || ""));
  }

  const rows  = parseCSV(csvText);
  const items = rowsToItems(rows);
  return items;
}
