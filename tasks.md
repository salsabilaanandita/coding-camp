# Implementation Plan: Expense & Budget Visualizer

## Overview

Build the app in small steps: project structure first, then the pure helpers, storage, view, and controller, then the optional challenges, then styling and deployment. Each task lists the requirements it covers. Verification is manual because the brief requires no test setup.

## Tasks

- [x] 1. Set up project structure
  - [x] 1.1 Create `index.html` with the page skeleton, the Chart.js script tag, and links to `css/style.css` and `js/app.js`
    - _Requirements: 9.1, 9.2, 9.4_
  - [x] 1.2 Create `css/style.css` with the base reset, color variables, and mobile-first layout
    - _Requirements: 9.2, 9.5, 9.7_
  - [x] 1.3 Create `js/app.js` scaffold with `CATEGORIES`, `STORAGE_KEY`, `MAX_CENTS`, in-memory `transactions`, and `chart`
    - Expose helpers through a guarded `window.ExpenseApp` and `module.exports`
    - _Requirements: 9.1, 9.2_

- [x] 2. Implement input parsing and validation
  - [x] 2.1 Implement `parseAmountToCents` and `validateInput`
    - Trim the name, require a category from `CATEGORIES`, require a positive amount up to `MAX_CENTS`
    - Return one error message per invalid field
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.7, 1.9_
  - [x] 2.2 Implement `formatCents`, `computeTotal`, and `totalsByCategory`
    - _Requirements: 3.4, 3.5, 4.1_

- [x] 3. Implement storage
  - [x] 3.1 Implement `loadTransactions` and `saveTransactions`
    - Return the `ok`, `empty`, or `corrupt` status, and `false` when saving throws
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  - [x] 3.2 Implement `loadSettings` and `saveSettings` for the spending limit and theme
    - _Requirements: 7.1, 8.2_

- [x] 4. Checkpoint: check helpers and storage
  - Call the helpers from the browser console and confirm `parseAmountToCents('12.50')` is `1250`
  - Ask the user if questions arise.

- [x] 5. Implement the view
  - [x] 5.1 Add the form markup (name, amount, category select, submit) and the list, total, chart, and banner containers in `index.html`
    - _Requirements: 1.1, 1.2, 2.1, 3.1, 4.1_
  - [x] 5.2 Implement `renderList` with the empty state and a delete button on each item
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6_
  - [x] 5.3 Implement `renderTotal` and `renderChart`
    - Show the empty state when the total is zero
    - Create or update the pie chart and catch chart errors
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 4.1, 4.2, 4.3, 4.4_
  - [x] 5.4 Implement `showFormErrors`, `clearFormErrors`, `showBanner`, and `hideBanner`
    - Show an inline error beside each invalid field at once; keep entered values
    - Banner messages: "Saved data could not be loaded" and "Data was not saved"
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.7, 1.9, 5.5, 5.6_

- [x] 6. Wire the controller
  - [x] 6.1 Implement `render`, `addTransaction`, `deleteTransaction`, and startup
    - On `DOMContentLoaded`: load from storage, show the banner if the data is corrupt, call `render()`
    - Submit handler: validate, show errors on failure; on success add, save, show the not-saved banner if saving fails, re-render, clear the form (reset category) and the errors
    - Delete handler: remove by id, save, re-render the list, total, and chart
    - Isolate chart errors so the list and total still update
    - _Requirements: 1.8, 2.5, 3.2, 3.3, 4.2, 5.1, 5.2, 5.5, 5.6_

- [x] 7. Checkpoint: check the MVP
  - Add, delete, and reload; confirm the total, the list, and the chart match each time
  - Ask the user if questions arise.

- [x] 8. Optional challenge: sort transactions
  - [x] 8.1 Implement `sortTransactions` and add a sort control (newest, amount, category)
    - _Requirements: 6.1, 6.2_

- [x] 9. Optional challenge: spending limit highlight
  - [x] 9.1 Add the limit input, save it in settings, and highlight the total and over-limit items
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 10. Optional challenge: dark/light mode
  - [x] 10.1 Add the toggle, `applyTheme`, saved theme, and the browser-preference fallback
    - Define dark and light color variables in `css/style.css`
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 11. Polish and verify
  - [x] 11.1 Style the layout: card sections, scrollable list with a maximum height, readable typography, clear hierarchy
    - _Requirements: 2.1, 9.5, 9.6, 9.7_
  - [x] 11.2 Check at phone width and in Chrome, Firefox, Edge, and Safari
    - _Requirements: 9.3, 9.5_
  - [x] 11.3 Check the error cases by hand: corrupt the saved value in DevTools, block storage, and block the chart script
    - _Requirements: 4.4, 5.5, 5.6_

- [ ] 12. Deploy and submit
  - [ ] 12.1 Name the repository `CodingCamp-[ddmmyy]-[participantname]`, commit with GitHub Desktop, and push
    - Make sure the `.kiro` folder is in the repository
    - _Requirements: 9.8_
  - [ ] 12.2 Publish with GitHub Pages and open the live URL to confirm it works
    - _Requirements: 9.8_
  - [ ] 12.3 Submit the Builder ID, repository URL, and website URL on Paperform before Saturday 23.59 WIB

- [ ] 13. Final checkpoint: ensure everything works
  - Ensure the MVP, the three optional challenges, and the submission checklist are complete; ask the user if questions arise.

## Notes

- The brief requires no test setup, so there are no test tasks. Verification is manual in the browser.
- The app must work by opening `index.html` directly, with no build step or server.
- Keep exactly one CSS file in `css/` and one JavaScript file in `js/`.
- Optional challenges chosen: sort transactions, spending limit highlight, and dark/light mode.
