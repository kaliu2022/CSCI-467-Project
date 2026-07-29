// Edit Quote: load a quote by ID, edit its line items/discount/notes, and
// sanction it (Save always sets status to 'sanctioned').
const editQuoteForm = document.getElementById('edit-quote-form');
const discountTypeSelect = document.getElementById('discount_type');
const discountValueInput = document.getElementById('discount_value');
const discountUnit = document.getElementById('discount-unit');
const existingSecretNotes = document.getElementById('existing-secret-notes');
const newSecretNoteInput = document.getElementById('new_secret_note');
const saveButton = document.getElementById('save-button');
const lineItemsContainer = document.getElementById('line-items');
const lineItemTemplate = document.getElementById('line-item-template');
const addItemButton = document.getElementById('add-item-button');

const DISCOUNT_UNIT_SYMBOLS = { percent: '%', amount: '$' };

// The quote's secret_notes as of the last load; new notes get appended to this.
let currentSecretNotes = '';

// Tracks whether the loaded quote is already 'ordered', in which case
// line items and the rest of the form become read-only.
let quoteIsOrdered = false;

function updateDiscountUnit() {
    discountUnit.textContent = DISCOUNT_UNIT_SYMBOLS[discountTypeSelect.value] || '';
}

function showIndexError(listElement, text) {
    listElement.innerHTML = `<li>${text}</li>`;
    listElement.className = 'index-list show error';
}

function hideIndex(listElement) {
    listElement.innerHTML = '';
    listElement.className = 'index-list';
}

async function lookupItem(itemId, listElement) {
    if (!Number.isInteger(itemId) || itemId < 1) {
        hideIndex(listElement);
        return;
    }

    try {
        const response = await fetch(`getItem.php?id=${itemId}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
            showIndexError(listElement, result.errors?.join(' ') || 'Item not found.');
            return;
        }

        const item = result.item;
        listElement.innerHTML = `
            <li>Description: ${item.description}</li>
            <li>Price: $${Number(item.price).toFixed(2)}</li>
        `;
        listElement.className = 'index-list show';
    } catch (error) {
        showIndexError(listElement, 'Unable to look up item.');
    }
}

// Item catalog for the "Item" dropdown. Fetched once and cached in
// itemCatalogPromise so every caller shares the same in-flight/resolved request.
let itemCatalog = [];
let itemCatalogPromise = null;

function loadItemCatalog() {
    if (!itemCatalogPromise) {
        itemCatalogPromise = fetch('getItems.php')
            .then((response) => response.json())
            .then((result) => {
                itemCatalog = result.success ? result.items : [];
            })
            .catch(() => {
                itemCatalog = [];
            });
    }

    return itemCatalogPromise;
}

function populateItemSelect(selectElement) {
    const options = ['<option value="">Select an item</option>'].concat(
        itemCatalog.map((item) => `<option value="${item.item_id}">${item.description}</option>`)
    );
    selectElement.innerHTML = options.join('');
}

// Adds a line item row, optionally pre-filled from an existing quote line item.
function addLineItem(item = null) {
    const fragment = lineItemTemplate.content.cloneNode(true);
    const row = fragment.querySelector('.line-item');
    const removeButton = fragment.querySelector('.remove-item-button');
    const itemIdSelect = fragment.querySelector('.item-id');
    const itemQuantityInput = fragment.querySelector('.item-quantity');
    const itemIndex = fragment.querySelector('.item-index');

    populateItemSelect(itemIdSelect);

    if (item) {
        itemIdSelect.value = item.item_id;
        itemQuantityInput.value = item.quantity;
        lookupItem(item.item_id, itemIndex);
    }

    itemIdSelect.addEventListener('change', () => {
        lookupItem(Number(itemIdSelect.value), itemIndex);
    });

    removeButton.addEventListener('click', () => {
        if (lineItemsContainer.children.length === 1) {
            showMessage('A quote must contain at least one line item.');
            return;
        }

        row.remove();
        clearMessage();
    });

    itemIdSelect.disabled = quoteIsOrdered;
    itemQuantityInput.disabled = quoteIsOrdered;
    removeButton.disabled = quoteIsOrdered;

    lineItemsContainer.appendChild(fragment);
}

discountTypeSelect.addEventListener('change', updateDiscountUnit);

addItemButton.addEventListener('click', () => {
    addLineItem();
    clearMessage();
});

onQuoteLoaded = async (quote, lineItems) => {
    discountTypeSelect.value = quote.discount_type || '';
    discountValueInput.value = quote.discount_value || 0;
    updateDiscountUnit();

    currentSecretNotes = quote.secret_notes || '';
    existingSecretNotes.textContent = currentSecretNotes || 'No notes yet.';
    newSecretNoteInput.value = '';

    quoteIsOrdered = quote.status === 'ordered';
    discountTypeSelect.disabled = quoteIsOrdered;
    discountValueInput.disabled = quoteIsOrdered;
    newSecretNoteInput.disabled = quoteIsOrdered;
    saveButton.disabled = quoteIsOrdered;
    addItemButton.disabled = quoteIsOrdered;

    await loadItemCatalog();

    lineItemsContainer.innerHTML = '';
    (lineItems || []).forEach((lineItem) => addLineItem(lineItem));
};

editQuoteForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearMessage();

    if (!currentQuoteId) {
        return;
    }

    const rows = [...lineItemsContainer.querySelectorAll('.line-item')];
    const lineItems = rows.map((row) => ({
        item_id: Number(row.querySelector('.item-id').value),
        quantity: Number(row.querySelector('.item-quantity').value)
    }));

    const invalidItem = lineItems.some((item) =>
        !Number.isInteger(item.item_id) || item.item_id < 1 ||
        !Number.isInteger(item.quantity) || item.quantity < 1
    );

    if (lineItems.length === 0) {
        showMessage('A quote must contain at least one line item.');
        return;
    }

    if (invalidItem) {
        showMessage('Please select an item and a valid quantity for every line item.');
        return;
    }

    const newNoteText = newSecretNoteInput.value.trim();
    const secretNotes = newNoteText
        ? (currentSecretNotes ? `${currentSecretNotes}\n\n${newNoteText}` : newNoteText)
        : (currentSecretNotes || null);

    saveButton.disabled = true;
    saveButton.textContent = 'Sanctioning...';

    try {
        const response = await fetch('editQuote.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                quote_id: currentQuoteId,
                discount_type: discountTypeSelect.value || null,
                discount_value: Number(discountValueInput.value) || 0,
                secret_notes: secretNotes,
                status: 'sanctioned',
                line_items: lineItems
            })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.errors?.join(' ') || 'The quote could not be updated.');
        }

        showMessage(`Quote #${result.quote_id} was updated successfully.`, 'success');
        await loadQuote(currentQuoteId);
    } catch (error) {
        showMessage(error.message || 'Unable to connect to the server.');
    } finally {
        saveButton.disabled = false;
        saveButton.textContent = 'Sanction Quote';
    }
});

loadItemCatalog();
