/**
 * config.js — Site configuration
 *
 * ════════════════════════════════════════════════════════
 *  SETUP: How to connect your Google Sheet
 * ════════════════════════════════════════════════════════
 *
 * 1. Open your Google Sheet.
 * 2. Go to:  File → Share → Publish to web
 * 3. Under "Link", set the dropdowns to:
 *       Sheet:   (whichever sheet has your items)
 *       Format:  Comma-separated values (.csv)
 * 4. Click "Publish" and copy the URL it gives you.
 * 5. Paste that URL below as SHEET_CSV_URL.
 *
 * ════════════════════════════════════════════════════════
 *  SHEET COLUMN FORMAT (Row 1 = headers, exactly as shown)
 * ════════════════════════════════════════════════════════
 *
 *  A: name        — Item name                    (required)
 *  B: type        — selling | buying | trading   (required)
 *  C: category    — Armor, Weapon, Scroll, etc.  (required)
 *  D: price       — Number, e.g. 5000            (leave blank for trade-only)
 *  E: priceUnit   — Galleons (or leave blank)    (optional, defaults to Galleons)
 *  F: note        — Any extra info               (optional)
 *  G: tradeWants  — Comma-separated list of what you want in trade (optional)
 *
 *  Example row:
 *  Sunken Sword | buying | Weapon | 15000 | Galleons | Must be clean | 
 *
 * ════════════════════════════════════════════════════════
 */

const CONFIG = {

  // Paste your published Google Sheet CSV URL here:
  SHEET_CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQRYSZfxfEOoGCfgTxSXoO1wyctXm2UhMgZ4H4VlxLlc8pSqPWslMh4aG2qy9NyQUjCm8RsCPC4dBap/pub?output=csv",

  // Your page title / shop name (shown in the header)
  SHOP_NAME: "Killploooopdec's Arcane Odyssey Store",

  // Subtitle shown under the shop name
  SHOP_SUBTITLE: "Items · Trades · Prices",

  // Contact line shown in the footer
  CONTACT_NOTE: "To inquire, reach out in-game or via Discord.",

};
