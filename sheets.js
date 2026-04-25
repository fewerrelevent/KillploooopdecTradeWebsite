/**
 * sheets.js — Fetches and parses item data from a published Google Sheet CSV.
 * No API key required — uses the public "Publish to web" CSV endpoint.
 */

/**
 * Parse a raw CSV string into an array of row arrays.
 * Handles quoted fields (including commas inside quotes).
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
        if (inQuote && line[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuote = !inQuote;
        }
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

/**
 * Convert parsed CSV rows into item objects the app understands.
 * Expects Row 0 = headers: name, type, category, price, priceUnit, note, tradeWants
 */
function rowsToItems(rows) {
  if (rows.length < 2) return [];

  // Build a header index map (case-insensitive, trimmed)
  const headers = rows[0].map(h => h.toLowerCase().trim());
  const col = key => headers.indexOf(key);

  const iName        = col("name");
  const iType        = col("type");
  const iCategory    = col("category");
  const iPrice       = col("price");
  const iPriceUnit   = col("priceunit");
  const iNote        = col("note");
  const iTradeWants  = col("tradewants");

  const items = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const name = iName >= 0 ? row[iName] : "";
    if (!name) continue; // skip blank rows

    const type = iType >= 0 ? row[iType].toLowerCase().trim() : "selling";
    const validTypes = ["selling", "buying", "trading"];
    if (!validTypes.includes(type)) continue; // skip rows with bad type

    const rawPrice = iPrice >= 0 ? row[iPrice].replace(/[^0-9.]/g, "") : "";
    const price = rawPrice ? parseFloat(rawPrice) : null;

    const tradeWantsRaw = iTradeWants >= 0 ? row[iTradeWants] : "";
    const tradeWants = tradeWantsRaw
      ? tradeWantsRaw.split(",").map(s => s.trim()).filter(Boolean)
      : [];

    items.push({
      name,
      type,
      category:  iCategory  >= 0 ? row[iCategory]  : "Miscellaneous",
      price,
      priceUnit: iPriceUnit >= 0 && row[iPriceUnit] ? row[iPriceUnit] : "Galleons",
      note:      iNote      >= 0 ? row[iNote]       : "",
      tradeWants,
    });
  }

  return items;
}

/**
 * Main export: fetch items from the configured Google Sheet CSV URL.
 * Returns a Promise that resolves to an array of item objects.
 */
async function fetchItemsFromSheet(csvUrl) {
  // Use a CORS proxy for the Google Sheets CSV (required from browser)
  // allorigins.win is a reliable free proxy for public URLs
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(csvUrl)}`;

  const response = await fetch(proxyUrl);
  if (!response.ok) throw new Error(`Network error: ${response.status}`);

  const json = await response.json();
  const csvText = json.contents;

  const rows  = parseCSV(csvText);
  const items = rowsToItems(rows);
  return items;
}
