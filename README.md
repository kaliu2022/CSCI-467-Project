# CSCI-467 Project — Sales Quote System

A PHP/MySQL web app for sales associates to create customer quotes, get them
approved, and convert them into purchase orders. Built with PHP
(mysqli), JS/HTML/CSS on the frontend.

## Features

- **Sales associate login** — associates sign in with a user ID and
  password; the session is kept client-side in `localStorage` and every
  quote page redirects back to login if it's missing.
- **Create Quote** — look up an existing customer, add one or more catalog
  items as line items, and submit to create a `finalized` quote.
- **Edit Quote** — load a quote by ID, change its line items, apply a
  discount (percent or fixed amount), append internal notes, and either save
  it as a draft or sanction it for processing.
- **Process Orders** — load a `sanctioned` quote, optionally apply one more
  discount, and convert it into a purchase order. This calls an external
  order-processing service to get back a PO number, processing date, and
  commission rate, then credits the commission to the associate's account.
- **Admin tools** — plain HTML/PHP pages to search/filter quotes and to
  view, add, edit, or delete sales associates.

## Quote lifecycle

```
draft ──> finalized ──> sanctioned ──> ordered
```

- `draft` / `finalized` — created via Create Quote or saved via Edit Quote.
- `sanctioned` — set from Edit Quote once the quote is ready for a PO.
- `ordered` — set by Process Orders after a successful conversion; the quote
  gets a PO number, processing date, and commission amount.

## Tech stack

- PHP + `mysqli` (prepared statements) for the API endpoints
- MySQL/MariaDB (via XAMPP) for storage
- Vanilla HTML/CSS/JS for the frontend — no build step, no framework
- `styles.css` / `common.js` / `auth.js` are shared across the quote pages

## Project structure

| File(s) | Purpose |
|---|---|
| `login.html`, `login.js`, `login.php` | Sales associate authentication |
| `createQuote.html`, `createQuote.js`, `createQuote.php` | Create a new quote |
| `editQuote.html`, `editQuote.js`, `editQuote.php` | Edit line items/discount, save draft or sanction |
| `convertQuote.html`, `convertQuote.js`, `convertQuote.php` | Convert a sanctioned quote into a purchase order |
| `quoteDetails.js` | Shared quote-loading/rendering logic for Edit Quote and Process Orders |
| `getQuote.php`, `getCustomer.php`, `getItem.php`, `getItems.php`, `searchQuotes.php` | Read-only lookup endpoints |
| `admin.php`, `viewSalesAssociates.php`, `editSalesAssociates.php` | Admin pages for quotes and sales associates |
| `db.php` | mysqli connection setup |
| `json_api.php` | Shared bootstrap (JSON headers, error handling, `getQuoteOrFail`) for the JSON endpoints |
| `common.js`, `auth.js`, `styles.css` | Shared frontend helpers and styling |
| `SQL/` | Table definitions and seed data |