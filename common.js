// Shared UI helpers used by every quote page (createQuote, editQuote, convertQuote).
// Each page provides its own #message element; these just read/write it.
const messageBox = document.getElementById('message');

// Shows text in the page's message box. type controls the styling
// ('error' by default, or 'success') via the message-<type> CSS class.
function showMessage(text, type = 'error') {
    messageBox.textContent = text;
    messageBox.className = `message ${type} show`;
    messageBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Hides the message box by clearing its text and resetting its class.
function clearMessage() {
    messageBox.textContent = '';
    messageBox.className = 'message';
}

// Formats a numeric amount as "$X.XX", or an em dash when there's no value.
function formatMoney(value) {
    return value === null || value === undefined ? '—' : `$${Number(value).toFixed(2)}`;
}
