const editQuoteForm = document.getElementById('edit-quote-form');
const discountTypeSelect = document.getElementById('discount_type');
const discountValueInput = document.getElementById('discount_value');
const secretNotesInput = document.getElementById('secret_notes');
const saveButton = document.getElementById('save-button');

onQuoteLoaded = (quote) => {
    discountTypeSelect.value = quote.discount_type || '';
    discountValueInput.value = quote.discount_value || 0;
    secretNotesInput.value = quote.secret_notes || '';

    const isOrdered = quote.status === 'ordered';
    discountTypeSelect.disabled = isOrdered;
    discountValueInput.disabled = isOrdered;
    secretNotesInput.disabled = isOrdered;
    saveButton.disabled = isOrdered;
};

editQuoteForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearMessage();

    if (!currentQuoteId) {
        return;
    }

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
                secret_notes: secretNotesInput.value.trim() || null,
                status: 'sanctioned'
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
