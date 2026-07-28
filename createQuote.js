const quoteForm = document.getElementById('quote-form');
const lineItemsContainer = document.getElementById('line-items');
const lineItemTemplate = document.getElementById('line-item-template');
const addItemButton = document.getElementById('add-item-button');
const saveButton = document.getElementById('save-button');
const logoutButton = document.getElementById('logout-button');
const messageBox = document.getElementById('message');
const associateBanner = document.getElementById('associate-banner');

const storedAssociate = localStorage.getItem('salesAssociate');
let associate = null;

try {
    associate = storedAssociate ? JSON.parse(storedAssociate) : null;
} catch (error) {
    localStorage.removeItem('salesAssociate');
}

if (!associate || !associate.associate_id) {
    window.location.href = 'login.html';
} else {
    associateBanner.textContent = `Logged in as ${associate.name} (${associate.associate_id})`;
}

function showMessage(text, type = 'error') {
    messageBox.textContent = text;
    messageBox.className = `message ${type} show`;
    messageBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function clearMessage() {
    messageBox.textContent = '';
    messageBox.className = 'message';
}

function addLineItem() {
    const fragment = lineItemTemplate.content.cloneNode(true);
    const row = fragment.querySelector('.line-item');
    const removeButton = fragment.querySelector('.remove-item-button');

    removeButton.addEventListener('click', () => {
        if (lineItemsContainer.children.length === 1) {
            showMessage('A quote must contain at least one line item.');
            return;
        }

        row.remove();
        clearMessage();
    });

    lineItemsContainer.appendChild(fragment);
}

addItemButton.addEventListener('click', () => {
    addLineItem();
    clearMessage();
});

quoteForm.addEventListener('reset', () => {
    setTimeout(() => {
        lineItemsContainer.innerHTML = '';
        addLineItem();
        clearMessage();
    }, 0);
});

logoutButton.addEventListener('click', () => {
    localStorage.removeItem('salesAssociate');
    window.location.href = 'login.html';
});

quoteForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearMessage();

    const customerId = Number(document.getElementById('customer_id').value);
    const secretNotes = document.getElementById('secret_notes').value.trim();
    const rows = [...document.querySelectorAll('.line-item')];

    const lineItems = rows.map((row) => {
        const itemId = Number(row.querySelector('.item-id').value);
        const priceText = row.querySelector('.item-price').value.trim();
        const quantity = Number(row.querySelector('.item-quantity').value);

        const item = {
            item_id: itemId,
            quantity: quantity
        };

        if (priceText !== '') {
            item.price = Number(priceText);
        }

        return item;
    });

    const invalidItem = lineItems.some((item) =>
        !Number.isInteger(item.item_id) || item.item_id < 1 ||
        !Number.isInteger(item.quantity) || item.quantity < 1 ||
        (Object.hasOwn(item, 'price') && (!Number.isFinite(item.price) || item.price < 0))
    );

    if (!Number.isInteger(customerId) || customerId < 1) {
        showMessage('Please enter a valid customer ID.');
        return;
    }

    if (invalidItem) {
        showMessage('Please check the item ID, quantity, and price for every line item.');
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

        showMessage(`Quote #${result.quote_id} was created successfully.`, 'success');
        quoteForm.reset();
    } catch (error) {
        showMessage(error.message || 'Unable to connect to the server.');
    } finally {
        saveButton.disabled = false;
        saveButton.textContent = 'Save Draft Quote';
    }
});

addLineItem();
