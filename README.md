# CSCI-467 Project — Sales Quote System

A PHP/MySQL web app for sales associates to create customer quotes, get them
approved, and convert them into purchase orders. Built with PHP
(mysqli), JS/HTML/CSS on the frontend.

## Features

- **Sales associate login** — associates sign in with a user ID and
  password; the session is kept client-side in `localStorage`. Create Quote
  checks for a logged-in associate and redirects to login if it's missing.
- **Create Quote** — look up an existing customer, add one or more catalog
  items as line items, and submit to create a `finalized` quote.
- **Edit Quote** — load a quote by ID, change its line items, apply a
  discount (percent or fixed amount), append internal notes, and either save
  it as a draft or sanction it for processing.
- **Process Orders** — load a `sanctioned` quote, optionally apply one more
  discount, and convert it into a purchase order. This calls an external
  order-processing service to get back a PO number, processing date, and
  commission rate, then credits the commission to the associate's account.
- **Admin tools** — an admin dashboard (no login required) linking to:
  - **Search Quotes** — a read-only, filterable list of quotes by status,
    associate, customer, or date range.
  - **Sales Associates** — lists every associate, including their password,
    and supports add/edit/delete. Associate IDs are generated automatically
    in the `RE-######` format and can't be changed after creation; leaving
    the password field blank while editing keeps the current password.

## Pages

- **Sales associates** — start at `login.html`. Logging in redirects to
  `pages/createQuote.html`.
- **Headquarters** — go directly to `pages/headquarters/editQuote.html` or
  `pages/headquarters/convertQuote.html` (no login required). The two
  share a nav bar (Edit Quote / Process Orders) for switching between them.
- **Admins** — go directly to `admin.php` (no login required). It links to
  Search Quotes (`pages/searchQuotes.html`) and Sales Associates
  (`pages/viewSalesAssociates.html`).

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
- `styles.css` / `common.js` are shared across all pages; `auth.js` additionally
  guards Create Quote (admin pages don't use it)

## Project structure

`login.html` and `admin.php` stay at the project root so their URLs never
change. The Headquarters pages live in their own `pages/headquarters/`
folder, since they're a separate, directly-accessed area rather than
something reached by clicking through from another page. Everything else
is grouped by type into subfolders. Every page's `fetch()` call and
`<script>`/`<link>` tag points across these folders with relative paths —
`pages/headquarters/` is one level deeper than `pages/`, so it reaches
shared assets via `../../css/...`, `../../js/...`, `../../api/...`.

```
csci467/
├── login.html              (entry point - sales associate login)
├── admin.php                (entry point - admin dashboard)
├── css/
│   └── styles.css
├── js/
│   ├── common.js, auth.js, quoteDetails.js   (shared)
│   └── login.js, createQuote.js, editQuote.js, convertQuote.js,
│       searchQuotes.js, viewSalesAssociates.js   (one per page)
├── pages/
│   ├── createQuote.html
│   ├── searchQuotes.html, viewSalesAssociates.html
│   └── headquarters/
│       ├── editQuote.html       (entry point - edit quote)
│       └── convertQuote.html    (entry point - process orders)
├── api/
│   ├── login.php, createQuote.php, editQuote.php, convertQuote.php
│   ├── searchQuotes.php, viewSalesAssociates.php
│   ├── createAssociate.php, editAssociate.php, deleteAssociate.php
│   └── getQuote.php, getCustomer.php, getItem.php, getItems.php
├── includes/
│   ├── db.php
│   └── json_api.php
├── SQL/
└── README.md
```

| File(s) | Purpose |
|---|---|
| `login.html`, `js/login.js`, `api/login.php` | Sales associate authentication |
| `pages/createQuote.html`, `js/createQuote.js`, `api/createQuote.php` | Create a new quote |
| `pages/headquarters/editQuote.html`, `js/editQuote.js`, `api/editQuote.php` | Edit line items/discount, save draft or sanction |
| `pages/headquarters/convertQuote.html`, `js/convertQuote.js`, `api/convertQuote.php` | Convert a sanctioned quote into a purchase order |
| `js/quoteDetails.js` | Shared quote-loading/rendering logic for Edit Quote and Process Orders; also auto-loads a quote when the page is opened with `?quote_id=` |
| `api/getQuote.php`, `api/getCustomer.php`, `api/getItem.php`, `api/getItems.php` | Read-only lookup endpoints |
| `admin.php` | Admin dashboard (no login required) linking to Search Quotes and Sales Associates |
| `pages/searchQuotes.html`, `js/searchQuotes.js`, `api/searchQuotes.php` | Read-only filter/search of quotes by status, associate, customer, or date |
| `pages/viewSalesAssociates.html`, `js/viewSalesAssociates.js`, `api/viewSalesAssociates.php` | List sales associates, including their password |
| `api/createAssociate.php`, `api/editAssociate.php`, `api/deleteAssociate.php` | Add, update, or remove a sales associate; `createAssociate.php` generates the `RE-######` associate ID |
| `includes/db.php` | mysqli connection setup |
| `includes/json_api.php` | Shared bootstrap (JSON headers, error handling, `getQuoteOrFail`) for the JSON endpoints |
| `js/common.js`, `js/auth.js`, `css/styles.css` | Shared frontend helpers and styling |
| `SQL/` | Table definitions and seed data |