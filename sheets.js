/**
 * sheets.js — Fetches and parses item data from a published Google Sheet CSV.
 * Uses a Cloudflare Pages Function (/proxy) to avoid CORS issues.
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
    console.warn("[Bazaar] CSV parsed but only", rows.length, "row(s) found");
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
  const iAmount     = col("amount");
  const iImage      = col("image");
  const iBuyPrice   = col("buyprice");

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

    const rawPrice    = cell(row, iPrice).replace(/[^0-9.]/g, "");
    const price       = rawPrice ? parseFloat(rawPrice) : null;

    const rawBuyPrice = cell(row, iBuyPrice).replace(/[^0-9.]/g, "");
    const buyPrice    = rawBuyPrice ? parseFloat(rawBuyPrice) : null;

    const rawAmount = cell(row, iAmount).replace(/[^0-9]/g, "");
    const amount = rawAmount ? parseInt(rawAmount, 10) : null;

    const tradeWantsRaw = cell(row, iTradeWants);
    const tradeWants = tradeWantsRaw
      ? tradeWantsRaw.split(",").map(s => s.trim()).filter(Boolean)
      : [];

    const item = {
      name,
      type,
      category:  cell(row, iCategory)  || "Miscellaneous",
      price,
      buyPrice,
      priceUnit: cell(row, iPriceUnit) || "Galleons",
      note:      cell(row, iNote),
      tradeWants,
      amount,
      image:     cell(row, iImage),
    };

    console.log(`[Bazaar] Row ${r} parsed OK:`, item);
    items.push(item);
  }

  console.log("[Bazaar] Total items loaded:", items.length);
  return items;
}

async function fetchItemsFromSheet(csvUrl) {
  const proxyUrl = `/proxy?url=${encodeURIComponent(csvUrl)}`;
  console.log("[Bazaar] Fetching via /proxy");

  const response = await fetch(proxyUrl);
  if (!response.ok) throw new Error(`Proxy error: ${response.status}`);

  const csvText = await response.text();
  console.log("[Bazaar] CSV received, first 200 chars:", csvText.slice(0, 200));

  const rows  = parseCSV(csvText);
  const items = rowsToItems(rows);
  return items;
}
