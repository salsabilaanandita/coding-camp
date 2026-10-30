# Requirements Document: Expense & Budget Visualizer

## Introduction

The Expense & Budget Visualizer is a mobile-friendly web app that helps users track daily spending. It shows the total balance, a scrollable history of transactions, and a pie chart of spending by category. It is built with HTML, CSS, and vanilla JavaScript, runs entirely in the browser, and stores data in Local Storage.

## Glossary

- **App**: the Expense & Budget Visualizer web page.
- **Transaction**: one spending entry with an id, item name, amount, category, and creation time.
- **Category**: one of Food, Transport, or Fun.
- **Total Balance**: the sum of the amounts of all transactions.
- **Storage**: the browser Local Storage API.

## Requirements

### Requirement 1: Input Form

**User Story:** As a user, I want to add a spending entry with a name, amount, and category, so that I can record what I spent.

#### Acceptance Criteria

1. THE App SHALL show a form with the fields Item Name, Amount, and Category.
2. THE Category field SHALL offer exactly Food, Transport, and Fun.
3. WHEN the user submits the form with an empty Item Name, THE App SHALL show an inline error beside that field and SHALL NOT add a transaction.
4. WHEN the user submits the form with an empty Amount, THE App SHALL show an inline error beside that field and SHALL NOT add a transaction.
5. WHEN the user submits the form without a Category, THE App SHALL show an inline error beside that field and SHALL NOT add a transaction.
6. WHEN the Amount is not a positive number, THE App SHALL show an inline error and SHALL NOT add a transaction.
7. WHEN several fields are invalid, THE App SHALL show all their errors at once and SHALL keep the values the user entered.
8. WHEN the form is valid, THE App SHALL add the transaction to the list, clear the form, reset the Category, and clear any errors.
9. THE App SHALL reject an Amount above the maximum supported value and show an inline error.

### Requirement 2: Transaction List

**User Story:** As a user, I want to see and remove my past entries, so that I can review and correct my spending.

#### Acceptance Criteria

1. THE App SHALL show all transactions in a scrollable list.
2. THE App SHALL show the name, amount, and category of each transaction.
3. WHEN the list is empty, THE App SHALL show a short empty-state message.
4. THE App SHALL show a delete control on each transaction.
5. WHEN the user activates a delete control, THE App SHALL remove that transaction only.
6. THE App SHALL show the newest transaction first by default.

### Requirement 3: Total Balance

**User Story:** As a user, I want to see my total spending at the top, so that I know how much I have spent.

#### Acceptance Criteria

1. THE App SHALL show the Total Balance at the top of the page.
2. WHEN a transaction is added, THE App SHALL update the Total Balance without a page reload.
3. WHEN a transaction is deleted, THE App SHALL update the Total Balance without a page reload.
4. THE App SHALL compute amounts in whole cents so that rounding errors do not appear in the total.
5. WHEN there are no transactions, THE App SHALL show a Total Balance of zero.

### Requirement 4: Visual Chart

**User Story:** As a user, I want a chart of spending by category, so that I can see where my money goes.

#### Acceptance Criteria

1. THE App SHALL show a pie chart of spending distribution by category, using Chart.js or another simple chart library.
2. WHEN a transaction is added or deleted, THE App SHALL update the chart without a page reload.
3. WHEN there are no transactions, THE App SHALL show an empty-state message instead of the chart.
4. IF the chart fails to draw, THEN THE App SHALL still update the list and the Total Balance.

### Requirement 5: Data Persistence

**User Story:** As a user, I want my entries to remain after I close the page, so that I do not lose my data.

#### Acceptance Criteria

1. WHEN a transaction is added or deleted, THE App SHALL save the full list to Storage.
2. WHEN the page loads, THE App SHALL read the saved list from Storage and render it.
3. THE App SHALL store all data on the client only and SHALL NOT call a backend server.
4. IF the saved data is missing, THEN THE App SHALL start with an empty list.
5. IF the saved data is corrupt, THEN THE App SHALL start with an empty list and show the banner "Saved data could not be loaded".
6. IF saving fails, THEN THE App SHALL keep working in memory and show the banner "Data was not saved".

### Requirement 6: Sort Transactions (Optional Challenge)

**User Story:** As a user, I want to sort my transactions, so that I can find large or related entries quickly.

#### Acceptance Criteria

1. THE App SHALL offer sorting by newest, amount, and category.
2. WHEN the user chooses a sort option, THE App SHALL reorder the list at once without changing the Total Balance or the chart.

### Requirement 7: Spending Limit Highlight (Optional Challenge)

**User Story:** As a user, I want to set a spending limit, so that I am warned when I go over it.

#### Acceptance Criteria

1. THE App SHALL let the user set a spending limit and SHALL save it in Storage.
2. WHEN the Total Balance is above the limit, THE App SHALL highlight the Total Balance.
3. WHEN a single transaction is above the limit, THE App SHALL highlight that transaction in the list.
4. WHEN the limit is empty or zero, THE App SHALL show no highlight.

### Requirement 8: Dark/Light Mode (Optional Challenge)

**User Story:** As a user, I want to switch between dark and light mode, so that the app is comfortable to read.

#### Acceptance Criteria

1. THE App SHALL offer a toggle between dark and light mode.
2. THE App SHALL save the chosen mode in Storage and apply it when the page loads.
3. WHEN no mode has been saved, THE App SHALL follow the browser color-scheme preference.
4. THE App SHALL keep text and controls readable in both modes.

### Requirement 9: Non-Functional and Project Constraints

**User Story:** As a learner and user, I want a simple, fast, readable app that follows the course rules.

#### Acceptance Criteria

1. THE App SHALL use HTML for structure, CSS for styling, and vanilla JavaScript with no framework.
2. THE project SHALL contain exactly one CSS file in `css/` and exactly one JavaScript file in `js/`.
3. THE App SHALL work in current versions of Chrome, Firefox, Edge, and Safari.
4. THE App SHALL work when `index.html` is opened directly, with no build step, no server, and no test setup.
5. THE App SHALL have a responsive layout that works well on phone screens.
6. THE App SHALL load quickly and update without noticeable lag.
7. THE App SHALL use a clear visual hierarchy and readable typography.
8. THE project SHALL be published with GitHub Pages and SHALL include the `.kiro` folder in the repository.