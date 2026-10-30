# Design Document: Expense & Budget Visualizer

## Overview

A single-page, client-only web app. The page is `index.html`, styled by one CSS file and driven by one JavaScript file. State lives in memory as an array of transactions and is mirrored to Local Storage after every change. After each change the app re-renders the list, the total balance, and the pie chart.

## Architecture

```
index.html
css/style.css      (only CSS file)
js/app.js          (only JS file)
.kiro/specs/expense-budget-visualizer/
```

Data flow:

```
User action (submit / delete / sort / toggle)
        |
        v
Controller (event handlers in app.js)
        |  validate -> update state -> save to Storage
        v
render(): list + total + chart
```

`app.js` is organized into small sections, each with one job:

1. **Constants and state**
2. **Pure helpers** (amount parsing, validation, totals, sorting)
3. **Storage** (load and save)
4. **View** (DOM updates, errors, banners, chart)
5. **Controller** (event wiring and startup)

Chart.js is loaded from a CDN with a `<script>` tag in `index.html`, before `app.js`.

## Components and Interfaces

### Constants and state

```js
const CATEGORIES = ['Food', 'Transport', 'Fun'];
const STORAGE_KEY = 'expense-budget-visualizer:v1';
const MAX_CENTS = 99999999999; // upper bound for one amount

let transactions = []; // in-memory source of truth
let chart = null;      // Chart.js instance
```

To make the pure helpers testable by hand in the browser console, the file exposes them through a guarded global (`window.ExpenseApp`), and also through `module.exports` behind a `typeof` check.

### Pure helpers

| Function | Purpose |
| --- | --- |
| `parseAmountToCents(text)` | Turn user input such as `12.50` into whole cents (`1250`). Return `null` when the text is not a valid number. |
| `validateInput({ name, amount, category })` | Return `{ ok, errors, value }`. `errors` has one message per invalid field. |
| `formatCents(cents)` | Format cents for display, e.g. `$12.50`. |
| `computeTotal(list)` | Sum of all `amountCents`. |
| `totalsByCategory(list)` | Object mapping each category to its sum in cents. |
| `sortTransactions(list, mode)` | Return a sorted copy: `newest`, `amount`, or `category`. |
| `createId()` | Unique id for a transaction. |

### Storage

| Function | Behavior |
| --- | --- |
| `loadTransactions()` | Read and parse the saved list. Return `{ list, status }` where `status` is `ok`, `empty`, or `corrupt`. |
| `saveTransactions(list)` | Write the list as JSON. Return `true` on success and `false` if it throws. |
| `loadSettings()` / `saveSettings()` | Same pattern for the spending limit and the theme. |

### View

| Function | Behavior |
| --- | --- |
| `renderList(list)` | Rebuild the list. Show the empty state when the list is empty. Highlight over-limit items. |
| `renderTotal(cents)` | Update the Total Balance and highlight it when over the limit. |
| `renderChart(totals)` | Create or update the pie chart. Show the empty state when the total is zero. |
| `render()` | Call the three functions above. The chart call is wrapped in `try/catch` so that a chart failure never blocks the list or the total. |
| `showFormErrors(errors)` | Show an inline error beside each invalid field, all at once. |
| `clearFormErrors()` | Remove all inline errors. |
| `showBanner(message)` / `hideBanner()` | Show or hide a page-level message. |
| `applyTheme(theme)` | Set `data-theme` on `<html>`. |

### Controller

| Function | Behavior |
| --- | --- |
| `addTransaction(input)` | Validate. On failure show errors and keep the values. On success add the item, save, show the banner "Data was not saved" if saving fails, re-render, clear the form, reset the category, and clear errors. |
| `deleteTransaction(id)` | Remove the item by id, save, and re-render. |
| `init()` | On `DOMContentLoaded`: load settings and theme, load transactions, show "Saved data could not be loaded" when the status is `corrupt`, wire events, and call `render()`. |

## Data Models

```js
// Transaction
{
  id: string,          // unique
  name: string,        // trimmed, non-empty
  amountCents: number, // integer, > 0 and <= MAX_CENTS
  category: 'Food' | 'Transport' | 'Fun',
  createdAt: number    // Date.now()
}
```

Local Storage keys:

- `expense-budget-visualizer:v1`: JSON array of transactions.
- `expense-budget-visualizer:settings`: JSON object `{ limitCents: number | null, theme: 'light' | 'dark' | null }`.

Money is stored in integer cents to avoid floating-point rounding errors in the total and the chart.

## Page Layout

Mobile-first, one column, centered with a maximum width on larger screens:

1. Header with app title and theme toggle
2. Banner area (hidden by default)
3. Total Balance card (top)
4. Spending limit input
5. Input form (name, amount, category, submit)
6. Chart card
7. Transaction list with sort control (scrollable, fixed maximum height)

## Error Handling

| Situation | Behavior |
| --- | --- |
| Invalid form input | Inline error beside each invalid field, all at once. Entered values are kept. No transaction is added. |
| Amount above `MAX_CENTS` | Inline error on the Amount field. |
| Corrupt saved data | Start with an empty list and show "Saved data could not be loaded". |
| Local Storage unavailable or full | Keep working in memory and show "Data was not saved". |
| Chart library missing or throws | Log the error. The list and total still update. The chart area shows a short message. |

## Testing Strategy

The course brief requires no test setup, so the app has no test runner and no build step. Verification is manual:

- Call the pure helpers from the browser console through `window.ExpenseApp` (for example `parseAmountToCents('12.50')` returns `1250`).
- Walk through each requirement in the browser: add, validate, delete, reload, corrupt the saved value by hand in DevTools, and switch themes.
- Check the layout at phone width in DevTools and in Chrome, Firefox, Edge, and Safari.

## Deployment

Commit with GitHub Desktop, push to a repository named `CodingCamp-[ddmmyy]-[participantname]`, and publish from the main branch with GitHub Pages. Keep the `.kiro` folder in the repository.