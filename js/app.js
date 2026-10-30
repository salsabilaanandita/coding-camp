/**
 * FlowExpense - Modern Expense & Budget Visualizer
 * Client-side only expense tracking application
 */

// ==========================================================================
// 1. Constants & State
// ==========================================================================

const CATEGORIES = ['Food', 'Transport', 'Fun'];
const STORAGE_KEY = 'expense-budget-visualizer:v1';
const SETTINGS_KEY = 'expense-budget-visualizer:settings';
const MAX_CENTS = 99999999999; // $999,999,999.99

let transactions = [];
let chart = null;
let currentSort = 'newest';
let spendingLimitCents = null;
let currentTheme = null;

// ==========================================================================
// 2. Pure Helpers
// ==========================================================================

/**
 * Turn user text amount into whole integer cents.
 * Returns null if invalid, not a positive number, or exceeding MAX_CENTS.
 * @param {string|number} text 
 * @returns {number|null}
 */
function parseAmountToCents(text) {
  if (text === null || text === undefined) return null;
  const str = String(text).trim();
  if (!str) return null;

  if (!/^\d+(\.\d{1,2})?$/.test(str) && !/^\d+(\.\d+)?$/.test(str)) {
    return null;
  }

  const num = Number(str);
  if (!Number.isFinite(num) || num <= 0) {
    return null;
  }

  const cents = Math.round(num * 100);
  if (cents <= 0 || cents > MAX_CENTS) {
    return null;
  }

  return cents;
}

/**
 * Validate input fields for adding a transaction.
 * @param {{ name: any, amount: any, category: any }} input
 * @returns {{ ok: boolean, errors: Record<string, string>, value?: { name: string, amountCents: number, category: string } }}
 */
function validateInput(input) {
  const errors = {};
  const rawName = input && input.name !== undefined && input.name !== null ? String(input.name).trim() : '';
  const rawAmount = input && input.amount !== undefined && input.amount !== null ? String(input.amount).trim() : '';
  const rawCategory = input && input.category !== undefined && input.category !== null ? String(input.category).trim() : '';

  if (!rawName) {
    errors.name = 'Please enter an item name.';
  }

  if (!rawAmount) {
    errors.amount = 'Please enter an amount.';
  } else {
    const num = Number(rawAmount);
    if (!Number.isFinite(num) || num <= 0) {
      errors.amount = 'Amount must be a positive number.';
    } else {
      const cents = Math.round(num * 100);
      if (cents > MAX_CENTS) {
        errors.amount = 'Amount exceeds maximum supported limit.';
      } else {
        var validCents = cents;
      }
    }
  }

  if (!rawCategory) {
    errors.category = 'Please select a category.';
  } else if (!CATEGORIES.includes(rawCategory)) {
    errors.category = 'Category must be Food, Transport, or Fun.';
  }

  const ok = Object.keys(errors).length === 0;
  if (!ok) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    errors: {},
    value: {
      name: rawName,
      amountCents: validCents,
      category: rawCategory
    }
  };
}

/**
 * Format integer cents to currency string (e.g. $12.50).
 * @param {number} cents 
 * @returns {string}
 */
function formatCents(cents) {
  const safeCents = Number.isFinite(cents) ? cents : 0;
  const dollars = (safeCents / 100).toFixed(2);
  const parts = dollars.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `$${parts.join('.')}`;
}

/**
 * Compute sum of all transaction amounts in whole cents.
 * @param {Array<{ amountCents: number }>} list 
 * @returns {number}
 */
function computeTotal(list) {
  if (!Array.isArray(list)) return 0;
  return list.reduce((sum, item) => sum + (item.amountCents || 0), 0);
}

/**
 * Group total spending in cents by category.
 * @param {Array<{ category: string, amountCents: number }>} list 
 * @returns {{ Food: number, Transport: number, Fun: number }}
 */
function totalsByCategory(list) {
  const totals = { Food: 0, Transport: 0, Fun: 0 };
  if (!Array.isArray(list)) return totals;

  for (const item of list) {
    if (totals.hasOwnProperty(item.category)) {
      totals[item.category] += (item.amountCents || 0);
    }
  }
  return totals;
}

/**
 * Return a sorted copy of transactions list.
 * @param {Array<any>} list 
 * @param {'newest'|'amount'|'category'} mode 
 * @returns {Array<any>}
 */
function sortTransactions(list, mode) {
  if (!Array.isArray(list)) return [];
  const copy = [...list];

  switch (mode) {
    case 'amount':
      return copy.sort((a, b) => (b.amountCents || 0) - (a.amountCents || 0));
    case 'category':
      return copy.sort((a, b) => {
        const catComp = (a.category || '').localeCompare(b.category || '');
        if (catComp !== 0) return catComp;
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
    case 'newest':
    default:
      return copy.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }
}

/**
 * Generate a unique ID string for a transaction.
 * @returns {string}
 */
function createId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
}

// ==========================================================================
// 3. Storage Functions
// ==========================================================================

function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null || raw.trim() === '') {
      return { list: [], status: 'empty' };
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return { list: [], status: 'corrupt' };
    }
    return { list: parsed, status: 'ok' };
  } catch (err) {
    return { list: [], status: 'corrupt' };
  }
}

function saveTransactions(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true;
  } catch (err) {
    return false;
  }
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { limitCents: null, theme: null };
    const parsed = JSON.parse(raw);
    return {
      limitCents: typeof parsed.limitCents === 'number' ? parsed.limitCents : null,
      theme: parsed.theme === 'dark' || parsed.theme === 'light' ? parsed.theme : null
    };
  } catch (err) {
    return { limitCents: null, theme: null };
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (err) {
    return false;
  }
}

// ==========================================================================
// 4. View Functions
// ==========================================================================

function showBanner(message) {
  const banner = document.getElementById('banner');
  const bannerText = document.getElementById('banner-message');
  if (banner && bannerText) {
    bannerText.textContent = message;
    banner.classList.remove('hidden');
  }
}

function hideBanner() {
  const banner = document.getElementById('banner');
  if (banner) {
    banner.classList.add('hidden');
  }
}

function showFormErrors(errors) {
  const nameError = document.getElementById('error-name');
  const nameInput = document.getElementById('item-name');
  if (nameError) nameError.textContent = errors.name || '';
  if (nameInput) {
    if (errors.name) nameInput.classList.add('input-error');
    else nameInput.classList.remove('input-error');
  }

  const amountError = document.getElementById('error-amount');
  const amountBox = document.querySelector('#item-amount')?.closest('.input-with-affix');
  if (amountError) amountError.textContent = errors.amount || '';
  if (amountBox) {
    if (errors.amount) amountBox.classList.add('input-error');
    else amountBox.classList.remove('input-error');
  }

  const catError = document.getElementById('error-category');
  const catBox = document.querySelector('#item-category')?.closest('.select-wrapper');
  if (catError) catError.textContent = errors.category || '';
  if (catBox) {
    if (errors.category) catBox.classList.add('input-error');
    else catBox.classList.remove('input-error');
  }
}

function clearFormErrors() {
  showFormErrors({});
}

function syncCategoryChips(selectedCategory) {
  const chips = document.querySelectorAll('.chip-btn');
  chips.forEach(chip => {
    if (chip.getAttribute('data-cat') === selectedCategory) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });
}

function renderTotal(totalCents) {
  const totalEl = document.getElementById('total-balance');
  const cardEl = document.getElementById('balance-card');
  const badgeEl = document.getElementById('limit-badge');
  const progressBar = document.getElementById('budget-progress-bar');
  const progressText = document.getElementById('budget-progress-text');

  if (totalEl) {
    totalEl.textContent = formatCents(totalCents);
  }

  const hasLimit = spendingLimitCents !== null && spendingLimitCents > 0;
  const isOverLimit = hasLimit && totalCents > spendingLimitCents;

  if (cardEl) {
    if (isOverLimit) {
      cardEl.classList.add('over-limit');
    } else {
      cardEl.classList.remove('over-limit');
    }
  }

  if (badgeEl) {
    if (isOverLimit) {
      badgeEl.classList.remove('hidden');
    } else {
      badgeEl.classList.add('hidden');
    }
  }

  // Update budget progress bar & text
  if (progressBar && progressText) {
    if (!hasLimit) {
      progressBar.style.width = '0%';
      progressText.textContent = 'No limit set';
    } else {
      const pct = Math.min(Math.round((totalCents / spendingLimitCents) * 100), 100);
      progressBar.style.width = `${pct}%`;
      const ratioStr = `${formatCents(totalCents)} / ${formatCents(spendingLimitCents)}`;
      if (totalCents > spendingLimitCents) {
        progressText.textContent = `${ratioStr} (${Math.round((totalCents / spendingLimitCents) * 100)}% - over)`;
      } else {
        progressText.textContent = `${ratioStr} (${pct}%)`;
      }
    }
  }
}

function renderList(list) {
  const listEl = document.getElementById('transactions-list');
  const emptyEl = document.getElementById('list-empty');
  const countBadge = document.getElementById('tx-count');
  if (!listEl || !emptyEl) return;

  if (countBadge) {
    countBadge.textContent = list.length.toString();
  }

  listEl.innerHTML = '';

  if (list.length === 0) {
    emptyEl.classList.remove('hidden');
    return;
  }

  emptyEl.classList.add('hidden');

  list.forEach(item => {
    const li = document.createElement('li');
    li.className = 'feed-item';

    const isItemOverLimit = spendingLimitCents !== null && spendingLimitCents > 0 && item.amountCents > spendingLimitCents;
    if (isItemOverLimit) {
      li.classList.add('over-limit');
    }

    const left = document.createElement('div');
    left.className = 'feed-item-left';

    const indicator = document.createElement('span');
    indicator.className = `category-indicator indicator-${item.category}`;

    const textGroup = document.createElement('div');
    textGroup.className = 'item-text-group';

    const title = document.createElement('span');
    title.className = 'item-headline';
    title.textContent = item.name;

    const sub = document.createElement('span');
    sub.className = 'item-subtext';
    sub.textContent = item.category;

    if (isItemOverLimit) {
      const excess = document.createElement('span');
      excess.className = 'tag-excess';
      excess.textContent = '· Above limit';
      sub.appendChild(excess);
    }

    textGroup.appendChild(title);
    textGroup.appendChild(sub);

    left.appendChild(indicator);
    left.appendChild(textGroup);

    const right = document.createElement('div');
    right.className = 'feed-item-right';

    const amount = document.createElement('span');
    amount.className = 'item-price';
    amount.textContent = formatCents(item.amountCents);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-remove';
    deleteBtn.type = 'button';
    deleteBtn.setAttribute('aria-label', `Delete ${item.name}`);
    deleteBtn.setAttribute('title', 'Delete expense');
    deleteBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;

    deleteBtn.addEventListener('click', () => {
      deleteTransaction(item.id);
    });

    right.appendChild(amount);
    right.appendChild(deleteBtn);

    li.appendChild(left);
    li.appendChild(right);

    listEl.appendChild(li);
  });
}

function renderChart(totals) {
  const canvas = document.getElementById('category-chart');
  const emptyEl = document.getElementById('chart-empty');
  const errorEl = document.getElementById('chart-error');
  if (!canvas || !emptyEl) return;

  // Update legend metrics
  const foodVal = document.getElementById('legend-val-food');
  const transVal = document.getElementById('legend-val-transport');
  const funVal = document.getElementById('legend-val-fun');
  if (foodVal) foodVal.textContent = formatCents(totals.Food);
  if (transVal) transVal.textContent = formatCents(totals.Transport);
  if (funVal) funVal.textContent = formatCents(totals.Fun);

  const totalSpent = totals.Food + totals.Transport + totals.Fun;

  if (totalSpent === 0) {
    if (chart) {
      chart.destroy();
      chart = null;
    }
    canvas.style.display = 'none';
    emptyEl.classList.remove('hidden');
    if (errorEl) errorEl.classList.add('hidden');
    return;
  }

  emptyEl.classList.add('hidden');
  canvas.style.display = 'block';

  try {
    if (typeof Chart === 'undefined') {
      throw new Error('Chart.js not loaded');
    }

    const dataValues = [totals.Food / 100, totals.Transport / 100, totals.Fun / 100];
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    // Modern restrained palette
    const bgColors = isDark 
      ? ['#fb923c', '#38bdf8', '#a78bfa'] 
      : ['#f97316', '#0284c7', '#8b5cf6'];
    const borderCol = isDark ? '#121214' : '#ffffff';

    if (chart) {
      chart.data.datasets[0].data = dataValues;
      chart.data.datasets[0].backgroundColor = bgColors;
      chart.data.datasets[0].borderColor = borderCol;
      chart.update();
    } else {
      const ctx = canvas.getContext('2d');
      chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Food', 'Transport', 'Fun'],
          datasets: [{
            data: dataValues,
            backgroundColor: bgColors,
            borderColor: borderCol,
            borderWidth: 3,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          plugins: {
            legend: {
              display: false // Using our clean custom grid legend below the chart
            },
            tooltip: {
              backgroundColor: isDark ? '#1e1e24' : '#09090b',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              padding: 10,
              cornerRadius: 8,
              callbacks: {
                label: function (context) {
                  const label = context.label || '';
                  const val = context.raw || 0;
                  const pct = totalSpent > 0 ? Math.round(((val * 100) / totalSpent) * 100) : 0;
                  return ` ${label}: $${val.toFixed(2)} (${pct}%)`;
                }
              }
            }
          }
        }
      });
    }
    if (errorEl) errorEl.classList.add('hidden');
  } catch (err) {
    console.error('Chart rendering failed:', err);
    canvas.style.display = 'none';
    if (errorEl) errorEl.classList.remove('hidden');
  }
}

function render() {
  const totalCents = computeTotal(transactions);
  renderTotal(totalCents);
  renderList(sortTransactions(transactions, currentSort));

  try {
    renderChart(totalsByCategory(transactions));
  } catch (err) {
    console.error('Error in renderChart wrapper:', err);
  }
}

function applyTheme(theme) {
  currentTheme = theme;
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }

  // Force chart to re-render with matching palette
  if (chart) {
    chart.destroy();
    chart = null;
    renderChart(totalsByCategory(transactions));
  }
}

// ==========================================================================
// 5. Controller
// ==========================================================================

function addTransaction(formData) {
  const validation = validateInput(formData);
  if (!validation.ok) {
    showFormErrors(validation.errors);
    return false;
  }

  clearFormErrors();

  const newTx = {
    id: createId(),
    name: validation.value.name,
    amountCents: validation.value.amountCents,
    category: validation.value.category,
    createdAt: Date.now()
  };

  transactions.unshift(newTx);

  const saved = saveTransactions(transactions);
  if (!saved) {
    showBanner('Data was not saved');
  } else {
    hideBanner();
  }

  render();

  // Reset form & category chips
  const form = document.getElementById('transaction-form');
  if (form) {
    form.reset();
    const catSelect = document.getElementById('item-category');
    if (catSelect) catSelect.value = '';
    syncCategoryChips('');
  }

  return true;
}

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);

  const saved = saveTransactions(transactions);
  if (!saved) {
    showBanner('Data was not saved');
  }

  render();
}

function init() {
  // 1. Settings & Theme
  const settings = loadSettings();
  spendingLimitCents = settings.limitCents;
  if (settings.theme) {
    applyTheme(settings.theme);
  } else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }

  const limitInput = document.getElementById('spending-limit');
  if (limitInput && spendingLimitCents !== null && spendingLimitCents > 0) {
    limitInput.value = (spendingLimitCents / 100).toString();
  }

  // 2. Load Transactions
  const loaded = loadTransactions();
  if (loaded.status === 'corrupt') {
    transactions = [];
    showBanner('Saved data could not be loaded');
  } else {
    transactions = loaded.list;
  }

  // 3. Initial Render
  render();

  // 4. Wire Events
  const form = document.getElementById('transaction-form');
  const catSelect = document.getElementById('item-category');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('item-name');
      const amountInput = document.getElementById('item-amount');

      addTransaction({
        name: nameInput ? nameInput.value : '',
        amount: amountInput ? amountInput.value : '',
        category: catSelect ? catSelect.value : ''
      });
    });
  }

  // Category Quick Chips
  const chips = document.querySelectorAll('.chip-btn');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const cat = chip.getAttribute('data-cat');
      if (catSelect) {
        catSelect.value = cat;
        // clear inline category error if any
        const catError = document.getElementById('error-category');
        if (catError) catError.textContent = '';
        const catBox = catSelect.closest('.select-wrapper');
        if (catBox) catBox.classList.remove('input-error');
      }
      syncCategoryChips(cat);
    });
  });

  if (catSelect) {
    catSelect.addEventListener('change', (e) => {
      syncCategoryChips(e.target.value);
    });
  }

  // Sort dropdown
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderList(sortTransactions(transactions, currentSort));
    });
  }

  // Spending Limit Input
  if (limitInput) {
    limitInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (!val) {
        spendingLimitCents = null;
      } else {
        const parsed = parseAmountToCents(val);
        spendingLimitCents = parsed;
      }
      saveSettings({ limitCents: spendingLimitCents, theme: currentTheme });
      render();
    });
  }

  const clearLimitBtn = document.getElementById('clear-limit-btn');
  if (clearLimitBtn) {
    clearLimitBtn.addEventListener('click', () => {
      if (limitInput) limitInput.value = '';
      spendingLimitCents = null;
      saveSettings({ limitCents: null, theme: currentTheme });
      render();
    });
  }

  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const nextTheme = isDark ? 'light' : 'dark';
      applyTheme(nextTheme);
      saveSettings({ limitCents: spendingLimitCents, theme: nextTheme });
    });
  }

  // Banner close
  const bannerClose = document.getElementById('banner-close');
  if (bannerClose) {
    bannerClose.addEventListener('click', hideBanner);
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

const ExpenseApp = {
  CATEGORIES,
  STORAGE_KEY,
  SETTINGS_KEY,
  MAX_CENTS,
  parseAmountToCents,
  validateInput,
  formatCents,
  computeTotal,
  totalsByCategory,
  sortTransactions,
  createId,
  loadTransactions,
  saveTransactions,
  loadSettings,
  saveSettings,
  addTransaction,
  deleteTransaction,
  render,
  init
};

if (typeof window !== 'undefined') {
  window.ExpenseApp = ExpenseApp;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExpenseApp;
}
