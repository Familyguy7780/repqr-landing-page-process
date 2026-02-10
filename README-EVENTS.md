# Rep QR Landing Page Process

This project contains:

1. **Landing page builder** (`index.html`) – Spotlight Basic, Professional Spotlight, and Realtor templates with guided setup and live preview.
2. **Event wizard** (`events.html`) – Multi-step event setup: template → basics & message → videos → products & shipping → payment → done.

## Quick links

- **Landing builder:** open `index.html` in a browser.
- **Event wizard:** open `events.html` in a browser, or click **Launch Events** in the main header.

## Event wizard files

- `events.html` – Event setup UI (6 steps, pricing, NFC, cups, shipping).
- `js/events-config.js` – Template config (Charity, Sports, Trade, Property, Custom) and pricing.
- `js/events.js` – Step navigation, payment breakdown, and form behavior.

You can change event templates, copy, and pricing in `js/events-config.js`. Edit the flow and layout in `events.html` and `js/events.js`.
