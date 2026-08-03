const searchForm = document.getElementById('search-form');
const searchButton = document.getElementById('search-button');
const customerIdInput = document.getElementById('customer_id');
const customerIndex = document.getElementById('customer-index');
const resultsBody = document.getElementById('results-body');
const resultsCount = document.getElementById('results-count');

function debounce(fn, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

function showIndexError(listElement, text) {
    listElement.innerHTML = `<li>${text}</li>`;
    listElement.className = 'index-list show error';
}

function hideIndex(listElement) {
    listElement.innerHTML = '';
    listElement.className = 'index-list';
}

async function lookupCustomer(customerId, listElement) {
    if (!Number.isInteger(customerId) || customerId < 1) {
        hideIndex(listElement);
        return;
    }

    try {
        const response = await fetch(`getCustomer.php?id=${customerId}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
            showIndexError(listElement, result.errors?.join(' ') || 'Customer not found.');
            return;
        }

        const customer = result.customer;
        listElement.innerHTML = `
            <li>Name: ${customer.name}</li>
            <li>City: ${customer.city}</li>
        `;
        listElement.className = 'index-list show';
    } catch (error) {
        showIndexError(listElement, 'Unable to look up customer.');
    }
}

const debouncedCustomerLookup = debounce((value, listElement) => {
    lookupCustomer(Number(value), listElement);
}, 400);

customerIdInput.addEventListener('input', () => {
    debouncedCustomerLookup(customerIdInput.value, customerIndex);
});

function renderResults(quotes) {
    resultsCount.textContent = quotes.length === 1 ? '1 quote' : `${quotes.length} quotes`;

    if (quotes.length === 0) {
        resultsBody.innerHTML = '<tr><td colspan="7" class="empty-state">No quotes match these filters.</td></tr>';
        return;
    }

    resultsBody.innerHTML = quotes.map((quote) => `
        <tr>
            <td>${quote.quote_id}</td>
            <td>${quote.customer_id}</td>
            <td>${quote.associate_id}</td>
            <td><span class="status-badge status-${quote.status}">${quote.status}</span></td>
            <td>${quote.created_date}</td>
            <td>${formatMoney(quote.final_amount)}</td>
            <td>${quote.po_number || '—'}</td>
        </tr>
    `).join('');
}

async function runSearch() {
    clearMessage();
    searchButton.disabled = true;
    searchButton.textContent = 'Searching...';

    const params = new URLSearchParams();
    const status = document.getElementById('status').value;
    const associateId = document.getElementById('associate_id').value;
    const customerId = document.getElementById('customer_id').value;
    const dateFrom = document.getElementById('date_from').value;
    const dateTo = document.getElementById('date_to').value;

    if (status) params.set('status', status);
    if (associateId) params.set('associate_id', associateId);
    if (customerId) params.set('customer_id', customerId);
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);

    try {
        const response = await fetch(`searchQuotes.php?${params.toString()}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.errors?.join(' ') || 'Unable to search quotes.');
        }

        renderResults(result.quotes);
    } catch (error) {
        showMessage(error.message || 'Unable to connect to the server.');
        resultsBody.innerHTML = '';
        resultsCount.textContent = '';
    } finally {
        searchButton.disabled = false;
        searchButton.textContent = 'Search';
    }
}

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    runSearch();
});

searchForm.addEventListener('reset', () => {
    setTimeout(() => {
        hideIndex(customerIndex);
        clearMessage();
        runSearch();
    }, 0);
});

runSearch();
