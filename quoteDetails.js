const loadQuoteForm = document.getElementById('load-quote-form');
const lookupQuoteIdInput = document.getElementById('lookup_quote_id');
const loadButton = document.getElementById('load-button');

const quoteDetails = document.getElementById('quote-details');
const detailQuoteId = document.getElementById('detail-quote-id');
const detailCustomerId = document.getElementById('detail-customer-id');
const detailAssociateId = document.getElementById('detail-associate-id');
const detailCustomerEmail = document.getElementById('detail-customer-email');
const detailCreatedDate = document.getElementById('detail-created-date');
const detailStatus = document.getElementById('detail-status');
const detailFinalAmount = document.getElementById('detail-final-amount');
const detailPoNumber = document.getElementById('detail-po-number');
const detailLineItems = document.getElementById('detail-line-items');

let currentQuoteId = null;

// Set by the page-specific script to react to a freshly loaded quote.
let onQuoteLoaded = null;

function renderQuoteDetails(quote) {
    currentQuoteId = quote.quote_id;

    detailQuoteId.textContent = quote.quote_id;
    detailCustomerId.textContent = quote.customer_id;
    detailAssociateId.textContent = quote.associate_id;
    detailCustomerEmail.textContent = quote.customer_email;
    detailCreatedDate.textContent = quote.created_date;
    detailStatus.textContent = quote.status;
    detailFinalAmount.textContent = formatMoney(quote.final_amount);
    detailPoNumber.textContent = quote.po_number || '—';
}

function renderLineItems(lineItems) {
    detailLineItems.innerHTML = lineItems.map((item) => `
        <li>${item.description} — Qty ${item.quantity} @ ${formatMoney(item.price)}</li>
    `).join('');
}

async function loadQuote(quoteId) {
    const response = await fetch(`getQuote.php?id=${quoteId}`);
    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.errors?.join(' ') || 'Quote not found.');
    }

    renderQuoteDetails(result.quote);
    renderLineItems(result.line_items);
    quoteDetails.hidden = false;

    if (typeof onQuoteLoaded === 'function') {
        onQuoteLoaded(result.quote);
    }
}

loadQuoteForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearMessage();

    const quoteId = Number(lookupQuoteIdInput.value);
    if (!Number.isInteger(quoteId) || quoteId < 1) {
        showMessage('Please enter a valid quote ID.');
        return;
    }

    loadButton.disabled = true;
    loadButton.textContent = 'Loading...';

    try {
        await loadQuote(quoteId);
    } catch (error) {
        quoteDetails.hidden = true;
        showMessage(error.message || 'Unable to connect to the server.');
    } finally {
        loadButton.disabled = false;
        loadButton.textContent = 'Load Quote';
    }
});
