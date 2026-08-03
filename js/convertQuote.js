// Process Orders: load a quote by ID and convert it to a purchase
// order once it's sanctioned; shows the resulting PO details.
const convertQuoteForm = document.getElementById('convert-quote-form');
const convertHelp = document.getElementById('convert-help');
const appliedDiscount = document.getElementById('applied-discount');
const finalDiscountValueInput = document.getElementById('final_discount_value');
const convertButton = document.getElementById('convert-button');

const poResult = document.getElementById('po-result');
const poNumber = document.getElementById('po-number');
const poProcessingDate = document.getElementById('po-processing-date');
const poCommissionRate = document.getElementById('po-commission-rate');
const poCommissionAmount = document.getElementById('po-commission-amount');
const poOrderAmount = document.getElementById('po-order-amount');

let currentQuoteStatus = null;

// The quote's stored final_amount, before any additional discount typed
// into this form is applied - used to live-preview that discount below.
let currentFinalAmount = null;

function updateFinalAmountPreview() {
    if (currentFinalAmount === null) {
        return;
    }

    const additionalDiscount = Number(finalDiscountValueInput.value) || 0;
    detailFinalAmount.textContent = formatMoney(currentFinalAmount - additionalDiscount);
}

finalDiscountValueInput.addEventListener('input', updateFinalAmountPreview);

onQuoteLoaded = (quote) => {
    currentQuoteStatus = quote.status;
    currentFinalAmount = Number(quote.final_amount) || 0;

    const isOrdered = quote.status === 'ordered';
    const isSanctioned = quote.status === 'sanctioned';

    convertButton.disabled = !isSanctioned;
    finalDiscountValueInput.disabled = !isSanctioned;
    finalDiscountValueInput.value = quote.final_discount_value || 0;
    updateFinalAmountPreview();

    if (isOrdered) {
        convertHelp.textContent = 'This quote has already been converted to a purchase order.';
    } else if (isSanctioned) {
        convertHelp.textContent = 'This quote is sanctioned and ready to convert.';
    } else {
        convertHelp.textContent = 'Converting to a purchase order requires the sanctioned status.';
    }

    if (quote.discount_type === 'percent') {
        appliedDiscount.textContent = `Discount applied: ${quote.discount_value}% (already reflected in the Final Amount).`;
    } else if (quote.discount_type === 'amount') {
        appliedDiscount.textContent = `Discount applied: ${formatMoney(quote.discount_value)} (already reflected in the Final Amount).`;
    } else {
        appliedDiscount.textContent = 'No discount applied.';
    }

    if (isOrdered) {
        poResult.hidden = false;
        poNumber.textContent = quote.po_number || '—';
        poProcessingDate.textContent = quote.processing_date || '—';
        poCommissionRate.textContent = quote.commission_rate !== null ? `${quote.commission_rate}%` : '—';
        poCommissionAmount.textContent = formatMoney(quote.commission_amount);
        poOrderAmount.textContent = formatMoney(quote.final_amount - (quote.final_discount_value || 0));
    } else {
        poResult.hidden = true;
    }
};

convertQuoteForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearMessage();

    if (!currentQuoteId) {
        return;
    }

    if (currentQuoteStatus !== 'sanctioned') {
        showMessage('Only sanctioned quotes can be converted to purchase orders.');
        return;
    }

    convertButton.disabled = true;
    convertButton.textContent = 'Converting...';

    try {
        const response = await fetch('../../api/convertQuote.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                quote_id: currentQuoteId,
                final_discount_value: Number(finalDiscountValueInput.value) || 0
            })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.errors?.join(' ') || 'The quote could not be converted.');
        }

        showMessage(`Quote #${currentQuoteId} was converted to purchase order ${result.po_number}.`, 'success');
        await loadQuote(currentQuoteId);
    } catch (error) {
        showMessage(error.message || 'Unable to connect to the server.');
    } finally {
        convertButton.disabled = false;
        convertButton.textContent = 'Convert to Purchase Order';
    }
});
