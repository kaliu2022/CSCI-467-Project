const quoteForm = document.getElementById('quote-form');
const lineItemsContainer = document.getElementById('line-items');
const lineItemTemplate = document.getElementById('line-item-template');
const addItemButton = document.getElementById('add-item-button');
const saveButton = document.getElementById('save-button');
const customerIndex = document.getElementById('customer-index');
const customerIdInput = document.getElementById('customer_id');
const subtotalDisplay = document.getElementById('line-items-subtotal');

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
            <li>Street: ${customer.street}</li>
        `;
        listElement.className = 'index-list show';
    } catch (error) {
        showIndexError(listElement, 'Unable to look up customer.');
    }
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

// Item catalog for the "Item" dropdown, loaded once on page load.
let itemCatalog = [];

async function loadItemCatalog() {
    try {
        const response = await fetch('getItems.php');
        const result = await response.json();
        itemCatalog = (response.ok && result.success) ? result.items : [];
    } catch (error) {
        itemCatalog = [];
    }
}

function populateItemSelect(selectElement) {
    const options = ['<option value="">Select an item</option>'].concat(
        itemCatalog.map((item) => `<option value="${item.item_id}">${item.description}</option>`)
    );
    selectElement.innerHTML = options.join('');
}

const debouncedCustomerLookup = debounce((value, listElement) => {
    lookupCustomer(Number(value), listElement);
}, 400);

customerIdInput.addEventListener('input', () => {
    debouncedCustomerLookup(customerIdInput.value, customerIndex);
});

function getRowPrice(row) {
    const itemId = Number(row.querySelector('.item-id').value);
    const catalogItem = itemCatalog.find((item) => Number(item.item_id) === itemId);
    return catalogItem ? Number(catalogItem.price) : 0;
}

function updateSubtotal() {
    const rows = [...lineItemsContainer.querySelectorAll('.line-item')];
    const subtotal = rows.reduce((sum, row) => {
        const price = getRowPrice(row);
        const quantity = Number(row.querySelector('.item-quantity').value);
        return Number.isFinite(price) && Number.isFinite(quantity) ? sum + price * quantity : sum;
    }, 0);

    subtotalDisplay.textContent = formatMoney(subtotal);
}

function addLineItem() {
    const fragment = lineItemTemplate.content.cloneNode(true);
    const row = fragment.querySelector('.line-item');
    const removeButton = fragment.querySelector('.remove-item-button');
    const itemIdSelect = fragment.querySelector('.item-id');
    const itemQuantityInput = fragment.querySelector('.item-quantity');
    const itemIndex = fragment.querySelector('.item-index');

    populateItemSelect(itemIdSelect);

    itemIdSelect.addEventListener('change', () => {
        lookupItem(Number(itemIdSelect.value), itemIndex);
        updateSubtotal();
    });

    itemQuantityInput.addEventListener('input', updateSubtotal);

    removeButton.addEventListener('click', () => {
        if (lineItemsContainer.children.length === 1) {
            showMessage('A quote must contain at least one line item.');
            return;
        }

        row.remove();
        clearMessage();
        updateSubtotal();
    });

    lineItemsContainer.appendChild(fragment);
    updateSubtotal();
}

addItemButton.addEventListener('click', () => {
    addLineItem();
    clearMessage();
});

quoteForm.addEventListener('reset', () => {
    setTimeout(() => {
        lineItemsContainer.innerHTML = '';
        addLineItem();
        hideIndex(customerIndex);
        clearMessage();
    }, 0);
});

quoteForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearMessage();

    const customerId = Number(document.getElementById('customer_id').value);
    const customerEmail = document.getElementById('customer_email').value.trim();
    const secretNotes = document.getElementById('secret_notes').value.trim();
    const rows = [...document.querySelectorAll('.line-item')];

    const lineItems = rows.map((row) => {
        const itemId = Number(row.querySelector('.item-id').value);
        const quantity = Number(row.querySelector('.item-quantity').value);

        return {
            item_id: itemId,
            quantity: quantity
        };
    });

    const invalidItem = lineItems.some((item) =>
        !Number.isInteger(item.item_id) || item.item_id < 1 ||
        !Number.isInteger(item.quantity) || item.quantity < 1
    );

    if (!Number.isInteger(customerId) || customerId < 1) {
        showMessage('Please enter a valid customer ID.');
        return;
    }

    if (invalidItem) {
        showMessage('Please check the item ID and quantity for every line item.');
        return;
    }

    saveButton.disabled = true;
    saveButton.textContent = 'Saving...';

    try {
        const response = await fetch('createQuote.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customer_id: customerId,
                customer_email: customerEmail,
                associate_id: associate.associate_id,
                secret_notes: secretNotes || null,
                line_items: lineItems
            })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            const errorText = result.errors?.join(' ') || 'The quote could not be created.';
            throw new Error(errorText);
        }

        quoteForm.reset();
        setTimeout(() => {
            showMessage(`Quote #${result.quote_id} created successfully.`, 'success');
        }, 0);
    } catch (error) {
        showMessage(error.message || 'Unable to connect to the server.');
    } finally {
        saveButton.disabled = false;
        saveButton.textContent = 'Create Finalized Quote';
    }
});

loadItemCatalog().then(addLineItem);
