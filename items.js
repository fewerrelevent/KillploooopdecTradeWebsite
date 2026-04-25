/**
 * items.js — Your Arcane Odyssey listings
 *
 * HOW TO EDIT:
 * Each item is an object in the ITEMS array.
 *
 * Fields:
 *   name       — Item name (required)
 *   type       — "selling" | "buying" | "trading"
 *   category   — Item category (e.g. "Armor", "Accessory", "Weapon", "Scroll")
 *   price      — Numeric price in galleons (omit for trading-only items)
 *   priceUnit  — Label for currency, default "Galleons" (e.g. "Galleons", "Crowns")
 *   note       — Optional extra info shown on card & modal
 *   tradeWants — For "trading" type: array of strings — what you'll accept in trade
 *
 * To add an item: copy an existing block, paste it, and change the values.
 * To remove an item: delete its entire { ... } block (and the comma before it).
 */

const ITEMS = [

  // ── SELLING ──────────────────────────────────────────────────────────────

  {
    name: "Amulet of Ravenna",
    type: "selling",
    category: "Accessory",
    price: 3000,
    priceUnit: "Galleons",
    note: "Pristine condition. Boosts power & agility stats nicely."
  },

  {
    name: "Sunken Warrior Chestplate",
    type: "selling",
    category: "Armor",
    price: 8000,
    priceUnit: "Galleons",
    note: "Full durability. The real deal — no enchants on it yet."
  },

  {
    name: "Mino Helmet",
    type: "selling",
    category: "Armor",
    price: 5500,
    priceUnit: "Galleons",
    note: "Great stats for power builds. Lightly used."
  },

  {
    name: "Power Scroll",
    type: "selling",
    category: "Scroll",
    price: 1200,
    priceUnit: "Galleons",
    note: "Selling multiples — ask about bulk pricing."
  },

  {
    name: "Bursting Scroll",
    type: "selling",
    category: "Scroll",
    price: 950,
    priceUnit: "Galleons",
  },

  // ── BUYING ───────────────────────────────────────────────────────────────

  {
    name: "Sunken Sword",
    type: "buying",
    category: "Weapon",
    price: 15000,
    priceUnit: "Galleons",
    note: "Must be clean (no bad enchants). DM me before offering."
  },

  {
    name: "Sunken Warrior Leggings",
    type: "buying",
    category: "Armor",
    price: 7500,
    priceUnit: "Galleons",
    note: "Any durability is fine."
  },

  {
    name: "Strong Scroll",
    type: "buying",
    category: "Scroll",
    price: 800,
    priceUnit: "Galleons",
    note: "Buying in bulk — the more the better."
  },

  {
    name: "Vastira",
    type: "buying",
    category: "Weapon",
    price: 4500,
    priceUnit: "Galleons",
    note: "Paying premium for high-stat rolls."
  },

  // ── TRADING ──────────────────────────────────────────────────────────────

  {
    name: "Mino Armor Set (Full)",
    type: "trading",
    category: "Armor",
    note: "Full set in good condition. Looking for Sunken gear or equivalent value.",
    tradeWants: ["Sunken Warrior Chestplate", "Sunken Sword", "Fair galleon offers"]
  },

  {
    name: "Amulet of Sailors' Lost Refuge",
    type: "trading",
    category: "Accessory",
    note: "Rare drop. Not in a hurry to trade — make it worth my while.",
    tradeWants: ["Sunken accessories", "Exotic scrolls", "High-value armor"]
  },

];

// ── LAST UPDATED ──────────────────────────────────────────────────────────
// Change this string whenever you update your listings.
const LAST_UPDATED = "April 24, 2025";
