# The Arcane Bazaar — Arcane Odyssey Trading Site

A static site for listing your Arcane Odyssey items for sale, purchase, and trade. Hosted via GitHub Pages + Cloudflare Pages.

## How to Update Your Listings

Open **`items.js`** — this is the only file you need to edit for day-to-day updates.

### Adding an item

Copy and paste this template into the `ITEMS` array:

```js
{
  name: "Item Name",
  type: "selling",        // "selling" | "buying" | "trading"
  category: "Armor",      // Any label: Armor, Accessory, Weapon, Scroll, etc.
  price: 5000,            // Omit this line for trading-only items
  priceUnit: "Galleons",  // Optional, defaults to "Galleons"
  note: "Any extra info", // Optional
},
```

For **trading** items, add a `tradeWants` array:

```js
{
  name: "Mino Set",
  type: "trading",
  category: "Armor",
  note: "Full set, good condition.",
  tradeWants: ["Sunken Sword", "Sunken Warrior Chestplate"],
},
```

### Removing an item

Delete its entire `{ ... }` block from the array (including the comma).

### Updating the "Last Updated" date

Change the `LAST_UPDATED` string at the bottom of `items.js`:

```js
const LAST_UPDATED = "April 24, 2025";
```

## Deployment

- Push to your GitHub repo (any branch — `main` by default).
- Cloudflare Pages will auto-deploy on every push.
- No build step required — this is pure HTML/CSS/JS.

## File Structure

```
/
├── index.html   ← Page structure
├── style.css    ← All styling
├── items.js     ← YOUR LISTINGS (edit this!)
├── app.js       ← Site logic (no need to edit)
└── README.md
```
